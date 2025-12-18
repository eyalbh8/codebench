import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { AuthRequest, UserWithAccounts } from '../types/api';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class DBUserAuthGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService,
    private readonly logger: AppLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return await this.validateRequest(request);
  }

  async validateRequest(request: AuthRequest): Promise<boolean> {
    if (!request.descopeUser) {
      this.logger.error(`DBUserAuthGuard - Descope user not found in request`);
      throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }
    if (!request.descopeUser.email) {
      this.logger.error(
        `DBUserAuthGuard - Descope user email not found in request`,
      );
      throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }

    let dbUser: UserWithAccounts | null = null;
    try {
      dbUser = await this.prismaService.user.findUnique({
        where: {
          email: request.descopeUser.email.toLowerCase(),
        },
        include: {
          userAccounts: true,
        },
      });
      if (!dbUser) {
        this.logger.error(`DBUserAuthGuard - User not found in database`);
        throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
      }
      this.cls.set('userId', dbUser.id);
    } catch (error) {
      this.logger.error(`Error finding user in database ${error.message}`);
      return false;
    }
    request.user = dbUser;
    return true;
  }
}
