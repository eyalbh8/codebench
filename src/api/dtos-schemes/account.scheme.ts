import { AccountStatus, PromptType, Provider } from '@/model.enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Configuration mapping for entities with their associated string arrays
 * Used to map entity names to their configuration values
 */
export type EntityConfigurationMapping = {
  [entityKey: string]: string[];
};

/**
 * Validation schema for creating a new account during initial onboarding
 * Contains core information needed to set up a new account entity
 */
export const NewAccountCreationRequestValidationSchema = z.object({
  name: z.string().describe('The name of the account'),
  domain: z.string().describe('The domain of the account'),
  location: z.string().describe('The location of the account'),
  language: z.string().describe('The language of the account'),
  referralCode: z
    .string()
    .optional()
    .describe('The referral code of the account'),
});

/**
 * Type inference from the new account creation schema
 * Represents the structure of data required to create an initial account
 */
export type NewAccountCreationRequestType = z.infer<
  typeof NewAccountCreationRequestValidationSchema
>;

/**
 * Data Transfer Object for creating an initial account
 * Validates and transforms request data for account creation endpoint
 */
export class NewAccountCreationRequestDto extends createZodDto(
  NewAccountCreationRequestValidationSchema,
) {}

/**
 * Validation schema for configuring trial period duration for an account
 * Allows setting the number of days an account should be in trial status
 */
export const AccountTrialPeriodConfigurationSchema = z.object({
  trialingDays: z.number().describe('The number of trialing days'),
});

/**
 * Type inference from the trial period configuration schema
 * Represents the structure for setting account trial duration
 */
export type AccountTrialPeriodConfigurationType = z.infer<
  typeof AccountTrialPeriodConfigurationSchema
>;

/**
 * Data Transfer Object for setting account trialing status
 * Used to configure trial period settings for account management
 */
export class AccountTrialPeriodConfigurationDto extends createZodDto(
  AccountTrialPeriodConfigurationSchema,
) {}

/**
 * Comprehensive validation schema for complete account entity data
 * Includes all account properties, settings, metadata, and relationships
 * Used for full account representation in API responses
 */
export const CompleteAccountDataValidationSchema = z.object({
  id: z.string().describe('The id of the account'),
  title: z.string().describe('The title of the account'),
  names: z.array(z.string()).describe('The alternative names of the account'),
  domains: z
    .array(z.string())

    .describe('The domains of the account'),
  knowledgeSources: z
    .array(z.string())
    .describe('Knowledge sources associated with the account'),
  postGuidelines: z
    .object({
      dos: z.array(z.string()),
      donts: z.array(z.string()),
    })
    .nullable()
    .optional()
    .describe('Post creation guidelines with dos and donts'),
  logo: z
    .string()
    .nullable()

    .describe('The logo url of the account'),
  status: z.nativeEnum(AccountStatus).describe('The status of the account'),
  about: z.string().nullable().describe('The about of the account'),
  createdAt: z.date().describe('The date the account was created'),
  updatedAt: z.date().describe('The date the account was updated'),
  industryCategory: z
    .string()
    .nullable()
    .describe('The industry category of the account'),
  subIndustryCategory: z
    .string()
    .nullable()
    .describe('The sub industry category of the account'),
  keyFeatures: z
    .array(z.string())
    .nullable()
    .describe('The key features of the account'),
  toneOfVoice: z
    .array(z.string())
    .nullable()
    .describe('The tone of voice of the account'),
  values: z.array(z.string()).nullable().describe('The values of the account'),
  language: z
    .string()
    .optional()
    .nullable()
    .describe('The language of the account'),
  personality: z
    .array(z.string())
    .nullable()
    .describe('The personality of the account'),
  targetAudience: z
    .array(z.string())
    .nullable()
    .describe('The target audience of the account'),
  isUnderAgency: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the account is under agency'),
  accountSettings: z
    .object({
      scanPeriod: z
        .number()
        .nullable()
        .optional()
        .describe('The interval in hours'),
      aiEngines: z.array(
        z.object({
          name: z.string(),
        }),
      ),
      regions: z.array(z.string()).describe('The regions for the account'),
      watchedOnboardVideo: z
        .date()
        .nullable()
        .optional()
        .describe('The date the account watched the onboard video'),
      promptLimit: z
        .number()
        .nullable()
        .optional()
        .describe('The prompt limit for the account'),
      regionLimit: z
        .number()
        .nullable()
        .optional()
        .describe('The regions limit for the account'),
      membersLimit: z
        .number()
        .nullable()
        .optional()
        .describe('The members limit for the account'),
      payingCustomer: z
        .string()
        .nullable()
        .optional()
        .describe('The paying customer for the account'),
      whiteLabelLogoSmall: z
        .string()
        .nullable()
        .optional()
        .describe('The small white label logo URL for the account'),
      whiteLabelLogoBig: z
        .string()
        .nullable()
        .optional()
        .describe('The big white label logo URL for the account'),
    })
    .nullable()
    .optional(),
});

