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
exports.TrackedRecommendationsController = void 0;
const tracked_recommendations_dto_1 = require("../../dtos-schemes/tracked-recommendations.dto");
const tracked_insights_1 = require("../../operations/tracked-insights");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const descope_auth_guard_1 = require("../../../auth/descope.auth.guard");
const db_user_auth_guard_1 = require("../../../auth/db.user.auth.guard");
const account_member_guard_1 = require("../../../auth/account.member.guard");
const account_decorator_1 = require("../../../auth/account.decorator");
const account_admin_guard_1 = require("../../../auth/account.admin.guard");
const account_active_guard_1 = require("../../../auth/account.active.guard");
const account_guard_1 = require("../../../auth/account.guard");
let TrackedRecommendationsController = class TrackedRecommendationsController {
    constructor(trackedRecommendationsService) {
        this.trackedRecommendationsService = trackedRecommendationsService;
    }
    async getAllTrackedRecommendations(account) {
        return await this.trackedRecommendationsService.get(account.id);
    }
    async getTrackedRecommendationsAnalytics(account) {
        return await this.trackedRecommendationsService.getTrackedTrends(account);
    }
    async createTrackedRecommendation(account, data) {
        const createData = {
            id: '',
            urls: data.urls,
            accountId: account.id,
            recommendationId: data.recommendationId ?? '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return await this.trackedRecommendationsService.create({
            account: {
                connect: {
                    id: account.id,
                },
            },
            recommendation: {
                connect: {
                    id: data.recommendationId ?? '',
                },
            },
            urls: data.urls,
        });
    }
    async updateTrackedRecommendationById(trackedRecommendationId, account, data) {
        return await this.trackedRecommendationsService.update(data, trackedRecommendationId);
    }
    async deleteTrackedRecommendationById(trackedRecommendationId) {
        return await this.trackedRecommendationsService.delete(trackedRecommendationId);
    }
};
exports.TrackedRecommendationsController = TrackedRecommendationsController;
__decorate([
    (0, common_1.Get)(),
    (0, nestjs_zod_1.ZodSerializerDto)(tracked_recommendations_dto_1.TrackedRecommendationEntityDto),
    (0, swagger_1.ApiOkResponse)({
        type: [tracked_recommendations_dto_1.TrackedRecommendationEntityDto],
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackedRecommendationsController.prototype, "getAllTrackedRecommendations", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, nestjs_zod_1.ZodSerializerDto)(tracked_recommendations_dto_1.RecommendationAnalyticsOverviewDto),
    (0, swagger_1.ApiOkResponse)({
        type: [tracked_recommendations_dto_1.RecommendationAnalyticsOverviewDto],
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackedRecommendationsController.prototype, "getTrackedRecommendationsAnalytics", null);
__decorate([
    (0, common_1.Post)(),
    (0, nestjs_zod_1.ZodSerializerDto)(tracked_recommendations_dto_1.TrackedRecommendationEntityDto),
    (0, swagger_1.ApiOkResponse)({
        type: tracked_recommendations_dto_1.TrackedRecommendationEntityDto,
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tracked_recommendations_dto_1.TrackedRecommendationCreationRequestDto]),
    __metadata("design:returntype", Promise)
], TrackedRecommendationsController.prototype, "createTrackedRecommendation", null);
__decorate([
    (0, common_1.Put)(':trackedRecommendationId'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, nestjs_zod_1.ZodSerializerDto)(tracked_recommendations_dto_1.TrackedRecommendationEntityDto),
    (0, swagger_1.ApiOkResponse)({
        type: tracked_recommendations_dto_1.TrackedRecommendationEntityDto,
    }),
    __param(0, (0, common_1.Param)('trackedRecommendationId')),
    __param(1, (0, account_decorator_1.AccountFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, tracked_recommendations_dto_1.TrackedRecommendationUpdateRequestDto]),
    __metadata("design:returntype", Promise)
], TrackedRecommendationsController.prototype, "updateTrackedRecommendationById", null);
__decorate([
    (0, common_1.Delete)(':trackedRecommendationId'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, swagger_1.ApiOkResponse)({
        type: tracked_recommendations_dto_1.TrackedRecommendationEntityDto,
    }),
    __param(0, (0, common_1.Param)('trackedRecommendationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackedRecommendationsController.prototype, "deleteTrackedRecommendationById", null);
exports.TrackedRecommendationsController = TrackedRecommendationsController = __decorate([
    (0, common_1.Controller)('accounts/:accountId/tracked-recommendations'),
    (0, common_1.UseGuards)(descope_auth_guard_1.DescopeAuthGuard, db_user_auth_guard_1.DBUserAuthGuard, account_guard_1.AccountGuard, account_member_guard_1.AccountMemberGuard, account_active_guard_1.AccountActiveGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [tracked_insights_1.TrackedRecommendationsService])
], TrackedRecommendationsController);
//# sourceMappingURL=tracked-recommendations.controller.js.map