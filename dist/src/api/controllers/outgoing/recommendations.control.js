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
exports.RecommendationsController = void 0;
const recommendations_service_1 = require("../../operations/recommendations.service");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const descope_auth_guard_1 = require("../../../auth/descope.auth.guard");
const db_user_auth_guard_1 = require("../../../auth/db.user.auth.guard");
const account_member_guard_1 = require("../../../auth/account.member.guard");
const account_decorator_1 = require("../../../auth/account.decorator");
const account_active_guard_1 = require("../../../auth/account.active.guard");
const account_guard_1 = require("../../../auth/account.guard");
const recommendations_dto_1 = require("../../dtos-schemes/recommendations.dto");
let RecommendationsController = class RecommendationsController {
    constructor(recommendationsService) {
        this.recommendationsService = recommendationsService;
    }
    async getAllRecommendations(account) {
        return await this.recommendationsService.getRecommendations(account.id);
    }
    async getActiveRecommendations(account) {
        return await this.recommendationsService.getActive(account.id);
    }
    async getRemainingInsightsCount(account) {
        return await this.recommendationsService.getRemainingInsights(account.id);
    }
    async createNewRecommendation(account, recommendation) {
        return await this.recommendationsService.createRecommendation(account.id, recommendation);
    }
    async updateRecommendationById(account, recommendationId, recommendation) {
        return await this.recommendationsService.updateRecommendation(account.id, recommendationId, recommendation);
    }
    async updateRecommendationStatusById(account, recommendationId, body) {
        return await this.recommendationsService.updateRecommendationStatus(account.id, recommendationId, body.status, body.urls);
    }
    async deleteRecommendationById(accountId, recommendationId) {
        return await this.recommendationsService.deleteRecommendation(accountId, recommendationId);
    }
    async generateRecommendations(req, account, body) {
        const result = await this.recommendationsService.generateRecommendationsJob(account, body.promptId, req.user);
        return result;
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({
        type: [recommendations_dto_1.RecommendationDataDto],
        description: 'Get all recommendations for an account',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getAllRecommendations", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOkResponse)({
        type: [recommendations_dto_1.RecommendationDataDto],
        description: 'Get the active recommendations for an account',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getActiveRecommendations", null);
__decorate([
    (0, common_1.Get)('remaining'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get remaining insight generation count for this month',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getRemainingInsightsCount", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOkResponse)({
        type: recommendations_dto_1.RecommendationDataDto,
        description: 'Create a recommendation for an account',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recommendations_dto_1.RecommendationDataDto]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "createNewRecommendation", null);
__decorate([
    (0, common_1.Put)(':recommendationId'),
    (0, swagger_1.ApiOkResponse)({
        type: recommendations_dto_1.RecommendationDataDto,
        description: 'Update a recommendation for an account',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('recommendationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, recommendations_dto_1.RecommendationDataDto]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "updateRecommendationById", null);
__decorate([
    (0, common_1.Put)(':recommendationId/status'),
    (0, swagger_1.ApiOkResponse)({
        type: recommendations_dto_1.RecommendationDataDto,
        description: 'Update recommendation status',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('recommendationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, recommendations_dto_1.RecommendationStatusUpdateRequestDto]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "updateRecommendationStatusById", null);
__decorate([
    (0, common_1.Delete)(':recommendationId'),
    (0, swagger_1.ApiOkResponse)({
        type: recommendations_dto_1.RecommendationDataDto,
        description: 'Delete a recommendation for an account',
    }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Param)('recommendationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "deleteRecommendationById", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOkResponse)({
        type: [recommendations_dto_1.RecommendationDataDto],
        description: 'Generate AI-powered recommendations from prompt response',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, account_decorator_1.AccountFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, recommendations_dto_1.RecommendationsGenerationRequestDto]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "generateRecommendations", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, common_1.Controller)('accounts/:accountId/recommendations'),
    (0, common_1.UseGuards)(descope_auth_guard_1.DescopeAuthGuard, db_user_auth_guard_1.DBUserAuthGuard, account_guard_1.AccountGuard, account_member_guard_1.AccountMemberGuard, account_active_guard_1.AccountActiveGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], RecommendationsController);
//# sourceMappingURL=recommendations.control.js.map