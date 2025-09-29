import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { PrismaService } from '@/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { AppLogger } from '@/utils/app-logger.service';
export declare class AccountGuard implements CanActivate {
    private readonly prismaService;
    private readonly cls;
    private readonly logger;
    constructor(prismaService: PrismaService, cls: ClsService, logger: AppLogger);
    canActivate(context: ExecutionContext): Promise<boolean>;
    validateRequest(request: AuthRequest): Promise<boolean>;
}
