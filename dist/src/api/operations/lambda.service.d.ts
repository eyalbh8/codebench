import { HttpService } from '@nestjs/axios';
import { PrismaService } from '@/prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { ConfigService } from '@/config/config.service';
export declare class LambdaOperations {
    private readonly httpService;
    private readonly prisma;
    private readonly configurationService;
    private readonly logger;
    constructor(httpService: HttpService, prisma: PrismaService, configurationService: ConfigService, logger: AppLogger);
    checkScanRunStatus(accountId: string): Promise<boolean>;
}
