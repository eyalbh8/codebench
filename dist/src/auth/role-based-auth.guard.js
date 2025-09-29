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
exports.RoleBasedAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../constants/errors");
const app_error_exception_1 = require("../exceptions/app-error.exception");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const descope_service_1 = require("./descope.service");
const roles_decorator_1 = require("./roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const model_enums_1 = require("../model.enums");
const app_logger_service_1 = require("../utils/app-logger.service");
let RoleBasedAuthGuard = class RoleBasedAuthGuard {
    constructor(descopeService, prismaService, configService, reflector, logger) {
        this.descopeService = descopeService;
        this.prismaService = prismaService;
        this.configService = configService;
        this.reflector = reflector;
        this.logger = logger;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        request.user = await this.authenticateUser(request);
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        return this.authorizeUser(request, requiredRoles);
    }
    async authenticateUser(request) {
        const sessionToken = request.headers['authorization']?.split(' ')?.[1];
        if (!sessionToken) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.NO_SESSION_TOKEN);
        }
        try {
            const session = await this.descopeService.validateSession(sessionToken);
            if (!session) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INVALID_SESSION_TOKEN);
            }
            if (!session.token.sub) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_USER_ID);
            }
            const user = await this.descopeService.getUser(session);
            if (!user) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.USER_NOT_FOUND);
            }
            const dbUser = await this.prismaService.user.findUnique({
                where: {
                    email: user.email,
                },
                include: {
                    userAccounts: true,
                },
            });
            if (!dbUser) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.DB_USER_NOT_FOUND);
            }
            return dbUser;
        }
        catch (error) {
            this.logger.error('Error validating session', { error });
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INVALID_SESSION_TOKEN);
        }
    }
    authorizeUser(request, requiredRoles) {
        try {
            const user = request.user;
            const accountId = request.params.id ?? request.params.accountId;
            const userRole = this.getUserHighestRole(user, accountId);
            if (!userRole) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INSUFFICIENT_PERMISSIONS);
            }
            const userPermissions = roles_decorator_1.ROLE_HIERARCHY[userRole];
            if (userPermissions.some((role) => requiredRoles.includes(role))) {
                return true;
            }
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INSUFFICIENT_PERMISSIONS);
        }
        catch (error) {
            this.logger.error('Error validating authorization', { error });
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INSUFFICIENT_PERMISSIONS);
        }
    }
    getUserHighestRole(user, accountId) {
        const systemAdminRoleName = this.configService.get('SYSTEM_ADMIN_ROLE_NAME');
        const accountAdminRoleName = this.configService.get('TENANT_ADMIN_ROLE');
        const machineRoleName = this.configService.get('MACHINE_ROLE_NAME');
        if (systemAdminRoleName &&
            user?.userAccounts?.some((ua) => ua.roles?.includes(model_enums_1.UserRole.OWNER))) {
            return roles_decorator_1.Role.OWNER;
        }
        if (accountId &&
            accountAdminRoleName &&
            user?.userAccounts?.some((ua) => ua.accountId === accountId &&
                ua.roles?.includes(accountAdminRoleName))) {
            return roles_decorator_1.Role.ACCOUNT_ADMIN;
        }
        if (machineRoleName &&
            user?.userAccounts?.some((ua) => ua.roles?.includes(machineRoleName))) {
            return roles_decorator_1.Role.MACHINE;
        }
        if (accountId) {
            if (user?.userAccounts?.some((ua) => ua.accountId === accountId)) {
                return roles_decorator_1.Role.USER;
            }
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_NOT_FOUND);
        }
        return undefined;
    }
};
exports.RoleBasedAuthGuard = RoleBasedAuthGuard;
exports.RoleBasedAuthGuard = RoleBasedAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [descope_service_1.DescopeService,
        prisma_service_1.PrismaService,
        config_1.ConfigService,
        core_1.Reflector,
        app_logger_service_1.AppLogger])
], RoleBasedAuthGuard);
//# sourceMappingURL=role-based-auth.guard.js.map