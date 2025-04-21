import { AccountStatus, PromptType } from '@/model.enums';
import { z } from 'zod';
export type EntityConfigurationMapping = {
    [entityKey: string]: string[];
};
export declare const NewAccountCreationRequestValidationSchema: z.ZodObject<{
    name: z.ZodString;
    domain: z.ZodString;
    location: z.ZodString;
    language: z.ZodString;
    referralCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    language: string;
    domain: string;
    location: string;
    referralCode?: string | undefined;
}, {
    name: string;
    language: string;
    domain: string;
    location: string;
    referralCode?: string | undefined;
}>;
export type NewAccountCreationRequestType = z.infer<typeof NewAccountCreationRequestValidationSchema>;
declare const NewAccountCreationRequestDto_base: import("nestjs-zod").ZodDto<{
    name: string;
    language: string;
    domain: string;
    location: string;
    referralCode?: string | undefined;
}, z.ZodObjectDef<{
    name: z.ZodString;
    domain: z.ZodString;
    location: z.ZodString;
    language: z.ZodString;
    referralCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny>, {
    name: string;
    language: string;
    domain: string;
    location: string;
    referralCode?: string | undefined;
}>;
export declare class NewAccountCreationRequestDto extends NewAccountCreationRequestDto_base {
}
export declare const AccountTrialPeriodConfigurationSchema: z.ZodObject<{
    trialingDays: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    trialingDays: number;
}, {
    trialingDays: number;
}>;
export type AccountTrialPeriodConfigurationType = z.infer<typeof AccountTrialPeriodConfigurationSchema>;
declare const AccountTrialPeriodConfigurationDto_base: import("nestjs-zod").ZodDto<{
    trialingDays: number;
}, z.ZodObjectDef<{
    trialingDays: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    trialingDays: number;
}>;
export declare class AccountTrialPeriodConfigurationDto extends AccountTrialPeriodConfigurationDto_base {
}
export declare const CompleteAccountDataValidationSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    names: z.ZodArray<z.ZodString, "many">;
    domains: z.ZodArray<z.ZodString, "many">;
    knowledgeSources: z.ZodArray<z.ZodString, "many">;
    postGuidelines: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        dos: z.ZodArray<z.ZodString, "many">;
        donts: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        dos: string[];
        donts: string[];
    }, {
        dos: string[];
        donts: string[];
    }>>>;
    logo: z.ZodNullable<z.ZodString>;
    status: z.ZodNativeEnum<typeof AccountStatus>;
    about: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    industryCategory: z.ZodNullable<z.ZodString>;
    subIndustryCategory: z.ZodNullable<z.ZodString>;
    keyFeatures: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    toneOfVoice: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    values: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    language: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    personality: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    targetAudience: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    isUnderAgency: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    accountSettings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        scanPeriod: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        aiEngines: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>, "many">;
        regions: z.ZodArray<z.ZodString, "many">;
        watchedOnboardVideo: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        promptLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        regionLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        membersLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        payingCustomer: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        whiteLabelLogoSmall: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        whiteLabelLogoBig: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        aiEngines: {
            name: string;
        }[];
        regions: string[];
        scanPeriod?: number | null | undefined;
        watchedOnboardVideo?: Date | null | undefined;
        promptLimit?: number | null | undefined;
        regionLimit?: number | null | undefined;
        membersLimit?: number | null | undefined;
        payingCustomer?: string | null | undefined;
        whiteLabelLogoSmall?: string | null | undefined;
        whiteLabelLogoBig?: string | null | undefined;
    }, {
        aiEngines: {
            name: string;
        }[];
        regions: string[];
        scanPeriod?: number | null | undefined;
        watchedOnboardVideo?: Date | null | undefined;
        promptLimit?: number | null | undefined;
        regionLimit?: number | null | undefined;
        membersLimit?: number | null | undefined;
        payingCustomer?: string | null | undefined;
        whiteLabelLogoSmall?: string | null | undefined;
        whiteLabelLogoBig?: string | null | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    status: AccountStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    names: string[];
    domains: string[];
    knowledgeSources: string[];
    logo: string | null;
    about: string | null;
    industryCategory: string | null;
    subIndustryCategory: string | null;
    keyFeatures: string[] | null;
    toneOfVoice: string[] | null;
    values: string[] | null;
    personality: string[] | null;
    targetAudience: string[] | null;
    accountSettings?: {
        aiEngines: {
            name: string;
        }[];
        regions: string[];
        scanPeriod?: number | null | undefined;
        watchedOnboardVideo?: Date | null | undefined;
        promptLimit?: number | null | undefined;
        regionLimit?: number | null | undefined;
        membersLimit?: number | null | undefined;
        payingCustomer?: string | null | undefined;
        whiteLabelLogoSmall?: string | null | undefined;
        whiteLabelLogoBig?: string | null | undefined;
    } | null | undefined;
    postGuidelines?: {
        dos: string[];
        donts: string[];
    } | null | undefined;
    isUnderAgency?: boolean | null | undefined;
    language?: string | null | undefined;
}, {
    title: string;
    status: AccountStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    names: string[];
    domains: string[];
    knowledgeSources: string[];
    logo: string | null;
    about: string | null;
    industryCategory: string | null;
    subIndustryCategory: string | null;
    keyFeatures: string[] | null;
    toneOfVoice: string[] | null;
    values: string[] | null;
    personality: string[] | null;
    targetAudience: string[] | null;
    accountSettings?: {
        aiEngines: {
            name: string;
        }[];
        regions: string[];
        scanPeriod?: number | null | undefined;
        watchedOnboardVideo?: Date | null | undefined;
        promptLimit?: number | null | undefined;
        regionLimit?: number | null | undefined;
        membersLimit?: number | null | undefined;
        payingCustomer?: string | null | undefined;
        whiteLabelLogoSmall?: string | null | undefined;
        whiteLabelLogoBig?: string | null | undefined;
    } | null | undefined;
    postGuidelines?: {
        dos: string[];
        donts: string[];
    } | null | undefined;
    isUnderAgency?: boolean | null | undefined;
    language?: string | null | undefined;
}>;
export declare const CompetitorAlternativeNamesMappingSchema: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
export type CompetitorAlternativeNamesMappingType = z.infer<typeof CompetitorAlternativeNamesMappingSchema>;
declare const CompetitorAlternativeNamesMappingDto_base: import("nestjs-zod").ZodDto<Record<string, string[]>, z.ZodRecordDef<z.ZodString, z.ZodArray<z.ZodString, "many">>, Record<string, string[]>>;
export declare class CompetitorAlternativeNamesMappingDto extends CompetitorAlternativeNamesMappingDto_base {
}
export declare const AccountMentionAnalyticsValidationSchema: z.ZodObject<{
    mentions: z.ZodNullable<z.ZodNumber>;
    mentionsChange: z.ZodNullable<z.ZodNumber>;
    mentionedInPrompts: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    mentions: number | null;
    mentionsChange: number | null;
    mentionedInPrompts: string[];
}, {
    mentions: number | null;
    mentionsChange: number | null;
    mentionedInPrompts: string[];
}>;
export type AccountMentionAnalyticsType = z.infer<typeof AccountMentionAnalyticsValidationSchema>;
export declare const AccountRunPerformanceResultsSchema: z.ZodObject<{
    accountId: z.ZodString;
    rank: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occurrences: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occurrencesDelta: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    topic: z.ZodString;
}, "strip", z.ZodTypeAny, {
    accountId: string;
    topic: string;
    rank?: number | null | undefined;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
}, {
    accountId: string;
    topic: string;
    rank?: number | null | undefined;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
}>;
export type AccountRunPerformanceResultsType = z.infer<typeof AccountRunPerformanceResultsSchema>;
export declare const SourceDomainMentionTrackingSchema: z.ZodObject<{
    domain: z.ZodString;
    count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    urls: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        promptCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        url: string;
        promptCount: number;
    }, {
        url: string;
        promptCount: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    domain: string;
    urls: {
        url: string;
        promptCount: number;
    }[];
    count?: number | null | undefined;
}, {
    domain: string;
    urls: {
        url: string;
        promptCount: number;
    }[];
    count?: number | null | undefined;
}>;
export type SourceDomainMentionTrackingType = z.infer<typeof SourceDomainMentionTrackingSchema>;
export declare const ProviderVisibilityMetricsSchema: z.ZodObject<{
    accountId: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    providers: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        appearanceCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        appearanceCountChange: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        appearanceCount?: number | null | undefined;
        appearanceCountChange?: number | null | undefined;
    }, {
        provider: string;
        appearanceCount?: number | null | undefined;
        appearanceCountChange?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    accountId: string;
    startDate: Date;
    endDate: Date;
    providers: {
        provider: string;
        appearanceCount?: number | null | undefined;
        appearanceCountChange?: number | null | undefined;
    }[];
}, {
    accountId: string;
    startDate: Date;
    endDate: Date;
    providers: {
        provider: string;
        appearanceCount?: number | null | undefined;
        appearanceCountChange?: number | null | undefined;
    }[];
}>;
export declare const AiProviderConfigurationUpdateSchema: z.ZodObject<{
    aiEngines: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    aiEngines: {
        name: string;
    }[];
}, {
    aiEngines: {
        name: string;
    }[];
}>;
export type AiProviderConfigurationUpdateType = z.infer<typeof AiProviderConfigurationUpdateSchema>;
declare const AiProviderConfigurationUpdateDto_base: import("nestjs-zod").ZodDto<{
    aiEngines: {
        name: string;
    }[];
}, z.ZodObjectDef<{
    aiEngines: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    aiEngines: {
        name: string;
    }[];
}>;
export declare class AiProviderConfigurationUpdateDto extends AiProviderConfigurationUpdateDto_base {
}
export declare const LlmGeneratedAccountOnboardingDataSchema: z.ZodObject<{
    about: z.ZodString;
    topics: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        volume: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        volume: number;
    }, {
        name: string;
        volume?: number | undefined;
    }>, "many">;
    keyFeatures: z.ZodArray<z.ZodString, "many">;
    toneOfVoice: z.ZodArray<z.ZodString, "many">;
    values: z.ZodArray<z.ZodString, "many">;
    personality: z.ZodArray<z.ZodString, "many">;
    industryCategory: z.ZodString;
    subIndustryCategory: z.ZodString;
    competitors: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        siteUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        siteUrl: string;
    }, {
        name: string;
        siteUrl: string;
    }>, "many">;
    prompts: z.ZodArray<z.ZodObject<{
        topic: z.ZodString;
        prompt: z.ZodString;
        intent: z.ZodNativeEnum<typeof PromptType>;
        volume: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        topic: string;
        volume: number;
        intent: PromptType;
    }, {
        prompt: string;
        topic: string;
        intent: PromptType;
        volume?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    about: string;
    industryCategory: string;
    subIndustryCategory: string;
    keyFeatures: string[];
    toneOfVoice: string[];
    values: string[];
    personality: string[];
    competitors: {
        name: string;
        siteUrl: string;
    }[];
    topics: {
        name: string;
        volume: number;
    }[];
    prompts: {
        prompt: string;
        topic: string;
        volume: number;
        intent: PromptType;
    }[];
}, {
    about: string;
    industryCategory: string;
    subIndustryCategory: string;
    keyFeatures: string[];
    toneOfVoice: string[];
    values: string[];
    personality: string[];
    competitors: {
        name: string;
        siteUrl: string;
    }[];
    topics: {
        name: string;
        volume?: number | undefined;
    }[];
    prompts: {
        prompt: string;
        topic: string;
        intent: PromptType;
        volume?: number | undefined;
    }[];
}>;
export type LlmGeneratedAccountOnboardingDataType = z.infer<typeof LlmGeneratedAccountOnboardingDataSchema>;
declare const LlmGeneratedAccountOnboardingDataDto_base: import("nestjs-zod").ZodDto<{
    about: string;
    industryCategory: string;
    subIndustryCategory: string;
    keyFeatures: string[];
    toneOfVoice: string[];
    values: string[];
    personality: string[];
    competitors: {
        name: string;
        siteUrl: string;
    }[];
    topics: {
        name: string;
        volume: number;
    }[];
    prompts: {
        prompt: string;
        topic: string;
        volume: number;
        intent: PromptType;
    }[];
}, z.ZodObjectDef<{
    about: z.ZodString;
    topics: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        volume: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        volume: number;
    }, {
        name: string;
        volume?: number | undefined;
    }>, "many">;
    keyFeatures: z.ZodArray<z.ZodString, "many">;
    toneOfVoice: z.ZodArray<z.ZodString, "many">;
    values: z.ZodArray<z.ZodString, "many">;
    personality: z.ZodArray<z.ZodString, "many">;
    industryCategory: z.ZodString;
    subIndustryCategory: z.ZodString;
    competitors: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        siteUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        siteUrl: string;
    }, {
        name: string;
        siteUrl: string;
    }>, "many">;
    prompts: z.ZodArray<z.ZodObject<{
        topic: z.ZodString;
        prompt: z.ZodString;
        intent: z.ZodNativeEnum<typeof PromptType>;
        volume: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        topic: string;
        volume: number;
        intent: PromptType;
    }, {
        prompt: string;
        topic: string;
        intent: PromptType;
        volume?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    about: string;
    industryCategory: string;
    subIndustryCategory: string;
    keyFeatures: string[];
    toneOfVoice: string[];
    values: string[];
    personality: string[];
    competitors: {
        name: string;
        siteUrl: string;
    }[];
    topics: {
        name: string;
        volume?: number | undefined;
    }[];
    prompts: {
        prompt: string;
        topic: string;
        intent: PromptType;
        volume?: number | undefined;
    }[];
}>;
export declare class LlmGeneratedAccountOnboardingDataDto extends LlmGeneratedAccountOnboardingDataDto_base {
}
export type ProviderVisibilityMetricsType = z.infer<typeof ProviderVisibilityMetricsSchema>;
export declare const AccountVisibilityScoreMetricsSchema: z.ZodObject<{
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    position: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    visibilityScore: z.ZodNumber;
    occurrences: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    startDate: Date;
    endDate: Date;
    visibilityScore: number;
    occurrences?: number | null | undefined;
    position?: number | null | undefined;
}, {
    startDate: Date;
    endDate: Date;
    visibilityScore: number;
    occurrences?: number | null | undefined;
    position?: number | null | undefined;
}>;
export type AccountVisibilityScoreMetricsType = z.infer<typeof AccountVisibilityScoreMetricsSchema>;
export declare const TopicProviderSentimentAnalysisSchema: z.ZodObject<{
    topic: z.ZodString;
    provider: z.ZodString;
    sentiment: z.ZodEnum<["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"]>;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    topic: string;
    provider: string;
    count: number;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
}, {
    topic: string;
    provider: string;
    count: number;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
}>;
export type TopicProviderSentimentAnalysisType = z.infer<typeof TopicProviderSentimentAnalysisSchema>;
export declare const EntitySentimentSummaryAggregationSchema: z.ZodObject<{
    sentimentData: z.ZodArray<z.ZodObject<{
        topic: z.ZodString;
        provider: z.ZodString;
        sentiment: z.ZodEnum<["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"]>;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        topic: string;
        provider: string;
        count: number;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    }, {
        topic: string;
        provider: string;
        count: number;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    sentimentData: {
        topic: string;
        provider: string;
        count: number;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    }[];
}, {
    sentimentData: {
        topic: string;
        provider: string;
        count: number;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    }[];
}>;
export type EntitySentimentSummaryAggregationType = z.infer<typeof EntitySentimentSummaryAggregationSchema>;
export declare const EntitySentimentScoreComputationSchema: z.ZodObject<{
    sentimentScore: z.ZodNumber;
    change: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sentimentScore: number;
    change: number | null;
}, {
    sentimentScore: number;
    change: number | null;
}>;
export type EntitySentimentScoreComputationType = z.infer<typeof EntitySentimentScoreComputationSchema>;
declare const AccountRunPerformanceResultsDto_base: import("nestjs-zod").ZodDto<{
    accountId: string;
    topic: string;
    rank?: number | null | undefined;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
}, z.ZodObjectDef<{
    accountId: z.ZodString;
    rank: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occurrences: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occurrencesDelta: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    topic: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    accountId: string;
    topic: string;
    rank?: number | null | undefined;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
}>;
export declare class AccountRunPerformanceResultsDto extends AccountRunPerformanceResultsDto_base {
}
declare const CompleteAccountDataDto_base: import("nestjs-zod").ZodDto<{
    title: string;
    status: AccountStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    names: string[];
    domains: string[];
    knowledgeSources: string[];
    logo: string | null;
    about: string | null;
    industryCategory: string | null;
    subIndustryCategory: string | null;
    keyFeatures: string[] | null;
    toneOfVoice: string[] | null;
    values: string[] | null;
    personality: string[] | null;
    targetAudience: string[] | null;
    accountSettings?: {
        aiEngines: {
            name: string;
        }[];
        regions: string[];
        scanPeriod?: number | null | undefined;
        watchedOnboardVideo?: Date | null | undefined;
        promptLimit?: number | null | undefined;
        regionLimit?: number | null | undefined;
        membersLimit?: number | null | undefined;
        payingCustomer?: string | null | undefined;
        whiteLabelLogoSmall?: string | null | undefined;
        whiteLabelLogoBig?: string | null | undefined;
    } | null | undefined;
    postGuidelines?: {
        dos: string[];
        donts: string[];
    } | null | undefined;
    isUnderAgency?: boolean | null | undefined;
    language?: string | null | undefined;
}, z.ZodObjectDef<{
    id: z.ZodString;
    title: z.ZodString;
    names: z.ZodArray<z.ZodString, "many">;
    domains: z.ZodArray<z.ZodString, "many">;
    knowledgeSources: z.ZodArray<z.ZodString, "many">;
    postGuidelines: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        dos: z.ZodArray<z.ZodString, "many">;
        donts: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        dos: string[];
        donts: string[];
    }, {
        dos: string[];
        donts: string[];
    }>>>;
    logo: z.ZodNullable<z.ZodString>;
    status: z.ZodNativeEnum<typeof AccountStatus>;
    about: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    industryCategory: z.ZodNullable<z.ZodString>;
    subIndustryCategory: z.ZodNullable<z.ZodString>;
    keyFeatures: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    toneOfVoice: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    values: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    language: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    personality: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    targetAudience: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    isUnderAgency: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    accountSettings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        scanPeriod: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        aiEngines: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>, "many">;
        regions: z.ZodArray<z.ZodString, "many">;
        watchedOnboardVideo: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        promptLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        regionLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        membersLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        payingCustomer: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        whiteLabelLogoSmall: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        whiteLabelLogoBig: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        aiEngines: {
            name: string;
        }[];
        regions: string[];
        scanPeriod?: number | null | undefined;
        watchedOnboardVideo?: Date | null | undefined;
        promptLimit?: number | null | undefined;
        regionLimit?: number | null | undefined;
        membersLimit?: number | null | undefined;
        payingCustomer?: string | null | undefined;
        whiteLabelLogoSmall?: string | null | undefined;
        whiteLabelLogoBig?: string | null | undefined;
    }, {
        aiEngines: {
            name: string;
        }[];
        regions: string[];
        scanPeriod?: number | null | undefined;
        watchedOnboardVideo?: Date | null | undefined;
        promptLimit?: number | null | undefined;
        regionLimit?: number | null | undefined;
        membersLimit?: number | null | undefined;
        payingCustomer?: string | null | undefined;
        whiteLabelLogoSmall?: string | null | undefined;
        whiteLabelLogoBig?: string | null | undefined;
    }>>>;
}, "strip", z.ZodTypeAny>, {
    title: string;
    status: AccountStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    names: string[];
    domains: string[];
    knowledgeSources: string[];
    logo: string | null;
    about: string | null;
    industryCategory: string | null;
    subIndustryCategory: string | null;
    keyFeatures: string[] | null;
    toneOfVoice: string[] | null;
    values: string[] | null;
    personality: string[] | null;
    targetAudience: string[] | null;
    accountSettings?: {
        aiEngines: {
            name: string;
        }[];
        regions: string[];
        scanPeriod?: number | null | undefined;
        watchedOnboardVideo?: Date | null | undefined;
        promptLimit?: number | null | undefined;
        regionLimit?: number | null | undefined;
        membersLimit?: number | null | undefined;
        payingCustomer?: string | null | undefined;
        whiteLabelLogoSmall?: string | null | undefined;
        whiteLabelLogoBig?: string | null | undefined;
    } | null | undefined;
    postGuidelines?: {
        dos: string[];
        donts: string[];
    } | null | undefined;
    isUnderAgency?: boolean | null | undefined;
    language?: string | null | undefined;
}>;
export declare class CompleteAccountDataDto extends CompleteAccountDataDto_base {
}
declare const AccountMentionAnalyticsDto_base: import("nestjs-zod").ZodDto<{
    mentions: number | null;
    mentionsChange: number | null;
    mentionedInPrompts: string[];
}, z.ZodObjectDef<{
    mentions: z.ZodNullable<z.ZodNumber>;
    mentionsChange: z.ZodNullable<z.ZodNumber>;
    mentionedInPrompts: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny>, {
    mentions: number | null;
    mentionsChange: number | null;
    mentionedInPrompts: string[];
}>;
export declare class AccountMentionAnalyticsDto extends AccountMentionAnalyticsDto_base {
}
declare const SourceDomainMentionTrackingDto_base: import("nestjs-zod").ZodDto<{
    domain: string;
    urls: {
        url: string;
        promptCount: number;
    }[];
    count?: number | null | undefined;
}, z.ZodObjectDef<{
    domain: z.ZodString;
    count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    urls: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        promptCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        url: string;
        promptCount: number;
    }, {
        url: string;
        promptCount: number;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    domain: string;
    urls: {
        url: string;
        promptCount: number;
    }[];
    count?: number | null | undefined;
}>;
export declare class SourceDomainMentionTrackingDto extends SourceDomainMentionTrackingDto_base {
}
declare const ProviderVisibilityMetricsDto_base: import("nestjs-zod").ZodDto<{
    accountId: string;
    startDate: Date;
    endDate: Date;
    providers: {
        provider: string;
        appearanceCount?: number | null | undefined;
        appearanceCountChange?: number | null | undefined;
    }[];
}, z.ZodObjectDef<{
    accountId: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    providers: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        appearanceCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        appearanceCountChange: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        appearanceCount?: number | null | undefined;
        appearanceCountChange?: number | null | undefined;
    }, {
        provider: string;
        appearanceCount?: number | null | undefined;
        appearanceCountChange?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    accountId: string;
    startDate: Date;
    endDate: Date;
    providers: {
        provider: string;
        appearanceCount?: number | null | undefined;
        appearanceCountChange?: number | null | undefined;
    }[];
}>;
export declare class ProviderVisibilityMetricsDto extends ProviderVisibilityMetricsDto_base {
}
declare const AccountVisibilityScoreMetricsDto_base: import("nestjs-zod").ZodDto<{
    startDate: Date;
    endDate: Date;
    visibilityScore: number;
    occurrences?: number | null | undefined;
    position?: number | null | undefined;
}, z.ZodObjectDef<{
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    position: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    visibilityScore: z.ZodNumber;
    occurrences: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny>, {
    startDate: Date;
    endDate: Date;
    visibilityScore: number;
    occurrences?: number | null | undefined;
    position?: number | null | undefined;
}>;
export declare class AccountVisibilityScoreMetricsDto extends AccountVisibilityScoreMetricsDto_base {
}
declare const TopicProviderSentimentAnalysisDto_base: import("nestjs-zod").ZodDto<{
    topic: string;
    provider: string;
    count: number;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
}, z.ZodObjectDef<{
    topic: z.ZodString;
    provider: z.ZodString;
    sentiment: z.ZodEnum<["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"]>;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    topic: string;
    provider: string;
    count: number;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
}>;
export declare class TopicProviderSentimentAnalysisDto extends TopicProviderSentimentAnalysisDto_base {
}
declare const EntitySentimentSummaryAggregationDto_base: import("nestjs-zod").ZodDto<{
    sentimentData: {
        topic: string;
        provider: string;
        count: number;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    }[];
}, z.ZodObjectDef<{
    sentimentData: z.ZodArray<z.ZodObject<{
        topic: z.ZodString;
        provider: z.ZodString;
        sentiment: z.ZodEnum<["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"]>;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        topic: string;
        provider: string;
        count: number;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    }, {
        topic: string;
        provider: string;
        count: number;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    sentimentData: {
        topic: string;
        provider: string;
        count: number;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    }[];
}>;
export declare class EntitySentimentSummaryAggregationDto extends EntitySentimentSummaryAggregationDto_base {
}
declare const EntitySentimentScoreComputationDto_base: import("nestjs-zod").ZodDto<{
    sentimentScore: number;
    change: number | null;
}, z.ZodObjectDef<{
    sentimentScore: z.ZodNumber;
    change: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny>, {
    sentimentScore: number;
    change: number | null;
}>;
export declare class EntitySentimentScoreComputationDto extends EntitySentimentScoreComputationDto_base {
}
export declare const ProviderMentionPromptReferenceSchema: z.ZodObject<{
    prompt: z.ZodString;
    promptId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    promptId: string;
}, {
    prompt: string;
    promptId: string;
}>;
export declare const ProviderMentionAnalyticsSchema: z.ZodObject<{
    provider: z.ZodString;
    count: z.ZodNumber;
    countChange: z.ZodNullable<z.ZodNumber>;
    prompts: z.ZodArray<z.ZodObject<{
        prompt: z.ZodString;
        promptId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        promptId: string;
    }, {
        prompt: string;
        promptId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    prompts: {
        prompt: string;
        promptId: string;
    }[];
    provider: string;
    count: number;
    countChange: number | null;
}, {
    prompts: {
        prompt: string;
        promptId: string;
    }[];
    provider: string;
    count: number;
    countChange: number | null;
}>;
export type ProviderMentionAnalyticsType = z.infer<typeof ProviderMentionAnalyticsSchema>;
declare const ProviderMentionAnalyticsDto_base: import("nestjs-zod").ZodDto<{
    prompts: {
        prompt: string;
        promptId: string;
    }[];
    provider: string;
    count: number;
    countChange: number | null;
}, z.ZodObjectDef<{
    provider: z.ZodString;
    count: z.ZodNumber;
    countChange: z.ZodNullable<z.ZodNumber>;
    prompts: z.ZodArray<z.ZodObject<{
        prompt: z.ZodString;
        promptId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        promptId: string;
    }, {
        prompt: string;
        promptId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    prompts: {
        prompt: string;
        promptId: string;
    }[];
    provider: string;
    count: number;
    countChange: number | null;
}>;
export declare class ProviderMentionAnalyticsDto extends ProviderMentionAnalyticsDto_base {
}
export {};
