import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '@/model.enums';
import { AuthRequest } from '../types/api';
import { AppLogger } from '@/utils/app-logger.service';

@Injectable()
export class AccountAdminGuard implements CanActivate {
  constructor(private readonly logger: AppLogger) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return this.validateRequest(request);
  }

  validateRequest(request: AuthRequest): boolean {
    // Account should already be loaded by AccountGuard
    const account = request.account;
    if (!account) {
      this.logger.error(`AccountAdminGuard - Account not found in request`);
      return false;
    }

    const user = request.user;
    if (!user) {
      this.logger.error(`AccountAdminGuard - User not found in request`);
      return false;
    }
    if (user.isSystemAdmin) {
      return true;
    }

    if (
      user.userAccounts.some(
        (ua) =>
          ua.accountId === account.id && ua.roles?.includes(UserRole.ADMIN),
      )
    ) {
      return true;
    }
    this.logger.error(
      `AccountAdminGuard - User does not have admin permissions`,
    );
    return false;
  }
}
