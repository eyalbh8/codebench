import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { DescopeService } from './descope.service';
import { AppLogger } from '@/utils/app-logger.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class DescopeAuthGuard implements CanActivate {
  constructor(
    private readonly logger: AppLogger,
    private readonly cls: ClsService,
    private readonly descopeService: DescopeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    try {
      return await this.validateRequest(request);
    } catch (error) {
      this.logger.error(
        `DescopeAuthGuard - Error validating request: ${error}`,
      );
    }
    return false;
  }

  async validateRequest(request: AuthRequest): Promise<boolean> {
    // Get the session token from the bearer token
    const sessionToken = request.headers['authorization']?.split(' ')?.[1];
    if (!sessionToken) {
      this.logger.error(`DescopeAuthGuard - No session token found in request`);
      return false;
    }
    const session = await this.descopeService.validateSession(sessionToken);
    if (!session) {
      return false;
    }
    if (!session.token.sub) {
      this.logger.error(`DescopeAuthGuard - Missing sub token in session`);
      return false;
    }
    const user = await this.descopeService.getUser(session);
    if (!user) {
      this.logger.error(`DescopeAuthGuard - User not found in session`);
      return false;
    }
    request.descopeUser = user;
    this.cls.set('userEmail', user.email);
    return true;
  }
}
