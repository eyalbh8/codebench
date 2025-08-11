import { DescopeService } from '../../auth/descope.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { DescopeUser, PopulatedAccount, ProfileUser, UserWithAccounts, UserWithRoles } from '../../types/api';
import { NewUserCreationRequestDto } from '../dtos-schemes/user.dto';
import { UserRole } from '@/model.enums';
import { AppLogger } from '@/utils/app-logger.service';
export declare class UsersService {
    private prisma;
    private descopeService;
    private logger;
    constructor(prisma: PrismaService, descopeService: DescopeService, logger: AppLogger);
    onboardUser(user: DescopeUser): Promise<ProfileUser>;
    createUser(user: DescopeUser | NewUserCreationRequestDto): Promise<UserWithAccounts>;
    removeUser(userId: string): Promise<void>;
    addTeamMemberToAccount({ email, firstName, lastName, account, roles, }: {
        email: string;
        firstName?: string;
        lastName?: string;
        account: PopulatedAccount;
        roles?: UserRole[];
    }): Promise<void>;
    getTeamMembers(accountId: string): Promise<UserWithRoles[]>;
    private attachUserToAccountInDB;
    private addDbUser;
    private getUserOrNull;
    detachUserFromAccount({ userId, accountId, }: {
        userId: string;
        accountId: string;
    }): Promise<void>;
    updateUserRoles({ userId, accountId, roles, }: {
        userId: string;
        accountId: string;
        roles: UserRole[];
    }): Promise<void>;
    markInsightsAsSeen(userId: string, accountId: string): Promise<void>;
    fetchCurrentUser(user: DescopeUser): Promise<ProfileUser>;
}
