import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Schema for async job status response containing job information and status
 */
export const AsyncJobStatusResponseSchema = z.object({
  message: z.string().describe('Status message'),
  jobId: z.string().optional().describe('The ID of the async job'),
  id: z
    .string()
    .optional()
    .describe('The ID of the async job (alias for jobId)'),
  type: z.string().optional().describe('The type of the async job'),
  status: z.string().optional().describe('The status of the async job'),
  createdAt: z.date().optional().describe('When the job was created'),
});

export type AsyncJobStatusResponse = z.infer<
  typeof AsyncJobStatusResponseSchema
>;

/**
 * Data Transfer Object for async job status response containing job information and status
 */
export class AsyncJobStatusResponseDataDto extends createZodDto(
  AsyncJobStatusResponseSchema,
) {}
