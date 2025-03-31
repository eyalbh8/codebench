import { Prisma, Scan } from '@prisma/client';
import { UserRole } from '@/model.enums';
import { Request } from 'express';
import { DescopeService } from '../auth/descope.service';

export type UserTenant = NonNullable<
  NonNullable<Awaited<ReturnType<DescopeService['getUser']>>>['userTenants']
>[number];

export type ProfileUser = Prisma.UserGetPayload<{
  include: { userAccounts: false };
}> & {
  isOnboarded: boolean;
  onboardingAccountId: string | null;
  userAccounts: {
    accountId: string;
    roles: UserRole[];
  }[];
};

export type OnboardedUser = Prisma.UserGetPayload<{
  include: { userAccounts: false };
}>;
export type UserWithAccounts = Prisma.UserGetPayload<{
  include: { userAccounts: true };
}>;

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { userAccounts: false };
}> & {
  roles: UserRole[];
};

export type UserWithAccountsAndRoles = Prisma.UserGetPayload<{
  include: { userAccounts: false };
}> & {
  accounts: {
    id: string;
    name: string;
    status: string;
    domains: string[];
  }[];
};
export type DescopeUser = Awaited<ReturnType<DescopeService['getUser']>>;

export type PopulatedAccount = Prisma.AccountGetPayload<{
  include: {
    accountSettings: true;
  };
}>;

export type OnboardedAccount = Prisma.AccountGetPayload<{
  include: {
    accountSettings: true;
    competitors: true;
    topics: true;
    prompts: true;
  };
}>;

export type AuthRequest = Request & {
  clientId: string | null;
  user: UserWithAccounts | null;
  descopeUser: DescopeUser | null;
  account: PopulatedAccount | null;
};

export type RunWithStatus = Scan & {
  status: RunStatus;
};

export type RunStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'TIMEOUT';
