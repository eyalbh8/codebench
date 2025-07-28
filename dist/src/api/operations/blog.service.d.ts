import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
export declare class BlogConnectionService implements ISocialMediaConnectionService {
    private readonly prisma;
    private readonly logger;
    private readonly configService;
    private readonly trackedRecommendationsService;
    private readonly providerKey;
    constructor(prisma: PrismaService, logger: AppLogger, configService: ConfigService, trackedRecommendationsService: TrackedRecommendationsService);
    private get isProd();
    setAccessToken(account: PopulatedAccount, code: string | {
        code: string;
        codeVerifier?: string;
        state?: string;
    }, codeVerifier?: string): Promise<{
        message: string;
        provider: string;
    }>;
    private validateWordPressCredentials;
    private parseExistingTokens;
    checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;
    logout(account: PopulatedAccount): Promise<boolean>;
    publish(account: PopulatedAccount, postId: string): Promise<boolean>;
    private uploadWordPressImage;
    private getOrCreateWordPressTags;
}
