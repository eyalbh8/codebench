import { ConfigService } from '@/config/config.service';
import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { AiModelsService, UsedStep } from '../ai.models.service';
import { AppLogger } from '@/utils/app-logger.service';
import { Account, AiSetting, Competitor, Topic } from '@prisma/client';
import {
  PromptIntentType,
  PromptType,
  Provider,
  SocialMediaProvider,
} from '@/model.enums';
import { S3Service } from '@/common/services/s3.service';
import { getFormattedDate } from '@/utils/calculations';
import { AccountData } from '@/api/dtos-schemes/agent.scheme';
import { PopulatedAccount } from '@/types/api';
import type {
  AccountWithCompetitors,
  CompetitorAngle,
  SocialPostSharedBriefing,
  SocialPostVisibilityPlan,
} from '@/types/social-media';
import { OpenaiProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { createApi } from 'unsplash-js';
import { BlogPatternsService, PromptIntent } from '../blog-patterns.service';
import { PrismaService } from '../../../prisma/prisma.service';

export interface LlmProvider {
  makeWebSearchRequest: ({
    model,
    inputMessage,
  }: {
    model: string;
    inputMessage: string;
  }) => Promise<LlmResponse>;
  makeChatRequest: (
    inputMessage: string,
    model: string,
  ) => Promise<LlmResponse>;
  makeImageRequest?: (prompt: string, model: string) => Promise<string>;
}

export interface LlmResponse {
  provider: string;
  model: string;
  inputMessage: string;
  output?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string | null;
}

export interface GenerateAccountSuggestedPromptsParams {
  account: Account;
  numberOfPrompts: number;
  domain: string;
  topics: string[];
  region: string;
  language: string;
  intentType: PromptIntentType;
  promptType: PromptType;
  additionalInstructions?: string;
  excludeWords?: string;
  existingPrompts?: string[];
}

@Injectable()
export class LlmService {
  private readonly client: OpenAI;

  constructor(
    private configService: ConfigService,
    private s3Service: S3Service,
    private aiModelsService: AiModelsService,
    private openaiProvider: OpenaiProvider,
    private geminiProvider: GeminiProvider,
    private blogPatternsService: BlogPatternsService,
    private prisma: PrismaService,
    private logger: AppLogger,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      const error = new ApplicationErrorException(
        ERROR_CODES.CONFIGURATION_ERROR,
        undefined,
        'OPENAI_API_KEY is required',
      );
      throw error;
    }
    this.client = new OpenAI({ apiKey });
  }

  async generateSocialPostSharedBriefing(
    account: AccountWithCompetitors,
    accountData: AccountData,
  ): Promise<SocialPostSharedBriefing> {
    try {
      const existingKnowledgeSources = account.knowledgeSources || [];

      const model = await this.aiModelsService.getAiStepSettings(
        UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
      );
      if (!model.inputMessage) {
        throw new ApplicationErrorException(ERROR_CODES.MISSING_REQUIRED_FIELD);
      }

      const competitors = (account.competitors || [])
        .filter((c) => c.status !== 'INACTIVE')
        .map((c) => ({
          name: c.name,
          site: c.site ?? '',
          advantage: c.advantage ?? '',
        }));

      const inputParams = {
        brandName: account.title,
        brandAltNames: (account.names || []).join(', ') || 'N/A',
        brandAbout: account.about || '',
        brandKeyFeatures: (account.keyFeatures || []).join(', '),
        toneOfVoice: (account.toneOfVoice || []).join(', '),
        values: (account.values || []).join(', '),
        personality: (account.personality || []).join(', '),
        accountDomains: (account.domains || []).join(', '),
        topic: accountData.topic,
        prompt: accountData.prompt,
        competitorDetails: JSON.stringify(competitors, null, 2),
        knowledgeSources: JSON.stringify(existingKnowledgeSources, null, 2),
      };

      const inputMessage = AiModelsService.renderTemplate(
        model.inputMessage,
        inputParams,
      );

      const provider = this.getProvider(model);
      const response = await provider.makeChatRequest(
        inputMessage,
        model.model,
      );

      if (!response.output) {
        throw new ApplicationErrorException(ERROR_CODES.LLM_SERVICE_ERROR);
      }

      const raw = JSON.parse(
        extractJsonFromOutput(response.output),
      ) as Partial<SocialPostSharedBriefing>;

      const sanitized = this.sanitizeSocialBriefing(raw);
      const s3_response_key = `llm/${account.id}/${getFormattedDate()}-social-post-briefing.json`;
      await Promise.all([
        this.uploadResponse(
          JSON.stringify(
            {
              provider: response.provider,
              model: response.model,
              inputMessage: response.inputMessage,
              inputParams,
              output: response.output,
              usage: response.usage,
              error: response.error,
            },
            null,
            2,
          ),
          s3_response_key,
        ),
      ]);

      this.logger.log('Social post shared briefing generated successfully', {
        accountId: account.id,
        accountName: account.title,
        provider: response.provider,
      });

      return sanitized;
    } catch (error) {
      this.logger.error(
        `Error generating social post shared briefing: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw error;
    }
  }

  async generateSocialPostVisibilityPlan(
    account: AccountWithCompetitors,
    accountData: AccountData,
    sharedBriefing: SocialPostSharedBriefing,
  ): Promise<SocialPostVisibilityPlan> {
    try {
      const model = await this.aiModelsService.getAiStepSettings(
        UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
      );
      if (!model.inputMessage) {
        throw new ApplicationErrorException(ERROR_CODES.MISSING_REQUIRED_FIELD);
      }

      const inputParams = {
        brandName: account.title,
        topic: accountData.topic,
        prompt: accountData.prompt,
        accountDomains: (account.domains || []).join(', '),
        sharedBriefing: JSON.stringify(sharedBriefing, null, 2),
      };

      const inputMessage = AiModelsService.renderTemplate(
        model.inputMessage,
        inputParams,
      );

      const provider = this.getProvider(model);
      const response = await provider.makeChatRequest(
        inputMessage,
        model.model,
      );

      if (!response.output) {
        throw new ApplicationErrorException(ERROR_CODES.LLM_SERVICE_ERROR);
      }

      const raw = JSON.parse(
        extractJsonFromOutput(response.output),
      ) as Partial<SocialPostVisibilityPlan>;

      const sanitized = this.sanitizeVisibilityPlan(raw);
      const s3_response_key = `llm/${account.id}/${getFormattedDate()}-social-post-visibility-plan.json`;
      await Promise.all([
        this.uploadResponse(
          JSON.stringify(
            {
              provider: response.provider,
              model: response.model,
              inputMessage: response.inputMessage,
              inputParams,
              output: response.output,
              usage: response.usage,
              error: response.error,
            },
            null,
            2,
          ),
          s3_response_key,
        ),
      ]);

      this.logger.log('Social post visibility plan generated successfully', {
        accountId: account.id,
        accountName: account.title,
        provider: response.provider,
      });

      return sanitized;
    } catch (error) {
      this.logger.error(
        `Error generating social post visibility plan: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw error;
    }
  }

  async generateSocialMediaContent(
    account: Account,
    provider: SocialMediaProvider,
    accountData: AccountData,
  ): Promise<string> {
    try {
      let aiSettingsStep: UsedStep;

      if (provider === SocialMediaProvider.BLOG) {
        try {
          let prompt: { type: string; prompt?: string } | null = null;
          let queryMethod: 'promptId' | 'promptText' | null = null;

          if ((accountData as any).promptId) {
            prompt = await this.prisma.prompt.findUnique({
              where: { id: (accountData as any).promptId },
              select: { type: true, prompt: true },
            });

            if (prompt) {
              queryMethod = 'promptId';
            }
          }

          if (!prompt) {
            const normalizedPromptText = accountData.prompt.trim();

            prompt = await this.prisma.prompt.findFirst({
              where: {
                accountId: account.id,
                prompt: normalizedPromptText,
                isActive: true,
                state: 'ACTIVE',
                deletedAt: null,
              },
              select: { type: true, prompt: true },
            });

            if (!prompt) {
              const allPrompts = await this.prisma.prompt.findMany({
                where: {
                  accountId: account.id,
                  isActive: true,
                  state: 'ACTIVE',
                  deletedAt: null,
                },
                select: { type: true, prompt: true },
              });

              const matchedPrompt = allPrompts.find(
                (p) =>
                  p.prompt.trim().toLowerCase() ===
                  normalizedPromptText.toLowerCase(),
              );

              if (matchedPrompt) {
                prompt = matchedPrompt;
                queryMethod = 'promptText';
              }
            } else {
              queryMethod = 'promptText';
            }
          }

          let derivedIntent: PromptIntent = 'INFORMATIONAL';
          if (prompt?.type) {
            const rawPromptType = prompt.type;
            const normalizedType = rawPromptType.toUpperCase().trim();

            if (
              [
                'COMMERCIAL',
                'INFORMATIONAL',
                'NAVIGATIONAL',
                'TRANSACTIONAL',
              ].includes(normalizedType)
            ) {
              derivedIntent = normalizedType as PromptIntent;
            } else {
              this.logger.warn(
                `Invalid prompt type "${rawPromptType}" found, defaulting to INFORMATIONAL`,
                {
                  accountId: account.id,
                  rawPromptType,
                  normalizedType,
                  validTypes: [
                    'COMMERCIAL',
                    'INFORMATIONAL',
                    'NAVIGATIONAL',
                    'TRANSACTIONAL',
                  ],
                },
              );
            }
          } else {
            this.logger.error(
              'Could not find prompt in database, defaulting to INFORMATIONAL',
              {
                accountId: account.id,
                prompt: accountData.prompt,
                queryMethod: queryMethod || 'none',
              },
            );
            throw new ApplicationErrorException(
              ERROR_CODES.MISSING_REQUIRED_FIELD,
              undefined,
              'Prompt not found in database',
            );
          }

          aiSettingsStep =
            this.blogPatternsService.getUsedStepForIntent(derivedIntent);
        } catch (error) {
          this.logger.error(
            `Error retrieving prompt intent, defaulting to INFORMATIONAL`,
            {
              accountId: account.id,
              topic: accountData.topic,
              prompt: accountData.prompt,
              hasPromptId: !!(accountData as any).promptId,
              promptId: (accountData as any).promptId || null,
              error: error instanceof Error ? error.message : String(error),
              errorStack: error instanceof Error ? error.stack : undefined,
            },
          );
          throw new ApplicationErrorException(
            ERROR_CODES.MISSING_REQUIRED_FIELD,
            undefined,
            `Error retrieving prompt intent: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      } else {
        const stepMap: Record<
          | 'LINKEDIN'
          | 'X'
          | 'FACEBOOK'
          | 'INSTAGRAM'
          | 'PINTEREST'
          | 'REDDIT'
          | 'LISTICLE',
          UsedStep
        > = {
          LINKEDIN: UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
          X: UsedStep.X_CONTENT_POST_GENERATION,
          FACEBOOK: UsedStep.FACEBOOK_CONTENT_POST_GENERATION,
          INSTAGRAM: UsedStep.INSTAGRAM_CONTENT_POST_GENERATION,
          PINTEREST: UsedStep.PINTEREST_CONTENT_POST_GENERATION,
          REDDIT: UsedStep.REDDIT_CONTENT_POST_GENERATION,
          LISTICLE: UsedStep.LISTICLE_CONTENT_POST_GENERATION,
        };

        aiSettingsStep = stepMap[provider];
      }
      const model =
        await this.aiModelsService.getAiStepSettings(aiSettingsStep);

      if (!model.inputMessage) {
        throw new ApplicationErrorException(ERROR_CODES.MISSING_REQUIRED_FIELD);
      }

      const sources = (accountData as any).sources;
      let sourcesText = '';
      let externalSourcesText = '';
      let internalSourcesText = '';

      if (sources) {
        if (sources.external && sources.external.length > 0) {
          externalSourcesText = sources.external
            .map(
              (s: { url: string; title?: string }, idx: number) =>
                `${idx + 1}. ${s.title ? `${s.title} - ` : ''}${s.url}`,
            )
            .join('\n');
        }
        if (sources.internal && sources.internal.length > 0) {
          internalSourcesText = sources.internal
            .map(
              (s: { url: string; title?: string }, idx: number) =>
                `${idx + 1}. ${s.title ? `${s.title} - ` : ''}${s.url}`,
            )
            .join('\n');
        }
        if (sources.all && sources.all.length > 0) {
          sourcesText = sources.all
            .map(
              (s: { url: string; title?: string }, idx: number) =>
                `${idx + 1}. ${s.title ? `${s.title} - ` : ''}${s.url}`,
            )
            .join('\n');
        }
      }

      const systemPrompt = AiModelsService.renderTemplate(model.inputMessage, {
        topic: accountData.topic,
        prompt: accountData.prompt,
        style: accountData.style || '',
        about: accountData.about || '',
        industryCategory: accountData.industryCategory || '',
        subIndustryCategory: accountData.subIndustryCategory || '',
        keyFeatures: (accountData.keyFeatures || []).join(', '),
        toneOfVoice: (accountData.toneOfVoice || []).join(', '),
        values: (accountData.values || []).join(', '),
        personality: (accountData.personality || []).join(', '),
        language: accountData.language || 'english',
        insight: accountData.insight || '',
        victorBrandbook: accountData.victorBrandbook || '',
        victorPastPosts: accountData.victorPastPosts || '',
        victorMarketIntel: accountData.victorMarketIntel || '',
        competitorBrands: (accountData as any).competitorBrands || '',
        victorSuccessfulBlogs: (accountData as any).victorSuccessfulBlogs || '',
        victorInternalLinks: (accountData as any).victorInternalLinks || '',
        victorCompetitorLearning:
          (accountData as any).victorCompetitorLearning || '',
        victorExternalLinks: (accountData as any).victorExternalLinks || '',
        postGuidelinesDos: (accountData as any).postGuidelinesDos || '',
        postGuidelinesDonts: (accountData as any).postGuidelinesDonts || '',
        sources: sourcesText,
        externalSources: externalSourcesText,
        internalSources: internalSourcesText,
        hasSources:
          sources && sources.all && sources.all.length > 0 ? 'YES' : 'NO',
      });

      const llmProvider: LlmProvider = this.getProvider(model);

      const response = await llmProvider.makeChatRequest(
        systemPrompt,
        model.model,
      );
      this.logger.log('LLM raw response received', {
        provider: response.provider,
        model: response.model,
        outputLength: response.output?.length || 0,
        outputFull: response.output,
      });

      const content = response.output;
      if (!content) {
        throw new ApplicationErrorException(ERROR_CODES.LLM_SERVICE_ERROR);
      }

      this.logger.log(`${provider} content generation completed successfully`);

      const s3_response_key = `llm/${account.id}/${getFormattedDate()}-social-media-content.json`;
      await Promise.all([
        this.uploadResponse(
          JSON.stringify(
            {
              provider: response.provider,
              model: response.model,
              inputMessage: response.inputMessage,
              output: response.output,
              usage: response.usage,
              error: response.error,
            },
            null,
            2,
          ),
          s3_response_key,
        ),
      ]);

      return content;
    } catch (error) {
      this.logger.error(
        `Error generating ${provider} content: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getCompetitorSiteUrl(
    account: PopulatedAccount,
    competitor: Competitor,
  ) {
    const siteUrlModel = await this.aiModelsService.getAiStepSettings(
      UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
    );

    if (!siteUrlModel.inputMessage) {
      throw new ApplicationErrorException(ERROR_CODES.MISSING_REQUIRED_FIELD);
    }

    const inputParams = {
      competitorName: competitor.name,
    };
    const inputMessage = AiModelsService.renderTemplate(
      siteUrlModel.inputMessage,
      inputParams,
    );

    const llmProvider: LlmProvider = this.getProvider(siteUrlModel);

    const response = await llmProvider.makeWebSearchRequest({
      model: siteUrlModel.model,
      inputMessage,
    });

    const content = response.output;
    if (!content) {
      this.logger.error('No content in OpenAI response');
      throw new Error('No content in OpenAI response');
    }

    const s3_response_key = `llm/${account.id}/${competitor.name}-site-url.json`;
    await Promise.all([
      this.uploadResponse(
        JSON.stringify(
          {
            provider: response.provider,
            model: response.model,
            inputMessage: response.inputMessage,
            inputParams,
            output: content,
            usage: response.usage,
            error: response.error,
          },
          null,
          2,
        ),
        s3_response_key,
      ),
    ]);

    const toReturn = JSON.parse(extractJsonFromOutput(content));

    return toReturn.siteUrl;
  }

  private async translateToEnglishIfNeeded(text: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      return text;
    }

    try {
      // Use OpenAI to detect language and translate if not English
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a language detection and translation assistant. If the provided text is in English, return it exactly as-is. If it is in any other language, translate it to English. Only return the text itself, no explanations or additional text.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const translatedText = response.choices[0]?.message?.content?.trim();
      if (translatedText) {
        return translatedText;
      }

      // Fallback: return original text if translation fails
      this.logger.warn('Translation response was empty, using original text', {
        originalText: text,
      });
      return text;
    } catch (error) {
      // If translation fails, log and return original text
      this.logger.error('Error translating text to English:', {
        error: error instanceof Error ? error.message : String(error),
        originalText: text,
      });
      return text;
    }
  }

  async trackUnsplashDownload(downloadLocation: string): Promise<void> {
    try {
      const unsplash = createApi({
        accessKey: this.configService.get<string>('UNSPLASH_ACCESS_KEY'),
      });

      await unsplash.photos.trackDownload({ downloadLocation });

      this.logger.log('Unsplash download tracked successfully');
    } catch (error) {
      this.logger.error('Error tracking Unsplash download:', error);
    }
  }

  private sanitizeSocialBriefing(
    raw: Partial<SocialPostSharedBriefing>,
  ): SocialPostSharedBriefing {
    const competitorAngles = (raw?.competitorAngles ?? [])
      .filter((angle): angle is CompetitorAngle => Boolean(angle?.name))
      .map((angle) => ({
        name: angle.name,
        threatLevel:
          angle.threatLevel === 'HIGH' ||
          angle.threatLevel === 'MEDIUM' ||
          angle.threatLevel === 'LOW'
            ? angle.threatLevel
            : 'MEDIUM',
        differentiator: angle.differentiator || '',
        recommendedCounter: angle.recommendedCounter || '',
      }));

    return {
      brandSummary: raw?.brandSummary || '',
      mustHighlight: (raw?.mustHighlight || []).filter(Boolean),
      brandVoiceGuardrails: {
        tone: raw?.brandVoiceGuardrails?.tone || [],
        values: raw?.brandVoiceGuardrails?.values || [],
        personality: raw?.brandVoiceGuardrails?.personality || [],
      },
      competitorAngles,
    };
  }

  private sanitizeVisibilityPlan(
    raw: Partial<SocialPostVisibilityPlan>,
  ): SocialPostVisibilityPlan {
    return {
      searchIntent: raw?.searchIntent || '',
      llmVisibilityAngles: raw?.llmVisibilityAngles || [],
      keywordFocus: raw?.keywordFocus || [],
      openingHook: raw?.openingHook || '',
      structure: {
        sections:
          raw?.structure?.sections?.map((section) => ({
            name: section?.name || '',
            purpose: section?.purpose || '',
          })) || [],
      },
      cta: raw?.cta || '',
      competitorDifferentiation: raw?.competitorDifferentiation || [],
    };
  }

  private parseJsonWithSanitization<T>(content: string): T {
    const attempts: string[] = [];

    // First, extract JSON from markdown code blocks if present
    const cleanedResponse = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const directTrimmed = cleanedResponse.trim();
    if (directTrimmed) {
      attempts.push(directTrimmed);
    }

    const firstBrace = directTrimmed.indexOf('{');
    const lastBrace = directTrimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      attempts.push(directTrimmed.slice(firstBrace, lastBrace + 1));
    }

    const sanitized = this.sanitizeJsonString(directTrimmed);
    if (sanitized && !attempts.includes(sanitized)) {
      attempts.push(sanitized);
    }

    for (const attempt of attempts) {
      try {
        return JSON.parse(attempt) as T;
      } catch (error) {
        // continue to next attempt
        if (attempt === attempts[attempts.length - 1]) {
          throw error instanceof Error ? error : new Error(String(error));
        }
      }
    }

    throw new Error('Unable to parse JSON response');
  }

  private sanitizeJsonString(content: string): string {
    let result = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < content.length; i += 1) {
      const char = content[i];

      if (inString) {
        if (escapeNext) {
          result += char;
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          result += char;
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          let j = i + 1;
          let foundClosing = false;

          while (j < content.length && /\s/.test(content[j])) {
            j++;
          }

          if (j < content.length) {
            const charAfterWhitespace = content[j];
            if (
              charAfterWhitespace === ':' ||
              charAfterWhitespace === ',' ||
              charAfterWhitespace === '}' ||
              charAfterWhitespace === ']'
            ) {
              foundClosing = true;
            }
          } else {
            foundClosing = true;
          }

          if (foundClosing) {
            result += char;
            inString = false;
            continue;
          } else {
            result += '\\"';
            continue;
          }
        }

        if (char === '\n') {
          result += '\\n';
          continue;
        }

        if (char === '\r') {
          result += '\\r';
          continue;
        }

        if (char === '\t') {
          result += '\\t';
          continue;
        }
      } else if (char === '"') {
        inString = true;
      }

      result += char;
    }

    return result;
  }

  private sanitizeJsonForParsing(content: string): string {
    // Extract JSON from markdown code blocks if present
    let extracted = extractJsonFromOutput(content);

    // Try to find JSON object boundaries
    const firstBrace = extracted.indexOf('{');
    const lastBrace = extracted.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      extracted = extracted.slice(firstBrace, lastBrace + 1);
    }

    // Fix common JSON issues:
    // 1. Trailing commas
    // 2. Control characters
    // 3. Unescaped quotes in string values

    // Remove trailing commas before closing braces/brackets
    extracted = extracted.replace(/,(\s*[}\]])/g, '$1');

    // Remove control characters (but keep newlines/tabs in string values)
    // We'll be more careful here - only remove truly problematic control chars
    extracted = extracted.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Try multiple parsing strategies
    const attempts: string[] = [extracted];

    // Strategy 1: Try to fix unescaped quotes in string values
    // This regex finds string values and escapes quotes within them
    try {
      let fixed = extracted;
      let inString = false;
      let escapeNext = false;
      let result = '';

      for (let i = 0; i < fixed.length; i++) {
        const char = fixed[i];

        if (escapeNext) {
          result += char;
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          result += char;
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          if (inString) {
            // Check if this is closing a string value (followed by comma, colon, brace, or bracket)
            const nextChar = fixed[i + 1];
            if (
              nextChar === ',' ||
              nextChar === '}' ||
              nextChar === ']' ||
              nextChar === ':'
            ) {
              inString = false;
              result += char;
              continue;
            }
            // Otherwise, escape it
            result += '\\"';
            continue;
          } else {
            // Check if this starts a string value (after colon or comma)
            const prevChar = fixed[i - 1];
            if (
              prevChar === ':' ||
              prevChar === ',' ||
              prevChar === '[' ||
              prevChar === '{'
            ) {
              inString = true;
              result += char;
              continue;
            }
          }
        }

        result += char;
      }

      if (result !== extracted) {
        attempts.push(result);
      }
    } catch (e) {
      // If fixing fails, continue with original
    }

    // Try each attempt
    for (const attempt of attempts) {
      try {
        // Validate it's parseable
        JSON.parse(attempt);
        return attempt;
      } catch (e) {
        // Continue to next attempt
      }
    }

    // If all attempts fail, return the original (will throw error in caller)
    return extracted;
  }

  private sanitizeGeneratedContent(content: string, brandName: string): string {
    let sanitized = content
      // Remove markdown-style links [text](url) -> keep just text
      .replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
      // Remove empty anchor tags <a href="">text</a> -> keep just text
      .replace(/<a\s+href=["']["']\s*>([^<]*)<\/a>/gi, '$1')
      // Clean up empty parentheses and extra spaces
      .replace(/\(\s*\)/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    if (brandName) {
      const brandRegex = new RegExp(
        `\\b${this.escapeRegExp(brandName)}\\b`,
        'i',
      );
      if (!brandRegex.test(sanitized)) {
        sanitized = `${brandName}: ${sanitized}`;
      }
    }

    return sanitized;
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async uploadResponse(responseContent: string, fileName: string) {
    try {
      await this.s3Service.putObject(responseContent, fileName);
    } catch (error) {
      this.logger.error(
        `Error saving suggested merge entities to S3: ${error}`,
        error,
      );
    }
  }

  private getProvider(suggestedMergeEntitiesModel: AiSetting) {
    switch (suggestedMergeEntitiesModel.provider) {
      case Provider.OPENAI.toString(): {
        return this.openaiProvider;
      }
      case Provider.GEMINI.toString(): {
        return this.geminiProvider;
      }
      default:
        throw new ApplicationErrorException(ERROR_CODES.INVALID_INPUT);
    }
  }
}

function extractJsonFromOutput(content: string): string {
  let cleanContent = content.trim();
  if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '');
    cleanContent = cleanContent.replace(/\n?```\s*$/, '');
  } else {
    // look for any ```json ... ``` block inside the text
    const match = cleanContent.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (match) {
      cleanContent = match[1].trim();
    }
  }
  return cleanContent;
}
