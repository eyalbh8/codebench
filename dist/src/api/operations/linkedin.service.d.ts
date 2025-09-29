import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
type LinkedInOrganization = {
    id: string;
    name: string;
    logoUrl: string;
    vanityName: string;
};
export declare class LinkedInConnectionServices implements ISocialMediaConnectionService {
    private readonly prisma;
    private readonly logger;
    private readonly configService;
    private readonly trackedRecommendationsService;
    private readonly graphBaseUrl;
    constructor(prisma: PrismaService, logger: AppLogger, configService: ConfigService, trackedRecommendationsService: TrackedRecommendationsService);
    private getExistingTokens;
    private getLinkedInTokens;
    private updateSocialMediaTokens;
    private exchangeLinkedInToken;
    private fetchLinkedInOrganizations;
    setAccessToken(account: PopulatedAccount, code: string): Promise<{
        message: string;
        provider: string;
        organizations: LinkedInOrganization[];
        organizationCount: number;
    }>;
    checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;
    logout(account: PopulatedAccount): Promise<boolean>;
    selectPage(account: PopulatedAccount, organizationId: string): Promise<{
        message: string;
        provider: string;
    }>;
    getSelectedPage(account: PopulatedAccount): Promise<{
        id: string;
        name: string;
        profileImage: string;
    } | null>;
    private uploadImageToLinkedIn;
    publish(account: PopulatedAccount, postId: string): Promise<boolean>;
    getPostAnalytics(account: PopulatedAccount, postId: string): Promise<any>;
    getPostComments(account: PopulatedAccount, postId: string): Promise<any[]>;
    getPostReactions(account: PopulatedAccount, postId: string): Promise<any>;
    private constructLinkedInUrl;
    generateShareLink(account: PopulatedAccount, postId: string): Promise<{
        shareUrl: string;
    }>;
}
export {};
