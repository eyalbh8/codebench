import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { AppLogger } from '@/utils/app-logger.service';
export declare class AccountMemberGuard implements CanActivate {
    private readonly logger;
    constructor(logger: AppLogger);
    canActivate(context: ExecutionContext): boolean;
    validateRequest(request: AuthRequest): boolean;
}
