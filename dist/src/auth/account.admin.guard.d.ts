import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { AppLogger } from '@/utils/app-logger.service';
export declare class AccountAdminGuard implements CanActivate {
    private readonly logger;
    constructor(logger: AppLogger);
    canActivate(context: ExecutionContext): boolean;
    validateRequest(request: AuthRequest): boolean;
}
