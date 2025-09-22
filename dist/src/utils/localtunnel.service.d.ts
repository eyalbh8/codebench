import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { AppLogger } from '@/utils/app-logger.service';
export declare class LocalTunnelService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private tunnel;
    constructor(configService: ConfigService, logger: AppLogger);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    private startLocalTunnel;
    private closeLocalTunnel;
}
