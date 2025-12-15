import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRequest, PopulatedAccount } from '../types/api';
import { PrismaService } from '@/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { AppLogger } from '@/utils/app-logger.service';

@Injectable()
export class AccountGuard implements CanActivate {
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
    const accountId = request.params.accountId;
    if (!accountId) {
      this.logger.warn('AccountGuard - Account ID not found');
      return false;
    }
    const account = await this.prismaService.account.findUnique({
      where: { id: accountId },
      include: { accountSettings: true },
    });

    if (!account) {
      this.logger.warn(`AccountGuard - Account with ID ${accountId} not found`);
      return false;
    }

    // Set account in request
    request.account = account as PopulatedAccount;
    this.cls.set('accountId', accountId);
    this.cls.set('accountName', account.title);
    return true;
  }
}
