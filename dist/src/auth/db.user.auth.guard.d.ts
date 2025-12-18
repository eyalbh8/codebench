import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { ClsService } from 'nestjs-cls';
export declare class DBUserAuthGuard implements CanActivate {
    private readonly prismaService;
    private readonly cls;
    private readonly logger;
    constructor(prismaService: PrismaService, cls: ClsService, logger: AppLogger);
    canActivate(context: ExecutionContext): Promise<boolean>;
    validateRequest(request: AuthRequest): Promise<boolean>;
}