/**
 * Validation schema for competitor alternative name mappings
 * Maps competitor identifiers to arrays of alternative names/variations
 * Useful for matching competitors across different naming conventions
 */
export const CompetitorAlternativeNamesMappingSchema = z.record(
  z.string(),
  z.array(z.string()),
);

/**
 * Type inference from competitor alternative names schema
 * Represents a mapping structure for competitor name variations
 */
export type CompetitorAlternativeNamesMappingType = z.infer<
  typeof CompetitorAlternativeNamesMappingSchema
>;

/**
 * Data Transfer Object for competitors alternative names mapping
 * Enables flexible competitor identification using various name formats
 */
export class CompetitorAlternativeNamesMappingDto extends createZodDto(
  CompetitorAlternativeNamesMappingSchema,
) {}

/**
 * Validation schema for account mention analytics data
 * Tracks how often an account is mentioned and in which prompts
 * Includes metrics for mention frequency and change over time
 */
export const AccountMentionAnalyticsValidationSchema = z.object({
  mentions: z
    .number()
    .nullable()
    .describe('The number of mentions for the account'),
  mentionsChange: z
    .number()
    .nullable()
    .describe('The change in mentions for the account'),
  mentionedInPrompts: z
    .array(z.string())
    .describe('The prompts that the account was mentioned in'),
});

/**
 * Type inference from account mention analytics schema
 * Represents mention tracking data for account visibility analysis
 */
export type AccountMentionAnalyticsType = z.infer<
  typeof AccountMentionAnalyticsValidationSchema
>;

/**
 * Validation schema for account performance results from a specific run
 * Groups results by run identifier, topic, and provider
 * Contains ranking, occurrence metrics, and topic associations
 */
export const AccountRunPerformanceResultsSchema = z.object({
  accountId: z.string(),
  rank: z.number().nullish(),
  occurrences: z.number().nullish(),
  occurrencesDelta: z.number().nullish(),
  topic: z.string(),
});

/**
 * Type inference from account run performance results schema
 * Represents aggregated performance data for account analytics
 */
export type AccountRunPerformanceResultsType = z.infer<
  typeof AccountRunPerformanceResultsSchema
>;

/**
 * Validation schema for tracking mentions across different source domains
 * Aggregates mention counts per domain with associated URL references
 * Includes prompt count for each referenced URL
 */
export const SourceDomainMentionTrackingSchema = z.object({
  domain: z.string(),
  count: z.number().nullish(),
  urls: z.array(
    z.object({
      url: z.string(),
      promptCount: z.number(),
    }),
  ),
});

/**
 * Type inference from source domain mention tracking schema
 * Represents source-level mention analytics with URL breakdowns
 */
export type SourceDomainMentionTrackingType = z.infer<
  typeof SourceDomainMentionTrackingSchema
>;

/**
 * Validation schema for provider visibility metrics over a time period
 * Tracks account appearances across different AI providers
 * Includes appearance counts and change metrics per provider
 */
export const ProviderVisibilityMetricsSchema = z.object({
  accountId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  providers: z.array(
    z.object({
      provider: z.string(),
      appearanceCount: z.number().nullish(),
      appearanceCountChange: z.number().nullish(),
    }),
  ),
});

/**
 * Validation schema for updating account AI provider configuration
 * Allows modification of enabled AI engines/providers for the account
 */
export const AiProviderConfigurationUpdateSchema = z.object({
  aiEngines: z.array(z.object({ name: z.string() })),
});

