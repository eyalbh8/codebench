import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { SocialMediaProvider, PostState } from '@/model.enums';
import axios from 'axios';
import { TrackedRecommendationsService } from './tracked-insights';

type WordPressCredentials = {
  siteUrl: string;
  username: string;
  applicationPassword: string;
  connectedAt: string;
};

type ProviderTokensRecord = {
  [key: string]: WordPressCredentials;
};

@Injectable()
export class BlogConnectionService implements ISocialMediaConnectionService {
  private readonly providerKey = 'blog';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly trackedRecommendationsService: TrackedRecommendationsService,
  ) {}

  private get isProd(): boolean {
    return (this.configService.get('NODE_ENV') || '').toLowerCase() === 'prod';
  }

  async setAccessToken(
    account: PopulatedAccount,
    code: string | { code: string; codeVerifier?: string; state?: string },
    codeVerifier?: string,
  ): Promise<{ message: string; provider: string }> {
    try {
      this.logger.log('Setting WordPress blog connection');

      const codeString = typeof code === 'string' ? code : code.code;

      let credentials: {
        siteUrl: string;
        username: string;
        applicationPassword: string;
      };

      try {
        credentials = JSON.parse(codeString);
      } catch (error) {
        this.logger.error('Failed to parse WordPress credentials', {
          error: error.message,
        });
        throw new Error('Invalid WordPress credentials format');
      }

      await this.validateWordPressCredentials(credentials);

      const existing =
        (account.accountSettings
          ?.socialMediaProviderTokens as unknown as ProviderTokensRecord) || {};
      existing[this.providerKey] = {
        ...credentials,
        connectedAt: new Date().toISOString(),
      };

      await this.prisma.accountSettings.update({
        where: { accountId: account.id },
        data: {
          socialMediaProviderTokens: existing,
        },
      });

      this.logger.log('WordPress blog connection saved successfully', {
        accountId: account.id,
        siteUrl: credentials.siteUrl,
      });

      return {
        message: 'WordPress blog connected successfully',
        provider: SocialMediaProvider.BLOG,
      };
    } catch (error) {
      this.logger.error('Error connecting WordPress blog:', {
        message: error.message,
        accountId: account.id,
      });
      throw error;
    }
  }

  private async validateWordPressCredentials(credentials: {
    siteUrl: string;
    username: string;
    applicationPassword: string;
  }): Promise<void> {
    const authString = Buffer.from(
      `${credentials.username}:${credentials.applicationPassword}`,
    ).toString('base64');

    const response = await axios.get(
      `${credentials.siteUrl}/wp-json/wp/v2/users/me`,
      {
        headers: {
          Authorization: `Basic ${authString}`,
        },
        timeout: 10000,
      },
    );

    if (!response.data || !response.data.id) {
      throw new Error('Failed to authenticate with WordPress');
    }

    this.logger.log('WordPress credentials validated successfully', {
      username: credentials.username,
      siteUrl: credentials.siteUrl,
    });
  }

  private parseExistingTokens(account: PopulatedAccount): ProviderTokensRecord {
    return (
      (account.accountSettings
        ?.socialMediaProviderTokens as unknown as ProviderTokensRecord) || {}
    );
  }

  async checkConnectionStatus(account: PopulatedAccount): Promise<boolean> {
    try {
      const existing = this.parseExistingTokens(account);
      const wordpressData = existing[this.providerKey] as WordPressCredentials;

      if (!wordpressData?.siteUrl || !wordpressData?.applicationPassword) {
        return false;
      }

      try {
        await this.validateWordPressCredentials({
          siteUrl: wordpressData.siteUrl,
          username: wordpressData.username,
          applicationPassword: wordpressData.applicationPassword,
        });
        return true;
      } catch (error) {
        this.logger.warn('WordPress credentials validation failed', {
          error: error.message,
        });
        return false;
      }
    } catch (error) {
      this.logger.error('Error checking WordPress blog connection status:', {
        message: error.message,
      });
      return false;
    }
  }

  async logout(account: PopulatedAccount): Promise<boolean> {
    try {
      this.logger.log('Disconnecting WordPress blog');

      const existing = this.parseExistingTokens(account);

      delete existing[this.providerKey];

      await this.prisma.accountSettings.update({
        where: { accountId: account.id },
        data: {
          socialMediaProviderTokens: existing,
        },
      });

      this.logger.log('WordPress blog disconnected successfully');

      return true;
    } catch (error) {
      this.logger.error('Error disconnecting WordPress blog:', {
        message: error.message,
      });
      throw error;
    }
  }

  async publish(account: PopulatedAccount, postId: string): Promise<boolean> {
    this.logger.log('Starting WordPress blog post publication');

    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        this.logger.error(`Post not found: ${postId}`);
        throw new Error(`Post not found: ${postId}`);
      }

      if (post.publishedAt || post.state === PostState.POSTED.toString()) {
        this.logger.warn(
          `Post ${postId} was already published on ${post.publishedAt?.toISOString()}`,
        );
        throw new Error(
          `Post ${postId} was already published and cannot be published again`,
        );
      }

      if (post.socialMediaProvider !== SocialMediaProvider.BLOG) {
        this.logger.error(
          `Post ${postId} is not for Blog provider: ${post.socialMediaProvider}`,
        );
        throw new Error(
          `Post ${postId} is not for Blog provider: ${post.socialMediaProvider}`,
        );
      }

      const isConnected = await this.checkConnectionStatus(account);
      if (!isConnected) {
        throw new Error('WordPress blog connection expired or invalid');
      }

      const existing =
        (account.accountSettings
          ?.socialMediaProviderTokens as unknown as ProviderTokensRecord) || {};
      const wordpressData = existing[this.providerKey] as WordPressCredentials;

      if (
        !wordpressData?.siteUrl ||
        !wordpressData?.username ||
        !wordpressData?.applicationPassword
      ) {
        throw new Error('WordPress credentials not found');
      }

      const authString = Buffer.from(
        `${wordpressData.username}:${wordpressData.applicationPassword}`,
      ).toString('base64');

      const content = post.body;

      let featuredMediaId: number | null = null;
      if (post.imagesUrl && post.imagesUrl.length > 0) {
        const lastImageUrl = post.imagesUrl[post.imagesUrl.length - 1];

        if (
          lastImageUrl &&
          typeof lastImageUrl === 'string' &&
          lastImageUrl.trim().length > 0
        ) {
          try {
            featuredMediaId = await this.uploadWordPressImage(
              wordpressData.siteUrl,
              authString,
              lastImageUrl,
              post.focusKeyphrase || post.title,
            );
            this.logger.log('Featured image uploaded successfully', {
              mediaId: featuredMediaId,
              imageUrl: lastImageUrl,
            });
          } catch (error) {
            this.logger.error('Failed to upload featured image', {
              error: error.message,
              imageUrl: lastImageUrl,
            });
          }
        } else {
          this.logger.warn('Invalid or empty image URL in imagesUrl array', {
            postId,
            imagesUrlLength: post.imagesUrl.length,
            lastImageUrl: lastImageUrl,
          });
        }
      }

      let wordpressTagIds: number[] = [];
      if (post.tags && post.tags.length > 0) {
        this.logger.log('Processing WordPress tags', {
          tagNames: post.tags,
          siteUrl: wordpressData.siteUrl,
        });

        wordpressTagIds = await this.getOrCreateWordPressTags(
          wordpressData.siteUrl,
          wordpressData.username,
          wordpressData.applicationPassword,
          post.tags,
        );
      }

      let updatedContent = content;
      try {
        const publishDate = new Date();
        const publishDateISO = publishDate.toISOString();

        const schemaScriptRegex =
          /<script type="application\/ld\+json"[\s\S]*?<\/script>/gi;
        const schemaMatch = content.match(schemaScriptRegex);

        if (schemaMatch && schemaMatch[0]) {
          try {
            const jsonMatch = schemaMatch[0].match(
              /<script[^>]*>([\s\S]*?)<\/script>/i,
            );
            if (jsonMatch && jsonMatch[1]) {
              const schemaJson = JSON.parse(jsonMatch[1]);

              if (schemaJson['@graph'] && Array.isArray(schemaJson['@graph'])) {
                schemaJson['@graph'].forEach((item: any) => {
                  if (
                    item['@type'] === 'Article' ||
                    item['@type'] === 'WebPage'
                  ) {
                    item.datePublished = publishDateISO;
                  }
                });

                const updatedSchemaScript = `<script type="application/ld+json">\n${JSON.stringify(schemaJson, null, 2)}\n</script>`;
                updatedContent = content.replace(
                  schemaScriptRegex,
                  updatedSchemaScript,
                );

                this.logger.log('Updated schema publish date', {
                  postId,
                  publishDate: publishDateISO,
                });
              }
            }
          } catch (parseError) {
            this.logger.warn(
              'Failed to parse existing schema, skipping date update',
              {
                error:
                  parseError instanceof Error
                    ? parseError.message
                    : String(parseError),
                postId,
              },
            );
          }
        }
      } catch (error) {
        this.logger.error('Failed to update schema publish date', {
          error: error instanceof Error ? error.message : String(error),
          postId,
        });
      }

      const wpPostData: any = {
        title: post.title,
        content: updatedContent,
        status: this.isProd ? 'publish' : 'draft',
        tags: wordpressTagIds,
        meta: {},
      };

      if (featuredMediaId) {
        wpPostData.featured_media = featuredMediaId;
      }

      if (post.slug) wpPostData.slug = post.slug;

      if (post.metaDescription) {
        wpPostData.excerpt = post.metaDescription;
        wpPostData.meta._yoast_wpseo_metadesc = post.metaDescription;
      }

      if (post.focusKeyphrase) {
        wpPostData.meta._yoast_wpseo_focuskw = post.focusKeyphrase;
      }

      if (Object.keys(wpPostData.meta).length === 0) {
        delete wpPostData.meta;
      }

      this.logger.log('Creating WordPress post with data:', {
        title: wpPostData.title,
        hasContent: !!wpPostData.content,
        tagsCount: wpPostData.tags?.length || 0,
        tags: wpPostData.tags,
        originalTags: post.tags,
        slug: wpPostData.slug,
        excerpt: wpPostData.excerpt,
        metaFields: wpPostData.meta,
        metaDescription: post.metaDescription,
        focusKeyphrase: post.focusKeyphrase,
        featuredMediaId: featuredMediaId,
        hasFeaturedImage: !!featuredMediaId,
      });

      const response = await axios.post(
        `${wordpressData.siteUrl}/wp-json/wp/v2/posts`,
        wpPostData,
        {
          headers: {
            Authorization: `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      if (response.status < 200 || response.status >= 300) {
        this.logger.error('WordPress API returned error status', {
          status: response.status,
          statusText: response.statusText,
          responseData: response.data,
          postId,
        });
        throw new Error(
          `WordPress API returned error status ${response.status}: ${response.statusText}`,
        );
      }

      if (response.data?.code || response.data?.message) {
        const errorCode = response.data.code || 'unknown_error';
        const errorMessage = response.data.message || 'Unknown WordPress error';
        const errorData = response.data.data || {};

        this.logger.error('WordPress API returned error response', {
          errorCode,
          errorMessage,
          errorData,
          fullResponse: response.data,
          postId,
          wpPostData: {
            title: wpPostData.title,
            hasContent: !!wpPostData.content,
            status: wpPostData.status,
            tagsCount: wpPostData.tags?.length || 0,
            hasFeaturedImage: !!wpPostData.featured_media,
            hasSlug: !!wpPostData.slug,
            hasExcerpt: !!wpPostData.excerpt,
          },
        });

        throw new Error(`WordPress API error [${errorCode}]: ${errorMessage}`);
      }

      if (!response.data || !response.data.id) {
        const responseSummary = {
          hasResponse: !!response,
          hasResponseData: !!response.data,
          responseDataType: response.data ? typeof response.data : 'undefined',
          responseDataKeys: response.data ? Object.keys(response.data) : [],
          responseStatus: response?.status,
          responseStatusText: response?.statusText,
          responseDataStringified: response.data
            ? JSON.stringify(response.data).substring(0, 1000)
            : 'null',
          responseDataId: response.data?.id,
          responseDataCode: response.data?.code,
          responseDataMessage: response.data?.message,
          postId,
          wpPostDataKeys: Object.keys(wpPostData),
          wpPostDataStatus: wpPostData.status,
          wpPostDataTitle: wpPostData.title,
        };

        this.logger.error(
          'WordPress API did not return a post ID',
          responseSummary,
        );

        let errorMessage = 'WordPress API did not return a post ID';
        if (response.data?.code) {
          errorMessage = `WordPress API error [${response.data.code}]: ${response.data.message || 'Unknown error'}`;
        } else if (response.data && typeof response.data === 'object') {
          errorMessage = `WordPress API returned unexpected response structure. Response keys: ${Object.keys(response.data).join(', ')}`;
        } else if (!response.data) {
          errorMessage = 'WordPress API returned empty or null response data';
        }

        throw new Error(errorMessage);
      }

      const wordpressPostId = response.data.id;
      const publishedUrl = response.data.link;

      this.logger.log('WordPress post created successfully', {
        postId: wordpressPostId,
        title: response.data.title?.rendered,
        metaInResponse: response.data?.meta || 'No meta in response',
        excerptInResponse:
          response.data?.excerpt?.rendered || 'No excerpt in response',
      });

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          postIdInSocialMediaProvider: wordpressPostId.toString(),
          publishedUrl: publishedUrl || null,
          state: PostState.POSTED,
          publishedAt: new Date(),
        } as any,
      });

      this.logger.log(
        `Successfully published post ${postId} to WordPress as post ${response.data.id}`,
        {
          accountId: account.id,
          wordpressPostId: response.data.id,
          wordpressPostUrl: response.data.link,
        },
      );

      try {
        this.logger.log('Generating schemas for published post', {
          postId,
          wordpressPostId: response.data.id,
        });

        if (!post) {
          throw new Error('Post not found for schema injection');
        }

        await axios.post(
          `${wordpressData.siteUrl}/wp-json/wp/v2/posts/${wordpressPostId}`,
          { content: post.body },
          {
            headers: {
              Authorization: `Basic ${authString}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        );

        const schemasIncluded: string[] = [];
        if (
          post.body.includes('"@type":"Organization"') ||
          post.body.includes('"@type": "Organization"')
        ) {
          schemasIncluded.push('Organization');
        }
        if (
          post.body.includes('"@type":"Person"') ||
          post.body.includes('"@type": "Person"')
        ) {
          schemasIncluded.push('Author');
        }
        if (
          post.body.includes('"@type":"Article"') ||
          post.body.includes('"@type": "Article"')
        ) {
          schemasIncluded.push('Article');
        }
        if (
          post.body.includes('"@type":"WebPage"') ||
          post.body.includes('"@type": "WebPage"')
        ) {
          schemasIncluded.push('WebPage');
        }
        if (
          post.body.includes('"@type":"HowTo"') ||
          post.body.includes('"@type": "HowTo"')
        ) {
          schemasIncluded.push('HowTo');
        }
        if (
          post.body.includes('"@type":"FAQPage"') ||
          post.body.includes('"@type": "FAQPage"')
        ) {
          schemasIncluded.push('FAQPage');
        }
        if (
          post.body.includes('"@type":"BreadcrumbList"') ||
          post.body.includes('"@type": "BreadcrumbList"')
        ) {
          schemasIncluded.push('BreadcrumbList');
        }

        await this.prisma.post.update({
          where: { id: postId },
          data: {
            schemasIncluded,
          } as any,
        });

        this.logger.log('Schemas successfully injected into WordPress post', {
          postId,
          wordpressPostId,
          schemasIncluded,
        });
      } catch (schemaError) {
        this.logger.error('Failed to generate/inject schemas (non-critical)', {
          postId,
          error:
            schemaError instanceof Error
              ? schemaError.message
              : String(schemaError),
        });
      }

      this.logger.log('WordPress blog post publication completed successfully');

      if (publishedUrl && post) {
        try {
          const effectiveRecommendationId = post.recommendationId || post.id;
          await this.trackedRecommendationsService.addUrlToTrackedRecommendation(
            account.id,
            effectiveRecommendationId,
            publishedUrl,
          );
          this.logger.log('Successfully tracked published Blog post:', {
            postId,
            publishedUrl,
            recommendationId: effectiveRecommendationId,
          });
        } catch (trackingError) {
          this.logger.error('Failed to track published Blog post:', {
            postId,
            publishedUrl,
            message: trackingError.message,
            stack: trackingError.stack,
          });
        }
      }

      try {
        this.logger.log('Ingesting published post into Victor', {
          postId,
          publishedUrl,
          accountId: account.id,
        });

        this.logger.log('Post successfully ingested into Victor', {
          postId,
          accountId: account.id,
        });
      } catch (error) {
        this.logger.error('Failed to ingest post into Victor (non-critical)', {
          postId,
          accountId: account.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return true;
    } catch (error: any) {
      const errorDetails: any = {
        message: error.message,
        errorType: error.constructor?.name || typeof error,
        postId,
        accountId: account.id,
      };

      if (error.response) {
        errorDetails.status = error.response.status;
        errorDetails.statusText = error.response.statusText;
        errorDetails.responseData = error.response.data;
        errorDetails.responseDataStringified = error.response.data
          ? JSON.stringify(error.response.data).substring(0, 2000)
          : 'null';
        errorDetails.responseHeaders = error.response.headers;
        errorDetails.hasResponseData = !!error.response.data;
        errorDetails.responseDataKeys = error.response.data
          ? Object.keys(error.response.data)
          : [];
      }

      if (error.config) {
        errorDetails.requestUrl = error.config.url;
        errorDetails.requestMethod = error.config.method;
        errorDetails.requestData = error.config.data
          ? JSON.stringify(JSON.parse(error.config.data)).substring(0, 1000)
          : 'null';
      }

      if (error.code) errorDetails.errorCode = error.code;
      if (error.stack) errorDetails.stack = error.stack;

      this.logger.error(
        `Error publishing post ${postId} to WordPress:`,
        errorDetails,
      );

      await this.prisma.post.update({
        where: { id: postId },
        data: { state: PostState.FAILED },
      });

      throw error;
    }
  }

  /**
   * Uploads an image to WordPress media library
   */
  private async uploadWordPressImage(
    siteUrl: string,
    authString: string,
    imageUrl: string,
    altText: string,
  ): Promise<number> {
    try {
      // Download the image
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
      const filename = imageUrl.split('/').pop() || 'image.jpg';

      // Create form data for WordPress media upload
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', imageBuffer, {
        filename,
        contentType,
      });
      form.append('alt_text', altText);

      // Upload to WordPress
      const uploadResponse = await axios.post(
        `${siteUrl}/wp-json/wp/v2/media`,
        form,
        {
          headers: {
            Authorization: `Basic ${authString}`,
            ...form.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 60000,
        },
      );

      if (!uploadResponse.data || !uploadResponse.data.id) {
        throw new Error('WordPress did not return a media ID');
      }

      return uploadResponse.data.id;
    } catch (error: any) {
      this.logger.error('Failed to upload image to WordPress', {
        error: error.message,
        imageUrl,
        siteUrl,
      });
      throw error;
    }
  }

  /**
   * Gets or creates WordPress tags and returns their IDs
   */
  private async getOrCreateWordPressTags(
    siteUrl: string,
    username: string,
    applicationPassword: string,
    tagNames: string[],
  ): Promise<number[]> {
    const authString = Buffer.from(
      `${username}:${applicationPassword}`,
    ).toString('base64');

    const tagIds: number[] = [];

    for (const tagName of tagNames) {
      try {
        // Try to find existing tag
        const searchResponse = await axios.get(
          `${siteUrl}/wp-json/wp/v2/tags`,
          {
            params: {
              search: tagName,
              per_page: 1,
            },
            headers: {
              Authorization: `Basic ${authString}`,
            },
            timeout: 10000,
          },
        );

        let tagId: number | null = null;

        if (
          searchResponse.data &&
          Array.isArray(searchResponse.data) &&
          searchResponse.data.length > 0
        ) {
          // Check if exact match
          const exactMatch = searchResponse.data.find(
            (tag: any) =>
              tag.name.toLowerCase() === tagName.toLowerCase() ||
              tag.slug.toLowerCase() ===
                tagName.toLowerCase().replace(/\s+/g, '-'),
          );

          if (exactMatch) {
            tagId = exactMatch.id;
          }
        }

        // If not found, create new tag
        if (!tagId) {
          const createResponse = await axios.post(
            `${siteUrl}/wp-json/wp/v2/tags`,
            {
              name: tagName,
            },
            {
              headers: {
                Authorization: `Basic ${authString}`,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            },
          );

          if (createResponse.data && createResponse.data.id) {
            tagId = createResponse.data.id;
          } else {
            this.logger.warn('Failed to create WordPress tag', {
              tagName,
              response: createResponse.data,
            });
            continue;
          }
        }

        if (tagId) {
          tagIds.push(tagId);
        }
      } catch (error: any) {
        this.logger.error('Error processing WordPress tag', {
          tagName,
          error: error.message,
        });
        // Continue with other tags even if one fails
      }
    }

    return tagIds;
  }

  /**
   * Ingests a single post into Victor (embedding system)
   */
}
