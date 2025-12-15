import { Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@/constants/errors';
import { DescopeService } from '../../auth/descope.service';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  DescopeUser,
  PopulatedAccount,
  ProfileUser,
  UserWithAccounts,
  UserWithRoles,
} from '../../types/api';
import { NewUserCreationRequestDto } from '../dtos-schemes/user.dto';
import { User } from '@prisma/client';
import { AccountStatus, UserRole } from '@/model.enums';
import { AppLogger } from '@/utils/app-logger.service';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private descopeService: DescopeService,
    private logger: AppLogger,
  ) {}

  async onboardUser(user: DescopeUser): Promise<ProfileUser> {
    if (!user) {
      throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }
    if (!user.email) {
      throw new ApplicationErrorException(
        ERROR_CODES.AUTH_USER_EMAIL_NOT_FOUND,
      );
    }

    this.logger.log(`Onboarding user ${user.email}`);
    const newUser = await this.prisma.user.create({
      data: {
        name: user.name ?? '',
        lastName: user.familyName ?? '',
        email: user.email.toLowerCase(),
        isSystemAdmin: false,
      },
    });

    return {
      ...newUser,
      isOnboarded: false,
      onboardingAccountId: null,
      userAccounts: [],
    };
  }

  async createUser(
    user: DescopeUser | NewUserCreationRequestDto,
  ): Promise<UserWithAccounts> {
    if (!user) {
      throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }

    // Handle both DescopeUser and NewUserCreationRequestDto types
    const userData = user as any;
    const email =
      userData.email ||
      userData.loginIds?.[0] ||
      (Array.isArray(userData.loginIds) && userData.loginIds[0]) ||
      '';

    if (!email) {
      throw new ApplicationErrorException(
        ERROR_CODES.AUTH_USER_EMAIL_NOT_FOUND,
      );
    }

    const name = userData.name || '';
    const familyName = userData.familyName || userData.lastName || '';
    const accounts =
      userData.accounts || userData.userAccounts || userData.userTenants || [];

    const newUser = await this.prisma.user.create({
      data: {
        name: name ?? '',
        lastName: familyName ?? '',
        email: email.toLowerCase(),
        isSystemAdmin: false,
        userAccounts: {
          create: accounts.map((account: any) => ({
            accountId: account.accountId || account.id,
            roles: (account.role || account.roles || []) as UserRole[],
          })),
        },
      },
      include: {
        userAccounts: true,
      },
    });
    await this.descopeService.createUser(newUser);

    return newUser;
  }

  async removeUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApplicationErrorException(ERROR_CODES.USER_NOT_FOUND);

    await this.prisma.$transaction(async (prismaClient) => {
      await prismaClient.userAccount.deleteMany({
        where: { userId },
      });
      await prismaClient.user.delete({
        where: { id: userId },
      });
      await this.descopeService.deleteUser(user.email);
    });
  }

  async addTeamMemberToAccount({
    email,
    firstName,
    lastName,
    account,
    roles = [UserRole.ADMIN],
  }: {
    email: string;
    firstName?: string;
    lastName?: string;
    account: PopulatedAccount;
    roles?: UserRole[];
  }) {
    try {
      if (account.status !== AccountStatus.ACTIVE.toString()) {
        throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_INACTIVE);
      }
      const userAccounts = await this.prisma.userAccount.findMany({
        where: { accountId: account.id },
        include: {
          user: true,
        },
      });
      const filteredUserAccounts = userAccounts.filter(
        (userAccount) => !userAccount.user.email.includes('@igeo.ai'),
      );
      const membersLimit = account.accountSettings?.membersLimit;
      if (!membersLimit) {
        throw new ApplicationErrorException(
          ERROR_CODES.ACCOUNT_MEMBERS_LIMIT_NOT_SET,
        );
      }
      if (membersLimit && membersLimit <= filteredUserAccounts.length) {
        this.logger.error(
          `Account members limit exceeded ${membersLimit} <= ${filteredUserAccounts.length}`,
        );
        throw new ApplicationErrorException(
          ERROR_CODES.ACCOUNT_MEMBERS_LIMIT_EXCEEDED,
        );
      }
      let user: User | null = await this.getUserOrNull(email);

      if (!user) {
        user = await this.addDbUser(email, firstName, lastName);
      }

      await Promise.all([
        await this.attachUserToAccountInDB({
          userId: user.id,
          accountId: account.id,
          roles,
        }),
        this.descopeService.createUser(user),
      ]);
      await this.descopeService.sendInviteEmail(email);
    } catch (error) {
      this.logger.error(`Error attaching user to account ${error.message}`);
      throw error;
    }
  }

  async getTeamMembers(accountId: string): Promise<UserWithRoles[]> {
    const teamMembers = await this.prisma.userAccount.findMany({
      where: { accountId },
      select: {
        roles: true,
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            isSystemAdmin: true,
            isAgency: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const filteredTeamMembers = teamMembers.filter(
      (teamMember) => !teamMember.user.email.includes('@igeo.ai'),
    );
    return filteredTeamMembers.map((teamMember) => ({
      ...teamMember.user,
      roles: teamMember.roles as UserRole[],
    }));
  }
  private async attachUserToAccountInDB({
    userId,
    accountId,
    roles,
  }: {
    userId: string;
    accountId: string;
    roles: UserRole[];
  }) {
    const existing = await this.prisma.userAccount.findUnique({
      where: { userId_accountId: { userId, accountId } },
    });
    if (existing) {
      return existing;
    }

    return await this.prisma.userAccount.create({
      data: {
        userId,
        accountId,
        roles,
      },
    });
  }

  private async addDbUser(
    email: string,
    firstName: string | undefined,
    lastName: string | undefined,
  ): Promise<User> {
    return await this.prisma.user.create({
      data: {
        email,
        name: firstName ?? '',
        lastName: lastName ?? '',
      },
    });
  }

  private async getUserOrNull(email: string) {
    let user: User | null = null;
    try {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      this.logger.error(`User not found, sending invite ${error.message}`);
    }
    return user;
  }

  async detachUserFromAccount({
    userId,
    accountId,
  }: {
    userId: string;
    accountId: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApplicationErrorException(ERROR_CODES.USER_NOT_FOUND);

    await this.prisma.userAccount.delete({
      where: { userId_accountId: { userId, accountId } },
    });
  }

  async updateUserRoles({
    userId,
    accountId,
    roles,
  }: {
    userId: string;
    accountId: string;
    roles: UserRole[];
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApplicationErrorException(ERROR_CODES.USER_NOT_FOUND);

    await this.prisma.userAccount.update({
      where: { userId_accountId: { userId, accountId } },
      data: { roles },
    });
  }

  async markInsightsAsSeen(userId: string, accountId: string): Promise<void> {
    await this.prisma.userAccount.update({
      where: { userId_accountId: { userId, accountId } },
      data: { lastInsightsVisit: new Date() },
    });
  }

  async fetchCurrentUser(user: DescopeUser): Promise<ProfileUser> {
    if (!user) {
      throw new ApplicationErrorException(ERROR_CODES.AUTH_USER_NOT_FOUND);
    }
    const dbUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return await this.onboardUser(user);
    }

    const userAccounts = await this.prisma.userAccount.findMany({
      where: { userId: dbUser.id },
      include: {
        account: true,
      },
    });
    const isOnboarded =
      userAccounts.some(
        (userAccount) =>
          userAccount.account.status === AccountStatus.ACTIVE.toString(),
      ) || dbUser.isSystemAdmin;

    const onboardingAccountId =
      userAccounts.find(
        (userAccount) =>
          userAccount.account.status === AccountStatus.INITIAL.toString(),
      )?.accountId ?? null;

    const userAccountsRolesAndAccountIds = userAccounts.map((userAccount) => ({
      accountId: userAccount.accountId,
      roles: userAccount.roles as UserRole[],
      lastInsightsVisit: userAccount.lastInsightsVisit,
    }));
    return {
      ...dbUser,
      isOnboarded,
      onboardingAccountId: onboardingAccountId,
      userAccounts: userAccountsRolesAndAccountIds,
    };
  }
}
