import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { DescopeService } from './descope.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
export declare class RoleBasedAuthGuard implements CanActivate {
    private readonly descopeService;
    private readonly prismaService;
    private readonly configService;
    private readonly reflector;
    private readonly logger;
    constructor(descopeService: DescopeService, prismaService: PrismaService, configService: ConfigService, reflector: Reflector, logger: AppLogger);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private authenticateUser;
    private authorizeUser;
    private getUserHighestRole;
}
