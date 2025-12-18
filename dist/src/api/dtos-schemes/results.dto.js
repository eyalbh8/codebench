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
exports.SearchResultsFilteringParametersDto = exports.SuggestedPromptActiveStatusToggleDto = exports.TimeRangeSpecificationDto = exports.TimeRangeSpecificationSchema = exports.SearchResultsFilteringParametersSchema = exports.SuggestedPromptActiveStatusToggleSchema = void 0;
const swagger_1 = require("@nestjs/swagger");
const model_enums_1 = require("../../model.enums");
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
exports.SuggestedPromptActiveStatusToggleSchema = zod_1.z.object({
    active: zod_1.z
        .string()
        .transform((statusValue) => statusValue === 'true' || statusValue === '1')
        .pipe(zod_1.z.boolean()),
});
exports.SearchResultsFilteringParametersSchema = zod_1.z.object({
    countries: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
    topics: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
    isCompanyInPrompt: zod_1.z
        .union([
        zod_1.z.enum(['AccountIncluded', 'AccountNotIncluded']),
        zod_1.z.array(zod_1.z.enum(['AccountIncluded', 'AccountNotIncluded'])),
    ])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
    promptTypes: zod_1.z
        .union([zod_1.z.nativeEnum(model_enums_1.PromptType), zod_1.z.array(zod_1.z.nativeEnum(model_enums_1.PromptType))])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
    aiEngines: zod_1.z
        .union([zod_1.z.nativeEnum(model_enums_1.Provider), zod_1.z.array(zod_1.z.nativeEnum(model_enums_1.Provider))])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
    promptIds: zod_1.z
        .union([zod_1.z.string().uuid(), zod_1.z.array(zod_1.z.string().uuid())])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
    tags: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .transform((val) => (Array.isArray(val) ? val : [val]))
        .optional(),
});
exports.TimeRangeSpecificationSchema = zod_1.z.object({
    range: zod_1.z.coerce
        .number()
        .optional()
        .describe('The number of days to look back'),
    startDate: zod_1.z.coerce
        .date()
        .optional()
        .describe('Custom start date for the range'),
    endDate: zod_1.z.coerce.date().optional().describe('Custom end date for the range'),
});
class TimeRangeSpecificationDto extends (0, nestjs_zod_1.createZodDto)(exports.TimeRangeSpecificationSchema) {
}
exports.TimeRangeSpecificationDto = TimeRangeSpecificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        required: false,
    }),
    __metadata("design:type", Number)
], TimeRangeSpecificationDto.prototype, "range", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
        required: false,
    }),
    __metadata("design:type", Date)
], TimeRangeSpecificationDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
        required: false,
    }),
    __metadata("design:type", Date)
], TimeRangeSpecificationDto.prototype, "endDate", void 0);
class SuggestedPromptActiveStatusToggleDto extends (0, nestjs_zod_1.createZodDto)(exports.SuggestedPromptActiveStatusToggleSchema) {
}
exports.SuggestedPromptActiveStatusToggleDto = SuggestedPromptActiveStatusToggleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: Boolean,
        required: true,
    }),
    __metadata("design:type", Boolean)
], SuggestedPromptActiveStatusToggleDto.prototype, "active", void 0);
class SearchResultsFilteringParametersDto extends (0, nestjs_zod_1.createZodDto)(exports.SearchResultsFilteringParametersSchema) {
}
exports.SearchResultsFilteringParametersDto = SearchResultsFilteringParametersDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        required: false,
    }),
    __metadata("design:type", Array)
], SearchResultsFilteringParametersDto.prototype, "countries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        required: false,
    }),
    __metadata("design:type", Array)
], SearchResultsFilteringParametersDto.prototype, "topics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        required: false,
        enum: ['AccountIncluded', 'AccountNotIncluded'],
    }),
    __metadata("design:type", Array)
], SearchResultsFilteringParametersDto.prototype, "isCompanyInPrompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        required: false,
        enum: model_enums_1.PromptType,
    }),
    __metadata("design:type", Array)
], SearchResultsFilteringParametersDto.prototype, "promptTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        required: false,
        enum: model_enums_1.Provider,
    }),
    __metadata("design:type", Array)
], SearchResultsFilteringParametersDto.prototype, "aiEngines", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        required: false,
    }),
    __metadata("design:type", Array)
], SearchResultsFilteringParametersDto.prototype, "promptIds", void 0);
//# sourceMappingURL=results.dto.js.map