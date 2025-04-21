"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountResultDto = exports.PaginationParamsDto = exports.NomineeSchema = exports.CountResultSchema = exports.PaginationSchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
exports.PaginationSchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().optional(),
    offset: zod_1.z.coerce.number().optional(),
});
exports.CountResultSchema = zod_1.z.object({
    count: zod_1.z.coerce.number(),
});
exports.NomineeSchema = zod_1.z.object({
    entity: zod_1.z.string(),
    entitySiteUrl: zod_1.z.string(),
    count: zod_1.z.number(),
});
class PaginationParamsDto extends (0, nestjs_zod_1.createZodDto)(exports.PaginationSchema) {
}
exports.PaginationParamsDto = PaginationParamsDto;
class CountResultDto extends (0, nestjs_zod_1.createZodDto)(exports.CountResultSchema) {
}
exports.CountResultDto = CountResultDto;
//# sourceMappingURL=common.dto.js.map