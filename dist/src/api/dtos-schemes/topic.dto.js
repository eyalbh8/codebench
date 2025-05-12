"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTopicsBatchRequestDto = exports.CreateTopicRequestDto = exports.TopicDataDto = exports.TopicPromptDataDto = exports.TopicVisibilityDataDto = exports.TopicAnalysisDataDto = exports.CreateTopicsBatchRequestSchema = exports.CreateTopicRequestSchema = exports.TopicDataSchema = exports.TopicPromptDataSchema = exports.TopicVisibilityDataSchema = exports.TopicAnalysisDataSchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const prompt_dto_1 = require("./prompt.dto");
const model_enums_1 = require("../../model.enums");
exports.TopicAnalysisDataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    priority: zod_1.z.number().gte(0),
    occurrences: zod_1.z.number().nullish(),
    occurrencesDelta: zod_1.z.number().nullish(),
});
exports.TopicVisibilityDataSchema = zod_1.z.object({
    topic: zod_1.z.string(),
    runs: zod_1.z.array(zod_1.z.object({
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date(),
        rank: zod_1.z.number().nullish(),
        visibilityScore: zod_1.z.number().gte(0),
    })),
});
exports.TopicPromptDataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    prompts: zod_1.z.array(prompt_dto_1.PromptResultsDataSchema),
    totalCount: zod_1.z.number(),
});
exports.TopicDataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    priority: zod_1.z.number(),
    volume: zod_1.z.number().optional(),
    promptsCount: zod_1.z.number().optional(),
    state: zod_1.z.nativeEnum(model_enums_1.TopicState),
});
exports.CreateTopicRequestSchema = zod_1.z.object({
    name: zod_1.z.string(),
    priority: zod_1.z.number(),
});
exports.CreateTopicsBatchRequestSchema = zod_1.z.object({
    names: zod_1.z.array(zod_1.z.string().min(1).trim()).min(1),
});
class TopicAnalysisDataDto extends (0, nestjs_zod_1.createZodDto)(exports.TopicAnalysisDataSchema) {
}
exports.TopicAnalysisDataDto = TopicAnalysisDataDto;
class TopicVisibilityDataDto extends (0, nestjs_zod_1.createZodDto)(exports.TopicVisibilityDataSchema) {
}
exports.TopicVisibilityDataDto = TopicVisibilityDataDto;
class TopicPromptDataDto extends (0, nestjs_zod_1.createZodDto)(exports.TopicPromptDataSchema) {
}
exports.TopicPromptDataDto = TopicPromptDataDto;
class TopicDataDto extends (0, nestjs_zod_1.createZodDto)(exports.TopicDataSchema) {
}
exports.TopicDataDto = TopicDataDto;
class CreateTopicRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.CreateTopicRequestSchema) {
}
exports.CreateTopicRequestDto = CreateTopicRequestDto;
class CreateTopicsBatchRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.CreateTopicsBatchRequestSchema) {
}
exports.CreateTopicsBatchRequestDto = CreateTopicsBatchRequestDto;
//# sourceMappingURL=topic.dto.js.map