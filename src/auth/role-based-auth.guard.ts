import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthRequest, UserWithAccounts } from '../types/api';
import { DescopeService } from './descope.service';
import { Role, ROLE_HIERARCHY, ROLES_KEY } from './roles.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { UserRole } from '@/model.enums';
import { AppLogger } from '@/utils/app-logger.service';

@Injectable()
export class RoleBasedAuthGuard implements CanActivate {
  constructor(
    private readonly descopeService: DescopeService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly logger: AppLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    request.user = await this.authenticateUser(request);

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, just authentication is enough
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return this.authorizeUser(request, requiredRoles);
  }

  private async authenticateUser(request: Request): Promise<UserWithAccounts> {
    // Get the session token from the bearer token
    const sessionToken = request.headers['authorization']?.split(' ')?.[1];
    if (!sessionToken) {
      throw new ApplicationErrorException(ERROR_CODES.NO_SESSION_TOKEN);
    }
    try {
      const session = await this.descopeService.validateSession(sessionToken);
      if (!session) {
        throw new ApplicationErrorException(ERROR_CODES.INVALID_SESSION_TOKEN);
      }
      if (!session.token.sub) {
        throw new ApplicationErrorException(ERROR_CODES.MISSING_USER_ID);
      }
      const user = await this.descopeService.getUser(session);
      if (!user) {
        throw new ApplicationErrorException(ERROR_CODES.USER_NOT_FOUND);
      }
      const dbUser = await this.prismaService.user.findUnique({
        where: {
          email: user.email,
        },
        include: {
          userAccounts: true,
        },
      });
      if (!dbUser) {
        throw new ApplicationErrorException(ERROR_CODES.DB_USER_NOT_FOUND);
      }
      return dbUser;
    } catch (error) {
      this.logger.error('Error validating session', { error });
      throw new ApplicationErrorException(ERROR_CODES.INVALID_SESSION_TOKEN);
    }
  }

  private authorizeUser(request: AuthRequest, requiredRoles: Role[]): boolean {
    try {
      const user = request.user;
      // * NOTE: If the accountId is provided in different places, the authorization will be missed
      const accountId = request.params.id ?? request.params.accountId;

      const userRole = this.getUserHighestRole(user, accountId);
      if (!userRole) {
        throw new ApplicationErrorException(
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        );
      }
      const userPermissions = ROLE_HIERARCHY[userRole];

      if (userPermissions.some((role) => requiredRoles.includes(role))) {
        return true;
      }

      throw new ApplicationErrorException(ERROR_CODES.INSUFFICIENT_PERMISSIONS);
    } catch (error) {
      this.logger.error('Error validating authorization', { error });
      throw new ApplicationErrorException(ERROR_CODES.INSUFFICIENT_PERMISSIONS);
    }
  }

  private getUserHighestRole(
    user: UserWithAccounts,
    accountId?: string,
  ): Role | undefined {
    const systemAdminRoleName = this.configService.get<string>(
      'SYSTEM_ADMIN_ROLE_NAME',
    );
    const accountAdminRoleName =
      this.configService.get<string>('TENANT_ADMIN_ROLE');

    const machineRoleName = this.configService.get<string>('MACHINE_ROLE_NAME');
    if (
      systemAdminRoleName &&
      user?.userAccounts?.some((ua) => ua.roles?.includes(UserRole.OWNER))
    ) {
      return Role.OWNER;
    }

    if (
      accountId &&
      accountAdminRoleName &&
      user?.userAccounts?.some(
        (ua) =>
          ua.accountId === accountId &&
          ua.roles?.includes(accountAdminRoleName as UserRole),
      )
    ) {
      return Role.ACCOUNT_ADMIN;
    }
    if (
      machineRoleName &&
      user?.userAccounts?.some((ua) =>
        ua.roles?.includes(machineRoleName as UserRole),
      )
    ) {
      return Role.MACHINE;
    }

    if (accountId) {
      if (user?.userAccounts?.some((ua) => ua.accountId === accountId)) {
        return Role.USER;
      }
      throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    return undefined;
  }
}
