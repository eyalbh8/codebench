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
exports.CompetitorsController = void 0;
const competitors_service_1 = require("../../operations/competitors.service");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const db_user_auth_guard_1 = require("../../../auth/db.user.auth.guard");
const account_member_guard_1 = require("../../../auth/account.member.guard");
const descope_auth_guard_1 = require("../../../auth/descope.auth.guard");
const account_decorator_1 = require("../../../auth/account.decorator");
const account_active_guard_1 = require("../../../auth/account.active.guard");
const account_guard_1 = require("../../../auth/account.guard");
const account_admin_guard_1 = require("../../../auth/account.admin.guard");
let CompetitorsController = class CompetitorsController {
    constructor(competitorsService) {
        this.competitorsService = competitorsService;
    }
    async getAllCompetitors(account) {
        return await this.competitorsService.getAllActiveCompetitors(account);
    }
    async createNewCompetitor(account, competitor) {
        return await this.competitorsService.createNewCompetitor(account, competitor);
    }
    async updateCompetitorById(account, competitorId, competitor) {
        return await this.competitorsService.updateCompetitorById(account, competitorId, competitor);
    }
    async deleteCompetitorById(account, competitorId) {
        return await this.competitorsService.deleteCompetitorById(account, competitorId);
    }
    async deleteNomineeById(account, nominee) {
        return await this.competitorsService.deleteNomineeByName(account, nominee);
    }
};
exports.CompetitorsController = CompetitorsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompetitorsController.prototype, "getAllCompetitors", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CompetitorsController.prototype, "createNewCompetitor", null);
__decorate([
    (0, common_1.Put)(':competitorId'),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('competitorId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CompetitorsController.prototype, "updateCompetitorById", null);
__decorate([
    (0, common_1.Delete)(':competitorId'),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('competitorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorsController.prototype, "deleteCompetitorById", null);
__decorate([
    (0, common_1.Post)('nominees/delete'),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorsController.prototype, "deleteNomineeById", null);
exports.CompetitorsController = CompetitorsController = __decorate([
    (0, common_1.Controller)('accounts/:accountId/competitors'),
    (0, common_1.UseGuards)(descope_auth_guard_1.DescopeAuthGuard, db_user_auth_guard_1.DBUserAuthGuard, account_guard_1.AccountGuard, account_member_guard_1.AccountMemberGuard, account_active_guard_1.AccountActiveGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [competitors_service_1.CompetitorsOperations])
], CompetitorsController);
//# sourceMappingURL=competitor.js.map