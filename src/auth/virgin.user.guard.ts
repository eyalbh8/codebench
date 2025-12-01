import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { AuthRequest } from '../types/api';
import { AppLogger } from '@/utils/app-logger.service';

@Injectable()
export class VirginUserGuard implements CanActivate {
  constructor(private readonly logger: AppLogger) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    if (!request.descopeUser) {
      throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }
    if (!request.user) {
      throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }
    return this.validateRequest(request);
  }

  validateRequest(request: AuthRequest): boolean {
    const userAccounts = request.user.userAccounts;
    if (userAccounts && userAccounts.length > 0) {
      throw new ApplicationErrorException(
        ERROR_CODES.USER_ALREADY_HAS_ACCOUNTS,
      );
    }

    return true;
  }
}
