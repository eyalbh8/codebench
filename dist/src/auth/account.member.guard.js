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
exports.AccountMemberGuard = void 0;
const common_1 = require("@nestjs/common");
const app_logger_service_1 = require("../utils/app-logger.service");
let AccountMemberGuard = class AccountMemberGuard {
    constructor(logger) {
        this.logger = logger;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }
    validateRequest(request) {
        const account = request.account;
        if (!account) {
            this.logger.error(`AccountMemberGuard - Account not found in request`);
            return false;
        }
        if (!request.user) {
            this.logger.error(`AccountMemberGuard - User not found in request`);
            return false;
        }
        if (request.user.isSystemAdmin) {
            return true;
        }
        if (!request.user.userAccounts) {
            this.logger.error(`AccountMemberGuard - User has no accounts`);
            return false;
        }
        if (!request.user.userAccounts.some((ua) => ua.accountId === account.id)) {
            this.logger.error(`AccountMemberGuard - User does not have access to account`);
            return false;
        }
        return true;
    }
};
exports.AccountMemberGuard = AccountMemberGuard;
exports.AccountMemberGuard = AccountMemberGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_logger_service_1.AppLogger])
], AccountMemberGuard);
//# sourceMappingURL=account.member.guard.js.map