"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPromptDtoToPrompt = exports.CreatePromptsByTopicRequestDto = exports.GeneratePromptSuggestionsRequestDto = exports.CreatePromptRequestDto = exports.UpdatePromptRequestDto = exports.PromptDataDto = exports.TelepromptRequestDto = exports.PromptResultsDataDto = exports.CreatePromptsByTopicRequestSchema = exports.GeneratePromptSuggestionsRequestSchema = exports.CreatePromptRequestSchema = exports.UpdatePromptRequestSchema = exports.PromptDataSchema = exports.TelepromptRequestSchema = exports.PromptResultsDataSchema = exports.GetAccountPromptResponsesQueryDto = exports.GetAccountPromptResponsesQuerySchema = void 0;
const model_enums_1 = require("../../model.enums");
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
exports.GetAccountPromptResponsesQuerySchema = zod_1.z.object({
    topicId: zod_1.z.string().optional(),
    promptId: zod_1.z.string().optional(),
    scanId: zod_1.z.string().optional(),
    isMeInResponse: zod_1.z.coerce.boolean().optional(),
    providers: zod_1.z.array(zod_1.z.string()).optional(),
    take: zod_1.z.coerce.number(),
    skip: zod_1.z.coerce.number(),
});
class GetAccountPromptResponsesQueryDto extends (0, nestjs_zod_1.createZodDto)(exports.GetAccountPromptResponsesQuerySchema) {
}
exports.GetAccountPromptResponsesQueryDto = GetAccountPromptResponsesQueryDto;
exports.PromptResultsDataSchema = zod_1.z.object({
    prompt: zod_1.z.string(),
    market_players: zod_1.z.array(zod_1.z.string()),
    urls: zod_1.z.array(zod_1.z.string()),
});
exports.TelepromptRequestSchema = zod_1.z.object({
    prompt: zod_1.z.string(),
    providers: zod_1.z.array(zod_1.z.string()),
    promptId: zod_1.z.string().optional(),
});
exports.PromptDataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    prompt: zod_1.z.string(),
    type: zod_1.z.nativeEnum(model_enums_1.PromptType),
    meInPrompt: zod_1.z.boolean(),
    topic: zod_1.z.object({
        id: zod_1.z.string().nullable(),
        name: zod_1.z.string(),
    }),
    regions: zod_1.z.array(zod_1.z.string()).optional(),
    ratingScore: zod_1.z.number().optional(),
    language: zod_1.z.string().optional().nullable(),
    generationId: zod_1.z.string().optional().nullable(),
    avgVisibility: zod_1.z.number().optional(),
    avgSentimentScore: zod_1.z.number().optional(),
    volume: zod_1.z.number().optional(),
    state: zod_1.z.nativeEnum(model_enums_1.PromptState),
    active: zod_1.z.coerce.boolean().optional(),
    createdAt: zod_1.z.coerce.date().optional(),
    updatedAt: zod_1.z.coerce.date().optional(),
    deletedAt: zod_1.z.coerce.date().nullable().optional(),
});
exports.UpdatePromptRequestSchema = zod_1.z.object({
    prompt: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    regions: zod_1.z.array(zod_1.z.string()).optional(),
    state: zod_1.z.nativeEnum(model_enums_1.PromptState).optional(),
});
exports.CreatePromptRequestSchema = zod_1.z.object({
    prompt: zod_1.z.string(),
    type: zod_1.z.nativeEnum(model_enums_1.PromptType),
    regions: zod_1.z.array(zod_1.z.string()),
    topic: zod_1.z.object({
        id: zod_1.z.string(),
    }),
});
exports.GeneratePromptSuggestionsRequestSchema = zod_1.z.object({
    topicId: zod_1.z.string(),
    numberOfPrompts: zod_1.z.number().min(1).max(50),
    intentType: zod_1.z.nativeEnum(model_enums_1.PromptIntentType),
    promptType: zod_1.z.nativeEnum(model_enums_1.PromptType),
    region: zod_1.z.string(),
    language: zod_1.z.string(),
    additionalInstructions: zod_1.z.string().optional(),
    excludeWords: zod_1.z.string().optional(),
});
exports.CreatePromptsByTopicRequestSchema = zod_1.z.object({
    topicId: zod_1.z.string(),
    region: zod_1.z.string(),
    prompts: zod_1.z.array(zod_1.z.string()).min(1),
});
class PromptResultsDataDto extends (0, nestjs_zod_1.createZodDto)(exports.PromptResultsDataSchema) {
}
exports.PromptResultsDataDto = PromptResultsDataDto;
class TelepromptRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.TelepromptRequestSchema) {
}
exports.TelepromptRequestDto = TelepromptRequestDto;
class PromptDataDto extends (0, nestjs_zod_1.createZodDto)(exports.PromptDataSchema) {
}
exports.PromptDataDto = PromptDataDto;
class UpdatePromptRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.UpdatePromptRequestSchema) {
}
exports.UpdatePromptRequestDto = UpdatePromptRequestDto;
class CreatePromptRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.CreatePromptRequestSchema) {
}
exports.CreatePromptRequestDto = CreatePromptRequestDto;
class GeneratePromptSuggestionsRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.GeneratePromptSuggestionsRequestSchema) {
}
exports.GeneratePromptSuggestionsRequestDto = GeneratePromptSuggestionsRequestDto;
class CreatePromptsByTopicRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.CreatePromptsByTopicRequestSchema) {
}
exports.CreatePromptsByTopicRequestDto = CreatePromptsByTopicRequestDto;
const mapPromptDtoToPrompt = (promptDto, accountId, topics) => {
    return {
        prompt: promptDto.prompt,
        id: promptDto.id,
        accountId: accountId,
        type: promptDto.type,
        meInPrompt: promptDto.meInPrompt,
        ratingScore: promptDto.ratingScore,
        regions: promptDto.regions,
        language: promptDto.language,
        topicId: promptDto.topic.id ??
            topics?.find((t) => t.name === promptDto.topic.name)?.id,
        isActive: promptDto.active ?? true,
    };
};
exports.mapPromptDtoToPrompt = mapPromptDtoToPrompt;
//# sourceMappingURL=prompt.dto.js.map