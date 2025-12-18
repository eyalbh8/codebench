import { Injectable } from '@nestjs/common';
import { SocialMediaProvider } from '@/model.enums';
import { FacebookConnectionService } from './facebook.service';
import { SocialMediaConnectionService } from './x.service';
import { AppLogger } from '@/utils/app-logger.service';
import { RedditConnectionService } from './reddit.service';
import { PinterestConnectionService } from './pinterest.service';
import { BlogConnectionService } from './blog.service';
import { InstagramConnectionServices } from './instagram.service';
import { LinkedInConnectionServices } from './linkedin.service';
import { PopulatedAccount } from '@/types/api';

export interface ISocialMediaConnectionService {
  setAccessToken(
    account: PopulatedAccount,
    code: string | { code: string; codeVerifier?: string; state?: string },
    codeVerifier?: string,
  ): Promise<{ message: string; provider: string; [key: string]: any }>;

  checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;

  logout(account: PopulatedAccount): Promise<boolean>;

  publish(account: PopulatedAccount, postId: string): Promise<boolean>;

  selectPage?(
    account: PopulatedAccount,
    pageId: string,
  ): Promise<{ message: string; provider: string }>;

  getSelectedPage?(account: PopulatedAccount): Promise<{
    id: string;
    name: string;
    profileImage: string;
    [key: string]: any;
  } | null>;
}

@Injectable()
export class SocialMediaConnectionRouterService {
  constructor(
    private readonly facebookConnectionService: FacebookConnectionService,
    private readonly linkedInConnectionService: LinkedInConnectionServices,
    private readonly xConnectionService: SocialMediaConnectionService,
    private readonly instagramConnectionService: InstagramConnectionServices,
    private readonly redditConnectionService: RedditConnectionService,
    private readonly pinterestConnectionService: PinterestConnectionService,
    private readonly blogConnectionService: BlogConnectionService,
    private readonly logger: AppLogger,
  ) {}

  private buildResultSummary(
    provider: SocialMediaProvider,
    result: Record<string, any>,
  ) {
    const summary: Record<string, any> = {
      provider,
      message: result?.message,
    };

    if (provider === SocialMediaProvider.FACEBOOK && result?.pages) {
      summary.pages = result.pages.map((page: any) => ({
        id: page.id,
        name: page.name,
      }));
      summary.pageCount = result.pages.length;
    }

    if (provider === SocialMediaProvider.INSTAGRAM && result?.profiles) {
      summary.profileCount = result.profiles.length;
      summary.profiles = result.profiles.map((profile: any) => ({
        id: profile.id,
        name: profile.username || profile.name,
      }));
    }

    if (provider === SocialMediaProvider.PINTEREST && result?.boards) {
      summary.boardCount = result.boards.length;
      summary.boards = result.boards.map((board: any) => ({
        id: board.id,
        name: board.name,
      }));
    }

    if (provider === SocialMediaProvider.REDDIT) {
      if (result?.user) {
        summary.user = {
          id: result.user.id,
          name: result.user.name,
        };
      }
      if (result?.subreddits) {
        summary.subredditCount = result.subreddits.length;
        summary.subreddits = result.subreddits.map((subreddit: any) => ({
          id: subreddit.id,
          name: subreddit.name,
        }));
      }
    }

    if (
      (provider === SocialMediaProvider.BLOG ||
        provider === SocialMediaProvider.LISTICLE) &&
      result?.siteUrl
    ) {
      summary.siteUrl = result.siteUrl;
    }

    if (provider === SocialMediaProvider.X && result?.username) {
      summary.username = result.username;
    }

    if (provider === SocialMediaProvider.GSC && result?.sites) {
      summary.siteCount = result.sites.length;
      summary.sites = result.sites.map((site: any) => ({
        id: site.siteUrl,
        name: site.siteUrl,
      }));
    }

    if (provider === SocialMediaProvider.LINKEDIN && result?.organizations) {
      summary.organizationCount = result.organizations.length;
      summary.organizations = result.organizations.map((org: any) => ({
        id: org.id,
        name: org.name,
      }));
    }

    return summary;
  }

  private getServiceForProvider(
    provider: SocialMediaProvider,
  ): ISocialMediaConnectionService {
    switch (provider) {
      case SocialMediaProvider.FACEBOOK:
        return this.facebookConnectionService;
      case SocialMediaProvider.LINKEDIN:
        return this.linkedInConnectionService;
      case SocialMediaProvider.INSTAGRAM:
        return this.instagramConnectionService;
      case SocialMediaProvider.X:
        return this.xConnectionService;
      case SocialMediaProvider.REDDIT:
        return this.redditConnectionService;
      case SocialMediaProvider.PINTEREST:
        return this.pinterestConnectionService;
      case SocialMediaProvider.LISTICLE:
      case SocialMediaProvider.BLOG:
        return this.blogConnectionService;
      default:
        this.logger.error(`Unsupported social media provider: ${provider}`);
        throw new Error(`Unsupported social media provider: ${provider}`);
    }
  }

