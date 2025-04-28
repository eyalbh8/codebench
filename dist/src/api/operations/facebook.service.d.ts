import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
export declare class FacebookConnectionService implements ISocialMediaConnectionService {
    private readonly prisma;
    private readonly logger;
    private readonly configService;
    private readonly trackedRecommendationsService;
    constructor(prisma: PrismaService, logger: AppLogger, configService: ConfigService, trackedRecommendationsService: TrackedRecommendationsService);
    private updateTokens;
    private getExistingTokens;
    private getFacebookTokens;
    private getFacebookPermalink;
    private updatePostAfterPublishing;
    private createFacebookFormData;
    private exchangeFacebookToken;
    private refreshFacebookToken;
    private getPageAccessToken;
    private getFacebookPageAccessToken;
    setAccessToken(account: PopulatedAccount, code: string): Promise<{
        message: string;
        provider: string;
        pages: Array<{
            name: string;
            id: string;
            profileImage: string;
        }>;
    }>;
    selectPage(account: PopulatedAccount, pageId: string): Promise<{
        message: string;
        provider: string;
    }>;
    checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;
    logout(account: PopulatedAccount): Promise<boolean>;
    getSelectedPage(account: PopulatedAccount): Promise<{
        id: string;
        name: string;
        profileImage: string;
    } | null>;
    publish(account: PopulatedAccount, postId: string): Promise<boolean>;
}
