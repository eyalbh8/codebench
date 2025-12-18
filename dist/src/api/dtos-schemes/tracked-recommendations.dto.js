"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationAnalyticsOverviewDto = exports.RecommendationAnalyticsOverviewSchema = exports.RecommendationImplementationAnalyticsSchema = exports.TrackedRecommendationWithFullRecommendationDto = exports.TrackedRecommendationWithFullRecommendationSchema = exports.TrackedRecommendationUpdateRequestDto = exports.TrackedRecommendationUpdateRequestSchema = exports.TrackedRecommendationCreationRequestDto = exports.TrackedRecommendationCreationRequestSchema = exports.TrackedRecommendationEntityDto = exports.TrackedRecommendationEntitySchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const recommendations_dto_1 = require("./recommendations.dto");
exports.TrackedRecommendationEntitySchema = zod_1.z.object({
    id: zod_1.z.string(),
    recommendationId: zod_1.z.string().nullable(),
    accountId: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    urls: zod_1.z.array(zod_1.z.string()).describe('URLs of the changes'),
});
class TrackedRecommendationEntityDto extends (0, nestjs_zod_1.createZodDto)(exports.TrackedRecommendationEntitySchema) {
}
exports.TrackedRecommendationEntityDto = TrackedRecommendationEntityDto;
exports.TrackedRecommendationCreationRequestSchema = zod_1.z.object({
    recommendationId: zod_1.z.string().optional(),
    urls: zod_1.z.array(zod_1.z.string()),
});
class TrackedRecommendationCreationRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.TrackedRecommendationCreationRequestSchema) {
}
exports.TrackedRecommendationCreationRequestDto = TrackedRecommendationCreationRequestDto;
exports.TrackedRecommendationUpdateRequestSchema = zod_1.z.object({
    urls: zod_1.z.array(zod_1.z.string()),
});
class TrackedRecommendationUpdateRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.TrackedRecommendationUpdateRequestSchema) {
}
exports.TrackedRecommendationUpdateRequestDto = TrackedRecommendationUpdateRequestDto;
exports.TrackedRecommendationWithFullRecommendationSchema = exports.TrackedRecommendationEntitySchema.extend({
    recommendation: recommendations_dto_1.RecommendationDataSchema.nullable(),
});
class TrackedRecommendationWithFullRecommendationDto extends (0, nestjs_zod_1.createZodDto)(exports.TrackedRecommendationWithFullRecommendationSchema) {
}
exports.TrackedRecommendationWithFullRecommendationDto = TrackedRecommendationWithFullRecommendationDto;
exports.RecommendationImplementationAnalyticsSchema = zod_1.z.object({
    tracked_recommendation_id: zod_1.z.string(),
    last_average: zod_1.z.union([zod_1.z.number(), zod_1.z.bigint(), zod_1.z.null()]),
    new_average: zod_1.z.number().nullable(),
    trend_percentage: zod_1.z.number().nullable(),
    total_appearances_after_implementation: zod_1.z.number().nonnegative(),
});
exports.RecommendationAnalyticsOverviewSchema = zod_1.z.object({
    tracked: exports.TrackedRecommendationEntitySchema,
    recommendation: recommendations_dto_1.RecommendationDataSchema.nullable(),
    analytics: exports.RecommendationImplementationAnalyticsSchema,
});
class RecommendationAnalyticsOverviewDto extends (0, nestjs_zod_1.createZodDto)(exports.RecommendationAnalyticsOverviewSchema) {
}
exports.RecommendationAnalyticsOverviewDto = RecommendationAnalyticsOverviewDto;
//# sourceMappingURL=tracked-recommendations.dto.js.map