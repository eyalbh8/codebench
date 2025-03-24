"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncJobStatusResponseDataDto = exports.AsyncJobStatusResponseSchema = void 0;
const zod_1 = require("zod");
const nestjs_zod_1 = require("nestjs-zod");
exports.AsyncJobStatusResponseSchema = zod_1.z.object({
    message: zod_1.z.string().describe('Status message'),
    jobId: zod_1.z.string().optional().describe('The ID of the async job'),
    id: zod_1.z
        .string()
        .optional()
        .describe('The ID of the async job (alias for jobId)'),
    type: zod_1.z.string().optional().describe('The type of the async job'),
    status: zod_1.z.string().optional().describe('The status of the async job'),
    createdAt: zod_1.z.date().optional().describe('When the job was created'),
});
class AsyncJobStatusResponseDataDto extends (0, nestjs_zod_1.createZodDto)(exports.AsyncJobStatusResponseSchema) {
}
exports.AsyncJobStatusResponseDataDto = AsyncJobStatusResponseDataDto;
//# sourceMappingURL=jobscheme.js.map