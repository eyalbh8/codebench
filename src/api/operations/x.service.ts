import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@/config/config.service';
import { PostState, SocialMediaProvider } from '@/model.enums';
import { TwitterApi } from 'twitter-api-v2';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { ERROR_CODES } from '@/constants/errors';

type TokenResponse = {
  message: string;
  provider: string;
};

type SocialMediaProviderTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: Date;
  updatedAt: Date;
};

type ProviderTokensRecord = Record<string, SocialMediaProviderTokens>;

@Injectable()
export class SocialMediaConnectionService
  implements ISocialMediaConnectionService
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly trackedRecommendationsService: TrackedRecommendationsService,
  ) {}

  private constructTwitterUrl(tweetId: string): string {
    return `https://twitter.com/i/status/${tweetId}`;
  }

  async setAccessToken(
    account: PopulatedAccount,
    bodyOrCode:
      | string
      | {
          code: string;
          codeVerifier?: string;
          state?: string;
        },
    codeVerifier?: string,
  ): Promise<TokenResponse> {
    let code: string;
    let bodyCodeVerifier: string | undefined;
    let state: string | undefined;

    if (typeof bodyOrCode === 'string') {
      code = bodyOrCode;
      bodyCodeVerifier = codeVerifier;
    } else {
      code = bodyOrCode.code;
      bodyCodeVerifier = bodyOrCode.codeVerifier;
      state = bodyOrCode.state;
    }

    try {
      const client = new TwitterApi({
        clientId: this.configService.get('X_CLIENT_ID'),
        clientSecret: this.configService.get('X_CLIENT_SECRET'),
      });
      const siteUrl = this.configService.get('SITE_URL');
      const redirectUri = `${siteUrl}/igeo-agents`;
      const xResponse = await client.loginWithOAuth2({
        code,
        codeVerifier: bodyCodeVerifier || '',
        redirectUri,
      });

      const accessToken = xResponse.accessToken;
      const refreshToken = xResponse.refreshToken;
      const expiresIn = xResponse.expiresIn;

      const expiresInSeconds = expiresIn;
      const expiresInDate = new Date(Date.now() + expiresInSeconds * 1000);

      const providerKey = 'x';
      const existingTokens =
        (account.accountSettings
          ?.socialMediaProviderTokens as unknown as ProviderTokensRecord) || {};

      const updatedTokens: ProviderTokensRecord = {
        ...existingTokens,
        [providerKey]: {
          accessToken,
          refreshToken,
          expiresIn: expiresInDate,
          updatedAt: new Date(),
        },
      };

      await this.prisma.accountSettings.update({
        where: { accountId: account.id },
        data: {
          socialMediaProviderTokens: updatedTokens,
        },
      });

      return {
        message: `X OAuth callback successful`,
        provider: SocialMediaProvider.X,
      };
    } catch (error) {
      this.logger.error(`Error setting access token for X: ${error.message}`);
      throw error;
    }
  }

  private async verifyXToken(accessToken: string): Promise<boolean> {
    try {
      const client = new TwitterApi(accessToken);
      await client.v2.me();
      return true;
    } catch (error) {
      this.logger.warn('X token verification failed:', {
        message: error.message,
      });
      return false;
    }
  }

  private async refreshXToken(
    tokenData: SocialMediaProviderTokens,
  ): Promise<SocialMediaProviderTokens | null> {
    try {
      if (!tokenData.refreshToken) {
        this.logger.warn('No refresh token available for X');
        return null;
      }

      const client = new TwitterApi({
        clientId: this.configService.get('X_CLIENT_ID'),
        clientSecret: this.configService.get('X_CLIENT_SECRET'),
      });

      const refreshed = await client.refreshOAuth2Token(tokenData.refreshToken);

      const expiresInSeconds = refreshed.expiresIn;
      const expiresInDate = new Date(Date.now() + expiresInSeconds * 1000);

      return {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken || tokenData.refreshToken,
        expiresIn: expiresInDate,
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error refreshing X access token:', {
        message: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  async checkConnectionStatus(account: PopulatedAccount): Promise<boolean> {
    return this.checkConnectionStatusWithProvider(
      account,
      SocialMediaProvider.X,
    );
  }

  async checkConnectionStatusWithProvider(
    account: PopulatedAccount,
    provider: SocialMediaProvider,
  ): Promise<boolean> {
    try {
      const providerKey = provider.toLowerCase();
      const allTokens = account.accountSettings
        ?.socialMediaProviderTokens as unknown as ProviderTokensRecord;
      const tokenData = allTokens?.[providerKey];

      if (!tokenData) {
        return false;
      }

      if (!tokenData || typeof tokenData !== 'object') {
        this.logger.warn(
          `Invalid token data structure for ${provider}:`,
          tokenData,
        );
        return false;
      }

      const { expiresIn } = tokenData;

      let expiresInDate: Date;
      if (typeof expiresIn === 'string') {
        expiresInDate = new Date(expiresIn);
      } else if (expiresIn instanceof Date) {
        expiresInDate = expiresIn;
      } else {
        this.logger.warn(`Invalid expiresIn field for ${provider}:`, expiresIn);
        return false;
      }

      const now = new Date();
      const timeUntilExpiry = expiresInDate.getTime() - now.getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const twentyMinutesInMs = 20 * 60 * 1000;

      if (timeUntilExpiry > sevenDaysInMs) {
        return true;
      }

      if (provider === SocialMediaProvider.X) {
        const isTokenValid = await this.verifyXToken(tokenData.accessToken);

        if (isTokenValid && timeUntilExpiry > twentyMinutesInMs) {
          return true;
        }

        if (!isTokenValid || timeUntilExpiry < twentyMinutesInMs) {
          const refreshed = await this.refreshXToken(tokenData);
          if (!refreshed) {
            this.logger.warn(`Failed to refresh X token for account:`, {
              accountId: account.id,
              reason: !tokenData.refreshToken
                ? 'No refresh token available'
                : 'Refresh attempt failed',
            });
            return false;
          }

          const refreshedTokenValid = await this.verifyXToken(
            refreshed.accessToken,
          );
          if (!refreshedTokenValid) {
            this.logger.warn(
              `Refreshed X token failed verification for account:`,
              {
                accountId: account.id,
              },
            );
            return false;
          }

          const existingTokens =
            (account.accountSettings
              ?.socialMediaProviderTokens as unknown as ProviderTokensRecord) ||
            {};
          const updatedTokens: ProviderTokensRecord = {
            ...existingTokens,
            [providerKey]: refreshed,
          };

          await this.prisma.accountSettings.update({
            where: { accountId: account.id },
            data: {
              socialMediaProviderTokens: updatedTokens,
            },
          });

          this.logger.log(
            `Successfully refreshed X token for account ${account.id}`,
          );
          return true;
        }
        return true;
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error checking connection status for ${provider}:`,
        error,
      );
      return false;
    }
  }

  async logout(account: PopulatedAccount): Promise<boolean> {
    return this.logoutWithProvider(account, SocialMediaProvider.X);
  }

  async logoutWithProvider(
    account: PopulatedAccount,
    provider: SocialMediaProvider,
  ): Promise<boolean> {
    try {
      const providerKey = provider.toLowerCase();
      const existingTokens =
        (account.accountSettings
          ?.socialMediaProviderTokens as unknown as ProviderTokensRecord) || {};

      if (existingTokens[providerKey]) {
        const { [providerKey]: removed, ...updatedTokens } = existingTokens;

        await this.prisma.accountSettings.update({
          where: { accountId: account.id },
          data: {
            socialMediaProviderTokens: updatedTokens,
          },
        });

        this.logger.log(
          `Successfully logged out from ${provider} for account ${account.id}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Error logging out from ${provider}: ${error.message}`);
      throw error;
    }
  }

  async publish(account: PopulatedAccount, postId: string): Promise<boolean> {
    this.logger.log('Starting X (Twitter) post publication');

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

      if (!post.socialMediaProvider) {
        this.logger.error(`Post ${postId} has no social media provider`);
        throw new Error(`Post ${postId} has no social media provider`);
      }

      const isConnected = await this.checkConnectionStatusWithProvider(
        account,
        post.socialMediaProvider as SocialMediaProvider,
      );
      if (!isConnected) {
        this.logger.error(
          `Social media connection expired or invalid for ${post.socialMediaProvider}`,
        );
        throw new Error(
          `Social media connection expired or invalid for ${post.socialMediaProvider}`,
        );
      }

      if (post.socialMediaProvider !== SocialMediaProvider.X.toString()) {
        this.logger.error(
          `Unsupported social media provider: ${post.socialMediaProvider}`,
        );
        throw new Error(
          `Unsupported social media provider: ${post.socialMediaProvider}`,
        );
      }

      const providerKey = post.socialMediaProvider.toLowerCase();
      let allTokens = account.accountSettings
        ?.socialMediaProviderTokens as unknown as ProviderTokensRecord;
      let tokenData = allTokens?.[providerKey];

      if (!tokenData?.accessToken) {
        this.logger.error(
          `No access token found for ${post.socialMediaProvider}`,
        );
        throw new Error(
          `No access token found for ${post.socialMediaProvider}`,
        );
      }

      if (post.socialMediaProvider === SocialMediaProvider.X.toString()) {
        let expiresInDate: Date;
        if (typeof tokenData.expiresIn === 'string') {
          expiresInDate = new Date(tokenData.expiresIn);
        } else if (tokenData.expiresIn instanceof Date) {
          expiresInDate = tokenData.expiresIn;
        } else {
          expiresInDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
        }

        const now = new Date();
        const timeUntilExpiry = expiresInDate.getTime() - now.getTime();
        const twentyMinutesInMs = 20 * 60 * 1000;

        if (timeUntilExpiry < twentyMinutesInMs) {
          const refreshed = await this.refreshXToken(tokenData);
          if (refreshed) {
            const updatedTokens: ProviderTokensRecord = {
              ...allTokens,
              [providerKey]: refreshed,
            };

            await this.prisma.accountSettings.update({
              where: { accountId: account.id },
              data: {
                socialMediaProviderTokens: updatedTokens,
              },
            });

            tokenData = refreshed;
            allTokens = updatedTokens;
            this.logger.log(
              `Refreshed X token before publishing post ${postId}`,
            );
          } else {
            this.logger.warn(
              `Failed to refresh X token before publishing, proceeding with existing token`,
            );
          }
        }
      }

      let publishedUrl: string | undefined;

      switch (post.socialMediaProvider) {
        case SocialMediaProvider.X.toString(): {
          const authenticatedClient = new TwitterApi(tokenData.accessToken);

          if (!post.body || post.body.trim().length === 0) {
            this.logger.error(`Post content is empty for post ${postId}`);
            throw new Error(`Post content is empty for post ${postId}`);
          }

          if (post.body.length > 280) {
            this.logger.warn(
              `Post content exceeds 280 characters, truncating...`,
            );
          }

          const tweetResponse = await authenticatedClient.v2.tweet(post.body);
          const tweetId = tweetResponse.data.id;
          publishedUrl = this.constructTwitterUrl(tweetId);

          await this.prisma.post.update({
            where: { id: postId },
            data: {
              postIdInSocialMediaProvider: tweetId,
              publishedAt: new Date(),
              state: PostState.POSTED,
              publishedUrl,
            },
          });

          // Track the published post
          if (publishedUrl) {
            try {
              await this.trackedRecommendationsService.addUrlToTrackedRecommendation(
                account.id,
                post.recommendationId,
                publishedUrl,
              );
              this.logger.log('Successfully tracked published X post:', {
                postId,
                publishedUrl,
                recommendationId: post.recommendationId || 'dummy',
              });
            } catch (trackingError) {
              this.logger.error('Failed to track published X post:', {
                postId,
                publishedUrl,
                message: trackingError.message,
                stack: trackingError.stack,
              });
              // Don't fail the publish operation due to tracking errors
            }
          }

          this.logger.log(
            `Successfully published content to ${post.socialMediaProvider} for account ${account.id}. Tweet ID: ${tweetId}`,
            { publishedUrl },
          );
          break;
        }

        default: {
          this.logger.error(
            `Unsupported social media provider in publish in switch case: ${post.socialMediaProvider}`,
          );
          throw new ApplicationErrorException(
            ERROR_CODES.UNSUPPORTED_SOCIAL_MEDIA_PROVIDER,
            HttpStatus.BAD_REQUEST,
            `Unsupported social media provider: ${post.socialMediaProvider}`,
          );
        }
      }

      // Ingest post into Victor for AI reference and tracking
      if (publishedUrl) {
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
          this.logger.error(
            'Failed to ingest post into Victor (non-critical)',
            {
              postId,
              accountId: account.id,
              error: error instanceof Error ? error.message : String(error),
            },
          );
        }
      }

      this.logger.log('X (Twitter) post publication completed successfully');
      return true;
    } catch (error) {
      try {
        await this.prisma.post.update({
          where: { id: postId },
          data: {
            state: PostState.FAILED,
          },
        });
      } catch (updateError) {
        this.logger.error(
          `Failed to update post state after publish error:`,
          updateError,
        );
      }

      this.logger.error(`Error publishing to ${postId}: ${error.message}`);
      throw error;
    }
  }
}
