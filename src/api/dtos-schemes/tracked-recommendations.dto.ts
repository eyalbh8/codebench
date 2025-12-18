import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { RecommendationDataSchema } from './recommendations.dto';

/**
 * Validation schema for tracked recommendation entity
 * Represents a recommendation that is being monitored for implementation
 * Links recommendation to implementation URLs and tracks changes
 */
export const TrackedRecommendationEntitySchema = z.object({
  id: z.string(),
  recommendationId: z.string().nullable(),
  accountId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  urls: z.array(z.string()).describe('URLs of the changes'),
});

/**
 * Type inference from tracked recommendation entity schema
 * Represents the structure of a tracked recommendation record
 */
export type TrackedRecommendationEntityType = z.infer<
  typeof TrackedRecommendationEntitySchema
>;

/**
 * Data Transfer Object for tracked recommendation data
 * Validates and structures tracked recommendation entities for API responses
 */
export class TrackedRecommendationEntityDto extends createZodDto(
  TrackedRecommendationEntitySchema,
) {}

/**
 * Validation schema for creating a new tracked recommendation
 * Allows optional recommendation linking during creation
 */
export const TrackedRecommendationCreationRequestSchema = z.object({
  recommendationId: z.string().optional(),
  urls: z.array(z.string()),
});

/**
 * Data Transfer Object for creating a tracked recommendation
 * Validates request payload for tracked recommendation creation
 */
export class TrackedRecommendationCreationRequestDto extends createZodDto(
  TrackedRecommendationCreationRequestSchema,
) {}

/**
 * Validation schema for updating tracked recommendation URLs
 * Modifies the list of implementation URLs being tracked
 */
export const TrackedRecommendationUpdateRequestSchema = z.object({
  urls: z.array(z.string()),
});

/**
 * Data Transfer Object for updating a tracked recommendation
 * Validates request payload for tracked recommendation updates
 */
export class TrackedRecommendationUpdateRequestDto extends createZodDto(
  TrackedRecommendationUpdateRequestSchema,
) {}

/**
 * Validation schema for tracked recommendation with populated recommendation data
 * Extends tracked recommendation with full recommendation details
 */
export const TrackedRecommendationWithFullRecommendationSchema =
  TrackedRecommendationEntitySchema.extend({
    recommendation: RecommendationDataSchema.nullable(),
  });

/**
 * Type inference from tracked recommendation with full recommendation schema
 * Represents tracked recommendation with nested recommendation details
 */
export type TrackedRecommendationWithFullRecommendationType = z.infer<
  typeof TrackedRecommendationWithFullRecommendationSchema
>;

/**
 * Data Transfer Object for tracked recommendation with populated recommendation data
 * Structures tracked recommendation with full recommendation context
 */
export class TrackedRecommendationWithFullRecommendationDto extends createZodDto(
  TrackedRecommendationWithFullRecommendationSchema,
) {}

/**
 * Validation schema for recommendation implementation analytics
 * Tracks performance metrics before and after recommendation implementation
 * Includes averages, trends, and appearance counts
 */
export const RecommendationImplementationAnalyticsSchema = z.object({
  tracked_recommendation_id: z.string(),
  last_average: z.union([z.number(), z.bigint(), z.null()]),
  new_average: z.number().nullable(),
  trend_percentage: z.number().nullable(),
  total_appearances_after_implementation: z.number().nonnegative(),
});

/**
 * Type inference from recommendation implementation analytics schema
 * Represents analytics data for recommendation tracking
 */
export type RecommendationImplementationAnalyticsType = z.infer<
  typeof RecommendationImplementationAnalyticsSchema
>;

/**
 * Validation schema for comprehensive analytics overview
 * Combines tracked recommendation, recommendation details, and analytics
 * Provides complete view of recommendation implementation status
 */
export const RecommendationAnalyticsOverviewSchema = z.object({
  tracked: TrackedRecommendationEntitySchema,
  recommendation: RecommendationDataSchema.nullable(),
  analytics: RecommendationImplementationAnalyticsSchema,
});

/**
 * Type inference from recommendation analytics overview schema
 * Represents complete analytics overview structure
 */
export type RecommendationAnalyticsOverviewType = z.infer<
  typeof RecommendationAnalyticsOverviewSchema
>;

/**
 * Data Transfer Object for analytics overview combining tracked recommendation, recommendation, and analytics
 * Structures comprehensive analytics overview for API responses
 */
export class RecommendationAnalyticsOverviewDto extends createZodDto(
  RecommendationAnalyticsOverviewSchema,
) {}
