import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { AppLogger } from '@/utils/app-logger.service';

@Injectable()
export class AccountMemberGuard implements CanActivate {
  constructor(private readonly logger: AppLogger) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return this.validateRequest(request);
  }

  validateRequest(request: AuthRequest): boolean {
    const account = request.account;
    if (!account) {
      this.logger.error(`AccountMemberGuard - Account not found in request`);
      return false;
    }

    if (!request.user) {
      this.logger.error(`AccountMemberGuard - User not found in request`);
      return false;
    }
    if (request.user.isSystemAdmin) {
      return true;
    }
    if (!request.user.userAccounts) {
      this.logger.error(`AccountMemberGuard - User has no accounts`);
      return false;
    }
    if (!request.user.userAccounts.some((ua) => ua.accountId === account.id)) {
      this.logger.error(
        `AccountMemberGuard - User does not have access to account`,
      );
      return false;
    }

    return true;
  }
}
