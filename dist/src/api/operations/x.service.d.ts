import { ConfigService } from '@/config/config.service';
import { SocialMediaProvider } from '@/model.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
type TokenResponse = {
    message: string;
    provider: string;
};
export declare class SocialMediaConnectionService implements ISocialMediaConnectionService {
    private readonly prisma;
    private readonly logger;
    private readonly configService;
    private readonly trackedRecommendationsService;
    constructor(prisma: PrismaService, logger: AppLogger, configService: ConfigService, trackedRecommendationsService: TrackedRecommendationsService);
    private constructTwitterUrl;
    setAccessToken(account: PopulatedAccount, bodyOrCode: string | {
        code: string;
        codeVerifier?: string;
        state?: string;
    }, codeVerifier?: string): Promise<TokenResponse>;
    private verifyXToken;
    private refreshXToken;
    checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;
    checkConnectionStatusWithProvider(account: PopulatedAccount, provider: SocialMediaProvider): Promise<boolean>;
    logout(account: PopulatedAccount): Promise<boolean>;
    logoutWithProvider(account: PopulatedAccount, provider: SocialMediaProvider): Promise<boolean>;
    publish(account: PopulatedAccount, postId: string): Promise<boolean>;
}
export {};
