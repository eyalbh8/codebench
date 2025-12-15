// limit.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
import { LIMIT_CHECK_KEY, LimitOptions } from './limit-check.decorator';
import { PromptState } from '@/model.enums';

@Injectable()
export class LimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitOptions = this.reflector.get<LimitOptions>(
      LIMIT_CHECK_KEY,
      context.getHandler(),
    );

    // If no limit check needed for this route, allow it
    if (!limitOptions) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.descopeUser;
    const accountId = user?.accountId;

    if (!accountId) {
      throw new ForbiddenException('Missing account ID');
    }

    const accountSettings = await this.prisma.accountSettings.findUnique({
      where: { accountId },
    });

    const prompts = await this.prisma.prompt.count({
      where: {
        accountId,
        state: PromptState.ACTIVE,
      },
    });

    if (!accountSettings || !prompts) {
      throw new ForbiddenException('Missing usage or settings');
    }

    if (accountSettings.promptLimit == null) {
      throw new ForbiddenException('Prompt limit not set');
    }

    if (limitOptions.promptsLimit && prompts >= accountSettings.promptLimit) {
      throw new ForbiddenException('Prompt limit exceeded');
    }

    if (accountSettings.regionLimit == null) {
      throw new ForbiddenException('Region limit not set');
    }
    if (
      limitOptions.regionsLimit &&
      accountSettings.regions.length >= accountSettings.regionLimit
    ) {
      throw new ForbiddenException('Region limit exceeded');
    }

    return true;
  }
}
