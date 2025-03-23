"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestedMergeEntitiesDataDto = exports.SuggestedMergeEntitiesSchema = exports.CandidateDataDto = exports.CandidateSchema = exports.CompetitorPerformanceDataDto = exports.CompetitorDataDto = exports.DeleteNomineeRequestDto = exports.NomineeDeleteSchema = exports.CompetitorPerformanceSchema = exports.CompetitorSchema = exports.MergeCandidateDataDto = exports.MergeCandidateSchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
exports.MergeCandidateSchema = zod_1.z.object({
    candidate: zod_1.z.string(),
    entityId: zod_1.z.string(),
});
class MergeCandidateDataDto extends (0, nestjs_zod_1.createZodDto)(exports.MergeCandidateSchema) {
}
exports.MergeCandidateDataDto = MergeCandidateDataDto;
exports.CompetitorSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    site: zod_1.z.string().nullish(),
    logo: zod_1.z.string().nullish(),
    advantage: zod_1.z.string().nullish(),
});
exports.CompetitorPerformanceSchema = exports.CompetitorSchema.extend({
    occurrences: zod_1.z.number().nullish(),
    occurrencesDelta: zod_1.z.number().nullish(),
    topics: zod_1.z.array(zod_1.z.string()).nullish(),
    position: zod_1.z.number().nullish(),
    sentimentScore: zod_1.z.number().nullish(),
    historicalData: zod_1.z
        .array(zod_1.z.object({
        date: zod_1.z.string(),
        value: zod_1.z.number(),
    }))
        .nullish(),
});
exports.NomineeDeleteSchema = zod_1.z.object({
    entity: zod_1.z.string(),
});
class DeleteNomineeRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.NomineeDeleteSchema) {
}
exports.DeleteNomineeRequestDto = DeleteNomineeRequestDto;
class CompetitorDataDto extends (0, nestjs_zod_1.createZodDto)(exports.CompetitorSchema) {
}
exports.CompetitorDataDto = CompetitorDataDto;
class CompetitorPerformanceDataDto extends (0, nestjs_zod_1.createZodDto)(exports.CompetitorPerformanceSchema) {
}
exports.CompetitorPerformanceDataDto = CompetitorPerformanceDataDto;
exports.CandidateSchema = zod_1.z.object({
    entity: zod_1.z.string(),
    count: zod_1.z.number(),
});
class CandidateDataDto extends (0, nestjs_zod_1.createZodDto)(exports.CandidateSchema) {
}
exports.CandidateDataDto = CandidateDataDto;
exports.SuggestedMergeEntitiesSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string()));
class SuggestedMergeEntitiesDataDto extends (0, nestjs_zod_1.createZodDto)(exports.SuggestedMergeEntitiesSchema) {
}
exports.SuggestedMergeEntitiesDataDto = SuggestedMergeEntitiesDataDto;
//# sourceMappingURL=competitor.dto.js.map