"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderMentionAnalyticsDto = exports.ProviderMentionAnalyticsSchema = exports.ProviderMentionPromptReferenceSchema = exports.EntitySentimentScoreComputationDto = exports.EntitySentimentSummaryAggregationDto = exports.TopicProviderSentimentAnalysisDto = exports.AccountVisibilityScoreMetricsDto = exports.ProviderVisibilityMetricsDto = exports.SourceDomainMentionTrackingDto = exports.AccountMentionAnalyticsDto = exports.CompleteAccountDataDto = exports.AccountRunPerformanceResultsDto = exports.EntitySentimentScoreComputationSchema = exports.EntitySentimentSummaryAggregationSchema = exports.TopicProviderSentimentAnalysisSchema = exports.AccountVisibilityScoreMetricsSchema = exports.LlmGeneratedAccountOnboardingDataDto = exports.LlmGeneratedAccountOnboardingDataSchema = exports.AiProviderConfigurationUpdateDto = exports.AiProviderConfigurationUpdateSchema = exports.ProviderVisibilityMetricsSchema = exports.SourceDomainMentionTrackingSchema = exports.AccountRunPerformanceResultsSchema = exports.AccountMentionAnalyticsValidationSchema = exports.CompetitorAlternativeNamesMappingDto = exports.CompetitorAlternativeNamesMappingSchema = exports.CompleteAccountDataValidationSchema = exports.AccountTrialPeriodConfigurationDto = exports.AccountTrialPeriodConfigurationSchema = exports.NewAccountCreationRequestDto = exports.NewAccountCreationRequestValidationSchema = void 0;
const model_enums_1 = require("../../model.enums");
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
exports.NewAccountCreationRequestValidationSchema = zod_1.z.object({
    name: zod_1.z.string().describe('The name of the account'),
    domain: zod_1.z.string().describe('The domain of the account'),
    location: zod_1.z.string().describe('The location of the account'),
    language: zod_1.z.string().describe('The language of the account'),
    referralCode: zod_1.z
        .string()
        .optional()
        .describe('The referral code of the account'),
});
class NewAccountCreationRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.NewAccountCreationRequestValidationSchema) {
}
exports.NewAccountCreationRequestDto = NewAccountCreationRequestDto;
exports.AccountTrialPeriodConfigurationSchema = zod_1.z.object({
    trialingDays: zod_1.z.number().describe('The number of trialing days'),
});
class AccountTrialPeriodConfigurationDto extends (0, nestjs_zod_1.createZodDto)(exports.AccountTrialPeriodConfigurationSchema) {
}
exports.AccountTrialPeriodConfigurationDto = AccountTrialPeriodConfigurationDto;
exports.CompleteAccountDataValidationSchema = zod_1.z.object({
    id: zod_1.z.string().describe('The id of the account'),
    title: zod_1.z.string().describe('The title of the account'),
    names: zod_1.z.array(zod_1.z.string()).describe('The alternative names of the account'),
    domains: zod_1.z
        .array(zod_1.z.string())
        .describe('The domains of the account'),
    knowledgeSources: zod_1.z
        .array(zod_1.z.string())
        .describe('Knowledge sources associated with the account'),
    postGuidelines: zod_1.z
        .object({
        dos: zod_1.z.array(zod_1.z.string()),
        donts: zod_1.z.array(zod_1.z.string()),
    })
        .nullable()
        .optional()
        .describe('Post creation guidelines with dos and donts'),
    logo: zod_1.z
        .string()
        .nullable()
        .describe('The logo url of the account'),
    status: zod_1.z.nativeEnum(model_enums_1.AccountStatus).describe('The status of the account'),
    about: zod_1.z.string().nullable().describe('The about of the account'),
    createdAt: zod_1.z.date().describe('The date the account was created'),
    updatedAt: zod_1.z.date().describe('The date the account was updated'),
    industryCategory: zod_1.z
        .string()
        .nullable()
        .describe('The industry category of the account'),
    subIndustryCategory: zod_1.z
        .string()
        .nullable()
        .describe('The sub industry category of the account'),
    keyFeatures: zod_1.z
        .array(zod_1.z.string())
        .nullable()
        .describe('The key features of the account'),
    toneOfVoice: zod_1.z
        .array(zod_1.z.string())
        .nullable()
        .describe('The tone of voice of the account'),
    values: zod_1.z.array(zod_1.z.string()).nullable().describe('The values of the account'),
    language: zod_1.z
        .string()
        .optional()
        .nullable()
        .describe('The language of the account'),
    personality: zod_1.z
        .array(zod_1.z.string())
        .nullable()
        .describe('The personality of the account'),
    targetAudience: zod_1.z
        .array(zod_1.z.string())
        .nullable()
        .describe('The target audience of the account'),
    isUnderAgency: zod_1.z
        .boolean()
        .nullable()
        .optional()
        .describe('Whether the account is under agency'),
    accountSettings: zod_1.z
        .object({
        scanPeriod: zod_1.z
            .number()
            .nullable()
            .optional()
            .describe('The interval in hours'),
        aiEngines: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
        })),
        regions: zod_1.z.array(zod_1.z.string()).describe('The regions for the account'),
        watchedOnboardVideo: zod_1.z
            .date()
            .nullable()
            .optional()
            .describe('The date the account watched the onboard video'),
        promptLimit: zod_1.z
            .number()
            .nullable()
            .optional()
            .describe('The prompt limit for the account'),
        regionLimit: zod_1.z
            .number()
            .nullable()
            .optional()
            .describe('The regions limit for the account'),
        membersLimit: zod_1.z
            .number()
            .nullable()
            .optional()
            .describe('The members limit for the account'),
        payingCustomer: zod_1.z
            .string()
            .nullable()
            .optional()
            .describe('The paying customer for the account'),
        whiteLabelLogoSmall: zod_1.z
            .string()
            .nullable()
            .optional()
            .describe('The small white label logo URL for the account'),
        whiteLabelLogoBig: zod_1.z
            .string()
            .nullable()
            .optional()
            .describe('The big white label logo URL for the account'),
    })
        .nullable()
        .optional(),
});
exports.CompetitorAlternativeNamesMappingSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string()));
class CompetitorAlternativeNamesMappingDto extends (0, nestjs_zod_1.createZodDto)(exports.CompetitorAlternativeNamesMappingSchema) {
}
exports.CompetitorAlternativeNamesMappingDto = CompetitorAlternativeNamesMappingDto;
exports.AccountMentionAnalyticsValidationSchema = zod_1.z.object({
    mentions: zod_1.z
        .number()
        .nullable()
        .describe('The number of mentions for the account'),
    mentionsChange: zod_1.z
        .number()
        .nullable()
        .describe('The change in mentions for the account'),
    mentionedInPrompts: zod_1.z
        .array(zod_1.z.string())
        .describe('The prompts that the account was mentioned in'),
});
exports.AccountRunPerformanceResultsSchema = zod_1.z.object({
    accountId: zod_1.z.string(),
    rank: zod_1.z.number().nullish(),
    occurrences: zod_1.z.number().nullish(),
    occurrencesDelta: zod_1.z.number().nullish(),
    topic: zod_1.z.string(),
});
exports.SourceDomainMentionTrackingSchema = zod_1.z.object({
    domain: zod_1.z.string(),
    count: zod_1.z.number().nullish(),
    urls: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string(),
        promptCount: zod_1.z.number(),
    })),
});
exports.ProviderVisibilityMetricsSchema = zod_1.z.object({
    accountId: zod_1.z.string(),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    providers: zod_1.z.array(zod_1.z.object({
        provider: zod_1.z.string(),
        appearanceCount: zod_1.z.number().nullish(),
        appearanceCountChange: zod_1.z.number().nullish(),
    })),
});
exports.AiProviderConfigurationUpdateSchema = zod_1.z.object({
    aiEngines: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string() })),
});
class AiProviderConfigurationUpdateDto extends (0, nestjs_zod_1.createZodDto)(exports.AiProviderConfigurationUpdateSchema) {
}
exports.AiProviderConfigurationUpdateDto = AiProviderConfigurationUpdateDto;
exports.LlmGeneratedAccountOnboardingDataSchema = zod_1.z.object({
    about: zod_1.z.string(),
    topics: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), volume: zod_1.z.number().default(0) })),
    keyFeatures: zod_1.z.array(zod_1.z.string()),
    toneOfVoice: zod_1.z.array(zod_1.z.string()),
    values: zod_1.z.array(zod_1.z.string()),
    personality: zod_1.z.array(zod_1.z.string()),
    industryCategory: zod_1.z.string(),
    subIndustryCategory: zod_1.z.string(),
    competitors: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), siteUrl: zod_1.z.string() })),
    prompts: zod_1.z.array(zod_1.z.object({
        topic: zod_1.z.string(),
        prompt: zod_1.z.string(),
        intent: zod_1.z.nativeEnum(model_enums_1.PromptType),
        volume: zod_1.z.number().default(0),
    })),
});
class LlmGeneratedAccountOnboardingDataDto extends (0, nestjs_zod_1.createZodDto)(exports.LlmGeneratedAccountOnboardingDataSchema) {
}
exports.LlmGeneratedAccountOnboardingDataDto = LlmGeneratedAccountOnboardingDataDto;
exports.AccountVisibilityScoreMetricsSchema = zod_1.z.object({
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    position: zod_1.z.number().nullish(),
    visibilityScore: zod_1.z.number().gte(0).lte(100),
    occurrences: zod_1.z.number().nullish(),
});
exports.TopicProviderSentimentAnalysisSchema = zod_1.z.object({
    topic: zod_1.z.string().nonempty(),
    provider: zod_1.z.string(),
    sentiment: zod_1.z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED']),
    count: zod_1.z.number(),
});
exports.EntitySentimentSummaryAggregationSchema = zod_1.z.object({
    sentimentData: zod_1.z.array(exports.TopicProviderSentimentAnalysisSchema),
});
exports.EntitySentimentScoreComputationSchema = zod_1.z.object({
    sentimentScore: zod_1.z.number().min(0).max(100),
    change: zod_1.z.number().nullable(),
});
class AccountRunPerformanceResultsDto extends (0, nestjs_zod_1.createZodDto)(exports.AccountRunPerformanceResultsSchema) {
}
exports.AccountRunPerformanceResultsDto = AccountRunPerformanceResultsDto;
class CompleteAccountDataDto extends (0, nestjs_zod_1.createZodDto)(exports.CompleteAccountDataValidationSchema) {
}
exports.CompleteAccountDataDto = CompleteAccountDataDto;
class AccountMentionAnalyticsDto extends (0, nestjs_zod_1.createZodDto)(exports.AccountMentionAnalyticsValidationSchema) {
}
exports.AccountMentionAnalyticsDto = AccountMentionAnalyticsDto;
class SourceDomainMentionTrackingDto extends (0, nestjs_zod_1.createZodDto)(exports.SourceDomainMentionTrackingSchema) {
}
exports.SourceDomainMentionTrackingDto = SourceDomainMentionTrackingDto;
class ProviderVisibilityMetricsDto extends (0, nestjs_zod_1.createZodDto)(exports.ProviderVisibilityMetricsSchema) {
}
exports.ProviderVisibilityMetricsDto = ProviderVisibilityMetricsDto;
class AccountVisibilityScoreMetricsDto extends (0, nestjs_zod_1.createZodDto)(exports.AccountVisibilityScoreMetricsSchema) {
}
exports.AccountVisibilityScoreMetricsDto = AccountVisibilityScoreMetricsDto;
class TopicProviderSentimentAnalysisDto extends (0, nestjs_zod_1.createZodDto)(exports.TopicProviderSentimentAnalysisSchema) {
}
exports.TopicProviderSentimentAnalysisDto = TopicProviderSentimentAnalysisDto;
class EntitySentimentSummaryAggregationDto extends (0, nestjs_zod_1.createZodDto)(exports.EntitySentimentSummaryAggregationSchema) {
}
exports.EntitySentimentSummaryAggregationDto = EntitySentimentSummaryAggregationDto;
class EntitySentimentScoreComputationDto extends (0, nestjs_zod_1.createZodDto)(exports.EntitySentimentScoreComputationSchema) {
}
exports.EntitySentimentScoreComputationDto = EntitySentimentScoreComputationDto;
exports.ProviderMentionPromptReferenceSchema = zod_1.z.object({
    prompt: zod_1.z.string(),
    promptId: zod_1.z.string(),
});
exports.ProviderMentionAnalyticsSchema = zod_1.z.object({
    provider: zod_1.z
        .string()
        .describe('The provider name (e.g., OPENAI, GEMINI, PERPLEXITY)'),
    count: zod_1.z
        .number()
        .describe('The number of times the account was mentioned by this provider'),
    countChange: zod_1.z
        .number()
        .nullable()
        .describe('The percentage change compared to previous period'),
    prompts: zod_1.z
        .array(exports.ProviderMentionPromptReferenceSchema)
        .describe('The prompts where the account was mentioned'),
});
class ProviderMentionAnalyticsDto extends (0, nestjs_zod_1.createZodDto)(exports.ProviderMentionAnalyticsSchema) {
}
exports.ProviderMentionAnalyticsDto = ProviderMentionAnalyticsDto;
//# sourceMappingURL=account.scheme.js.map