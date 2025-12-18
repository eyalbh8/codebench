import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Helper function to convert string or array to array format
 */
const toArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return value;
};

/**
 * Schema for string array with preprocessing
 */
const stringArraySchema = z
  .preprocess(toArray, z.array(z.string()).min(1))
  .optional();

/**
 * Schema for UUID array with preprocessing
 */
const uuidArraySchema = z
  .preprocess(toArray, z.array(z.string().uuid()).min(1))
  .optional();

/**
 * Schema for querying LLM calls with filters for date range, provider, prompts, topics, models, and purpose
 */
export const GetLlmCallsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  provider: stringArraySchema.nullable(),
  promptId: uuidArraySchema.nullable(),
  topicId: uuidArraySchema.nullable(),
  model: stringArraySchema.nullable(),
  purpose: stringArraySchema.nullable(),
});

export type GetLlmCalls = z.infer<typeof GetLlmCallsSchema>;

/**
 * Data Transfer Object for querying LLM calls with filters for date range, provider, prompts, topics, models, and purpose
 */
export class GetLlmCallsQueryDto extends createZodDto(GetLlmCallsSchema) {}
