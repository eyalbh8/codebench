import { Prompt, Topic } from '@prisma/client';
import { PromptIntentType, PromptState, PromptType } from '@/model.enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema for querying account prompt responses with filters
 */
export const GetAccountPromptResponsesQuerySchema = z.object({
  topicId: z.string().optional(),
  promptId: z.string().optional(),
  scanId: z.string().optional(),
  isMeInResponse: z.coerce.boolean().optional(),
  providers: z.array(z.string()).optional(),
  take: z.coerce.number(),
  skip: z.coerce.number(),
});

/**
 * Data Transfer Object for querying account prompt responses with filters
 */
export class GetAccountPromptResponsesQueryDto extends createZodDto(
  GetAccountPromptResponsesQuerySchema,
) {}

/**
 * Schema for prompt results containing prompt text, market players, and URLs
 */
export const PromptResultsDataSchema = z.object({
  prompt: z.string(),
  market_players: z.array(z.string()),
  // response: z.string(), // TODO: Add response
  urls: z.array(z.string()),
});

/**
 * Schema for teleprompt request with prompt, providers, and optional prompt ID
 */
export const TelepromptRequestSchema = z.object({
  prompt: z.string(),
  providers: z.array(z.string()),
  promptId: z.string().optional(),
});

/**
 * Schema for a prompt with full details including type, topic, regions, and state
 */
export const PromptDataSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  type: z.nativeEnum(PromptType),
  meInPrompt: z.boolean(),
  topic: z.object({
    id: z.string().nullable(),
    name: z.string(),
  }),
  regions: z.array(z.string()).optional(),
  ratingScore: z.number().optional(),
  language: z.string().optional().nullable(),
  generationId: z.string().optional().nullable(),
  avgVisibility: z.number().optional(),
  avgSentimentScore: z.number().optional(),
  volume: z.number().optional(),
  state: z.nativeEnum(PromptState),
  active: z.coerce.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().nullable().optional(),
});

/**
 * Schema for updating a prompt with optional fields
 */
export const UpdatePromptRequestSchema = z.object({
  prompt: z.string().optional(),
  type: z.string().optional(),
  regions: z.array(z.string()).optional(),
  state: z.nativeEnum(PromptState).optional(),
});

/**
 * Schema for creating a new prompt
 */
export const CreatePromptRequestSchema = z.object({
  prompt: z.string(),
  type: z.nativeEnum(PromptType),
  regions: z.array(z.string()),
  topic: z.object({
    id: z.string(),
  }),
});

/**
 * Schema for generating prompt suggestions based on topic and parameters
 */
export const GeneratePromptSuggestionsRequestSchema = z.object({
  topicId: z.string(),
  numberOfPrompts: z.number().min(1).max(50),
  intentType: z.nativeEnum(PromptIntentType),
  promptType: z.nativeEnum(PromptType),
  region: z.string(),
  language: z.string(),
  additionalInstructions: z.string().optional(),
  excludeWords: z.string().optional(),
});

/**
 * Schema for creating multiple prompts by topic
 */
export const CreatePromptsByTopicRequestSchema = z.object({
  topicId: z.string(),
  region: z.string(),
  prompts: z.array(z.string()).min(1),
});

/**
 * Data Transfer Object for prompt results containing prompt, market players, and URLs
 */
export class PromptResultsDataDto extends createZodDto(
  PromptResultsDataSchema,
) {}

/**
 * Data Transfer Object for teleprompt request with prompt, providers, and optional prompt ID
 */
export class TelepromptRequestDto extends createZodDto(
  TelepromptRequestSchema,
) {}

/**
 * Data Transfer Object for a prompt with full details including type, topic, regions, and state
 */
export class PromptDataDto extends createZodDto(PromptDataSchema) {}

/**
 * Data Transfer Object for updating a prompt with optional fields
 */
export class UpdatePromptRequestDto extends createZodDto(
  UpdatePromptRequestSchema,
) {}

/**
 * Data Transfer Object for creating a new prompt
 */
export class CreatePromptRequestDto extends createZodDto(
  CreatePromptRequestSchema,
) {}

/**
 * Data Transfer Object for generating prompt suggestions based on topic and parameters
 */
export class GeneratePromptSuggestionsRequestDto extends createZodDto(
  GeneratePromptSuggestionsRequestSchema,
) {}

/**
 * Data Transfer Object for creating multiple prompts by topic
 */
export class CreatePromptsByTopicRequestDto extends createZodDto(
  CreatePromptsByTopicRequestSchema,
) {}

export const mapPromptDtoToPrompt = (
  promptDto: PromptDataDto,
  accountId: string,
  topics?: Topic[],
): Prompt => {
  return {
    prompt: promptDto.prompt,
    id: promptDto.id,
    accountId: accountId,
    type: promptDto.type as PromptType,
    meInPrompt: promptDto.meInPrompt,
    ratingScore: promptDto.ratingScore,
    regions: promptDto.regions,
    language: promptDto.language,
    topicId:
      promptDto.topic.id ??
      topics?.find((t) => t.name === promptDto.topic.name)?.id,
    isActive: promptDto.active ?? true,
  } as Prompt;
};
