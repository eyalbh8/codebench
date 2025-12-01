import { SetMetadata } from '@nestjs/common';

export enum Role {
  OWNER = 'owner',
  USER = 'user',
  ACCOUNT_ADMIN = 'account_admin',
  SYSTEM_ADMIN = 'system_admin',
  MACHINE = 'machine',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Role hierarchy - higher roles include permissions of lower roles
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.MACHINE]: [Role.MACHINE],
  [Role.OWNER]: [Role.OWNER],
  [Role.USER]: [Role.USER],
  [Role.ACCOUNT_ADMIN]: [Role.USER, Role.ACCOUNT_ADMIN],
  [Role.SYSTEM_ADMIN]: [Role.USER, Role.ACCOUNT_ADMIN, Role.SYSTEM_ADMIN],
};
