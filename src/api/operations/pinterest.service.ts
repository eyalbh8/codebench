import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialMediaProvider, PostState } from '@/model.enums';
import { PrismaService } from '@/prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
import axios from 'axios';

type PinterestTokens = {
  provider: SocialMediaProvider;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  boards: Array<{ id: string; name: string; description: string }>;
  selectedBoardId?: string;
  updatedAt: Date;
};

type ProviderTokensRecord = {
  [key: string]: PinterestTokens;
};

@Injectable()
export class PinterestConnectionService
  implements ISocialMediaConnectionService
{
  private readonly providerKey = SocialMediaProvider.PINTEREST;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly trackedRecommendationsService: TrackedRecommendationsService,
  ) {}

  private get isProd(): boolean {
    return (this.configService.get('NODE_ENV') || '').toLowerCase() === 'prod';
  }

  private get baseUrl(): string {
    return this.isProd
      ? 'https://api.pinterest.com/v5'
      : 'https://api-sandbox.pinterest.com/v5';
  }

  private get sandboxToken(): string {
    return this.configService.get('PINTEREST_SANDBOX_SECRET') || '';
  }

  private parseExistingTokens(account: PopulatedAccount): ProviderTokensRecord {
    return (
      (account.accountSettings
        ?.socialMediaProviderTokens as unknown as ProviderTokensRecord) || {}
    );
  }

  private constructPinterestUrl(pinId: string): string {
    return `https://www.pinterest.com/pin/${pinId}/`;
  }

  private async getPinterestBoards(
    accessToken: string,
  ): Promise<Array<{ id: string; name: string; description: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/boards`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const boards =
        response.data.items?.map((board: any) => ({
          id: board.id,
          name: board.name,
          description: board.description || '',
        })) || [];

      return boards;
    } catch (error: any) {
      this.logger.error('Error fetching Pinterest boards:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      return [];
    }
  }

  private async exchangePinterestToken(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      if (!this.isProd) {
        if (!this.sandboxToken) {
          throw new Error('Missing PINTEREST_SANDBOX_ACCESS_TOKEN');
        }
        return {
          accessToken: this.sandboxToken,
          refreshToken: '',
          expiresIn: 2592000,
        };
      }

      const clientId = this.configService.get('PINTEREST_CLIENT_ID');
      const clientSecret = this.configService.get('PINTEREST_CLIENT_SECRET');
      const siteUrl = this.configService.get('SITE_URL');

      const redirectUri = `${siteUrl}/igeo-agents`;

      if (!code) {
        throw new Error('Missing authorization code for Pinterest OAuth');
      }

      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );

      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', code);
      formData.append('redirect_uri', redirectUri);

      const response = await axios.post(
        `${this.baseUrl}/oauth/token`,
        formData.toString(),
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in || 2592000,
      };
    } catch (error: any) {
      this.logger.error('Error exchanging Pinterest token:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(`Failed to exchange Pinterest token: ${error.message}`);
    }
  }

  private async refreshAccessToken(
    tokens: PinterestTokens,
  ): Promise<PinterestTokens | null> {
    try {
      if (!this.isProd) {
        return tokens;
      }

      if (!tokens.refreshToken) return null;

      const clientId = this.configService.get('PINTEREST_CLIENT_ID');
      const clientSecret = this.configService.get('PINTEREST_CLIENT_SECRET');

      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );

      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', tokens.refreshToken);

      const response = await axios.post(
        `${this.baseUrl}/oauth/token`,
        formData.toString(),
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      );

      const now = Date.now();
      const expiresAt = response.data.expires_in
        ? new Date(now + response.data.expires_in * 1000).toISOString()
        : tokens.expiresAt;

      return {
        ...tokens,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || tokens.refreshToken,
        expiresAt,
        updatedAt: new Date(),
      };
    } catch (error: any) {
      this.logger.error('Error refreshing Pinterest access token:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      return null;
    }
  }

  private async updateSocialMediaTokens(
    accountId: string,
    provider: SocialMediaProvider,
    tokenData: PinterestTokens,
  ): Promise<void> {
    const existing = this.parseExistingTokens({
      accountSettings: { socialMediaProviderTokens: {} },
    } as PopulatedAccount);

    const updated: ProviderTokensRecord = {
      ...existing,
      [SocialMediaProvider.PINTEREST]: tokenData,
    };

    await this.prisma.accountSettings.update({
      where: { accountId },
      data: { socialMediaProviderTokens: updated },
    });
  }

  async setAccessToken(
    account: PopulatedAccount,
    code: string,
  ): Promise<{
    message: string;
    provider: string;
    boards: Array<{ id: string; name: string; description: string }>;
  }> {
    try {
      if (!this.isProd) {
        if (!this.sandboxToken) {
          throw new Error('Missing PINTEREST_SANDBOX_ACCESS_TOKEN');
        }

        const boards = await this.getPinterestBoards(this.sandboxToken);

        const tokenData: PinterestTokens = {
          provider: SocialMediaProvider.PINTEREST,
          accessToken: this.sandboxToken,
          refreshToken: '',
          expiresAt: new Date(Date.now() + 2592000 * 1000).toISOString(), // 30 days
          boards,
          updatedAt: new Date(),
        };

        await this.updateSocialMediaTokens(
          account.id,
          SocialMediaProvider.PINTEREST,
          tokenData,
        );

        return {
          message: `PINTEREST sandbox connection successful`,
          provider: SocialMediaProvider.PINTEREST,
          boards,
        };
      }

      const pinterestResponse = await this.exchangePinterestToken(code);

      const boards = await this.getPinterestBoards(
        pinterestResponse.accessToken,
      );

      const now = Date.now();
      const expiresInSeconds = pinterestResponse.expiresIn;
      const expiresAt = new Date(now + expiresInSeconds * 1000).toISOString();

      const tokenData: PinterestTokens = {
        provider: SocialMediaProvider.PINTEREST,
        accessToken: pinterestResponse.accessToken,
        refreshToken: pinterestResponse.refreshToken,
        expiresAt,
        boards,
        updatedAt: new Date(),
      };

      await this.updateSocialMediaTokens(
        account.id,
        SocialMediaProvider.PINTEREST,
        tokenData,
      );

      return {
        message: `PINTEREST OAuth callback successful`,
        provider: SocialMediaProvider.PINTEREST,
        boards,
      };
    } catch (error: any) {
      this.logger.error('Error setting Pinterest access token:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async checkConnectionStatus(account: PopulatedAccount): Promise<boolean> {
    try {
      const existing = this.parseExistingTokens(account);
      const tokenData = existing[this.providerKey];

      if (!tokenData?.accessToken) return false;
      if (!tokenData.selectedBoardId) return false;

      const now = new Date();
      const expiresAt = new Date(tokenData.expiresAt);

      if (now >= expiresAt) {
        const refreshedToken = await this.refreshAccessToken(tokenData);
        if (refreshedToken) {
          await this.updateSocialMediaTokens(
            account.id,
            SocialMediaProvider.PINTEREST,
            refreshedToken,
          );
          return !!refreshedToken.selectedBoardId;
        }
        return false;
      }

      return true;
    } catch (error: any) {
      this.logger.error('Error checking Pinterest connection status:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      return false;
    }
  }

  async selectBoard(
    account: PopulatedAccount,
    boardId: string,
  ): Promise<{ message: string; provider: string }> {
    try {
      const existing = this.parseExistingTokens(account);
      const tokenData = existing[this.providerKey];

      if (!tokenData) {
        this.logger.error('No Pinterest tokens found for this account', {
          accountId: account.id,
        });
        throw new Error('No Pinterest tokens found for this account');
      }

      const selectedBoard = tokenData.boards?.find(
        (board) => board.id === boardId,
      );
      if (!selectedBoard) {
        this.logger.error('Selected board not found', {
          accountId: account.id,
          boardId,
        });
        throw new Error('Selected board not found');
      }

      const updatedTokenData = {
        ...tokenData,
        selectedBoardId: selectedBoard.id,
        updatedAt: new Date(),
      };

      await this.updateSocialMediaTokens(
        account.id,
        SocialMediaProvider.PINTEREST,
        updatedTokenData,
      );

      return {
        message: `Pinterest board selected successfully`,
        provider: SocialMediaProvider.PINTEREST,
      };
    } catch (error: any) {
      this.logger.error('Error selecting Pinterest board:', {
        message: error.message,
        accountId: account.id,
        boardId,
      });
      throw error;
    }
  }

  async getSelectedBoard(
    account: PopulatedAccount,
  ): Promise<{ id: string; name: string; profileImage: string } | null> {
    try {
      const existing = this.parseExistingTokens(account);
      const tokenData = existing[this.providerKey];

      if (!tokenData?.selectedBoardId) return null;

      const selectedBoard = tokenData.boards?.find(
        (board) => board.id === tokenData.selectedBoardId,
      );

      if (!selectedBoard) return null;

      return {
        id: selectedBoard.id,
        name: selectedBoard.name,
        profileImage: '',
      };
    } catch (error: any) {
      this.logger.error('Error getting selected Pinterest board:', {
        message: error.message,
        accountId: account.id,
      });
      return null;
    }
  }

  async logout(account: PopulatedAccount): Promise<boolean> {
    try {
      const existing = this.parseExistingTokens(account);
      const updated: ProviderTokensRecord = { ...existing };
      delete updated[this.providerKey];

      await this.prisma.accountSettings.update({
        where: { accountId: account.id },
        data: { socialMediaProviderTokens: updated },
      });

      return true;
    } catch (error: any) {
      this.logger.error('Error logging out from Pinterest:', {
        message: error.message,
        accountId: account.id,
      });
      return false;
    }
  }

  async publish(account: PopulatedAccount, postId: string): Promise<boolean> {
    this.logger.log('Starting Pinterest post publication');

    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) throw new Error(`Post not found: ${postId}`);

      if (post.publishedAt || post.state === PostState.POSTED.toString()) {
        this.logger.warn(
          `Post ${postId} was already published on ${post.publishedAt?.toISOString()}`,
        );
        throw new Error(
          `Post ${postId} was already published and cannot be published again`,
        );
      }

      if (post.socialMediaProvider !== SocialMediaProvider.PINTEREST) {
        throw new Error(
          `Post ${postId} is not for Pinterest provider: ${post.socialMediaProvider}`,
        );
      }

      const isConnected = await this.checkConnectionStatus(account);
      if (!isConnected) {
        throw new Error('Pinterest connection expired or invalid');
      }

      const existing = this.parseExistingTokens(account);
      const tokenData = existing[this.providerKey];

      if (!tokenData?.accessToken) {
        throw new Error('No Pinterest access token found');
      }

      if (!tokenData.selectedBoardId) {
        throw new Error(
          'No Pinterest board selected. Please select a board first.',
        );
      }

      const imageUrl = post?.imagesUrl?.[post?.imagesUrl?.length - 1];
      if (!imageUrl) {
        throw new Error('Pinterest requires an image URL to create a pin');
      }

      const pinData = {
        board_id: tokenData.selectedBoardId,
        title: post.title,
        description: post.body,
        link: post.visitSite || '',
        media_source: {
          source_type: 'image_url',
          url: imageUrl,
        },
      };

      const response = await axios.post(`${this.baseUrl}/pins`, pinData, {
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const pinId = response.data.id;
      const publishedUrl = this.constructPinterestUrl(pinId);

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          postIdInSocialMediaProvider: pinId,
          state: PostState.POSTED,
          publishedAt: new Date(),
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
          this.logger.log('Successfully tracked published Pinterest post:', {
            postId,
            publishedUrl,
            recommendationId: post.recommendationId || 'dummy',
          });
        } catch (trackingError) {
          this.logger.error('Failed to track published Pinterest post:', {
            postId,
            publishedUrl,
            message: trackingError.message,
            stack: trackingError.stack,
          });
          // Don't fail the publish operation due to tracking errors
        }
      }

      this.logger.log(
        `Successfully published post ${postId} to Pinterest as Pin ${pinId}`,
        { publishedUrl },
      );

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

      this.logger.log('Pinterest post publication completed successfully');
      return true;
    } catch (error: any) {
      this.logger.error(`Error publishing post ${postId} to Pinterest:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        postId,
        accountId: account.id,
      });

      await this.prisma.post.update({
        where: { id: postId },
        data: { state: PostState.FAILED },
      });

      throw error;
    }
  }
}
