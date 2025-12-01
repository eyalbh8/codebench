import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { AuthRequest } from '../types/api';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@/config/config.service';
import { AppLogger } from '@/utils/app-logger.service';
import { PostState, SocialMediaProvider } from '@/model.enums';
import { PostContentGenerationData } from '@/api/dtos-schemes/agent.scheme';
import { AgentService } from '@/api/operations/agent.service';

@Injectable()
export class SocialMediaPostsLimitGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly agentService: AgentService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    if (!request.body || Object.keys(request.body).length === 0) {
      this.logger.error('Request body is required', {
        body: request.body,
        method: request.method,
        url: request.url,
      });
      throw new ApplicationErrorException(ERROR_CODES.REQUEST_BODY_REQUIRED);
    }

    const generationData = request.body as PostContentGenerationData;
    const provider = generationData.socialMediaProvider;
    if (!provider) {
      throw new ApplicationErrorException(ERROR_CODES.MISSING_REQUIRED_FIELD);
    }
    const account = request.account;
    if (!account) {
      throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }
    const accountSettings = account.accountSettings;
    if (!accountSettings) {
      throw new ApplicationErrorException(
        ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND,
      );
    }

    const configKey = `${provider.toUpperCase()}_POSTS_LIMIT`;
    let postsLimit = accountSettings.postCreationLimit;
    if (postsLimit === null) {
      throw new ApplicationErrorException(
        ERROR_CODES.POST_CREATION_LIMIT_NOT_SET,
      );
    }

    if (!postsLimit) {
      const configPostsLimit = this.configService.get<number>(configKey);
      postsLimit = configPostsLimit;
    }

    const result = await this.agentService.getPosts({
      account,
      state: PostState.IN_PROGRESS as PostState,
      take: 1,
      skip: 0,
    });
    if (result.posts.length > 0) {
      throw new ApplicationErrorException(
        ERROR_CODES.POSTS_ALREADY_IN_PROGRESS,
      );
    }

    const lastWeekPosts = await this.prismaService.post.count({
      where: {
        accountId: account.id,
        socialMediaProvider: provider,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    if (lastWeekPosts >= postsLimit) {
      this.logger.warn(
        `${provider} posts limit reached for account ${account.id}`,
        {
          lastWeekPosts,
          postsLimit,
          provider: provider,
        },
      );
      throw new ApplicationErrorException(ERROR_CODES.POSTS_LIMIT_EXCEEDED);
    }
    return true;
  }
}
