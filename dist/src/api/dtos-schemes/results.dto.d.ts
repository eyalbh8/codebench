import { PromptType, Provider } from '@/model.enums';
import { getAppearancesCountByCompanyNames } from '@prisma/client/sql';
import { z } from 'zod';
export type EntityAppearanceMetrics = Omit<getAppearancesCountByCompanyNames.Result, 'appearances_count' | 'appearances_count_change' | 'rank' | 'runid' | 'entity' | 'topics' | 'rundate' | 'prompts'> & {
    count: number | null;
    countChange: number | null;
    rank: number | null;
    runId: string;
    name: string;
    topics: string[] | null;
    runDate: Date;
    prompts?: string[] | null;
};
export type TopicAggregatedAppearanceMetrics = Omit<EntityAppearanceMetrics, 'topics' | 'prompts'> & {
    topic: string;
};
export type CompetitorAppearanceMetrics = Omit<EntityAppearanceMetrics, 'runId' | 'runDate' | 'prompts'> & {
    competitorId: string;
    historicalData?: Array<{
        date: string;
        value: number;
    }>;
};
export declare const SuggestedPromptActiveStatusToggleSchema: z.ZodObject<{
    active: z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    active: boolean;
}, {
    active: string;
}>;
export declare const SearchResultsFilteringParametersSchema: z.ZodObject<{
    countries: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>, string[], string | string[]>>;
    topics: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>, string[], string | string[]>>;
    isCompanyInPrompt: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEnum<["AccountIncluded", "AccountNotIncluded"]>, z.ZodArray<z.ZodEnum<["AccountIncluded", "AccountNotIncluded"]>, "many">]>, ("AccountIncluded" | "AccountNotIncluded")[], "AccountIncluded" | "AccountNotIncluded" | ("AccountIncluded" | "AccountNotIncluded")[]>>;
    promptTypes: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNativeEnum<typeof PromptType>, z.ZodArray<z.ZodNativeEnum<typeof PromptType>, "many">]>, PromptType[], PromptType | PromptType[]>>;
    aiEngines: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNativeEnum<typeof Provider>, z.ZodArray<z.ZodNativeEnum<typeof Provider>, "many">]>, Provider[], Provider | Provider[]>>;
    promptIds: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>, string[], string | string[]>>;
    tags: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>, string[], string | string[]>>;
}, "strip", z.ZodTypeAny, {
    topics?: string[] | undefined;
    countries?: string[] | undefined;
    promptTypes?: PromptType[] | undefined;
    aiEngines?: Provider[] | undefined;
    tags?: string[] | undefined;
    isCompanyInPrompt?: ("AccountIncluded" | "AccountNotIncluded")[] | undefined;
    promptIds?: string[] | undefined;
}, {
    topics?: string | string[] | undefined;
    countries?: string | string[] | undefined;
    promptTypes?: PromptType | PromptType[] | undefined;
    aiEngines?: Provider | Provider[] | undefined;
    tags?: string | string[] | undefined;
    isCompanyInPrompt?: "AccountIncluded" | "AccountNotIncluded" | ("AccountIncluded" | "AccountNotIncluded")[] | undefined;
    promptIds?: string | string[] | undefined;
}>;
export type SearchResultsFilteringParametersType = z.infer<typeof SearchResultsFilteringParametersSchema>;
export declare const TimeRangeSpecificationSchema: z.ZodObject<{
    range: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    range?: number | undefined;
}, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    range?: number | undefined;
}>;
export type TimeRangeSpecificationType = z.infer<typeof TimeRangeSpecificationSchema>;
declare const TimeRangeSpecificationDto_base: import("nestjs-zod").ZodDto<{
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    range?: number | undefined;
}, z.ZodObjectDef<{
    range: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny>, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    range?: number | undefined;
}>;
export declare class TimeRangeSpecificationDto extends TimeRangeSpecificationDto_base {
    range?: number;
    startDate?: Date;
    endDate?: Date;
}
declare const SuggestedPromptActiveStatusToggleDto_base: import("nestjs-zod").ZodDto<{
    active: boolean;
}, z.ZodObjectDef<{
    active: z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>;
}, "strip", z.ZodTypeAny>, {
    active: string;
}>;
export declare class SuggestedPromptActiveStatusToggleDto extends SuggestedPromptActiveStatusToggleDto_base {
    active: boolean;
}
declare const SearchResultsFilteringParametersDto_base: import("nestjs-zod").ZodDto<{
    topics?: string[] | undefined;
    countries?: string[] | undefined;
    promptTypes?: PromptType[] | undefined;
    aiEngines?: Provider[] | undefined;
    tags?: string[] | undefined;
    isCompanyInPrompt?: ("AccountIncluded" | "AccountNotIncluded")[] | undefined;
    promptIds?: string[] | undefined;
}, z.ZodObjectDef<{
    countries: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>, string[], string | string[]>>;
    topics: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>, string[], string | string[]>>;
    isCompanyInPrompt: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEnum<["AccountIncluded", "AccountNotIncluded"]>, z.ZodArray<z.ZodEnum<["AccountIncluded", "AccountNotIncluded"]>, "many">]>, ("AccountIncluded" | "AccountNotIncluded")[], "AccountIncluded" | "AccountNotIncluded" | ("AccountIncluded" | "AccountNotIncluded")[]>>;
    promptTypes: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNativeEnum<typeof PromptType>, z.ZodArray<z.ZodNativeEnum<typeof PromptType>, "many">]>, PromptType[], PromptType | PromptType[]>>;
    aiEngines: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNativeEnum<typeof Provider>, z.ZodArray<z.ZodNativeEnum<typeof Provider>, "many">]>, Provider[], Provider | Provider[]>>;
    promptIds: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>, string[], string | string[]>>;
    tags: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>, string[], string | string[]>>;
}, "strip", z.ZodTypeAny>, {
    topics?: string | string[] | undefined;
    countries?: string | string[] | undefined;
    promptTypes?: PromptType | PromptType[] | undefined;
    aiEngines?: Provider | Provider[] | undefined;
    tags?: string | string[] | undefined;
    isCompanyInPrompt?: "AccountIncluded" | "AccountNotIncluded" | ("AccountIncluded" | "AccountNotIncluded")[] | undefined;
    promptIds?: string | string[] | undefined;
}>;
export declare class SearchResultsFilteringParametersDto extends SearchResultsFilteringParametersDto_base {
    countries?: string[];
    topics?: string[];
    isCompanyInPrompt?: ('AccountIncluded' | 'AccountNotIncluded')[];
    promptTypes?: PromptType[];
    aiEngines?: Provider[];
    promptIds?: string[];
}
export {};
