import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '@/utils/app-logger.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PopulatedAccount } from '@/types/api';
import { SocialMediaProvider, PostState } from '@/model.enums';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
import axios from 'axios';

type InstagramBusinessProfile = {
  id: string;
  username: string;
  profileImage: string;
  pageId: string;
  pageName: string;
};

type InstagramTokenData = {
  provider: typeof SocialMediaProvider.INSTAGRAM;
  accessToken: string;
  expiresAt: string;
  profiles: InstagramBusinessProfile[];
  selectedProfileId?: string;
  selectedPageId?: string;
  updatedAt: Date;
};

@Injectable()
export class InstagramConnectionServices
  implements ISocialMediaConnectionService
{
  private readonly graphBaseUrl = 'https://graph.facebook.com/v20.0';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly trackedRecommendationsService: TrackedRecommendationsService,
  ) {}

  private parseInstagramTokens(
    account: PopulatedAccount,
  ): Record<string, InstagramTokenData> {
    const rawTokens = account.accountSettings
      ?.socialMediaProviderTokens as unknown;

    if (!rawTokens || typeof rawTokens !== 'object') {
      return {};
    }

    return rawTokens as Record<string, InstagramTokenData>;
  }

  private async getExistingTokens(
    accountId: string,
  ): Promise<Record<string, any>> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { accountSettings: true },
    });

    return (
      (account?.accountSettings?.socialMediaProviderTokens as Record<
        string,
        any
      >) || {}
    );
  }

  private getInstagramTokens(
    account: PopulatedAccount,
  ): InstagramTokenData | null {
    const allTokens = this.parseInstagramTokens(account);

    return allTokens?.[SocialMediaProvider.INSTAGRAM] || null;
  }

  private async updateSocialMediaTokens(
    accountId: string,
    tokenData: InstagramTokenData,
  ): Promise<void> {
    const existingTokens = await this.getExistingTokens(accountId);

    const updatedTokens = {
      ...existingTokens,
      [SocialMediaProvider.INSTAGRAM]: tokenData,
    };

    await this.prisma.accountSettings.update({
      where: { accountId },
      data: { socialMediaProviderTokens: updatedTokens },
    });
  }

  private async exchangeFacebookToken(
    code: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const redirectUri = this.configService.get('SITE_URL') + '/igeo-agents';

      // Exchange OAuth code for access token
      const res = await axios.get(`${this.graphBaseUrl}/oauth/access_token`, {
        params: {
          client_id: this.configService.get('FACEBOOK_APP_ID'),
          client_secret: this.configService.get('FACEBOOK_APP_SECRET'),
          redirect_uri: redirectUri,
          code: code,
        },
      });

      const shortLivedToken = res.data.access_token;
      const expiresIn = res.data.expires_in || 5184000; // Default 60 days

      // Exchange short-lived token for long-lived token
      try {
        const longLivedRes = await axios.get(
          `${this.graphBaseUrl}/oauth/access_token`,
          {
            params: {
              grant_type: 'fb_exchange_token',
              client_id: this.configService.get('FACEBOOK_APP_ID'),
              client_secret: this.configService.get('FACEBOOK_APP_SECRET'),
              fb_exchange_token: shortLivedToken,
            },
          },
        );

        return {
          accessToken: longLivedRes.data.access_token,
          expiresIn: longLivedRes.data.expires_in || expiresIn,
        };
      } catch (exchangeError) {
        // If long-lived exchange fails, use short-lived token
        this.logger.warn(
          'Failed to exchange for long-lived token, using short-lived',
          {
            error: exchangeError,
          },
        );
        return {
          accessToken: shortLivedToken,
          expiresIn: expiresIn,
        };
      }
    } catch (error: any) {
      this.logger.error('Error exchanging Instagram token:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      throw new Error(`Failed to exchange Instagram token: ${error.message}`);
    }
  }

  private async fetchInstagramProfiles(
    userAccessToken: string,
  ): Promise<InstagramBusinessProfile[]> {
    try {
      // Check what permissions the token actually has
      const permissionsResponse = await axios.get(
        `${this.graphBaseUrl}/me/permissions`,
        {
          params: {
            access_token: userAccessToken,
          },
        },
      );

      this.logger.log('Token permissions:', {
        permissions: permissionsResponse.data?.data?.map((p: any) => ({
          permission: p.permission,
          status: p.status,
        })),
      });

      // Check which user this token belongs to
      const meResponse = await axios.get(`${this.graphBaseUrl}/me`, {
        params: {
          fields: 'id,name,email',
          access_token: userAccessToken,
        },
      });

      this.logger.log('Token belongs to user:', {
        userId: meResponse.data.id,
        userName: meResponse.data.name,
        userEmail: meResponse.data.email,
      });

      // Try /me/accounts first (personal pages)
      const response = await axios.get(`${this.graphBaseUrl}/me/accounts`, {
        params: {
          fields: 'name,id,access_token,instagram_business_account',
          access_token: userAccessToken,
        },
      });

      let pages = response.data?.data || [];

      this.logger.log('Facebook /me/accounts response:', {
        pageCount: pages.length,
        pages: pages.map((p: any) => ({
          id: p.id,
          name: p.name,
          hasInstagramAccount: !!p.instagram_business_account,
          instagramAccountId: p.instagram_business_account?.id,
        })),
      });

      // If no pages found, try Business Manager pages
      if (pages.length === 0) {
        try {
          const businessResponse = await axios.get(
            `${this.graphBaseUrl}/me/businesses`,
            {
              params: {
                fields: 'id,name',
                access_token: userAccessToken,
              },
            },
          );

          const businesses = businessResponse.data?.data || [];

          this.logger.log('Facebook /me/businesses response:', {
            businessCount: businesses.length,
            businesses: businesses.map((b: any) => ({
              id: b.id,
              name: b.name,
            })),
          });

          // Get pages from each business
          for (const business of businesses) {
            try {
              const businessPagesResponse = await axios.get(
                `${this.graphBaseUrl}/${business.id}/owned_pages`,
                {
                  params: {
                    fields: 'name,id,access_token,instagram_business_account',
                    access_token: userAccessToken,
                  },
                },
              );

              const businessPages = businessPagesResponse.data?.data || [];
              this.logger.log(`Business ${business.name} pages:`, {
                pageCount: businessPages.length,
                pages: businessPages.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  hasInstagramAccount: !!p.instagram_business_account,
                })),
              });

              pages = pages.concat(businessPages);
            } catch (error: any) {
              this.logger.warn(
                `Failed to fetch pages for business ${business.id}:`,
                {
                  error: error.message,
                },
              );
            }
          }
        } catch (error: any) {
          this.logger.warn('Failed to fetch business accounts:', {
            error: error.message,
          });
        }
      }

      const profiles = await Promise.all(
        pages.map(async (page: any) => {
          if (!page.instagram_business_account?.id) {
            return null;
          }

          try {
            const profileResponse = await axios.get(
              `${this.graphBaseUrl}/${page.instagram_business_account.id}`,
              {
                params: {
                  fields: 'username,profile_picture_url',
                  access_token: page.access_token || userAccessToken,
                },
              },
            );

            return {
              id: page.instagram_business_account.id,
              username: profileResponse.data.username,
              profileImage: profileResponse.data.profile_picture_url || '',
              pageId: page.id,
              pageName: page.name,
            } as unknown as InstagramBusinessProfile;
          } catch (error: any) {
            this.logger.warn(
              `Failed to fetch Instagram profile for page ${page.id}:`,
              {
                message: error.message,
                stack: error.stack,
              },
            );
            return null;
          }
        }),
      );

      const validProfiles = profiles.filter(
        (profile): profile is InstagramBusinessProfile => profile !== null,
      );

      return validProfiles;
    } catch (error: any) {
      this.logger.error('Error fetching Instagram profiles:', {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(
        `Failed to fetch Instagram business profiles: ${error.message}`,
      );
    }
  }

  private async getPageAccessToken(
    userAccessToken: string,
    pageId: string,
  ): Promise<string> {
    try {
      const res = await axios.get(`${this.graphBaseUrl}/${pageId}`, {
        params: {
          fields: 'access_token',
          access_token: userAccessToken,
        },
      });
      return res.data.access_token;
    } catch (error: any) {
      this.logger.error(
        `Error fetching Instagram page access token for ${pageId}:`,
        {
          message: error.message,
          stack: error.stack,
        },
      );
      throw new Error(
        `Failed to fetch Instagram page access token: ${error.message}`,
      );
    }
  }

  private buildCaption(post: {
    body?: string | null;
    tags?: string[] | null;
  }): string {
    const message = post?.body || '';

    if (!post?.tags || post.tags.length === 0) {
      return message;
    }

    const hashtags = post.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`);

    return `${message}\n\n${hashtags.join(' ')}`.trim();
  }

  private async getInstagramPermalink(
    mediaId: string,
    accessToken: string,
  ): Promise<string | undefined> {
    try {
      const response = await axios.get(`${this.graphBaseUrl}/${mediaId}`, {
        params: {
          fields: 'permalink',
          access_token: accessToken,
        },
      });

      return response.data.permalink || undefined;
    } catch (error) {
      this.logger.warn('Failed to fetch Instagram permalink:', {
        mediaId,
        message: error.message,
        stack: error.stack,
      });
      return undefined;
    }
  }

  async setAccessToken(
    account: PopulatedAccount,
    code: string,
  ): Promise<{
    message: string;
    provider: string;
    profiles: InstagramBusinessProfile[];
  }> {
    try {
      const exchangeResponse = await this.exchangeFacebookToken(code);
      const profiles = await this.fetchInstagramProfiles(
        exchangeResponse.accessToken,
      );

      const expiresAt =
        typeof exchangeResponse.expiresIn === 'number' &&
        Number.isFinite(exchangeResponse.expiresIn)
          ? new Date(
              Date.now() + exchangeResponse.expiresIn * 1000,
            ).toISOString()
          : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

      const tokenData: InstagramTokenData = {
        provider: SocialMediaProvider.INSTAGRAM,
        accessToken: exchangeResponse.accessToken,
        expiresAt,
        profiles,
        updatedAt: new Date(),
      };

      await this.updateSocialMediaTokens(account.id, tokenData);

      return {
        message: `${SocialMediaProvider.INSTAGRAM} OAuth callback successful`,
        provider: SocialMediaProvider.INSTAGRAM,
        profiles,
      };
    } catch (error: any) {
      this.logger.error('Error setting Instagram access token:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async checkConnectionStatus(account: PopulatedAccount): Promise<boolean> {
    try {
      const tokenData = this.getInstagramTokens(account);

      if (!tokenData?.accessToken) {
        return false;
      }

      if (!tokenData.selectedProfileId || !tokenData.selectedPageId) {
        return false;
      }

      if (tokenData.expiresAt) {
        const expiresAt = new Date(tokenData.expiresAt);
        if (Date.now() >= expiresAt.getTime()) {
          this.logger.warn(
            `Instagram access token expired for account ${account.id}`,
          );
          return false;
        }
      }

      return true;
    } catch (error: any) {
      this.logger.error('Error checking Instagram connection status:', {
        message: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  async logout(account: PopulatedAccount): Promise<boolean> {
    try {
      const existingTokens = await this.getExistingTokens(account.id);

      if (existingTokens[SocialMediaProvider.INSTAGRAM]) {
        const { [SocialMediaProvider.INSTAGRAM]: removed, ...updatedTokens } =
          existingTokens;

        await this.prisma.accountSettings.update({
          where: { accountId: account.id },
          data: {
            socialMediaProviderTokens: updatedTokens,
          },
        });

        this.logger.log(
          `Successfully logged out from Instagram for account ${account.id}`,
        );
      }

      return true;
    } catch (error: any) {
      this.logger.error('Error logging out from Instagram:', {
        message: error.message,
        stack: error.stack,
        accountId: account.id,
      });
      throw error;
    }
  }

  async selectPage(
    account: PopulatedAccount,
    profileId: string,
  ): Promise<{ message: string; provider: string }> {
    try {
      const tokenData = this.getInstagramTokens(account);

      if (!tokenData) {
        throw new Error('No Instagram tokens found for this account');
      }

      const selectedProfile = tokenData.profiles.find(
        (profile) => profile.id === profileId,
      );

      if (!selectedProfile) {
        throw new Error('Selected Instagram profile not found');
      }

      const updatedTokenData: InstagramTokenData = {
        ...tokenData,
        selectedProfileId: selectedProfile.id,
        selectedPageId: selectedProfile.pageId,
        updatedAt: new Date(),
      };

      await this.updateSocialMediaTokens(account.id, updatedTokenData);

      return {
        message: `Successfully selected Instagram profile: ${selectedProfile.username}`,
        provider: SocialMediaProvider.INSTAGRAM,
      };
    } catch (error: any) {
      this.logger.error('Error selecting Instagram profile:', {
        message: error.message,
        stack: error.stack,
        accountId: account.id,
      });
      throw error;
    }
  }

  async getSelectedPage(
    account: PopulatedAccount,
  ): Promise<{ id: string; name: string; profileImage: string } | null> {
    try {
      const tokenData = this.getInstagramTokens(account);

      if (!tokenData?.selectedProfileId) {
        return null;
      }

      const selectedProfile = tokenData.profiles.find(
        (profile) => profile.id === tokenData.selectedProfileId,
      );

      if (!selectedProfile) {
        return null;
      }

      return {
        id: selectedProfile.id,
        name: selectedProfile.username,
        profileImage: selectedProfile.profileImage,
      };
    } catch (error: any) {
      this.logger.error('Error getting selected Instagram profile:', {
        message: error.message,
        stack: error.stack,
        accountId: account.id,
      });
      return null;
    }
  }

  async publish(account: PopulatedAccount, postId: string): Promise<boolean> {
    this.logger.log('Starting Instagram post publication');

    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new Error(`Post with ID ${postId} not found`);
      }

      if (post.accountId !== account.id) {
        throw new Error('Post does not belong to this account');
      }

      if (post.socialMediaProvider !== SocialMediaProvider.INSTAGRAM) {
        throw new Error(
          `Post ${postId} is not configured for Instagram provider`,
        );
      }

      const tokenData = this.getInstagramTokens(account);

      if (
        !tokenData?.accessToken ||
        !tokenData.selectedProfileId ||
        !tokenData.selectedPageId
      ) {
        throw new Error('Instagram account is not connected or configured');
      }

      const imageUrls = Array.isArray(post?.imagesUrl) ? post?.imagesUrl : [];
      const imageUrl = imageUrls[imageUrls.length - 1];

      if (!imageUrl) {
        throw new Error(
          'Instagram publishing requires at least one image. Please add an image to the post.',
        );
      }

      const pageAccessToken = await this.getPageAccessToken(
        tokenData.accessToken,
        tokenData.selectedPageId,
      );

      const caption = this.buildCaption(post);

      const creationResponse = await axios.post(
        `${this.graphBaseUrl}/${tokenData.selectedProfileId}/media`,
        null,
        {
          params: {
            image_url: imageUrl,
            caption,
            access_token: pageAccessToken,
          },
        },
      );

      const creationId = creationResponse.data?.id;

      if (!creationId) {
        throw new Error('Failed to create Instagram media container');
      }

      const publishResponse = await axios.post(
        `${this.graphBaseUrl}/${tokenData.selectedProfileId}/media_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: pageAccessToken,
          },
        },
      );

      const instagramPostId = publishResponse.data?.id || creationId;

      // Fetch permalink URL
      const publishedUrl = await this.getInstagramPermalink(
        instagramPostId,
        pageAccessToken,
      );

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          postIdInSocialMediaProvider: instagramPostId,
          publishedAt: new Date(),
          state: PostState.POSTED,
          ...(publishedUrl && { publishedUrl }),
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
          this.logger.log('Successfully tracked published Instagram post:', {
            postId,
            publishedUrl,
            recommendationId: post.recommendationId || 'dummy',
          });
        } catch (trackingError) {
          this.logger.error('Failed to track published Instagram post:', {
            postId,
            publishedUrl,
            message: trackingError.message,
            stack: trackingError.stack,
          });
          // Don't fail the publish operation due to tracking errors
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

      this.logger.log('Instagram post publication completed successfully', {
        accountId: account.id,
        postId,
        instagramPostId,
        publishedUrl,
      });

      return true;
    } catch (error: any) {
      this.logger.error('Error publishing Instagram post:', {
        message: error.response?.data || error.message,
        stack: error.stack,
        accountId: account.id,
        postId,
      });

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          state: PostState.FAILED,
        },
      });

      throw error;
    }
  }
}
