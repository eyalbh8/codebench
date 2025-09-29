import { ConfigService as NestConfigService } from '@nestjs/config';
export declare class ConfigService {
    private configService;
    constructor(configService: NestConfigService);
    get<T = string>(key: string, defaultValue?: T): T;
}
