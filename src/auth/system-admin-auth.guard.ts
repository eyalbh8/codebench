import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { AuthRequest } from '../types/api';
import { AppLogger } from '@/utils/app-logger.service';

@Injectable()
export class SystemAdminAuthGuard implements CanActivate {
  constructor(private readonly logger: AppLogger) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return this.validateRequest(request);
  }

  validateRequest(request: AuthRequest) {
    const user = request.user;
    if (!user) {
      throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }
    if (user.isSystemAdmin) {
      return true;
    }
    throw new ApplicationErrorException(
      ERROR_CODES.SYSTEM_ASMIN_INSUFFICIENT_PERMISSIONS,
    );
  }
}