/**
 * Type inference from AI provider configuration update schema
 * Represents the structure for updating provider settings
 */
export type AiProviderConfigurationUpdateType = z.infer<
  typeof AiProviderConfigurationUpdateSchema
>;

/**
 * Data Transfer Object for updating AI provider settings
 * Used to modify which AI engines are enabled for account operations
 */
export class AiProviderConfigurationUpdateDto extends createZodDto(
  AiProviderConfigurationUpdateSchema,
) {}
/**
 * Validation schema for LLM-generated account onboarding data
 * Contains structured information extracted/generated by LLM for new account setup
 * Includes account details, topics, competitors, and initial prompts
 */
export const LlmGeneratedAccountOnboardingDataSchema = z.object({
  about: z.string(),
  topics: z.array(
    z.object({ name: z.string(), volume: z.number().default(0) }),
  ),
  keyFeatures: z.array(z.string()),
  toneOfVoice: z.array(z.string()),
  values: z.array(z.string()),
  personality: z.array(z.string()),
  industryCategory: z.string(),
  subIndustryCategory: z.string(),
  competitors: z.array(z.object({ name: z.string(), siteUrl: z.string() })),
  prompts: z.array(
    z.object({
      topic: z.string(),
      prompt: z.string(),
      intent: z.nativeEnum(PromptType),
      volume: z.number().default(0),
    }),
  ),
});

/**
 * Type inference from LLM generated account onboarding data schema
 * Represents the complete onboarding payload from LLM processing
 */
export type LlmGeneratedAccountOnboardingDataType = z.infer<
  typeof LlmGeneratedAccountOnboardingDataSchema
>;

/**
 * Data Transfer Object for LLM output for onboarding account
 * Validates and structures LLM-generated account initialization data
 */
export class LlmGeneratedAccountOnboardingDataDto extends createZodDto(
  LlmGeneratedAccountOnboardingDataSchema,
) {}

/**
 * Type inference from provider visibility metrics schema
 * Represents visibility analytics across multiple AI providers
 */
export type ProviderVisibilityMetricsType = z.infer<
  typeof ProviderVisibilityMetricsSchema
>;

/**
 * Validation schema for account visibility scoring metrics
 * Calculates visibility score (0-100) over a specified date range
 * Includes position ranking and occurrence frequency data
 */
export const AccountVisibilityScoreMetricsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  position: z.number().nullish(),
  visibilityScore: z.number().gte(0).lte(100),
  occurrences: z.number().nullish(),
});

/**
 * Type inference from account visibility score metrics schema
 * Represents computed visibility metrics for analytics dashboard
 */
export type AccountVisibilityScoreMetricsType = z.infer<
  typeof AccountVisibilityScoreMetricsSchema
>;

/**
 * Validation schema for sentiment analysis grouped by topic and provider
 * Tracks sentiment classification and counts across different topics and AI providers
 * Enables granular sentiment analysis reporting
 */
export const TopicProviderSentimentAnalysisSchema = z.object({
  topic: z.string().nonempty(),
  provider: z.string(),
  sentiment: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED']),
  count: z.number(),
});

/**
 * Type inference from topic provider sentiment analysis schema
 * Represents sentiment breakdowns for detailed analytics
 */
export type TopicProviderSentimentAnalysisType = z.infer<
  typeof TopicProviderSentimentAnalysisSchema
>;

/**
 * Validation schema for aggregated entity sentiment summary
 * Combines multiple topic-provider sentiment analyses into a comprehensive summary
 * Provides overview of sentiment distribution across all dimensions
 */
export const EntitySentimentSummaryAggregationSchema = z.object({
  sentimentData: z.array(TopicProviderSentimentAnalysisSchema),
});

/**
 * Type inference from entity sentiment summary aggregation schema
 * Represents complete sentiment overview for account entity
 */
export type EntitySentimentSummaryAggregationType = z.infer<
  typeof EntitySentimentSummaryAggregationSchema
>;

/**
 * Validation schema for computed entity sentiment score
 * Provides a normalized sentiment score (0-100) with change tracking
 * Note: Detailed breakdown commented out but available for future implementation
 */
