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
    setAccessToken(account: PopulatedAccount, code: string | {
        code: string;
        codeVerifier?: string;
        state?: string;
    }, codeVerifier?: string): Promise<{
        message: string;
        provider: string;
        [key: string]: any;
    }>;
    checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;
    logout(account: PopulatedAccount): Promise<boolean>;
    publish(account: PopulatedAccount, postId: string): Promise<boolean>;
    selectPage?(account: PopulatedAccount, pageId: string): Promise<{
        message: string;
        provider: string;
    }>;
    getSelectedPage?(account: PopulatedAccount): Promise<{
        id: string;
        name: string;
        profileImage: string;
        [key: string]: any;
    } | null>;
}
export declare class SocialMediaConnectionRouterService {
    private readonly facebookConnectionService;
    private readonly linkedInConnectionService;
    private readonly xConnectionService;
    private readonly instagramConnectionService;
    private readonly redditConnectionService;
    private readonly pinterestConnectionService;
    private readonly blogConnectionService;
    private readonly logger;
    constructor(facebookConnectionService: FacebookConnectionService, linkedInConnectionService: LinkedInConnectionServices, xConnectionService: SocialMediaConnectionService, instagramConnectionService: InstagramConnectionServices, redditConnectionService: RedditConnectionService, pinterestConnectionService: PinterestConnectionService, blogConnectionService: BlogConnectionService, logger: AppLogger);
    private buildResultSummary;
    private getServiceForProvider;
    setAccessToken(account: PopulatedAccount, provider: SocialMediaProvider, code: string, codeVerifier?: string): Promise<{
        message: string;
        provider: string;
        [key: string]: any;
    }>;
    checkConnectionStatus(account: PopulatedAccount, provider: SocialMediaProvider): Promise<boolean>;
    logout(account: PopulatedAccount, provider: SocialMediaProvider): Promise<boolean>;
    publish(account: PopulatedAccount, postId: string, provider: SocialMediaProvider): Promise<boolean>;
    selectPage(account: PopulatedAccount, provider: SocialMediaProvider, pageId: string): Promise<{
        message: string;
        provider: string;
    }>;
    getSelectedPage(account: PopulatedAccount, provider: SocialMediaProvider): Promise<{
        id: string;
        name: string;
        profileImage: string;
    } | null>;
}
