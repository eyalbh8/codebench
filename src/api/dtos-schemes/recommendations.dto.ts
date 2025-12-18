import {
  ImpactLevels,
  RecommendationType,
  RecommendationStatus,
} from '@/model.enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Base validation schema for recommendation entity without persistence fields
 * Defines core recommendation properties excluding ID and timestamps
 * Used for creation requests and base type definitions
 */
export const RecommendationBasePropertiesSchema = z.object({
  title: z.string(),
  type: z.nativeEnum(RecommendationType),
  effectiveness: z.nativeEnum(ImpactLevels),
  description: z.string(),
  publishedAt: z.coerce.date().nullable().optional(),
  topic: z.string().nullable().optional(),
  easyToDo: z.boolean().default(false),
  insight: z.string(),
  trackable: z.boolean().default(true),
  status: z
    .nativeEnum(RecommendationStatus)
    .default(RecommendationStatus.TO_DO),
});

/**
 * Validation schema for complete recommendation entity with all fields
 * Extends base schema with ID, timestamps, and optional prompt relationship
 * Includes nested prompt data when populated
 */
export const RecommendationDataSchema =
  RecommendationBasePropertiesSchema.extend({
    id: z.string(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    deletedAt: z.coerce.date().nullable(),
    promptId: z.string().nullable().optional(),
    prompt: z
      .object({
        id: z.string(),
        accountId: z.string(),
        prompt: z.string(),
        type: z.string(),
        ratingScore: z.number(),
        meInPrompt: z.boolean(),
        topicId: z.string(),
        regions: z.array(z.string()),
        language: z.string().nullable(),
        isActive: z.boolean(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        deletedAt: z.coerce.date().nullable(),
        state: z.string(),
        topic: z.object({
          id: z.string(),
          accountId: z.string().optional(),
          name: z.string(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
          createdAt: z.coerce.date().optional(),
          updatedAt: z.coerce.date().optional(),
          deletedAt: z.coerce.date().nullable().optional(),
          state: z.string().optional(),
        }),
      })
      .nullable()
      .optional(),
  });

/**
 * Data Transfer Object for full recommendation data with ID, timestamps, and optional prompt
 * Validates complete recommendation entities for API responses
 */
export class RecommendationDataDto extends createZodDto(
  RecommendationDataSchema,
) {}

/**
 * Data Transfer Object for recommendation creation request
 * Validates recommendation data for new recommendation creation
 * Uses base schema without persistence fields
 */
export class RecommendationCreationRequestDto extends createZodDto(
  RecommendationBasePropertiesSchema,
) {}

/**
 * Validation schema for generating recommendations from a prompt
 * Triggers AI-powered recommendation generation based on prompt analysis
 */
export const RecommendationsGenerationRequestSchema = z.object({
  promptId: z.string(),
});

/**
 * Data Transfer Object for generating recommendations based on a prompt ID
 * Validates request parameters for recommendation generation endpoint
 */
export class RecommendationsGenerationRequestDto extends createZodDto(
  RecommendationsGenerationRequestSchema,
) {}

/**
 * Validation schema for updating recommendation status and tracking URLs
 * Allows status transitions and optional URL tracking for implementation
 */
export const RecommendationStatusUpdateRequestSchema = z.object({
  status: z.nativeEnum(RecommendationStatus),
  urls: z.array(z.string()).optional(),
});

/**
 * Data Transfer Object for updating recommendation status with optional URLs
 * Validates status update requests with optional implementation tracking
 */
export class RecommendationStatusUpdateRequestDto extends createZodDto(
  RecommendationStatusUpdateRequestSchema,
) {}
