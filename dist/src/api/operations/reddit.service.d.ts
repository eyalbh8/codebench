import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
import { ConfigService } from '@/config/config.service';
export declare class RedditConnectionService implements ISocialMediaConnectionService {
    private readonly prisma;
    private readonly logger;
    private readonly configService;
    private readonly trackedRecommendationsService;
    constructor(prisma: PrismaService, logger: AppLogger, configService: ConfigService, trackedRecommendationsService: TrackedRecommendationsService);
    private updateSocialMediaTokens;
    private getExistingTokens;
    private getRedditTokens;
    private constructRedditUrl;
    private updatePostAfterPublishing;
    private exchangeRedditToken;
    private refreshRedditToken;
    private getRedditUserInfo;
    setAccessToken(account: PopulatedAccount, code: string): Promise<{
        message: string;
        provider: string;
        user: {
            id: string;
            name: string;
            profileImage: string;
        };
        subreddits: {
            id: string;
            name: string;
            description: string;
            displayName: string;
            icon: string;
        }[];
    }>;
    checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;
    logout(account: PopulatedAccount): Promise<boolean>;
    private fetchRedditSubreddits;
    getRedditSubreddits(account: PopulatedAccount): Promise<Array<{
        id: string;
        name: string;
        description: string;
        displayName: string;
        icon: string;
    }>>;
    selectPage(account: PopulatedAccount, subredditName: string): Promise<{
        message: string;
        provider: string;
    }>;
    getSelectedPage(account: PopulatedAccount): Promise<{
        id: string;
        name: string;
        profileImage: string;
        selectedSubreddit: string;
        subreddits: any[];
    } | null>;
    publish(account: PopulatedAccount, postId: string): Promise<boolean>;
}
