import { ConfigService } from '@nestjs/config';
import { AppLogger } from '@/utils/app-logger.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
type InstagramBusinessProfile = {
    id: string;
    username: string;
    profileImage: string;
    pageId: string;
    pageName: string;
};
export declare class InstagramConnectionServices implements ISocialMediaConnectionService {
    private readonly prisma;
    private readonly logger;
    private readonly configService;
    private readonly trackedRecommendationsService;
    private readonly graphBaseUrl;
    constructor(prisma: PrismaService, logger: AppLogger, configService: ConfigService, trackedRecommendationsService: TrackedRecommendationsService);
    private parseInstagramTokens;
    private getExistingTokens;
    private getInstagramTokens;
    private updateSocialMediaTokens;
    private exchangeFacebookToken;
    private fetchInstagramProfiles;
    private getPageAccessToken;
    private buildCaption;
    private getInstagramPermalink;
    setAccessToken(account: PopulatedAccount, code: string): Promise<{
        message: string;
        provider: string;
        profiles: InstagramBusinessProfile[];
    }>;
    checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;
    logout(account: PopulatedAccount): Promise<boolean>;
    selectPage(account: PopulatedAccount, profileId: string): Promise<{
        message: string;
        provider: string;
    }>;
    getSelectedPage(account: PopulatedAccount): Promise<{
        id: string;
        name: string;
        profileImage: string;
    } | null>;
    publish(account: PopulatedAccount, postId: string): Promise<boolean>;
}
export {};
