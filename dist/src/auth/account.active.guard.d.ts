import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
export declare class AccountActiveGuard implements CanActivate {
    private readonly prismaService;
    private readonly logger;
    constructor(prismaService: PrismaService, logger: AppLogger);
    canActivate(context: ExecutionContext): Promise<boolean>;
    validateRequest(request: AuthRequest): Promise<boolean>;
    private handleTrialSubscriptions;
}
