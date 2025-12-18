import { HttpStatus, Injectable } from '@nestjs/common';
import { SocialMediaProvider } from '@/model.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
import axios from 'axios';
import { ConfigService } from '@/config/config.service';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException as AppError } from '@/exceptions/app-error.exception';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';

type RedditTokenData = {
  provider: typeof SocialMediaProvider.REDDIT;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
  subreddits: Array<{
    id: string;
    name: string;
    description: string;
    displayName: string;
    icon: string;
  }>;
  selectedSubreddit?: string;
  profileImage?: string;
  updatedAt: Date;
};

@Injectable()
export class RedditConnectionService implements ISocialMediaConnectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly trackedRecommendationsService: TrackedRecommendationsService,
  ) {}

  private async updateSocialMediaTokens(
    accountId: string,
    provider: SocialMediaProvider,
    tokenData: any,
  ): Promise<void> {
    const existingTokens = await this.getExistingTokens(accountId);
    const updatedTokens = { ...existingTokens, [provider]: tokenData };

    await this.prisma.accountSettings.update({
      where: { accountId },
      data: { socialMediaProviderTokens: updatedTokens },
    });
  }

  private async getExistingTokens(accountId: string): Promise<any> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { accountSettings: true },
    });
    return (account?.accountSettings?.socialMediaProviderTokens as any) || {};
  }

  private getRedditTokens(account: PopulatedAccount): any {
    const allTokens = account.accountSettings?.socialMediaProviderTokens as any;
    return allTokens?.[SocialMediaProvider.REDDIT];
  }

  private constructRedditUrl(subreddit: string, postId: string): string {
    return `https://www.reddit.com/r/${subreddit}/comments/${postId}/`;
  }

  private async updatePostAfterPublishing(
    postId: string,
    redditPostId: string,
    publishedUrl?: string,
  ): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        postIdInSocialMediaProvider: redditPostId,
        publishedAt: new Date(),
        state: 'POSTED',
        ...(publishedUrl && { publishedUrl }),
      },
    });
  }

  private async exchangeRedditToken(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    scope: string;
  }> {
    try {
      const clientId = this.configService.get('REDDIT_CLIENT_ID');
      const clientSecret = this.configService.get('REDDIT_CLIENT_SECRET');
      const siteUrl = this.configService.get('SITE_URL');
      const redirectUri = `${siteUrl}/igeo-agents`;

      if (!clientId || !clientSecret || !siteUrl) {
        throw new ApplicationErrorException(
          ERROR_CODES.REDDIT_CONFIGURATION_NOT_SET,
        );
      }
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );

      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
          },
        },
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
      };
    } catch (error) {
      this.logger.error('Error exchanging Reddit token:', {
        message: error.message,
        stack: error.stack,
      });
      throw new ApplicationErrorException(
        ERROR_CODES.REDDIT_SERVICE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async refreshRedditToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const clientId = this.configService.get('REDDIT_CLIENT_ID');
      const clientSecret = this.configService.get('REDDIT_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new ApplicationErrorException(
          ERROR_CODES.REDDIT_CONFIGURATION_NOT_SET,
          HttpStatus.BAD_REQUEST,
        );
      }

      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );

      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
          },
        },
      );

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      this.logger.error('Error refreshing Reddit token:', {
        message: error.message,
        stack: error.stack,
      });
      throw new ApplicationErrorException(
        ERROR_CODES.REDDIT_SERVICE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getRedditUserInfo(accessToken: string): Promise<{
    id: string;
    name: string;
    profileImage: string;
  }> {
    try {
      const response = await axios.get('https://oauth.reddit.com/api/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
        },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        profileImage: response.data.icon_img || '',
      };
    } catch (error) {
      this.logger.error('Error getting Reddit user info:', {
        message: error.message,
        stack: error.stack,
      });
      throw new ApplicationErrorException(
        ERROR_CODES.REDDIT_SERVICE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setAccessToken(
    account: PopulatedAccount,
    code: string,
  ): Promise<{
    message: string;
    provider: string;
    user: { id: string; name: string; profileImage: string };
    subreddits: {
      id: string;
      name: string;
      description: string;
      displayName: string;
      icon: string;
    }[];
  }> {
    try {
      const redditResponse = await this.exchangeRedditToken(code);

      const userInfo = await this.getRedditUserInfo(redditResponse.accessToken);

      const subreddits: Array<{
        id: string;
        name: string;
        description: string;
        displayName: string;
        icon: string;
      }> = await this.fetchRedditSubreddits(redditResponse.accessToken);

      if (!subreddits || subreddits.length === 0) {
        this.logger.warn('No Reddit subreddits found for user', {
          accountId: account.id,
          userId: userInfo.id,
        });

        const tokenData: RedditTokenData = {
          provider: SocialMediaProvider.REDDIT,
          accessToken: redditResponse.accessToken,
          refreshToken: redditResponse.refreshToken,
          expiresIn: redditResponse.expiresIn,
          tokenType: redditResponse.tokenType,
          scope: redditResponse.scope,
          subreddits: [],
          updatedAt: new Date(),
        };

        await this.updateSocialMediaTokens(
          account.id,
          SocialMediaProvider.REDDIT,
          tokenData,
        );

        return {
          message: `${SocialMediaProvider.REDDIT} OAuth callback successful, but no subreddits found`,
          provider: SocialMediaProvider.REDDIT,
          user: userInfo,
          subreddits: [],
        };
      }

      const tokenData: RedditTokenData = {
        provider: SocialMediaProvider.REDDIT,
        accessToken: redditResponse.accessToken,
        refreshToken: redditResponse.refreshToken,
        expiresIn: redditResponse.expiresIn,
        tokenType: redditResponse.tokenType,
        scope: redditResponse.scope,
        subreddits: subreddits,
        updatedAt: new Date(),
      };

      await this.updateSocialMediaTokens(
        account.id,
        SocialMediaProvider.REDDIT,
        tokenData,
      );

      return {
        message: `${SocialMediaProvider.REDDIT} OAuth callback successful`,
        provider: SocialMediaProvider.REDDIT,
        user: userInfo,
        subreddits: subreddits,
      };
    } catch (error) {
      this.logger.error(`Error setting Reddit access token:`, {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async checkConnectionStatus(account: PopulatedAccount): Promise<boolean> {
    try {
      const tokenData = this.getRedditTokens(account);

      if (!tokenData) {
        return false;
      }

      const { accessToken, expiresIn, selectedSubreddit } = tokenData;

      if (!accessToken) {
        this.logger.warn(`No Reddit access token found for account:`, {
          accountId: account.id,
        });
        return false;
      }

      if (!selectedSubreddit) {
        this.logger.warn(`No Reddit subreddit selected for account:`, {
          accountId: account.id,
        });
        return false;
      }

      const now = new Date();
      const updatedAt =
        tokenData.updatedAt instanceof Date
          ? tokenData.updatedAt
          : new Date(tokenData.updatedAt);
      const expiresInSeconds = expiresIn || 3600; // 1 hour default
      const tokenExpiry = new Date(
        updatedAt.getTime() + expiresInSeconds * 1000,
      );
      const bufferTime = 5 * 60 * 1000;

      if (tokenExpiry.getTime() - now.getTime() < bufferTime) {
        this.logger.warn(
          `Reddit access token is expired or expiring soon for account:`,
          {
            accountId: account.id,
            expiresAt: tokenExpiry,
            now,
          },
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking Reddit connection status:`, {
        message: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  async logout(account: PopulatedAccount): Promise<boolean> {
    try {
      const existingTokens = await this.getExistingTokens(account.id);

      if (existingTokens[SocialMediaProvider.REDDIT]) {
        const { [SocialMediaProvider.REDDIT]: removed, ...updatedTokens } =
          existingTokens;

        await this.prisma.accountSettings.update({
          where: { accountId: account.id },
          data: {
            socialMediaProviderTokens: updatedTokens,
          },
        });

        this.logger.log(
          `Successfully logged out from Reddit for account ${account.id}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Error logging out from Reddit:`, {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private async fetchRedditSubreddits(accessToken: string): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      displayName: string;
      icon: string;
    }>
  > {
    try {
      const response = await axios.get(
        'https://oauth.reddit.com/subreddits/mine/subscriber?limit=100',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
          },
        },
      );

      const subreddits = response.data.data.children.map((subreddit: any) => ({
        id: subreddit.data.display_name,
        name: subreddit.data.display_name,
        description:
          subreddit.data.public_description || subreddit.data.description || '',
        displayName: subreddit.data.display_name,
        icon: subreddit.data.icon_img || subreddit.data.community_icon || '',
      }));

      return subreddits;
    } catch (error) {
      this.logger.error('Error fetching Reddit subreddits:', {
        message: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  async getRedditSubreddits(account: PopulatedAccount): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      displayName: string;
      icon: string;
    }>
  > {
    try {
      const tokenData = this.getRedditTokens(account);

      if (!tokenData?.accessToken) {
        this.logger.error('No Reddit access token found', {
          accountId: account.id,
        });
        throw new ApplicationErrorException(
          ERROR_CODES.REDDIT_SERVICE_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let accessToken = tokenData.accessToken;

      const now = new Date();
      const expiresInSeconds = tokenData.expiresIn || 3600; // 1 hour default
      const tokenExpiry = new Date(
        new Date(tokenData.updatedAt).getTime() + expiresInSeconds * 1000,
      );
      const bufferTime = 5 * 60 * 1000;

      if (tokenExpiry.getTime() - now.getTime() < bufferTime) {
        this.logger.log('Refreshing Reddit access token');
        const refreshResponse = await this.refreshRedditToken(
          tokenData.refreshToken,
        );

        const updatedTokenData = {
          ...tokenData,
          accessToken: refreshResponse.accessToken,
          expiresIn: refreshResponse.expiresIn,
          updatedAt: new Date(),
        };

        await this.updateSocialMediaTokens(
          account.id,
          SocialMediaProvider.REDDIT,
          updatedTokenData,
        );

        accessToken = refreshResponse.accessToken;
      }

      const subreddits: Array<{
        id: string;
        name: string;
        description: string;
        displayName: string;
        icon: string;
      }> = await this.fetchRedditSubreddits(accessToken);

      const updatedTokenData = {
        ...tokenData,
        subreddits,
        updatedAt: new Date(),
      };

      await this.updateSocialMediaTokens(
        account.id,
        SocialMediaProvider.REDDIT,
        updatedTokenData,
      );

      return subreddits;
    } catch (error) {
      this.logger.error('Error getting Reddit subreddits:', {
        message: error.message,
        stack: error.stack,
        accountId: account.id,
      });
      throw error;
    }
  }

  async selectPage(
    account: PopulatedAccount,
    subredditName: string,
  ): Promise<{ message: string; provider: string }> {
    try {
      const tokenData = this.getRedditTokens(account);

      if (!tokenData) {
        this.logger.error('No Reddit tokens found for this account', {
          accountId: account.id,
        });
        throw new AppError(ERROR_CODES.REDDIT_TOKEN_NOT_FOUND);
      }

      const isProfileSelection = subredditName.startsWith('u_');

      let subreddit = null as any;
      if (!isProfileSelection) {
        subreddit = tokenData.subreddits?.find(
          (sub) => sub.name === subredditName,
        );

        if (!subreddit) {
          this.logger.error('Subreddit not found in user subscriptions', {
            accountId: account.id,
            subredditName,
          });
          throw new AppError(ERROR_CODES.REDDIT_SUBREDDIT_NOT_FOUND);
        }
      }

      const updatedTokenData = {
        ...tokenData,
        selectedSubreddit: subredditName,
        updatedAt: new Date(),
      };

      await this.updateSocialMediaTokens(
        account.id,
        SocialMediaProvider.REDDIT,
        updatedTokenData,
      );

      this.logger.log('Successfully selected Reddit target:', {
        accountId: account.id,
        subredditName,
      });

      return {
        message: isProfileSelection
          ? `Successfully selected profile: ${subredditName}`
          : `Successfully selected subreddit: ${subreddit.displayName}`,
        provider: SocialMediaProvider.REDDIT,
      };
    } catch (error) {
      this.logger.error('Error selecting Reddit subreddit:', {
        message: error.message,
        stack: error.stack,
        accountId: account.id,
        subredditName,
      });
      throw error;
    }
  }

  async getSelectedPage(account: PopulatedAccount): Promise<{
    id: string;
    name: string;
    profileImage: string;
    selectedSubreddit: string;
    subreddits: any[];
  } | null> {
    try {
      const tokenData = this.getRedditTokens(account);

      if (!tokenData?.selectedSubreddit) {
        return null;
      }

      const isProfileSelection = tokenData.selectedSubreddit.startsWith('u_');

      const selectedSubreddit = isProfileSelection
        ? null
        : tokenData.subreddits?.find(
            (sub) => sub.name === tokenData.selectedSubreddit,
          );

      if (!isProfileSelection && !selectedSubreddit) {
        return null;
      }

      if (
        !isProfileSelection &&
        !tokenData.profileImage &&
        selectedSubreddit.icon
      ) {
        await this.updateSocialMediaTokens(
          account.id,
          SocialMediaProvider.REDDIT,
          {
            ...tokenData,
            profileImage: selectedSubreddit.icon,
          },
        );
      }

      if (isProfileSelection) {
        return {
          id: tokenData.selectedSubreddit,
          name: tokenData.selectedSubreddit,
          profileImage: tokenData.profileImage || '',
          selectedSubreddit: tokenData.selectedSubreddit,
          subreddits: tokenData.subreddits || [],
        };
      } else {
        return {
          id: selectedSubreddit.name,
          name: selectedSubreddit.displayName,
          profileImage: tokenData.profileImage || selectedSubreddit.icon,
          selectedSubreddit: tokenData.selectedSubreddit,
          subreddits: tokenData.subreddits || [],
        };
      }
    } catch (error) {
      this.logger.error('Error getting selected Reddit subreddit:', {
        message: error.message,
        stack: error.stack,
        accountId: account.id,
      });
      return null;
    }
  }

  async publish(account: PopulatedAccount, postId: string): Promise<boolean> {
    this.logger.log('Starting Reddit post publication');

    let postData: any = {};

    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        this.logger.error('Post not found', {
          postId,
          accountId: account.id,
        });
        throw new AppError(ERROR_CODES.POST_NOT_FOUND);
      }

      if (post.accountId !== account.id) {
        this.logger.error('Post does not belong to this account', {
          postId,
          accountId: account.id,
        });
        throw new AppError(ERROR_CODES.INSUFFICIENT_PERMISSIONS);
      }

      const tokenData = this.getRedditTokens(account);

      if (!tokenData?.accessToken) {
        this.logger.error('No Reddit access token found', {
          postId,
          accountId: account.id,
        });
        throw new AppError(ERROR_CODES.REDDIT_TOKEN_NOT_FOUND);
      }

      let accessToken = tokenData.accessToken;

      const now = new Date();
      const expiresInSeconds = tokenData.expiresIn;
      const tokenExpiry = new Date(
        new Date(tokenData.updatedAt).getTime() + expiresInSeconds * 1000,
      );
      const bufferTime = 5 * 60 * 1000;

      if (tokenExpiry.getTime() - now.getTime() < bufferTime) {
        this.logger.log('Refreshing Reddit access token');
        const refreshResponse = await this.refreshRedditToken(
          tokenData.refreshToken,
        );

        const updatedTokenData = {
          ...tokenData,
          accessToken: refreshResponse.accessToken,
          expiresIn: refreshResponse.expiresIn,
          updatedAt: new Date(),
        };

        await this.updateSocialMediaTokens(
          account.id,
          SocialMediaProvider.REDDIT,
          updatedTokenData,
        );

        accessToken = refreshResponse.accessToken;
      }

      let title = post.title || '';
      let text = post.body || '';

      if (post?.tags && post?.tags?.length > 0) {
        const hashtags = post.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`);
        text += `\n\n${hashtags.join(' ')}`;
      }

      const selectedSubreddit = tokenData.selectedSubreddit;
      const subreddit = selectedSubreddit;

      if (!selectedSubreddit) {
        this.logger.warn('No subreddit selected, using default subreddit', {
          postId,
          accountId: account.id,
          defaultSubreddit: subreddit,
        });
      }

      let flairId: string | null = null;
      if (subreddit && !subreddit.startsWith('u_')) {
        try {
          this.logger.log('Fetching flairs for subreddit:', {
            subreddit,
            postId,
            accountId: account.id,
          });

          const flairResponse = await axios.get(
            `https://oauth.reddit.com/r/${subreddit}/api/link_flair`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
              },
            },
          );

          this.logger.log('Flair API response:', {
            subreddit,
            status: flairResponse.status,
            data: flairResponse.data,
            postId,
            accountId: account.id,
          });

          const flairs = Array.isArray(flairResponse.data)
            ? flairResponse.data
            : flairResponse.data?.choices || [];

          if (flairs.length > 0) {
            flairId = flairs[0].id || flairs[0].flair_template_id || null;
            this.logger.log('Using default flair for subreddit:', {
              subreddit,
              flairId,
              flairText: flairs[0].text || flairs[0].flair_text,
              totalFlairs: flairs.length,
            });
          } else {
            this.logger.warn('No flairs available for subreddit:', {
              subreddit,
              responseData: flairResponse.data,
            });
          }
        } catch (flairError: any) {
          this.logger.error('Could not fetch flairs for subreddit:', {
            subreddit,
            error: flairError.message,
            status: flairError.response?.status,
            statusText: flairError.response?.statusText,
            responseData: flairError.response?.data,
            postId,
            accountId: account.id,
          });

          if (subreddit === 'react') {
            const reactFlairIds = [
              '94e0c0d4-1f9e-11e2-892e-12313d0b60e8', // Discussion
              '94e0c0d6-1f9e-11e2-892e-12313d0b60e8', // Help
              '94e0c0d8-1f9e-11e2-892e-12313d0b60e8', // Showcase
            ];

            for (const testFlairId of reactFlairIds) {
              try {
                const testResponse = await axios.post(
                  'https://oauth.reddit.com/api/submit',
                  new URLSearchParams({
                    sr: subreddit,
                    kind: 'self',
                    title: 'Test flair validation',
                    text: 'Test',
                    api_type: 'json',
                    flair_id: testFlairId,
                  }),
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                    },
                  },
                );

                if (
                  !testResponse.data.json?.errors?.some(
                    (error: any[]) =>
                      error[0] === 'SUBMIT_VALIDATION_FLAIR_REQUIRED',
                  )
                ) {
                  flairId = testFlairId;
                  this.logger.log('Found valid flair ID for r/react:', {
                    subreddit,
                    flairId: testFlairId,
                    postId,
                    accountId: account.id,
                  });
                  break;
                }
              } catch (testError) {
                continue;
              }
            }
          }
        }
      }

      postData = {
        sr: subreddit,
        kind: 'self',
        title: title,
        text: text,
        api_type: 'json',
      };

      if (flairId) {
        postData.flair_id = flairId;
      }

      const response = await axios.post(
        'https://oauth.reddit.com/api/submit',
        new URLSearchParams(postData),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
          },
        },
      );

      this.logger.log('Reddit API response:', {
        status: response.status,
        data: response.data,
        postId,
        accountId: account.id,
      });

      if (response.data.json?.errors?.length > 0) {
        const errors = response.data.json.errors;
        const isFlairError = errors.some(
          (error: any[]) => error[0] === 'SUBMIT_VALIDATION_FLAIR_REQUIRED',
        );

        this.logger.log('Reddit API errors detected:', {
          errors,
          isFlairError,
          flairId,
          postId,
          accountId: account.id,
        });

        if (isFlairError) {
          this.logger.warn('Flair error detected, retrying without flair:', {
            subreddit,
            originalFlairId: flairId,
            postId,
            accountId: account.id,
          });

          const retryPostData = {
            sr: subreddit,
            kind: 'self',
            title: title,
            text: text,
            api_type: 'json',
          };

          const retryResponse = await axios.post(
            'https://oauth.reddit.com/api/submit',
            new URLSearchParams(retryPostData),
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
              },
            },
          );

          if (retryResponse.data.json?.errors?.length > 0) {
            const retryErrors = retryResponse.data.json.errors;
            const isRetryFlairError = retryErrors.some(
              (error: any[]) => error[0] === 'SUBMIT_VALIDATION_FLAIR_REQUIRED',
            );

            if (isRetryFlairError) {
              this.logger.warn(
                'Subreddit requires flair but none available, posting to profile instead:',
                {
                  subreddit,
                  postId,
                  accountId: account.id,
                },
              );

              const userInfo = await this.getRedditUserInfo(accessToken);
              const profileSubreddit = `u_${userInfo.name}`;

              const profilePostData = {
                sr: profileSubreddit,
                kind: 'self',
                title: title,
                text: text,
                api_type: 'json',
              };

              const profileResponse = await axios.post(
                'https://oauth.reddit.com/api/submit',
                new URLSearchParams(profilePostData),
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                  },
                },
              );

              if (profileResponse.data.json?.errors?.length > 0) {
                this.logger.error('Reddit API error posting to profile:', {
                  error: profileResponse.data.json.errors,
                  fullResponse: profileResponse.data,
                  postId,
                  accountId: account.id,
                });
                throw new AppError(ERROR_CODES.REDDIT_SERVICE_ERROR);
              }

              const redditPostId = profileResponse.data.json?.data?.id;
              if (!redditPostId) {
                this.logger.error(
                  'No Reddit post ID returned from profile post:',
                  {
                    fullResponse: profileResponse.data,
                    postId,
                    accountId: account.id,
                  },
                );
                throw new AppError(ERROR_CODES.REDDIT_SERVICE_ERROR);
              }

              const publishedUrl = this.constructRedditUrl(
                profileSubreddit,
                redditPostId,
              );
              await this.updatePostAfterPublishing(
                postId,
                redditPostId,
                publishedUrl,
              );

              // Track the published post
              if (publishedUrl) {
                try {
                  await this.trackedRecommendationsService.addUrlToTrackedRecommendation(
                    account.id,
                    post.recommendationId,
                    publishedUrl,
                  );
                  this.logger.log(
                    'Successfully tracked published Reddit post:',
                    {
                      postId,
                      publishedUrl,
                      recommendationId: post.recommendationId || 'dummy',
                    },
                  );
                } catch (trackingError) {
                  this.logger.error('Failed to track published Reddit post:', {
                    postId,
                    publishedUrl,
                    message: trackingError.message,
                    stack: trackingError.stack,
                  });
                  // Don't fail the publish operation due to tracking errors
                }
              }

              this.logger.log(
                'Successfully published Reddit post to profile:',
                {
                  postId,
                  redditPostId,
                  profileSubreddit,
                  originalSubreddit: subreddit,
                  publishedUrl,
                },
              );

              return true;
            }

            this.logger.error('Reddit API error after retry:', {
              error: retryResponse.data.json.errors,
              fullResponse: retryResponse.data,
              postId,
              accountId: account.id,
            });
            throw new AppError(ERROR_CODES.REDDIT_SERVICE_ERROR);
          }

          const redditPostId = retryResponse.data.json?.data?.id;
          if (!redditPostId) {
            this.logger.error('No Reddit post ID returned after retry:', {
              fullResponse: retryResponse.data,
              postId,
              accountId: account.id,
            });
            throw new AppError(ERROR_CODES.REDDIT_SERVICE_ERROR);
          }

          const publishedUrl = this.constructRedditUrl(subreddit, redditPostId);
          await this.updatePostAfterPublishing(
            postId,
            redditPostId,
            publishedUrl,
          );

          // Track the published post
          if (publishedUrl) {
            try {
              await this.trackedRecommendationsService.addUrlToTrackedRecommendation(
                account.id,
                post.recommendationId,
                publishedUrl,
              );
              this.logger.log('Successfully tracked published Reddit post:', {
                postId,
                publishedUrl,
                recommendationId: post.recommendationId || 'dummy',
              });
            } catch (trackingError) {
              this.logger.error('Failed to track published Reddit post:', {
                postId,
                publishedUrl,
                message: trackingError.message,
                stack: trackingError.stack,
              });
              // Don't fail the publish operation due to tracking errors
            }
          }

          this.logger.log(
            'Successfully published Reddit post (retry without flair):',
            {
              postId,
              redditPostId,
              subreddit,
              publishedUrl,
            },
          );

          return true;
        }

        this.logger.error('Reddit API error:', {
          error: errors,
          fullResponse: response.data,
          postId,
          accountId: account.id,
        });
        throw new AppError(ERROR_CODES.REDDIT_SERVICE_ERROR);
      }

      const redditPostId = response.data.json?.data?.id;
      if (!redditPostId) {
        this.logger.error('No Reddit post ID returned:', {
          fullResponse: response.data,
          postId,
          accountId: account.id,
        });
        throw new AppError(ERROR_CODES.REDDIT_SERVICE_ERROR);
      }

      const publishedUrl = this.constructRedditUrl(subreddit, redditPostId);
      await this.updatePostAfterPublishing(postId, redditPostId, publishedUrl);

      // Track the published post
      if (publishedUrl) {
        try {
          await this.trackedRecommendationsService.addUrlToTrackedRecommendation(
            account.id,
            post.recommendationId,
            publishedUrl,
          );
          this.logger.log('Successfully tracked published Reddit post:', {
            postId,
            publishedUrl,
            recommendationId: post.recommendationId || 'dummy',
          });
        } catch (trackingError) {
          this.logger.error('Failed to track published Reddit post:', {
            postId,
            publishedUrl,
            message: trackingError.message,
            stack: trackingError.stack,
          });
          // Don't fail the publish operation due to tracking errors
        }
      }

      this.logger.log('Successfully published Reddit post:', {
        postId,
        redditPostId,
        subreddit,
        publishedUrl,
      });

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

      this.logger.log('Reddit post publication completed successfully');
      return true;
    } catch (error: any) {
      this.logger.error('Error publishing Reddit post:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        stack: error.stack,
        postId,
        accountId: account.id,
        postData: {
          sr: postData.sr,
          kind: postData.kind,
          title: postData.title,
          textLength: postData.text?.length || 0,
        },
      });

      if (error.response) {
        throw new AppError(ERROR_CODES.REDDIT_SERVICE_ERROR);
      }

      throw error;
    }
  }
}
