import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialMediaProvider } from '@/model.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
import axios from 'axios';
import FormData from 'form-data';

type FacebookTokens = {
  provider: typeof SocialMediaProvider.FACEBOOK;
  accessToken: string;
  expiresIn: number | Date;
  pages: Array<{
    name: string;
    id: string;
    profileImage: string;
    accessToken: string;
  }>;
  selectedPageId?: string;
  updatedAt: Date;
};

@Injectable()
export class FacebookConnectionService
  implements ISocialMediaConnectionService
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly trackedRecommendationsService: TrackedRecommendationsService,
  ) {}

  private async updateTokens(accountId: string, tokenData: any): Promise<void> {
    // Validate expiresIn is a valid date if present
    if (tokenData.expiresIn) {
      const expiresInDate =
        tokenData.expiresIn instanceof Date
          ? tokenData.expiresIn
          : new Date(tokenData.expiresIn);

      if (isNaN(expiresInDate.getTime())) {
        this.logger.error('Invalid expiresIn date when updating tokens:', {
          accountId,
          expiresIn: tokenData.expiresIn,
        });
        throw new Error('Invalid expiresIn date');
      }
    }

    const existingTokens = await this.getExistingTokens(accountId);
    const updatedTokens = {
      ...existingTokens,
      [SocialMediaProvider.FACEBOOK]: tokenData,
    };

    await this.prisma.accountSettings.update({
      where: { accountId },
      data: { socialMediaProviderTokens: updatedTokens },
    });
  }

  private async getExistingTokens(accountId: string): Promise<FacebookTokens> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { accountSettings: true },
    });
    return (
      (account?.accountSettings
        ?.socialMediaProviderTokens as unknown as FacebookTokens) || {
        provider: SocialMediaProvider.FACEBOOK,
        accessToken: '',
        expiresIn: new Date(),
        pages: [],
        updatedAt: new Date(),
      }
    );
  }

  private getFacebookTokens(account: PopulatedAccount): FacebookTokens {
    const allTokens = account.accountSettings
      ?.socialMediaProviderTokens as unknown as FacebookTokens;
    return allTokens;
  }

  private async getFacebookPermalink(
    pageAccessToken: string,
    facebookPostId: string,
  ): Promise<string | undefined> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/${facebookPostId}`,
        {
          params: {
            fields: 'permalink_url',
            access_token: pageAccessToken,
          },
        },
      );

      return response.data.permalink_url || undefined;
    } catch (error) {
      this.logger.warn('Failed to fetch Facebook permalink:', {
        facebookPostId,
        message: error.message,
        stack: error.stack,
      });
      return undefined;
    }
  }

  private async updatePostAfterPublishing(
    postId: string,
    facebookPostId: string,
    publishedUrl?: string,
  ): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        postIdInSocialMediaProvider: facebookPostId,
        publishedAt: new Date(),
        state: 'POSTED',
        ...(publishedUrl && { publishedUrl }),
      },
    });
  }

  private createFacebookFormData(
    data: Record<string, string>,
    accessToken: string,
  ): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    formData.append('access_token', accessToken);
    return formData;
  }

  private async exchangeFacebookToken(
    accessToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const res = await axios.get(
        'https://graph.facebook.com/v20.0/oauth/access_token',
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: this.configService.get('FACEBOOK_APP_ID'),
            client_secret: this.configService.get('FACEBOOK_APP_SECRET'),
            fb_exchange_token: accessToken,
          },
        },
      );

      return {
        accessToken: res.data.access_token,
        expiresIn: res.data.expires_in,
      };
    } catch (error) {
      this.logger.error('Error exchanging Facebook token:', {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to exchange Facebook token: ${error.message}`);
    }
  }

  private async refreshFacebookToken(
    tokenData: FacebookTokens,
  ): Promise<FacebookTokens | null> {
    try {
      if (!tokenData.accessToken) {
        return null;
      }

      const exchangeResponse = await this.exchangeFacebookToken(
        tokenData.accessToken,
      );

      // Default to 60 days if expiresIn is not provided
      const expiresInSeconds = exchangeResponse.expiresIn || 60 * 24 * 60 * 60;
      const expiresInDate = new Date(Date.now() + expiresInSeconds * 1000);

      const refreshedPages = await this.getFacebookPageAccessToken(
        exchangeResponse.accessToken,
      );

      return {
        ...tokenData,
        accessToken: exchangeResponse.accessToken,
        expiresIn: expiresInDate,
        pages: refreshedPages,
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error refreshing Facebook access token:', {
        message: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  private async getPageAccessToken(
    userAccessToken: string,
    pageId: string,
  ): Promise<string> {
    try {
      const res = await axios.get(
        `https://graph.facebook.com/v20.0/${pageId}`,
        {
          params: {
            fields: 'access_token',
            access_token: userAccessToken,
          },
        },
      );
      return res.data.access_token;
    } catch (error) {
      this.logger.error(`Error getting page access token for ${pageId}:`, {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to get page access token: ${error.message}`);
    }
  }

  private async getFacebookPageAccessToken(userAccessToken: string): Promise<
    Array<{
      name: string;
      id: string;
      profileImage: string;
      accessToken: string;
    }>
  > {
    try {
      const res = await axios.get(
        'https://graph.facebook.com/v20.0/me/accounts',
        {
          params: {
            fields: 'name,id,access_token',
            access_token: userAccessToken,
          },
        },
      );

      const pagesWithImages = await Promise.all(
        res.data.data.map(async (page: any) => {
          try {
            const profileImageRes = await axios.get(
              `https://graph.facebook.com/v20.0/${page.id}/picture`,
              {
                params: {
                  type: 'large',
                  redirect: false,
                  access_token: userAccessToken,
                },
              },
            );

            return {
              name: page.name,
              id: page.id,
              profileImage: profileImageRes.data.data?.url || '',
              accessToken: page.access_token,
            };
          } catch (error) {
            this.logger.warn(
              `Failed to get profile image for page ${page.id}:`,
              {
                message: error.message,
                stack: error.stack,
              },
            );
            return {
              name: page.name,
              id: page.id,
              profileImage: '',
              accessToken: page.access_token,
            };
          }
        }),
      );

      return pagesWithImages;
    } catch (error) {
      this.logger.error('Error getting Facebook page access token:', {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(
        `Failed to get Facebook page access token: ${error.message}`,
      );
    }
  }

  async setAccessToken(
    account: PopulatedAccount,
    code: string,
  ): Promise<{
    message: string;
    provider: string;
    pages: Array<{ name: string; id: string; profileImage: string }>;
  }> {
    try {
      const facebookResponse = await this.exchangeFacebookToken(code);
      const pages = await this.getFacebookPageAccessToken(
        facebookResponse.accessToken,
      );

      // Default to 60 days if expiresIn is not provided
      const expiresInSeconds = facebookResponse.expiresIn || 60 * 24 * 60 * 60;
      const expiresInDate = new Date(Date.now() + expiresInSeconds * 1000);

      const tokenData: FacebookTokens = {
        provider: SocialMediaProvider.FACEBOOK,
        accessToken: facebookResponse.accessToken,
        expiresIn: expiresInDate,
        pages,
        updatedAt: new Date(),
      };

      await this.updateTokens(account.id, tokenData);

      return {
        message: `${SocialMediaProvider.FACEBOOK} OAuth callback successful`,
        provider: SocialMediaProvider.FACEBOOK,
        pages,
      };
    } catch (error) {
      this.logger.error(`Error setting Facebook access token:`, {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async selectPage(
    account: PopulatedAccount,
    pageId: string,
  ): Promise<{ message: string; provider: string }> {
    try {
      const facebookTokens = this.getFacebookTokens(account);
      if (!facebookTokens) {
        this.logger.error('No Facebook tokens found for this account', {
          accountId: account.id,
        });
        throw new Error('No Facebook tokens found for this account');
      }

      const selectedPage = facebookTokens.pages?.find(
        (page: any) => page.id === pageId,
      );
      if (!selectedPage) {
        this.logger.error('Selected page not found', {
          accountId: account.id,
          pageId,
        });
        throw new Error('Selected page not found');
      }

      const updatedTokenData = {
        ...facebookTokens,
        selectedPageId: selectedPage.id,
        updatedAt: new Date(),
      };

      await this.updateTokens(account.id, updatedTokenData);

      return {
        message: `Successfully selected Facebook page: ${selectedPage.name}`,
        provider: SocialMediaProvider.FACEBOOK,
      };
    } catch (error) {
      this.logger.error(`Error selecting Facebook page:`, {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async checkConnectionStatus(account: PopulatedAccount): Promise<boolean> {
    try {
      const tokenData = this.getFacebookTokens(account);

      if (!tokenData) {
        return false;
      }

      const { expiresIn, selectedPageId } = tokenData;

      if (!selectedPageId) {
        this.logger.warn(`No Facebook page selected for account:`, {
          accountId: account.id,
        });
        return false;
      }

      if (!tokenData.accessToken) {
        this.logger.warn(`No Facebook access token found for account:`, {
          accountId: account.id,
        });
        return false;
      }

      let expiresInDate: Date;
      if (typeof expiresIn === 'number') {
        expiresInDate = new Date(Date.now() + expiresIn * 1000);
      } else if (expiresIn instanceof Date) {
        expiresInDate = expiresIn;
      } else if (typeof expiresIn === 'string') {
        expiresInDate = new Date(expiresIn);
        if (isNaN(expiresInDate.getTime())) {
          this.logger.warn(`Invalid expiresIn date string for Facebook:`, {
            accountId: account.id,
            expiresIn,
          });
          return false;
        }
      } else {
        this.logger.warn(`Invalid expiresIn field for Facebook:`, {
          accountId: account.id,
          expiresInType: typeof expiresIn,
        });
        return false;
      }

      const now = new Date();
      const timeUntilExpiry = expiresInDate.getTime() - now.getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      if (timeUntilExpiry < 0) {
        this.logger.warn(`Facebook access token has expired for account:`, {
          accountId: account.id,
          expiresIn: expiresInDate,
          now,
        });
        return false;
      }

      if (timeUntilExpiry < sevenDaysInMs) {
        const refreshed = await this.refreshFacebookToken(tokenData);
        if (!refreshed) {
          this.logger.warn(`Failed to refresh Facebook token for account:`, {
            accountId: account.id,
          });
          return false;
        }

        await this.updateTokens(account.id, SocialMediaProvider.FACEBOOK);

        this.logger.log(
          `Successfully refreshed Facebook token for account ${account.id}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking Facebook connection status:`, {
        message: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  async logout(account: PopulatedAccount): Promise<boolean> {
    try {
      const existingTokens = await this.getExistingTokens(account.id);

      if (existingTokens.accessToken) {
        await this.prisma.accountSettings.update({
          where: { accountId: account.id },
          data: {
            socialMediaProviderTokens: { [SocialMediaProvider.FACEBOOK]: null },
          },
        });
      }

      this.logger.log(
        `Successfully logged out from Facebook for account ${account.id}`,
      );

      return true;
    } catch (error) {
      this.logger.error(`Error logging out from Facebook:`, {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getSelectedPage(
    account: PopulatedAccount,
  ): Promise<{ id: string; name: string; profileImage: string } | null> {
    try {
      const tokenData = this.getFacebookTokens(account);

      if (!tokenData || !tokenData.selectedPageId) {
        return null;
      }

      const selectedPage = tokenData.pages?.find(
        (page: any) => page.id === tokenData.selectedPageId,
      );

      if (!selectedPage) {
        return null;
      }

      return {
        id: selectedPage.id,
        name: selectedPage.name,
        profileImage: selectedPage.profileImage,
      };
    } catch (error) {
      this.logger.error(`Error getting selected Facebook page:`, {
        message: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  async publish(account: PopulatedAccount, postId: string): Promise<boolean> {
    this.logger.log('Starting Facebook post publication');

    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        this.logger.error('Post not found', {
          postId,
          accountId: account.id,
        });
        throw new Error(`Post with ID ${postId} not found`);
      }

      if (post.accountId !== account.id) {
        this.logger.error('Post does not belong to this account', {
          postId,
          accountId: account.id,
        });
        throw new Error('Post does not belong to this account');
      }

      let tokenData = this.getFacebookTokens(account);

      if (!tokenData || !tokenData.selectedPageId) {
        this.logger.error('No Facebook page selected for this account', {
          postId,
          accountId: account.id,
        });
        throw new Error('No Facebook page selected for this account');
      }

      if (!tokenData?.accessToken) {
        this.logger.error('No Facebook access token found', {
          postId,
          accountId: account.id,
        });
        throw new Error('No Facebook access token found');
      }

      let expiresInDate: Date;
      if (typeof tokenData.expiresIn === 'number') {
        expiresInDate = new Date(Date.now() + tokenData.expiresIn * 1000);
      } else if (tokenData.expiresIn instanceof Date) {
        expiresInDate = tokenData.expiresIn;
      } else {
        expiresInDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      }

      const now = new Date();
      const timeUntilExpiry = expiresInDate.getTime() - now.getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      if (timeUntilExpiry < sevenDaysInMs) {
        const refreshed = await this.refreshFacebookToken(tokenData);
        if (refreshed) {
          await this.updateTokens(account.id, refreshed);
          tokenData = refreshed;
          this.logger.log(
            `Refreshed Facebook token before publishing post ${postId}`,
          );
        } else {
          this.logger.warn(
            `Failed to refresh Facebook token before publishing, proceeding with existing token`,
          );
        }
      }

      const pageAccessToken = await this.getPageAccessToken(
        tokenData.accessToken,
        tokenData.selectedPageId!,
      );

      let message = post?.body || '';
      if (post?.tags && post?.tags?.length > 0) {
        const hashtags = post.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`);
        message += `\n\n${hashtags.join(' ')}`;
      }

      let facebookPostId: string;

      if (post?.imagesUrl && post?.imagesUrl?.length > 0) {
        const lastImageUrl = post.imagesUrl[post.imagesUrl.length - 1];

        const formData = this.createFacebookFormData(
          {
            url: lastImageUrl,
            caption: message,
          },
          pageAccessToken,
        );

        const response = await axios.post(
          `https://graph.facebook.com/v20.0/${tokenData.selectedPageId}/photos`,
          formData,
          { headers: formData.getHeaders() },
        );

        facebookPostId = response.data.id;

        // Fetch permalink URL
        const permalinkUrl = await this.getFacebookPermalink(
          pageAccessToken,
          facebookPostId,
        );

        await this.updatePostAfterPublishing(
          postId,
          facebookPostId,
          permalinkUrl,
        );

        // Track the published post if we have a permalink URL
        if (permalinkUrl) {
          try {
            await this.trackedRecommendationsService.addUrlToTrackedRecommendation(
              account.id,
              post.recommendationId,
              permalinkUrl,
            );
            this.logger.log('Successfully tracked published Facebook post:', {
              postId,
              permalinkUrl,
              recommendationId: post.recommendationId || 'dummy',
            });
          } catch (trackingError) {
            this.logger.error('Failed to track published Facebook post:', {
              postId,
              permalinkUrl,
              message: trackingError.message,
              stack: trackingError.stack,
            });
            // Don't fail the publish operation due to tracking errors
          }
        }

        this.logger.log('Successfully published Facebook post with image:', {
          postId,
          facebookPostId,
          pageId: tokenData.selectedPageId,
          permalinkUrl,
        });

        return true;
      } else {
        const formData = this.createFacebookFormData(
          { message },
          pageAccessToken,
        );

        const response = await axios.post(
          `https://graph.facebook.com/v20.0/${tokenData.selectedPageId}/feed`,
          formData,
          { headers: formData.getHeaders() },
        );

        facebookPostId = response.data.id;

        // Fetch permalink URL
        const permalinkUrl = await this.getFacebookPermalink(
          pageAccessToken,
          facebookPostId,
        );

        await this.updatePostAfterPublishing(
          postId,
          facebookPostId,
          permalinkUrl,
        );

        // Track the published post if we have a permalink URL
        if (permalinkUrl) {
          try {
            await this.trackedRecommendationsService.addUrlToTrackedRecommendation(
              account.id,
              post.recommendationId,
              permalinkUrl,
            );
            this.logger.log('Successfully tracked published Facebook post:', {
              postId,
              permalinkUrl,
              recommendationId: post.recommendationId || 'dummy',
            });
          } catch (trackingError) {
            this.logger.error('Failed to track published Facebook post:', {
              postId,
              permalinkUrl,
              message: trackingError.message,
              stack: trackingError.stack,
            });
            // Don't fail the publish operation due to tracking errors
          }
        }

        this.logger.log('Successfully published Facebook text post:', {
          postId,
          facebookPostId,
          pageId: tokenData.selectedPageId,
          permalinkUrl,
        });

        // Ingest post into Victor for AI reference and tracking
        if (permalinkUrl) {
          try {
            this.logger.log('Ingesting published post into Victor', {
              postId,
              publishedUrl: permalinkUrl,
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

        this.logger.log('Facebook post publication completed successfully');
        return true;
      }
    } catch (error: any) {
      this.logger.error('Error publishing Facebook post:', {
        message: error.response?.data || error.message,
        stack: error.stack,
        postId,
        accountId: account.id,
      });
      throw error;
    }
  }
}
