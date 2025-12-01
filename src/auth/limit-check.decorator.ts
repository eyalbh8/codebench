import { SetMetadata } from '@nestjs/common';

export const LIMIT_CHECK_KEY = 'limit-check';

export type LimitOptions = {
  promptsLimit?: boolean;
  regionsLimit?: boolean;
  topicsLimit?: boolean;
};

export const LimitCheck = (limits: LimitOptions) =>
  SetMetadata(LIMIT_CHECK_KEY, limits);
