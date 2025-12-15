// decorators/account.decorator.ts
import { AuthRequest, PopulatedAccount } from '@/types/api';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const AccountFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PopulatedAccount => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    if (!request.account) {
      throw new UnauthorizedException(
        'AccountFromRequest -Account not found in request',
      );
    }
    return request.account;
  },
);
