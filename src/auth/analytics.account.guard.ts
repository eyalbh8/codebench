import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AnalyticsAccountGuard implements CanActivate {
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
    const body = request.body;
    if (!body || !body.accountId) {
      this.logger.error(
        `AnalyticsAccountGuard - Missing account ID in request`,
      );
      return false;
    }
    const accountId = request.body.accountId;
    const account = await this.prismaService.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      this.logger.error(
        `AnalyticsAccountGuard - Account not found in database`,
      );
      return false;
    }
    try {
      this.cls.set('accountId', accountId);
      this.cls.set('accountName', account.title);
    } catch (error) {
      this.logger.error(
        `AnalyticsAccountGuard - Error finding user in database ${error.message}`,
      );
      return false;
    }
    return true;
  }
}
