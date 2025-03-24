"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltersParamsDto = exports.FiltersSchema = exports.FilterValuesSchema = void 0;
const model_enums_1 = require("../../model.enums");
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const FilterValuesSchema = (type) => zod_1.z.array(type);
exports.FilterValuesSchema = FilterValuesSchema;
exports.FiltersSchema = zod_1.z.object({
    countries: (0, exports.FilterValuesSchema)(zod_1.z.string()),
    topics: (0, exports.FilterValuesSchema)(zod_1.z.string()),
    meInPrompt: (0, exports.FilterValuesSchema)(zod_1.z.enum(['AccountIncluded', 'AccountNotIncluded'])),
    promptTypes: (0, exports.FilterValuesSchema)(zod_1.z.nativeEnum(model_enums_1.PromptType)),
    aiEngines: (0, exports.FilterValuesSchema)(zod_1.z.nativeEnum(model_enums_1.Provider)),
    tags: (0, exports.FilterValuesSchema)(zod_1.z.string()),
});
class FiltersParamsDto extends (0, nestjs_zod_1.createZodDto)(exports.FiltersSchema) {
}
exports.FiltersParamsDto = FiltersParamsDto;
//# sourceMappingURL=filter.dto.js.map