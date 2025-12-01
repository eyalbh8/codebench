import DescopeClient, { AuthenticationInfo } from '@descope/node-sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { User } from '@prisma/client';
import { AppLogger } from '@/utils/app-logger.service';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
@Injectable()
export class DescopeService {
  private readonly descope: ReturnType<typeof DescopeClient>;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    const projectId = this.configService
      .get<string>('DESCOPE_PROJECT_ID')
      ?.trim();
    const managementKey = this.configService.get<string>(
      'DESCOPE_MANAGEMENT_KEY',
    );
    let baseUrl: string;
    try {
      baseUrl = this.configService.get<string>('DESCOPE_BASE_URL');
    } catch {
      baseUrl = 'https://api.descope.com';
    }

    this.descope = DescopeClient({
      projectId,
      managementKey,
      baseUrl,
    });
  }

  /**
   * Validates a session token
   * @param sessionToken The session token to validate
   * @returns The validated session information
   */
  async validateSession(
    sessionToken: string,
  ): Promise<AuthenticationInfo | null> {
    try {
      const validationResponse =
        await this.descope.validateSession(sessionToken);
      return validationResponse;
    } catch (error) {
      this.logger.warn(
        `DescopeService - Error validating session: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Refreshes a session token
   * @param refreshToken The refresh token
   * @returns The refreshed session information
   */
  async refreshSession(refreshToken: string) {
    try {
      const refreshResponse = await this.descope.refresh(refreshToken);
      return refreshResponse;
    } catch (error) {
      throw new ApplicationErrorException(
        ERROR_CODES.INVALID_SESSION_REFRESH_TOKEN,
        undefined,
        error.message,
      );
    }
  }

  /**
   * Logs out a user by invalidating their session
   * @param sessionToken The session token to invalidate
   */
  async logout(sessionToken: string) {
    try {
      await this.descope.logout(sessionToken);
    } catch (error) {
      throw new ApplicationErrorException(
        ERROR_CODES.INVALID_SESSION_TOKEN,
        undefined,
        error.message,
      );
    }
  }

  /**
   * Gets a user by id
   * @param id The id of the user
   * @returns The user
   */
  async getUser(authenticationInfo: AuthenticationInfo) {
    if (!authenticationInfo.token.sub) {
      throw new ApplicationErrorException(ERROR_CODES.MISSING_SUB_TOKEN);
    }

    let user: Awaited<
      ReturnType<typeof this.descope.management.user.loadByUserId>
    >['data'];

    const isMachine = authenticationInfo.token.token_type === 'access_token';
    if (isMachine) {
      user = {
        userId: authenticationInfo.token.sub,
        loginIds: [],
        verifiedEmail: false,
        verifiedPhone: false,
        picture: '',
        roleNames: authenticationInfo.token.roles as string[],
        userTenants: [],
        createTime: Date.now(),
        TOTP: false,
        SAML: false,
        SCIM: false,
        password: false,
        status: 'active' as const,
      };
    } else {
      try {
        const response = await this.descope.management.user.loadByUserId(
          authenticationInfo.token.sub,
        );
        if (!response.ok) {
          throw new ApplicationErrorException(ERROR_CODES.AUTH_RESPONSE_NOT_OK);
        }
        user = response.data;
      } catch (error) {
        this.logger.error(`Descope Failed to load user by id ${error.message}`);
        throw new ApplicationErrorException(ERROR_CODES.AUTH_RESPONSE_NOT_OK);
      }
    }

    return user;
  }

  async sendInviteEmail(email: string) {
    const baseUrl = this.configService.get<string>('SITE_URL');
    try {
      await this.descope.magicLink.signUpOrIn.email(email, `${baseUrl}/login`);

      this.logger.log(`Invite sent to ${email}`);
    } catch (err) {
      this.logger.error('Failed to send invite:', err);
      throw new ApplicationErrorException(ERROR_CODES.AUTH_RESPONSE_NOT_OK);
    }
  }

  async createUser(user: User) {
    await this.descope.management.user.create(user.email, user.email);
  }

  async deleteUser(userEmail: string) {
    await this.descope.management.user.delete(userEmail);
  }

  async fetchUsers() {
    const users = await this.descope.management.user.searchAll();
    return users;
  }

  async exchangeAccessKey(ACCESS_KEY: any, customClaims?: Record<string, any>) {
    const result = await this.descope.exchangeAccessKey(ACCESS_KEY, {
      customClaims,
    });
    return result.jwt;
  }
}
