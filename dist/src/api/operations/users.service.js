"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../constants/errors");
const descope_service_1 = require("../../auth/descope.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const model_enums_1 = require("../../model.enums");
const app_logger_service_1 = require("../../utils/app-logger.service");
const app_error_exception_1 = require("../../exceptions/app-error.exception");
let UsersService = class UsersService {
    constructor(prisma, descopeService, logger) {
        this.prisma = prisma;
        this.descopeService = descopeService;
        this.logger = logger;
    }
    async onboardUser(user) {
        if (!user) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.AUTH_USER_NOT_FOUND);
        }
        if (!user.email) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.AUTH_USER_EMAIL_NOT_FOUND);
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
    async createUser(user) {
        if (!user) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.AUTH_USER_NOT_FOUND);
        }
        const userData = user;
        const email = userData.email ||
            userData.loginIds?.[0] ||
            (Array.isArray(userData.loginIds) && userData.loginIds[0]) ||
            '';
        if (!email) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.AUTH_USER_EMAIL_NOT_FOUND);
        }
        const name = userData.name || '';
        const familyName = userData.familyName || userData.lastName || '';
        const accounts = userData.accounts || userData.userAccounts || userData.userTenants || [];
        const newUser = await this.prisma.user.create({
            data: {
                name: name ?? '',
                lastName: familyName ?? '',
                email: email.toLowerCase(),
                isSystemAdmin: false,
                userAccounts: {
                    create: accounts.map((account) => ({
                        accountId: account.accountId || account.id,
                        roles: (account.role || account.roles || []),
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
    async removeUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.USER_NOT_FOUND);
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
    async addTeamMemberToAccount({ email, firstName, lastName, account, roles = [model_enums_1.UserRole.ADMIN], }) {
        try {
            if (account.status !== model_enums_1.AccountStatus.ACTIVE.toString()) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_INACTIVE);
            }
            const userAccounts = await this.prisma.userAccount.findMany({
                where: { accountId: account.id },
                include: {
                    user: true,
                },
            });
            const filteredUserAccounts = userAccounts.filter((userAccount) => !userAccount.user.email.includes('@igeo.ai'));
            const membersLimit = account.accountSettings?.membersLimit;
            if (!membersLimit) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_MEMBERS_LIMIT_NOT_SET);
            }
            if (membersLimit && membersLimit <= filteredUserAccounts.length) {
                this.logger.error(`Account members limit exceeded ${membersLimit} <= ${filteredUserAccounts.length}`);
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_MEMBERS_LIMIT_EXCEEDED);
            }
            let user = await this.getUserOrNull(email);
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
        }
        catch (error) {
            this.logger.error(`Error attaching user to account ${error.message}`);
            throw error;
        }
    }
    async getTeamMembers(accountId) {
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
        const filteredTeamMembers = teamMembers.filter((teamMember) => !teamMember.user.email.includes('@igeo.ai'));
        return filteredTeamMembers.map((teamMember) => ({
            ...teamMember.user,
            roles: teamMember.roles,
        }));
    }
    async attachUserToAccountInDB({ userId, accountId, roles, }) {
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
    async addDbUser(email, firstName, lastName) {
        return await this.prisma.user.create({
            data: {
                email,
                name: firstName ?? '',
                lastName: lastName ?? '',
            },
        });
    }
    async getUserOrNull(email) {
        let user = null;
        try {
            user = await this.prisma.user.findUnique({
                where: { email },
            });
        }
        catch (error) {
            this.logger.error(`User not found, sending invite ${error.message}`);
        }
        return user;
    }
    async detachUserFromAccount({ userId, accountId, }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.USER_NOT_FOUND);
        await this.prisma.userAccount.delete({
            where: { userId_accountId: { userId, accountId } },
        });
    }
    async updateUserRoles({ userId, accountId, roles, }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.USER_NOT_FOUND);
        await this.prisma.userAccount.update({
            where: { userId_accountId: { userId, accountId } },
            data: { roles },
        });
    }
    async markInsightsAsSeen(userId, accountId) {
        await this.prisma.userAccount.update({
            where: { userId_accountId: { userId, accountId } },
            data: { lastInsightsVisit: new Date() },
        });
    }
    async fetchCurrentUser(user) {
        if (!user) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.AUTH_USER_NOT_FOUND);
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
        const isOnboarded = userAccounts.some((userAccount) => userAccount.account.status === model_enums_1.AccountStatus.ACTIVE.toString()) || dbUser.isSystemAdmin;
        const onboardingAccountId = userAccounts.find((userAccount) => userAccount.account.status === model_enums_1.AccountStatus.INITIAL.toString())?.accountId ?? null;
        const userAccountsRolesAndAccountIds = userAccounts.map((userAccount) => ({
            accountId: userAccount.accountId,
            roles: userAccount.roles,
            lastInsightsVisit: userAccount.lastInsightsVisit,
        }));
        return {
            ...dbUser,
            isOnboarded,
            onboardingAccountId: onboardingAccountId,
            userAccounts: userAccountsRolesAndAccountIds,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        descope_service_1.DescopeService,
        app_logger_service_1.AppLogger])
], UsersService);
//# sourceMappingURL=users.service.js.map