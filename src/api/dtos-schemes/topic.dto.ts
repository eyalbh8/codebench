import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PromptResultsDataSchema } from './prompt.dto';
import { TopicState } from '@/model.enums';

/**
 * Schema for topic analysis data with occurrences and delta
 */
export const TopicAnalysisDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.number().gte(0),
  occurrences: z.number().nullish(),
  occurrencesDelta: z.number().nullish(),
});

/**
 * Schema for topic visibility data with runs and visibility scores
 */
export const TopicVisibilityDataSchema = z.object({
  topic: z.string(),
  runs: z.array(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
      rank: z.number().nullish(),
      visibilityScore: z.number().gte(0),
    }),
  ),
});

/**
 * Schema for topic with associated prompts
 */
export const TopicPromptDataSchema = z.object({
  id: z.string(),
  prompts: z.array(PromptResultsDataSchema),
  totalCount: z.number(),
});

/**
 * Schema for topic data with ID, name, priority, volume, and state
 */
export const TopicDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.number(),
  volume: z.number().optional(),
  promptsCount: z.number().optional(),
  state: z.nativeEnum(TopicState),
});

/**
 * Schema for creating a new topic
 */
export const CreateTopicRequestSchema = z.object({
  name: z.string(),
  priority: z.number(),
});

/**
 * Schema for creating multiple topics in batch
 */
export const CreateTopicsBatchRequestSchema = z.object({
  names: z.array(z.string().min(1).trim()).min(1),
});

export type TopicAnalysis = z.infer<typeof TopicAnalysisDataSchema>;

/**
 * Data Transfer Object for topic analysis data with occurrences and delta
 */
export class TopicAnalysisDataDto extends createZodDto(
  TopicAnalysisDataSchema,
) {}

export type TopicVisibility = z.infer<typeof TopicVisibilityDataSchema>;

/**
 * Data Transfer Object for topic visibility data with runs and visibility scores
 */
export class TopicVisibilityDataDto extends createZodDto(
  TopicVisibilityDataSchema,
) {}

export type TopicPrompt = z.infer<typeof TopicPromptDataSchema>;

/**
 * Data Transfer Object for topic with associated prompts
 */
export class TopicPromptDataDto extends createZodDto(TopicPromptDataSchema) {}

export type TopicType = z.infer<typeof TopicDataSchema>;

/**
 * Data Transfer Object for topic data with ID, name, priority, volume, and state
 */
export class TopicDataDto extends createZodDto(TopicDataSchema) {}

export type CreateTopic = z.infer<typeof CreateTopicRequestSchema>;

/**
 * Data Transfer Object for creating a new topic
 */
export class CreateTopicRequestDto extends createZodDto(
  CreateTopicRequestSchema,
) {}

export type CreateTopicsBatch = z.infer<typeof CreateTopicsBatchRequestSchema>;

/**
 * Data Transfer Object for creating multiple topics in batch
 */
export class CreateTopicsBatchRequestDto extends createZodDto(
  CreateTopicsBatchRequestSchema,
) {}