export const EntitySentimentScoreComputationSchema = z.object({
  sentimentScore: z.number().min(0).max(100),
  change: z.number().nullable(),
  // breakdown: z.object({
  //   positive: z.number().gte(0),
  //   neutral: z.number().gte(0),
  //   negative: z.number().gte(0),
  //   mixed: z.number().gte(0),
  //   total: z.number().gte(0),
  // }),
});

/**
 * Type inference from entity sentiment score computation schema
 * Represents the final computed sentiment score with trend information
 */
export type EntitySentimentScoreComputationType = z.infer<
  typeof EntitySentimentScoreComputationSchema
>;

/**
 * Data Transfer Object for account run performance results
 * Wraps run analytics data with validation and transformation capabilities
 */
export class AccountRunPerformanceResultsDto extends createZodDto(
  AccountRunPerformanceResultsSchema,
) {}

/**
 * Data Transfer Object for account data with full details
 * Complete account entity representation with all nested properties
 */
export class CompleteAccountDataDto extends createZodDto(
  CompleteAccountDataValidationSchema,
) {}

/**
 * Data Transfer Object for account mention analytics
 * Provides mention tracking and analytics for account visibility
 */
export class AccountMentionAnalyticsDto extends createZodDto(
  AccountMentionAnalyticsValidationSchema,
) {}

/**
 * Data Transfer Object for source domain mention tracking
 * Tracks mentions across different source domains with URL details
 */
export class SourceDomainMentionTrackingDto extends createZodDto(
  SourceDomainMentionTrackingSchema,
) {}

/**
 * Data Transfer Object for provider visibility metrics
 * Aggregates visibility data across multiple AI providers
 */
export class ProviderVisibilityMetricsDto extends createZodDto(
  ProviderVisibilityMetricsSchema,
) {}

/**
 * Data Transfer Object for account visibility score metrics
 * Contains computed visibility scores and ranking information
 */
export class AccountVisibilityScoreMetricsDto extends createZodDto(
  AccountVisibilityScoreMetricsSchema,
) {}

/**
 * Data Transfer Object for topic provider sentiment analysis
 * Detailed sentiment breakdown by topic and provider dimensions
 */
export class TopicProviderSentimentAnalysisDto extends createZodDto(
  TopicProviderSentimentAnalysisSchema,
) {}

/**
 * Data Transfer Object for entity sentiment summary aggregation
 * Comprehensive sentiment overview combining all topic-provider analyses
 */
export class EntitySentimentSummaryAggregationDto extends createZodDto(
  EntitySentimentSummaryAggregationSchema,
) {}

/**
 * Data Transfer Object for entity sentiment score computation
 * Final sentiment score with normalized values and trend tracking
 */
export class EntitySentimentScoreComputationDto extends createZodDto(
  EntitySentimentScoreComputationSchema,
) {}

/**
 * Validation schema for individual prompt reference within provider mentions
 * Links prompt text and identifier for mention tracking
 */
export const ProviderMentionPromptReferenceSchema = z.object({
  prompt: z.string(),
  promptId: z.string(),
});

/**
 * Validation schema for provider-level mention analytics
 * Aggregates mention statistics per AI provider with prompt breakdowns
 * Tracks mention frequency, changes, and associated prompts
 */
export const ProviderMentionAnalyticsSchema = z.object({
  provider: z
    .string()
    .describe('The provider name (e.g., OPENAI, GEMINI, PERPLEXITY)'),
  count: z
    .number()
    .describe('The number of times the account was mentioned by this provider'),
  countChange: z
    .number()
    .nullable()
    .describe('The percentage change compared to previous period'),
  prompts: z
    .array(ProviderMentionPromptReferenceSchema)
    .describe('The prompts where the account was mentioned'),
});

/**
 * Type inference from provider mention analytics schema
 * Represents mention tracking data grouped by AI provider
 */
export type ProviderMentionAnalyticsType = z.infer<
  typeof ProviderMentionAnalyticsSchema
>;

/**
 * Data Transfer Object for provider mention analytics
 * Provides detailed mention statistics per provider with prompt references
 */
export class ProviderMentionAnalyticsDto extends createZodDto(
  ProviderMentionAnalyticsSchema,
) {}
