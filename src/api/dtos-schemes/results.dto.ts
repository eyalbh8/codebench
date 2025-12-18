import { ApiProperty } from '@nestjs/swagger';
import { PromptType, Provider } from '@/model.enums';
import { getAppearancesCountByCompanyNames } from '@prisma/client/sql';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Transformed appearance count data structure
 * Maps database result fields to camelCase API-friendly format
 * Represents occurrence metrics for entities in search results
 */
export type EntityAppearanceMetrics = Omit<
  getAppearancesCountByCompanyNames.Result,
  | 'appearances_count'
  | 'appearances_count_change'
  | 'rank'
  | 'runid'
  | 'entity'
  | 'topics'
  | 'rundate'
  | 'prompts'
> & {
  count: number | null;
  countChange: number | null;
  rank: number | null;
  runId: string;
  name: string;
  topics: string[] | null;
  runDate: Date;
  prompts?: string[] | null;
};

/**
 * Topic-aggregated appearance metrics
 * Groups appearance counts by topic, removing prompt-level granularity
 */
export type TopicAggregatedAppearanceMetrics = Omit<
  EntityAppearanceMetrics,
  'topics' | 'prompts'
> & {
  topic: string;
};

/**
 * Competitor-specific appearance count structure
 * Includes competitor identifier and optional historical trend data
 * Removes run-specific fields for competitor-level aggregation
 */
export type CompetitorAppearanceMetrics = Omit<
  EntityAppearanceMetrics,
  'runId' | 'runDate' | 'prompts'
> & {
  competitorId: string;
  historicalData?: Array<{ date: string; value: number }>;
};

/**
 * Validation schema for toggling active status of suggested prompts
 * Transforms string input to boolean for query parameter parsing
 */
export const SuggestedPromptActiveStatusToggleSchema = z.object({
  active: z
    .string()
    .transform((statusValue) => statusValue === 'true' || statusValue === '1')
    .pipe(z.boolean()),
});

/**
 * Validation schema for filtering search results
 * Supports multi-dimensional filtering by countries, topics, prompt types,
 * AI engines, prompt IDs, and tags with array normalization
 */
export const SearchResultsFilteringParametersSchema = z.object({
  countries: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  topics: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  isCompanyInPrompt: z
    .union([
      z.enum(['AccountIncluded', 'AccountNotIncluded']),
      z.array(z.enum(['AccountIncluded', 'AccountNotIncluded'])),
    ])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  promptTypes: z
    .union([z.nativeEnum(PromptType), z.array(z.nativeEnum(PromptType))])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  aiEngines: z
    .union([z.nativeEnum(Provider), z.array(z.nativeEnum(Provider))])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  promptIds: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
});

/**
 * Type inference from search results filtering parameters schema
 * Represents the structure for filtering search result queries
 */
export type SearchResultsFilteringParametersType = z.infer<
  typeof SearchResultsFilteringParametersSchema
>;

/**
 * Validation schema for time range specification
 * Supports both relative ranges (days) and absolute date ranges
 * Enables flexible time-based querying for analytics
 */
export const TimeRangeSpecificationSchema = z.object({
  range: z.coerce
    .number()
    .optional()
    .describe('The number of days to look back'),
  startDate: z.coerce
    .date()
    .optional()
    .describe('Custom start date for the range'),
  endDate: z.coerce.date().optional().describe('Custom end date for the range'),
});

/**
 * Type inference from time range specification schema
 * Represents time range parameters for query filtering
 */
export type TimeRangeSpecificationType = z.infer<
  typeof TimeRangeSpecificationSchema
>;

/**
 * Data Transfer Object for time range specification
 * Validates and structures time range parameters for API requests
 */
export class TimeRangeSpecificationDto extends createZodDto(
  TimeRangeSpecificationSchema,
) {
  @ApiProperty({
    type: 'number',
    required: false,
  })
  range?: number;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  startDate?: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  endDate?: Date;
}

/**
 * Data Transfer Object for suggested prompt active status toggle
 * Handles boolean conversion from query string parameters
 */
export class SuggestedPromptActiveStatusToggleDto extends createZodDto(
  SuggestedPromptActiveStatusToggleSchema,
) {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  active!: boolean;
}

/**
 * Data Transfer Object for search results filtering parameters
 * Validates and structures multi-dimensional filter criteria
 */
export class SearchResultsFilteringParametersDto extends createZodDto(
  SearchResultsFilteringParametersSchema,
) {
  @ApiProperty({
    type: [String],
    required: false,
  })
  countries?: string[];

  @ApiProperty({
    type: [String],
    required: false,
  })
  topics?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    enum: ['AccountIncluded', 'AccountNotIncluded'],
  })
  isCompanyInPrompt?: ('AccountIncluded' | 'AccountNotIncluded')[];

  @ApiProperty({
    type: [String],
    required: false,
    enum: PromptType,
  })
  promptTypes?: PromptType[];

  @ApiProperty({
    type: [String],
    required: false,
    enum: Provider,
  })
  aiEngines?: Provider[];

  @ApiProperty({
    type: [String],
    required: false,
  })
  promptIds?: string[];
}
