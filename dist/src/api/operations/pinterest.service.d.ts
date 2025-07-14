import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PopulatedAccount } from '@/types/api';
import { ISocialMediaConnectionService } from './social-media-connection-router.service';
import { TrackedRecommendationsService } from './tracked-insights';
export declare class PinterestConnectionService implements ISocialMediaConnectionService {
    private readonly prisma;
    private readonly logger;
    private readonly configService;
    private readonly trackedRecommendationsService;
    private readonly providerKey;
    constructor(prisma: PrismaService, logger: AppLogger, configService: ConfigService, trackedRecommendationsService: TrackedRecommendationsService);
    private get isProd();
    private get baseUrl();
    private get sandboxToken();
    private parseExistingTokens;
    private constructPinterestUrl;
    private getPinterestBoards;
    private exchangePinterestToken;
    private refreshAccessToken;
    private updateSocialMediaTokens;
    setAccessToken(account: PopulatedAccount, code: string): Promise<{
        message: string;
        provider: string;
        boards: Array<{
            id: string;
            name: string;
            description: string;
        }>;
    }>;
    checkConnectionStatus(account: PopulatedAccount): Promise<boolean>;
    selectBoard(account: PopulatedAccount, boardId: string): Promise<{
        message: string;
        provider: string;
    }>;
    getSelectedBoard(account: PopulatedAccount): Promise<{
        id: string;
        name: string;
        profileImage: string;
    } | null>;
    logout(account: PopulatedAccount): Promise<boolean>;
    publish(account: PopulatedAccount, postId: string): Promise<boolean>;
}
