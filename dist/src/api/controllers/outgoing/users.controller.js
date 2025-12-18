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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const user_dto_1 = require("../../dtos-schemes/user.dto");
const users_service_1 = require("../../operations/users.service");
const system_admin_auth_guard_1 = require("../../../auth/system-admin-auth.guard");
const zod_1 = require("zod");
const account_admin_guard_1 = require("../../../auth/account.admin.guard");
const descope_auth_guard_1 = require("../../../auth/descope.auth.guard");
const db_user_auth_guard_1 = require("../../../auth/db.user.auth.guard");
const account_decorator_1 = require("../../../auth/account.decorator");
const account_active_guard_1 = require("../../../auth/account.active.guard");
const account_guard_1 = require("../../../auth/account.guard");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createNewUser(req, body) {
        return await this.usersService.createUser(body);
    }
    async removeUserById(req, body) {
        return await this.usersService.removeUser(body.userId);
    }
    async addTeamMemberToAccount(account, body) {
        return await this.usersService.addTeamMemberToAccount({
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            account,
            roles: body.roles,
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(system_admin_auth_guard_1.SystemAdminAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_dto_1.NewUserCreationRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createNewUser", null);
__decorate([
    (0, common_1.UseGuards)(system_admin_auth_guard_1.SystemAdminAuthGuard),
    (0, common_1.Post)('remove'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_dto_1.UserAccountDetachmentRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeUserById", null);
__decorate([
    (0, common_1.UseGuards)(account_guard_1.AccountGuard, account_active_guard_1.AccountActiveGuard, account_admin_guard_1.AccountAdminGuard),
    (0, common_1.Post)('accounts/:accountId/members'),
    (0, nestjs_zod_1.ZodSerializerDto)((0, zod_1.boolean)()),
    (0, swagger_1.ApiOkResponse)({ type: Boolean, description: 'Attach a user to an account' }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_dto_1.UserAccountAttachmentRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addTeamMemberToAccount", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(descope_auth_guard_1.DescopeAuthGuard, db_user_auth_guard_1.DBUserAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map