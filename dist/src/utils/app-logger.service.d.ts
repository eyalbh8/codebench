import { LoggerService } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
export declare class AppLogger implements LoggerService {
    private readonly cls;
    constructor(cls: ClsService);
    private log_levels;
    private readonly contextKeys;
    private getColorCode;
    private formatLog;
    log(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    debug(message: string, meta?: Record<string, any>): void;
    exception(message: string, meta?: Record<string, any>): void;
}
