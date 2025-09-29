"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationStatusUpdateRequestDto = exports.RecommendationStatusUpdateRequestSchema = exports.RecommendationsGenerationRequestDto = exports.RecommendationsGenerationRequestSchema = exports.RecommendationCreationRequestDto = exports.RecommendationDataDto = exports.RecommendationDataSchema = exports.RecommendationBasePropertiesSchema = void 0;
const model_enums_1 = require("../../model.enums");
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
exports.RecommendationBasePropertiesSchema = zod_1.z.object({
    title: zod_1.z.string(),
    type: zod_1.z.nativeEnum(model_enums_1.RecommendationType),
    effectiveness: zod_1.z.nativeEnum(model_enums_1.ImpactLevels),
    description: zod_1.z.string(),
    publishedAt: zod_1.z.coerce.date().nullable().optional(),
    topic: zod_1.z.string().nullable().optional(),
    easyToDo: zod_1.z.boolean().default(false),
    insight: zod_1.z.string(),
    trackable: zod_1.z.boolean().default(true),
    status: zod_1.z
        .nativeEnum(model_enums_1.RecommendationStatus)
        .default(model_enums_1.RecommendationStatus.TO_DO),
});
exports.RecommendationDataSchema = exports.RecommendationBasePropertiesSchema.extend({
    id: zod_1.z.string(),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    deletedAt: zod_1.z.coerce.date().nullable(),
    promptId: zod_1.z.string().nullable().optional(),
    prompt: zod_1.z
        .object({
        id: zod_1.z.string(),
        accountId: zod_1.z.string(),
        prompt: zod_1.z.string(),
        type: zod_1.z.string(),
        ratingScore: zod_1.z.number(),
        meInPrompt: zod_1.z.boolean(),
        topicId: zod_1.z.string(),
        regions: zod_1.z.array(zod_1.z.string()),
        language: zod_1.z.string().nullable(),
        isActive: zod_1.z.boolean(),
        createdAt: zod_1.z.coerce.date(),
        updatedAt: zod_1.z.coerce.date(),
        deletedAt: zod_1.z.coerce.date().nullable(),
        state: zod_1.z.string(),
        topic: zod_1.z.object({
            id: zod_1.z.string(),
            accountId: zod_1.z.string().optional(),
            name: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional(),
            createdAt: zod_1.z.coerce.date().optional(),
            updatedAt: zod_1.z.coerce.date().optional(),
            deletedAt: zod_1.z.coerce.date().nullable().optional(),
            state: zod_1.z.string().optional(),
        }),
    })
        .nullable()
        .optional(),
});
class RecommendationDataDto extends (0, nestjs_zod_1.createZodDto)(exports.RecommendationDataSchema) {
}
exports.RecommendationDataDto = RecommendationDataDto;
class RecommendationCreationRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.RecommendationBasePropertiesSchema) {
}
exports.RecommendationCreationRequestDto = RecommendationCreationRequestDto;
exports.RecommendationsGenerationRequestSchema = zod_1.z.object({
    promptId: zod_1.z.string(),
});
class RecommendationsGenerationRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.RecommendationsGenerationRequestSchema) {
}
exports.RecommendationsGenerationRequestDto = RecommendationsGenerationRequestDto;
exports.RecommendationStatusUpdateRequestSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(model_enums_1.RecommendationStatus),
    urls: zod_1.z.array(zod_1.z.string()).optional(),
});
class RecommendationStatusUpdateRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.RecommendationStatusUpdateRequestSchema) {
}
exports.RecommendationStatusUpdateRequestDto = RecommendationStatusUpdateRequestDto;
//# sourceMappingURL=recommendations.dto.js.map