  async setAccessToken(
    account: PopulatedAccount,
    provider: SocialMediaProvider,
    code: string,
    codeVerifier?: string,
  ): Promise<{ message: string; provider: string; [key: string]: any }> {
    try {
      const service = this.getServiceForProvider(provider);
      this.logger.log('Starting social media token exchange', {
        provider,
        accountId: account.id,
      });

      if (provider === SocialMediaProvider.X) {
        const result = await service.setAccessToken(
          account,
          code,
          codeVerifier,
        );
        this.logger.log('Completed social media token exchange', {
          accountId: account.id,
          ...this.buildResultSummary(provider, result),
        });
        return result;
      }

      const result = await service.setAccessToken(account, code);
      this.logger.log('Completed social media token exchange', {
        accountId: account.id,
        ...this.buildResultSummary(provider, result),
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error setting access token for ${provider}: ${error.message}`,
        {
          accountId: account.id,
          provider,
        },
      );
      throw error;
    }
  }

  async checkConnectionStatus(
    account: PopulatedAccount,
    provider: SocialMediaProvider,
  ): Promise<boolean> {
    try {
      const service = this.getServiceForProvider(provider);
      return await service.checkConnectionStatus(account);
    } catch (error) {
      this.logger.error(
        `Error checking connection status for ${provider}:`,
        error,
      );
      return false;
    }
  }

  async logout(
    account: PopulatedAccount,
    provider: SocialMediaProvider,
  ): Promise<boolean> {
    try {
      const service = this.getServiceForProvider(provider);
      return await service.logout(account);
    } catch (error) {
      this.logger.error(`Error logging out from ${provider}: ${error.message}`);
      throw error;
    }
  }

  async publish(
    account: PopulatedAccount,
    postId: string,
    provider: SocialMediaProvider,
  ): Promise<boolean> {
    try {
      const service = this.getServiceForProvider(provider);

      return await service.publish(account, postId);
    } catch (error) {
      this.logger.error(`Error publishing post ${postId} to ${provider}:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async selectPage(
    account: PopulatedAccount,
    provider: SocialMediaProvider,
    pageId: string,
  ): Promise<{ message: string; provider: string }> {
    try {
      const service = this.getServiceForProvider(provider);

      if (
        provider === SocialMediaProvider.FACEBOOK &&
        'selectPage' in service
      ) {
        return await (service as any).selectPage(account, pageId);
      }

      if (
        provider === SocialMediaProvider.INSTAGRAM &&
        'selectPage' in service
      ) {
        return await (service as any).selectPage(account, pageId);
      }

      if (provider === SocialMediaProvider.GSC && 'selectSite' in service) {
        return await (service as any).selectSite(account, pageId);
      }

      if (
        provider === SocialMediaProvider.PINTEREST &&
        'selectBoard' in service
      ) {
        return await (service as any).selectBoard(account, pageId);
      }

      if (provider === SocialMediaProvider.REDDIT && 'selectPage' in service) {
        return await (service as any).selectPage(account, pageId);
      }

      if (
        provider === SocialMediaProvider.LINKEDIN &&
        'selectPage' in service
      ) {
        return await (service as any).selectPage(account, pageId);
      }

      throw new Error(`Page selection not supported for provider: ${provider}`);
    } catch (error) {
      this.logger.error(
        `Error selecting page for ${provider}: ${error.message}`,
      );
      throw error;
    }
  }

  async getSelectedPage(
    account: PopulatedAccount,
    provider: SocialMediaProvider,
  ): Promise<{ id: string; name: string; profileImage: string } | null> {
    try {
      const service = this.getServiceForProvider(provider);

      if (
        provider === SocialMediaProvider.FACEBOOK &&
        'getSelectedPage' in service
      ) {
        return await (service as any).getSelectedPage(account);
      }

      if (
        provider === SocialMediaProvider.INSTAGRAM &&
        'getSelectedPage' in service
      ) {
        return await (service as any).getSelectedPage(account);
      }

      if (
        provider === SocialMediaProvider.GSC &&
        'getSelectedSite' in service
      ) {
        const selectedSite = await (service as any).getSelectedSite(account);
        if (selectedSite) {
          return {
            id: selectedSite.siteUrl,
            name: selectedSite.siteUrl,
            profileImage: '',
          };
        }
      }

      if (
        provider === SocialMediaProvider.PINTEREST &&
        'getSelectedBoard' in service
      ) {
        return await (service as any).getSelectedBoard(account);
      }

      if (
        provider === SocialMediaProvider.REDDIT &&
        'getSelectedPage' in service
      ) {
        return await (service as any).getSelectedPage(account);
      }

      if (
        provider === SocialMediaProvider.LINKEDIN &&
        'getSelectedPage' in service
      ) {
        return await (service as any).getSelectedPage(account);
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Error getting selected page for ${provider}: ${error.message}`,
      );
      return null;
    }
  }
}
