import { Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@/constants/errors';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';

import {
  PostContentGenerationData,
  UpdatePostRequestDto,
  AgentGeneratedPostDto,
  AgentPostWithGenerationIdDto,
  AccountData,
  RemoveImagesRequestDto,
} from '../dtos-schemes/agent.scheme';

import { PostState, SocialMediaProvider } from '@/model.enums';
import { PrismaService } from '@/prisma/prisma.service';
import { Account, post } from '@prisma/client';
import { SocialContentGenerationService } from './social-media-content-generation-service';
import {
  FinalValidationService,
  ValidationFinalResult,
} from './content-validator.service';
import { AppLogger } from '@/utils/app-logger.service';
import { AiModelsService, UsedStep } from './ai.models.service';
import { ConfigService } from '@/config/config.service';
import { LlmService } from './llm/llm.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as AWS from 'aws-sdk';
import { S3Service } from '@/common/services/s3.service';

import { PopulatedAccount } from '@/types/api';
const lambda = new AWS.Lambda();
@Injectable()
export class AgentService {
  private lastUsedChunkIds: string[] = [];
  private retriedPosts = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly socialContentGenerationService: SocialContentGenerationService,
    private readonly finalValidationService: FinalValidationService,
    private readonly s3Service: S3Service,
    private readonly logger: AppLogger,
    private readonly aiModelsService: AiModelsService,
    private readonly configService: ConfigService,
    private readonly llmService: LlmService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Domains to exclude from sources (Google utilities, non-content pages, etc.)
   */
  private readonly EXCLUDED_SOURCE_DOMAINS = [
    'google.com',
    'support.google.com',
    'maps.google.com',
    'accounts.google.com',
    'policies.google.com',
  ];

  /**
   * Checks if a URL's domain should be excluded from sources
   * @param url - The URL to check
   * @returns true if domain should be excluded
   */
  /**
   * Checks if URL domain should be excluded from sources
   */
  private isNotGoodDomain(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      return this.EXCLUDED_SOURCE_DOMAINS.some((domain) => {
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });
    } catch {
      return true;
    }
  }

  private async validateLinkSituation(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);
      return response.status === 200;
    } catch (error) {
      this.logger.log('URL validation failed', {
        url,
        error: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Validates and filters source URLs, removing excluded domains and invalid URLs
   */
  private async validateLinksSituation(
    sources: Array<{ url: string; title?: string }>,
  ): Promise<Array<{ url: string; title?: string }>> {
    const validatedSources: Array<{ url: string; title?: string }> = [];
    const invalidUrls: string[] = [];
    const excludedUrls: string[] = [];

    const allowedSources = sources.filter((source) => {
      if (this.isNotGoodDomain(source.url)) {
        excludedUrls.push(source.url);
        return false;
      }
      return true;
    });

    if (excludedUrls.length > 0) {
      this.logger.log('Filtered out excluded domain URLs', {
        count: excludedUrls.length,
        urls: excludedUrls,
      });
    }

    const concurrencyLimit = 5;
    for (let i = 0; i < allowedSources.length; i += concurrencyLimit) {
      const batch = allowedSources.slice(i, i + concurrencyLimit);
      const validationResults = await Promise.all(
        batch.map(async (source) => {
          const isValid = await this.validateLinkSituation(source.url);
          return { source, isValid };
        }),
      );

      for (const { source, isValid } of validationResults) {
        if (isValid) {
          validatedSources.push(source);
        } else {
          invalidUrls.push(source.url);
        }
      }
    }

    if (invalidUrls.length > 0) {
      this.logger.log('Filtered out invalid status code URLs', {
        count: invalidUrls.length,
        urls: invalidUrls,
      });
    }

    return validatedSources;
  }

  /**
   * Validates if account has not exceeded post creation limit for the provider
   */
  async checkPostCreationLimitForProvider(
    account: PopulatedAccount,
    provider: SocialMediaProvider,
  ): Promise<boolean> {
    const setting = account.accountSettings;
    if (!setting) {
      throw new ApplicationErrorException(
        ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND,
      );
    }

    const postCreationLimit = setting.postCreationLimit;
    if (!postCreationLimit) {
      throw new ApplicationErrorException(ERROR_CODES.MISSING_REQUIRED_FIELD);
    }

    if (postCreationLimit <= 0) {
      throw new ApplicationErrorException(ERROR_CODES.INVALID_INPUT);
    }

    return true;
  }
  /**
   * Initiates post creation via Lambda function
   */
  async createPostWithLambda(
    account: PopulatedAccount,
    generationData: PostContentGenerationData,
  ): Promise<AgentPostWithGenerationIdDto> {
    const generationId = uuidv4();
    generationData.generationId = generationId;

    if (generationData.recommendationId) {
      const recommendation = await this.prisma.recommendation.findUnique({
        where: { id: generationData.recommendationId },
        include: {
          prompt: true,
        },
      });

      if (recommendation) {
        (generationData as any).insight = recommendation.insight;

        if (recommendation.promptId) {
          const results = await this.prisma.results.findMany({
            where: {
              promptId: recommendation.promptId,
              accountId: account.id,
            },
            select: {
              urlSources: true,
              companySources: true,
            },
            take: 10,
            orderBy: {
              timestamp: 'desc',
            },
          });

          const allSources: Array<{ url: string; title?: string }> = [];
          const seenUrls = new Set<string>();

          for (const result of results) {
            if (result.urlSources && Array.isArray(result.urlSources)) {
              for (const source of result.urlSources) {
                let url: string | undefined;
                let title: string | undefined;

                if (typeof source === 'string') {
                  url = source;
                } else if (
                  source &&
                  typeof source === 'object' &&
                  !Array.isArray(source)
                ) {
                  url = (source as any).url || (source as any).source;
                  title = (source as any).title;
                }

                if (url && typeof url === 'string' && !seenUrls.has(url)) {
                  seenUrls.add(url);
                  allSources.push({
                    url,
                    title:
                      title && typeof title === 'string' ? title : undefined,
                  });
                }
              }
            }

            if (result.companySources && Array.isArray(result.companySources)) {
              for (const source of result.companySources) {
                let url: string | undefined;
                let title: string | undefined;

                if (typeof source === 'string') {
                  url = source;
                } else if (
                  source &&
                  typeof source === 'object' &&
                  !Array.isArray(source)
                ) {
                  url = (source as any).url || (source as any).source;
                  title = (source as any).title;
                }

                if (url && typeof url === 'string' && !seenUrls.has(url)) {
                  seenUrls.add(url);
                  allSources.push({
                    url,
                    title:
                      title && typeof title === 'string' ? title : undefined,
                  });
                }
              }
            }
          }

          const validatedSources =
            await this.validateLinksSituation(allSources);

          const accountDomains = account.domains || [];
          const internalSources: Array<{ url: string; title?: string }> = [];
          const externalSources: Array<{ url: string; title?: string }> = [];

          for (const source of validatedSources) {
            try {
              const sourceUrl = new URL(source.url);
              const sourceHostname = sourceUrl.hostname.replace(/^www\./, '');
              const isInternal = accountDomains.some((domain) => {
                const cleanDomain = domain
                  .replace(/^https?:\/\//, '')
                  .replace(/^www\./, '');
                return (
                  sourceHostname === cleanDomain ||
                  sourceHostname.endsWith(`.${cleanDomain}`)
                );
              });

              if (isInternal) {
                internalSources.push(source);
              } else {
                externalSources.push(source);
              }
            } catch {}
          }

          (generationData as any).sources = {
            internal: internalSources,
            external: externalSources,
            all: validatedSources,
          };
        }
      }
    }

    if (!generationData.recommendationId && generationData.prompt) {
      const normalizedPromptText = generationData.prompt.trim();

      const prompt = await this.prisma.prompt.findFirst({
        where: {
          accountId: account.id,
          prompt: normalizedPromptText,
          isActive: true,
          state: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true },
      });

      if (prompt?.id) {
        const results = await this.prisma.results.findMany({
          where: {
            promptId: prompt.id,
            accountId: account.id,
          },
          select: {
            urlSources: true,
            companySources: true,
          },
          take: 10,
          orderBy: {
            timestamp: 'desc',
          },
        });

        const allSources: Array<{ url: string; title?: string }> = [];
        const seenUrls = new Set<string>();

        for (const result of results) {
          if (result.urlSources && Array.isArray(result.urlSources)) {
            for (const source of result.urlSources) {
              let url: string | undefined;
              let title: string | undefined;

              if (typeof source === 'string') {
                url = source;
              } else if (
                source &&
                typeof source === 'object' &&
                !Array.isArray(source)
              ) {
                url = (source as any).url || (source as any).source;
                title = (source as any).title;
              }

              if (url && typeof url === 'string' && !seenUrls.has(url)) {
                seenUrls.add(url);
                allSources.push({
                  url,
                  title: title && typeof title === 'string' ? title : undefined,
                });
              }
            }
          }

          if (result.companySources && Array.isArray(result.companySources)) {
            for (const source of result.companySources) {
              let url: string | undefined;
              let title: string | undefined;

              if (typeof source === 'string') {
                url = source;
              } else if (
                source &&
                typeof source === 'object' &&
                !Array.isArray(source)
              ) {
                url = (source as any).url || (source as any).source;
                title = (source as any).title;
              }

              if (url && typeof url === 'string' && !seenUrls.has(url)) {
                seenUrls.add(url);
                allSources.push({
                  url,
                  title: title && typeof title === 'string' ? title : undefined,
                });
              }
            }
          }
        }

        const validatedSources = await this.validateLinksSituation(allSources);

        const accountDomains = account.domains || [];
        const internalSources: Array<{ url: string; title?: string }> = [];
        const externalSources: Array<{ url: string; title?: string }> = [];

        for (const source of validatedSources) {
          try {
            const sourceUrl = new URL(source.url);
            const sourceHostname = sourceUrl.hostname.replace(/^www\./, '');
            const isInternal = accountDomains.some((domain) => {
              const cleanDomain = domain
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '');
              return (
                sourceHostname === cleanDomain ||
                sourceHostname.endsWith(`.${cleanDomain}`)
              );
            });

            if (isInternal) {
              internalSources.push(source);
            } else {
              externalSources.push(source);
            }
          } catch {
            continue;
          }
        }

        (generationData as any).sources = {
          internal: internalSources,
          external: externalSources,
          all: validatedSources,
        };
      }
    }

    const params: AWS.Lambda.InvocationRequest = {
      FunctionName: `${process.env.NODE_ENV}-create-post`,
      InvocationType: 'Event',
      Payload: JSON.stringify({
        accountId: account.id,
        generationData: generationData,
      }),
    };

    await lambda.invoke(params).promise();

    return {
      generationId,
      message: 'Task started, processing in the background',
    };
  }

  /**
   * Creates and processes a post with validation and content generation
   */
  async generatePost(
    account: PopulatedAccount,
    generationData: PostContentGenerationData,
  ) {
    const generationId = generationData.generationId;
    if (!generationId) {
      throw new ApplicationErrorException(ERROR_CODES.MISSING_GENERATION_ID);
    }

    try {
      if (
        !(generationData as any).sources &&
        generationData.prompt &&
        !generationData.recommendationId
      ) {
        const normalizedPromptText = generationData.prompt.trim();
        const prompt = await this.prisma.prompt.findFirst({
          where: {
            accountId: account.id,
            prompt: normalizedPromptText,
            isActive: true,
            state: 'ACTIVE',
            deletedAt: null,
          },
          select: { id: true },
        });

        if (prompt?.id) {
          const results = await this.prisma.results.findMany({
            where: {
              promptId: prompt.id,
              accountId: account.id,
            },
            select: {
              urlSources: true,
              companySources: true,
            },
            take: 10,
            orderBy: { timestamp: 'desc' },
          });

          const allSources: Array<{ url: string; title?: string }> = [];
          const seenUrls = new Set<string>();

          for (const result of results) {
            if (result.urlSources && Array.isArray(result.urlSources)) {
              for (const source of result.urlSources) {
                let url: string | undefined;
                let title: string | undefined;
                if (typeof source === 'string') {
                  url = source;
                } else if (
                  source &&
                  typeof source === 'object' &&
                  !Array.isArray(source)
                ) {
                  url = (source as any).url || (source as any).source;
                  title = (source as any).title;
                }
                if (url && typeof url === 'string' && !seenUrls.has(url)) {
                  seenUrls.add(url);
                  allSources.push({
                    url,
                    title:
                      title && typeof title === 'string' ? title : undefined,
                  });
                }
              }
            }
            if (result.companySources && Array.isArray(result.companySources)) {
              for (const source of result.companySources) {
                let url: string | undefined;
                let title: string | undefined;
                if (typeof source === 'string') {
                  url = source;
                } else if (
                  source &&
                  typeof source === 'object' &&
                  !Array.isArray(source)
                ) {
                  url = (source as any).url || (source as any).source;
                  title = (source as any).title;
                }
                if (url && typeof url === 'string' && !seenUrls.has(url)) {
                  seenUrls.add(url);
                  allSources.push({
                    url,
                    title:
                      title && typeof title === 'string' ? title : undefined,
                  });
                }
              }
            }
          }

          const validatedSources =
            await this.validateLinksSituation(allSources);

          const accountDomains = account.domains || [];
          const internalSources: Array<{ url: string; title?: string }> = [];
          const externalSources: Array<{ url: string; title?: string }> = [];

          for (const source of validatedSources) {
            try {
              const sourceUrl = new URL(source.url);
              const sourceHostname = sourceUrl.hostname.replace(/^www\./, '');
              const isInternal = accountDomains.some((domain) => {
                const cleanDomain = domain
                  .replace(/^https?:\/\//, '')
                  .replace(/^www\./, '');
                return (
                  sourceHostname === cleanDomain ||
                  sourceHostname.endsWith(`.${cleanDomain}`)
                );
              });
              if (isInternal) {
                internalSources.push(source);
              } else {
                externalSources.push(source);
              }
            } catch {
              continue;
            }
          }

          (generationData as any).sources = {
            internal: internalSources,
            external: externalSources,
            all: validatedSources,
          };
        }
      }

      const result = await this.generateSocialMediaContentWithLlm(
        generationData,
        account,
      );

      for (const post of result) {
        let [title, ...bodyParts] = post.text.split('\n\n');
        let body = bodyParts.join('\n\n');
        let retryPostData: AgentGeneratedPostDto | null = null;

        if (
          generationData.socialMediaProvider === SocialMediaProvider.BLOG ||
          generationData.socialMediaProvider === SocialMediaProvider.LISTICLE
        ) {
          if (generationData.socialMediaProvider === SocialMediaProvider.BLOG) {
            let finalValidation =
              this.finalValidationService.validateBlogPostFinal({
                title: title,
                content: body,
                language: account.language ?? undefined,
              });
            if (!finalValidation.isAuthorityLevel) {
              this.logger.error('Generated blog failed final validation', {
                postId: post.id,
                score: finalValidation.score,
                issueCount: finalValidation.issues.length,
                issues: finalValidation.issues.map((i) => ({
                  severity: i.severity,
                  category: i.category,
                  message: i.message,
                })),
                language: account.language,
              });

              if (this.shouldRetryGeneration(post.id, finalValidation)) {
                try {
                  const retryResult = await this.retryBlogGeneration(
                    post,
                    generationData,
                    account,
                    finalValidation,
                  );

                  title = retryResult.title;
                  body = retryResult.body;
                  retryPostData = retryResult.retryPost;

                  const retryTempPostForSchema: Partial<post> = {
                    id: post.id,
                    title: title,
                    body: body,
                    slug: retryResult.retryPost.slug || post.slug || 'untitled',
                    focusKeyphrase:
                      retryResult.retryPost.focusKeyphrase ||
                      post.focusKeyphrase,
                    metaDescription:
                      retryResult.retryPost.metaDescription ||
                      post.metaDescription,
                    tags: retryResult.retryPost.hashtags || post.hashtags || [],
                    publishedUrl: null,
                    readTime: this.calculateEstimatedReadingTime(
                      retryResult.retryPost.text,
                    ),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    publishedAt: null,
                    imagesUrl: retryResult.retryPost.imageUrl
                      ? [retryResult.retryPost.imageUrl]
                      : [],
                  };

                  finalValidation =
                    this.finalValidationService.validateBlogPostFinal({
                      title: title,
                      content: body,
                      focusKeyphrase:
                        retryResult.retryPost.focusKeyphrase ||
                        post.focusKeyphrase,
                      language: account.language ?? undefined,
                    });

                  if (finalValidation.isAuthorityLevel) {
                    this.logger.log(
                      'Blog passed authority validation after retry',
                      {
                        postId: post.id,
                        score: finalValidation.score,
                        passedChecks: finalValidation.passed.length,
                        originalScore: finalValidation.score,
                      },
                    );
                  } else {
                    this.logger.warn(
                      'Blog still failed validation after retry, accepting anyway',
                      {
                        postId: post.id,
                        retryScore: finalValidation.score,
                        retryIssueCount: finalValidation.issues.length,
                        originalScore: finalValidation.score,
                        language: account.language,
                      },
                    );
                  }
                } catch (retryError) {
                  this.logger.error(
                    'Retry generation failed, accepting original result',
                    {
                      postId: post.id,
                      retryError:
                        retryError instanceof Error
                          ? retryError.message
                          : String(retryError),
                    },
                  );
                }
              } else {
                this.logger.warn(
                  'Blog failed validation and cannot retry, accepting anyway',
                  {
                    postId: post.id,
                    score: finalValidation.score,
                    issueCount: finalValidation.issues.length,
                    language: account.language,
                  },
                );
              }
            } else {
              this.logger.log('Blog passed authority validation', {
                postId: post.id,
                score: finalValidation.score,
                passedChecks: finalValidation.passed.length,
              });
            }
          }

          if (
            generationData.socialMediaProvider === SocialMediaProvider.LISTICLE
          ) {
            const finalValidation =
              this.finalValidationService.validateListicleFinal({
                content: body,
              });

            if (!finalValidation.hasAllCompanyNames) {
              this.logger.error(
                'Generated listicle failed company name validation',
                {
                  postId: post.id,
                  score: finalValidation.score,
                  totalItems: finalValidation.totalItems,
                  validItems: finalValidation.validItems,
                  missingItems: finalValidation.missingCompanyNameItems,
                  issueCount: finalValidation.issues.length,
                  issues: finalValidation.issues.map((i) => ({
                    severity: i.severity,
                    category: i.category,
                    message: i.message,
                    details: i.details,
                  })),
                },
              );

              const filteredContent = this.filterInvalidListicleEntries(
                body,
                finalValidation.missingCompanyNameItems,
              );

              if (filteredContent) {
                body = filteredContent.filteredBody;
                if (filteredContent.newCount !== finalValidation.totalItems) {
                  const titleMatch = title.match(/^(\d+)\s+(.+)$/);
                  if (titleMatch) {
                    title = `${filteredContent.newCount} ${titleMatch[2]}`;
                  }
                }

                this.logger.log(
                  'Listicle content filtered to remove invalid entries',
                  {
                    postId: post.id,
                    originalCount: finalValidation.totalItems,
                    newCount: filteredContent.newCount,
                    removedItems: finalValidation.missingCompanyNameItems,
                  },
                );
              } else {
                this.logger.warn(
                  'Failed to filter listicle content, accepting original',
                  {
                    postId: post.id,
                    missingItems: finalValidation.missingCompanyNameItems,
                  },
                );
              }
            } else {
              this.logger.log('Listicle passed company name validation', {
                postId: post.id,
                score: finalValidation.score,
                totalItems: finalValidation.totalItems,
                validItems: finalValidation.validItems,
                passedChecks: finalValidation.passed.length,
              });
            }
          }
        }

        const finalPostData = retryPostData || post;
        const finalText = retryPostData?.text || post.text;

        await this.prisma.post.update({
          where: { id: post.id },
          data: {
            title: title,
            body: body,
            state: PostState.SUGGESTED,
            tags: finalPostData.hashtags || post.hashtags,
            readTime: this.calculateEstimatedReadingTime(finalText),
            imagesUrl: finalPostData.imageUrl
              ? [finalPostData.imageUrl]
              : post.imageUrl
                ? [post.imageUrl]
                : [],
            ...((finalPostData as any).focusKeyphrase && {
              focusKeyphrase: (finalPostData as any).focusKeyphrase,
            }),
            ...((finalPostData as any).slug && {
              slug: (finalPostData as any).slug,
            }),
            ...((finalPostData as any).metaDescription && {
              metaDescription: (finalPostData as any).metaDescription,
            }),
            ...((finalPostData as any).unsplashPhotoId && {
              unsplashPhotoId: (finalPostData as any).unsplashPhotoId,
            }),
            ...((finalPostData as any).unsplashPhotographerName && {
              unsplashPhotographerName: (finalPostData as any)
                .unsplashPhotographerName,
            }),
            ...((finalPostData as any).unsplashPhotographerUsername && {
              unsplashPhotographerUsername: (finalPostData as any)
                .unsplashPhotographerUsername,
            }),
            ...((finalPostData as any).unsplashDownloadLocation && {
              unsplashDownloadLocation: (finalPostData as any)
                .unsplashDownloadLocation,
            }),
          },
        });

        if (this.lastUsedChunkIds.length > 0) {
          try {
            await this.trackChunkUsage(
              post.id,
              this.lastUsedChunkIds,
              'context',
            );
          } catch (error) {
            this.logger.error('Failed to track chunk usage', {
              postId: post.id,
              error: error instanceof Error ? error.message : String(error),
            });
            throw new ApplicationErrorException(
              ERROR_CODES.LLM_SERVICE_ERROR,
              undefined,
              `Failed to track chunk usage: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      }

      this.retriedPosts.clear();

      this.logger.log('Post creation process completed successfully');

      return Array.isArray(result) ? result : [result];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('Post creation failed, marking as FAILED', {
        generationId,
        error: errorMessage,
      });

      await this.markGeneratedPostsAsFailed(generationId, errorMessage);

      throw error;
    }
  }

  /**
   * Calculates estimated reading time in minutes (200 words per minute)
   */
  private calculateEstimatedReadingTime(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  }

  /**
   * Alias for calculateEstimatedReadingTime
   * Calculates reading time for blog posts
   */
  private calculateReadTime(text: string): number {
    return this.calculateEstimatedReadingTime(text);
  }

  /**
   * Determines if post generation should be retried based on validation results
   */
  private shouldRetryGeneratedPost(
    postId: string,
    validation: ValidationFinalResult,
  ): boolean {
    if (validation.isAuthorityLevel) {
      return false;
    }

    if (this.retriedPosts.has(postId)) {
      this.logger.log('Generated post already retried once, skipping retry', {
        postId,
        score: validation.score,
      });
      return false;
    }

    this.logger.log('Generated post validation failed, will retry once', {
      postId,
      score: validation.score,
      errorCount: validation.issues.filter((i) => i.severity === 'error')
        .length,
      warningCount: validation.issues.filter((i) => i.severity === 'warning')
        .length,
    });
    return true;
  }

  /**
   * Alias for shouldRetryGeneratedPost
   * Determines if blog generation should be retried
   */
  private shouldRetryGeneration(
    postId: string,
    finalValidation: ValidationFinalResult,
  ): boolean {
    return this.shouldRetryGeneratedPost(postId, finalValidation);
  }

  /**
   * Retries blog post generation when validation fails
   */
  private async retryGeneratedPost(
    generatedPost: AgentGeneratedPostDto,
    generationData: PostContentGenerationData,
    account: PopulatedAccount,
    originalValidation: ValidationFinalResult,
  ): Promise<{
    title: string;
    body: string;
    retryGeneratedPost: AgentGeneratedPostDto;
  }> {
    const generatedPostId = generatedPost.id;

    this.retriedPosts.add(generatedPostId);

    const retryResult = await this.generateSocialMediaContentWithLlm(
      generationData,
      account,
    );

    const retryGeneratedPost = retryResult[0];

    if (!retryGeneratedPost) {
      throw new Error(
        `Retry generated post not found for generatedPostId: ${generatedPostId}`,
      );
    }

    const [retryTitle, ...retryBodyParts] =
      retryGeneratedPost.text.split('\n\n');
    const retryBody = retryBodyParts.join('\n\n');

    return {
      title: retryTitle,
      body: retryBody,
      retryGeneratedPost: retryGeneratedPost,
    };
  }

  /**
   * Retries blog post generation when validation fails
   * Alias for retryGeneratedPost with blog-specific return type
   */
  private async retryBlogGeneration(
    generatedPost: AgentGeneratedPostDto,
    generationData: PostContentGenerationData,
    account: PopulatedAccount,
    originalValidation: ValidationFinalResult,
  ): Promise<{
    title: string;
    body: string;
    retryPost: AgentGeneratedPostDto;
  }> {
    const result = await this.retryGeneratedPost(
      generatedPost,
      generationData,
      account,
      originalValidation,
    );
    return {
      title: result.title,
      body: result.body,
      retryPost: result.retryGeneratedPost,
    };
  }

  /**
   * Removes invalid entries from listicle content
   */
  private filterInvalidListicleEntries(
    content: string,
    invalidItemNumbers: number[],
  ): { filteredBody: string; newCount: number } | null {
    if (invalidItemNumbers.length === 0) {
      return null;
    }

    try {
      const h2Pattern = /<h2[^>]*>(\d+)\.\s*([^<]*)<\/h2>/gi;
      const sections: Array<{
        fullMatch: string;
        number: number;
        headingText: string;
        startIndex: number;
        endIndex: number;
      }> = [];

      let match;
      while ((match = h2Pattern.exec(content)) !== null) {
        const itemNumber = parseInt(match[1], 10);
        const headingText = (match[2] || '').trim();

        if (!invalidItemNumbers.includes(itemNumber)) {
          sections.push({
            fullMatch: match[0],
            number: itemNumber,
            headingText: headingText,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          });
        }
      }

      if (sections.length === 0) {
        this.logger.warn(
          'All listicle entries would be filtered out, keeping original',
        );
        return null;
      }

      const parts: string[] = [];
      let lastEnd = 0;

      if (sections.length > 0 && sections[0].startIndex > 0) {
        parts.push(content.substring(0, sections[0].startIndex));
      }

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const nextSection = sections[i + 1];
        const sectionEnd = nextSection
          ? nextSection.startIndex
          : content.length;

        const newHeading = section.fullMatch.replace(/(\d+)\./, `${i + 1}.`);
        const sectionContent = content.substring(section.endIndex, sectionEnd);

        parts.push(newHeading + sectionContent);
      }

      const filteredBody = parts.join('');

      return {
        filteredBody,
        newCount: sections.length,
      };
    } catch (error) {
      this.logger.error('Error filtering listicle entries', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Marks posts as failed and logs error details
   */
  async markGeneratedPostsAsFailed(
    generationId: string,
    errorMessage?: string,
  ): Promise<void> {
    this.logger.error('Marking generated posts as FAILED', {
      generationId,
      errorMessage,
    });

    await this.prisma.post.updateMany({
      where: {
        generationId: generationId,
        state: PostState.IN_PROGRESS,
      },
      data: {
        state: PostState.FAILED,
        body: errorMessage
          ? `Post generation failed: ${errorMessage}`
          : 'Post generation failed',
      },
    });
  }
  /**
   * Creates a draft post record in the database
   */
  private async addPostAsDraft(
    generationId: string,
    aiModelSetting,
    generationData: any,
    accountId: string,
    socialMediaProvider: SocialMediaProvider,
  ): Promise<post> {
    return await this.prisma.post.create({
      data: {
        generationId,
        socialMediaProvider: socialMediaProvider,
        title: '',
        body: '',
        tags: [],
        readTime: 0,
        imagesUrl: [],
        visitSite: generationData.visitSite || null,
        aiModel: aiModelSetting.model,
        aiProvider: aiModelSetting.provider,
        aiStyle: generationData.style,
        accountId: accountId,
        topic: generationData.topic,
        prompt: generationData.prompt,
        state: PostState.IN_PROGRESS,
        recommendationId: generationData.recommendationId || null,
      },
    });
  }

  /**
   * Retrieves posts with pagination and filtering
   */
  async getPosts({
    account,
    generationId,
    socialNetwork,
    state,
    take,
    skip,
  }: {
    account: PopulatedAccount;
    generationId?: string;
    socialNetwork?: SocialMediaProvider;
    state?: PostState;
    take: number;
    skip: number;
  }): Promise<{ posts: any[]; totalCount: number }> {
    const where = {
      accountId: account.id,
      ...(generationId && { generationId }),
      ...(socialNetwork && { socialMediaProvider: socialNetwork }),
      ...(state ? { state } : { state: { in: ['SUGGESTED', 'POSTED'] } }),
    };

    const uniqueGenerations = await this.prisma.post.groupBy({
      by: ['generationId'],
      where,
      _min: {
        createdAt: true,
      },
      orderBy: {
        _min: {
          createdAt: 'desc',
        },
      },
    });

    const totalGenerationCount = uniqueGenerations.length;

    const paginatedGenerations = uniqueGenerations.slice(skip, skip + take);
    const paginatedGenerationIds = paginatedGenerations.map(
      (g) => g.generationId,
    );

    const posts = await this.prisma.post.findMany({
      where: {
        ...where,
        generationId: {
          in: paginatedGenerationIds,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        generationId: true,
        createdAt: true,
        socialMediaProvider: true,
        state: true,
        topic: true,
        prompt: true,
        title: true,
        body: true,
        publishedAt: true,
        publishAt: true,
        readTime: true,
        imagesUrl: true,
        tags: true,
        focusKeyphrase: true,
        slug: true,
        metaDescription: true,
        aiModel: true,
        aiProvider: true,
        aiStyle: true,
        youtubeUrl: true,
        visitSite: true,
        accountId: true,
        postIdInSocialMediaProvider: true,
        recommendationId: true,
        unsplashPhotoId: true,
        unsplashPhotographerName: true,
        unsplashPhotographerUsername: true,
        unsplashDownloadLocation: true,
      },
    });

    return {
      posts,
      totalCount: totalGenerationCount,
    };
  }

  /**
   * Updates an existing post with new content or metadata
   */
  async updatePost(
    account: Account,
    postId: string,
    data: UpdatePostRequestDto,
  ) {
    this.logger.log('Starting generated post update process');

    if (
      !data.body &&
      !data.title &&
      !data.tags &&
      !data.hashtags &&
      !data.focusKeyphrase &&
      !data.slug &&
      !data.metaDescription &&
      !data.textContentChange &&
      !data.removeImages &&
      !data.visitSite &&
      !data.state
    ) {
      throw new ApplicationErrorException(ERROR_CODES.NO_DATA_TO_UPDATE);
    }

    const post = await this.prisma.post.findUnique({
      where: {
        accountId: account.id,
        id: postId,
      },
    });

    if (!post) {
      throw new ApplicationErrorException(ERROR_CODES.POST_NOT_FOUND);
    }

    if (post.state === PostState.POSTED.toString()) {
      throw new ApplicationErrorException(ERROR_CODES.POST_ALREADY_POSTED);
    }

    const updatedPost = await this.prisma.post.update({
      where: {
        accountId: account.id,
        id: postId,
      },
      data: {
        ...(data.body && { body: data.body }),
        ...(data.title && { title: data.title }),
        ...(data.tags && { tags: data.tags }),
        ...(data.hashtags && { tags: data.hashtags }),
        ...(data.focusKeyphrase && { focusKeyphrase: data.focusKeyphrase }),
        ...(data.slug && { slug: data.slug }),
        ...(data.metaDescription && { metaDescription: data.metaDescription }),
        ...(data.textContentChange && { body: data.textContentChange }),
        ...(data.removeImages && { imagesUrl: [] }),
        ...(data.visitSite && { visitSite: data.visitSite }),
        ...(data.state && { state: data.state }),
      },
    });

    if (
      data.state === PostState.POSTED &&
      post.state !== PostState.POSTED.toString()
    ) {
      this.logger.log(
        `Post ${postId} published, triggering Victor ingestion for account ${account.id}`,
      );
    }

    this.logger.log('Post update process completed successfully');

    return {
      success: true,
      message: 'Post updated successfully',
      postId: updatedPost.id,
      tags: updatedPost.tags,
      body: updatedPost.body,
      socialNetwork: data.socialMediaProvider,
    };
  }

  private async trackChunkUsage(
    generatedPostId: string,
    chunkIds: string[],
    role: string,
  ): Promise<void> {
    await this.prisma.postChunkUsage.createMany({
      data: chunkIds.map((chunkId) => ({
        postId: generatedPostId,
        chunkId,
        role,
      })),
    });

    await Promise.all(
      chunkIds.map((chunkId) =>
        this.prisma.embeddingChunk.update({
          where: { id: chunkId },
          data: { usageCount: { increment: 1 } },
        }),
      ),
    );
  }

  /**
   * Creates a preview of Victor context data for logging
   */
  private buildVictorContextPreview(
    data: Partial<AccountData>,
  ): Record<string, { length: number; full: string }> {
    const result: Record<string, { length: number; full: string }> = {};
    const keys: Array<keyof AccountData> = [
      'victorBrandbook',
      'victorSuccessfulBlogs',
      'victorRealExamples',
      'victorInternalLinks',
      'victorCompetitorLearning',
      'victorExternalLinks',
      'victorPastPosts',
      'victorMarketIntel',
    ];

    keys.forEach((key) => {
      const value = data[key];
      if (typeof value === 'string' && value.trim()) {
        result[key as string] = {
          length: value.length,
          full: value,
        };
      }
    });

    return result;
  }

  /**
   * Generates social media content using LLM with Victor context enrichment
   */
  private async generateSocialMediaContentWithLlm(
    generationData: PostContentGenerationData,
    account: Account,
  ): Promise<AgentGeneratedPostDto[]> {
    const generationId = generationData.generationId;
    if (!generationId) {
      throw new ApplicationErrorException(ERROR_CODES.MISSING_GENERATION_ID);
    }
    let generatedContent: { posts: AgentGeneratedPostDto[] } | null = null;

    if (!account) {
      throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    const postGuidelinesData = account.postGuidelines as {
      dos: string[];
      donts: string[];
    } | null;
    const postGuidelinesDos =
      postGuidelinesData?.dos?.filter((item) => item.trim()).join(', ') || '';
    const postGuidelinesDonts =
      postGuidelinesData?.donts?.filter((item) => item.trim()).join(', ') || '';

    const enhancedGenerationData: AccountData & {
      insight?: string;
      postGuidelinesDos?: string;
      postGuidelinesDonts?: string;
      sources?: {
        internal: Array<{ url: string; title?: string }>;
        external: Array<{ url: string; title?: string }>;
        all: Array<{ url: string; title?: string }>;
      };
      hasSources?: boolean;
      sourceCount?: { internal: number; external: number };
    } = {
      topic: generationData.topic,
      prompt: generationData.prompt,
      style: generationData.style,
      industryCategory: account.industryCategory,
      subIndustryCategory: account.subIndustryCategory,
      keyFeatures: account.keyFeatures,
      toneOfVoice: account.toneOfVoice,
      values: account.values,
      personality: account.personality,
      about: account.about,
      language: account.language || 'english',
      insight: (generationData as any).insight || '',
      postGuidelinesDos,
      postGuidelinesDonts,
      ...((generationData as any).sources && {
        sources: (generationData as any).sources,
        hasSources: (generationData as any).sources.all.length > 0,
        sourceCount: {
          internal: (generationData as any).sources.internal.length,
          external: (generationData as any).sources.external.length,
        },
      }),
    };

    if (!account) {
      throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    const usedStepMap = {
      [SocialMediaProvider.X]: UsedStep.X_CONTENT_POST_GENERATION,
      [SocialMediaProvider.LINKEDIN]: UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
      [SocialMediaProvider.FACEBOOK]: UsedStep.FACEBOOK_CONTENT_POST_GENERATION,
      [SocialMediaProvider.INSTAGRAM]:
        UsedStep.INSTAGRAM_CONTENT_POST_GENERATION,
      [SocialMediaProvider.PINTEREST]:
        UsedStep.PINTEREST_CONTENT_POST_GENERATION,
      [SocialMediaProvider.REDDIT]: UsedStep.REDDIT_CONTENT_POST_GENERATION,
      [SocialMediaProvider.BLOG]: UsedStep.BLOG_CONTENT_POST_GENERATION,
      [SocialMediaProvider.LISTICLE]: UsedStep.LISTICLE_CONTENT_POST_GENERATION,
    };

    const usedStep = usedStepMap[generationData.socialMediaProvider];

    if (!usedStep) {
      this.logger.error('Invalid social network for AI settings', {
        socialNetwork: generationData.socialMediaProvider,
      });
      throw new ApplicationErrorException(
        ERROR_CODES.INVALID_SOCIAL_NETWORK_FOR_AI_SETTINGS,
      );
    }

    const aiModelSetting =
      await this.aiModelsService.getAiStepSettings(usedStep);

    const configKey = `${generationData.socialMediaProvider.toUpperCase()}_POSTS_GENERATION_COUNT`;
    const postsCount = this.configService.get<number>(configKey);
    if (!postsCount) {
      this.logger.error(`${configKey} environment variable is required`);
      throw new ApplicationErrorException(ERROR_CODES.CONFIGURATION_ERROR);
    }

    const draftPosts = await Promise.all(
      Array.from({ length: postsCount }, async () => {
        return await this.addPostAsDraft(
          generationId,
          aiModelSetting,
          generationData,
          account.id,
          generationData.socialMediaProvider,
        );
      }),
    );

    this.lastUsedChunkIds = [];

    const result = await this.socialContentGenerationService.generatePosts(
      enhancedGenerationData,
      this.socialContentGenerationService.parseSocialMediaContent.bind(
        this.socialContentGenerationService,
      ),
      generationData.socialMediaProvider,
      account,
      generationData.generateImage,
    );

    // Type assertion: parseGeneratedPost returns AgentGeneratedPostDto
    generatedContent = {
      posts: result.generatedPosts as unknown as AgentGeneratedPostDto[],
    };

    if (generatedContent == null || !generatedContent.posts) {
      this.logger.error(
        `No content generated socialMediaProvider ${generationData.socialMediaProvider}`,
        {
          socialMediaProvider: generationData.socialMediaProvider,
          accountId: account.id,
        },
      );
      throw new ApplicationErrorException(ERROR_CODES.NO_CONTENT_GENERATED);
    }

    const postsWithDraftIds = generatedContent.posts.map((post, index) => ({
      ...post,
      id: draftPosts[index].id,
    }));

    return postsWithDraftIds;
  }

  async removeImages(
    account: Account,
    postId: string,
    body: RemoveImagesRequestDto,
  ) {
    const post = await this.prisma.post.findUnique({
      where: {
        accountId: account.id,
        id: postId,
      },
    });

    if (!post) {
      throw new ApplicationErrorException(ERROR_CODES.POST_NOT_FOUND);
    }

    const imagesToRemove = body.map((image) => image.imageUrl);
    if (!imagesToRemove) {
      throw new ApplicationErrorException(ERROR_CODES.NO_IMAGES_TO_REMOVE);
    }
    post.imagesUrl = post.imagesUrl.filter(
      (image) => !imagesToRemove.includes(image),
    );
    const updatedPost = await this.prisma.post.update({
      where: {
        accountId: account.id,
        id: postId,
      },
      data: {
        imagesUrl: post.imagesUrl,
      },
    });

    return {
      success: true,
      message: 'Images removed successfully',
      postId: updatedPost.id,
      imagesUrl: updatedPost.imagesUrl,
    };
  }

  /**
   * Generates presigned URL for image upload and adds it to post
   */
  async uploadImageToS3AndAddToPost(account: Account, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        accountId: account.id,
        id: postId,
      },
    });

    if (!post) {
      throw new ApplicationErrorException(ERROR_CODES.POST_NOT_FOUND);
    }

    const fileIdKey = uuidv4();
    const imageKey = `user_uploads/${account.id}/images/${postId}/${fileIdKey}.png`;
    const region = this.configService.get<string>('AWS_REGION');
    const bucket = this.configService.get<string>(
      'S3_BUCKET_IGEO_PUBLIC_RESOURCES',
    );
    const preSignedUrl = await this.s3Service.generatePresignedUrl(
      imageKey,
      bucket,
    );
    const imageFinalUrl = `https://${bucket}.s3.${region}.amazonaws.com/${imageKey}`;

    post.imagesUrl.push(imageFinalUrl);
    await this.prisma.post.update({
      where: {
        accountId: account.id,
        id: postId,
      },
      data: {
        imagesUrl: post.imagesUrl,
      },
    });

    return {
      signedUrl: preSignedUrl,
      message: 'uploaded image to S3',
    };
  }

  /**
   * Downloads post image and tracks Unsplash usage if applicable
   */
  async downloadPictureFromUrl(
    pictureUrl: string,
  ): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    try {
      this.logger.log('Fetching picture from URL', { pictureUrl });

      this.logger.log('Fetching picture from URL', { pictureUrl });
      const response = await firstValueFrom(
        this.httpService.get(pictureUrl, {
          responseType: 'arraybuffer',
        }),
      );

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const filename = `${pictureUrl.split('/').pop() || 'image'}.jpg`;

      this.logger.log('Picture downloaded successfully', { filename });

      return { buffer, contentType, filename };
    } catch (error) {
      this.logger.error('Error downloading picture:', error);
      throw error;
    }
  }
}
