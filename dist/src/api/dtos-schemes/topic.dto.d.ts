import { z } from 'zod';
import { TopicState } from '@/model.enums';
export declare const TopicAnalysisDataSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    priority: z.ZodNumber;
    occurrences: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occurrencesDelta: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    priority: number;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
}, {
    name: string;
    id: string;
    priority: number;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
}>;
export declare const TopicVisibilityDataSchema: z.ZodObject<{
    topic: z.ZodString;
    runs: z.ZodArray<z.ZodObject<{
        startDate: z.ZodDate;
        endDate: z.ZodDate;
        rank: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        visibilityScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startDate: Date;
        endDate: Date;
        visibilityScore: number;
        rank?: number | null | undefined;
    }, {
        startDate: Date;
        endDate: Date;
        visibilityScore: number;
        rank?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    topic: string;
    runs: {
        startDate: Date;
        endDate: Date;
        visibilityScore: number;
        rank?: number | null | undefined;
    }[];
}, {
    topic: string;
    runs: {
        startDate: Date;
        endDate: Date;
        visibilityScore: number;
        rank?: number | null | undefined;
    }[];
}>;
export declare const TopicPromptDataSchema: z.ZodObject<{
    id: z.ZodString;
    prompts: z.ZodArray<z.ZodObject<{
        prompt: z.ZodString;
        market_players: z.ZodArray<z.ZodString, "many">;
        urls: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        urls: string[];
        market_players: string[];
    }, {
        prompt: string;
        urls: string[];
        market_players: string[];
    }>, "many">;
    totalCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    prompts: {
        prompt: string;
        urls: string[];
        market_players: string[];
    }[];
    totalCount: number;
}, {
    id: string;
    prompts: {
        prompt: string;
        urls: string[];
        market_players: string[];
    }[];
    totalCount: number;
}>;
export declare const TopicDataSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    priority: z.ZodNumber;
    volume: z.ZodOptional<z.ZodNumber>;
    promptsCount: z.ZodOptional<z.ZodNumber>;
    state: z.ZodNativeEnum<typeof TopicState>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    state: TopicState;
    priority: number;
    volume?: number | undefined;
    promptsCount?: number | undefined;
}, {
    name: string;
    id: string;
    state: TopicState;
    priority: number;
    volume?: number | undefined;
    promptsCount?: number | undefined;
}>;
export declare const CreateTopicRequestSchema: z.ZodObject<{
    name: z.ZodString;
    priority: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    priority: number;
}, {
    name: string;
    priority: number;
}>;
export declare const CreateTopicsBatchRequestSchema: z.ZodObject<{
    names: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    names: string[];
}, {
    names: string[];
}>;
export type TopicAnalysis = z.infer<typeof TopicAnalysisDataSchema>;
declare const TopicAnalysisDataDto_base: import("nestjs-zod").ZodDto<{
    name: string;
    id: string;
    priority: number;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
}, z.ZodObjectDef<{
    id: z.ZodString;
    name: z.ZodString;
    priority: z.ZodNumber;
    occurrences: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occurrencesDelta: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny>, {
    name: string;
    id: string;
    priority: number;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
}>;
export declare class TopicAnalysisDataDto extends TopicAnalysisDataDto_base {
}
export type TopicVisibility = z.infer<typeof TopicVisibilityDataSchema>;
declare const TopicVisibilityDataDto_base: import("nestjs-zod").ZodDto<{
    topic: string;
    runs: {
        startDate: Date;
        endDate: Date;
        visibilityScore: number;
        rank?: number | null | undefined;
    }[];
}, z.ZodObjectDef<{
    topic: z.ZodString;
    runs: z.ZodArray<z.ZodObject<{
        startDate: z.ZodDate;
        endDate: z.ZodDate;
        rank: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        visibilityScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startDate: Date;
        endDate: Date;
        visibilityScore: number;
        rank?: number | null | undefined;
    }, {
        startDate: Date;
        endDate: Date;
        visibilityScore: number;
        rank?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    topic: string;
    runs: {
        startDate: Date;
        endDate: Date;
        visibilityScore: number;
        rank?: number | null | undefined;
    }[];
}>;
export declare class TopicVisibilityDataDto extends TopicVisibilityDataDto_base {
}
export type TopicPrompt = z.infer<typeof TopicPromptDataSchema>;
declare const TopicPromptDataDto_base: import("nestjs-zod").ZodDto<{
    id: string;
    prompts: {
        prompt: string;
        urls: string[];
        market_players: string[];
    }[];
    totalCount: number;
}, z.ZodObjectDef<{
    id: z.ZodString;
    prompts: z.ZodArray<z.ZodObject<{
        prompt: z.ZodString;
        market_players: z.ZodArray<z.ZodString, "many">;
        urls: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        prompt: string;
        urls: string[];
        market_players: string[];
    }, {
        prompt: string;
        urls: string[];
        market_players: string[];
    }>, "many">;
    totalCount: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    id: string;
    prompts: {
        prompt: string;
        urls: string[];
        market_players: string[];
    }[];
    totalCount: number;
}>;
export declare class TopicPromptDataDto extends TopicPromptDataDto_base {
}
export type TopicType = z.infer<typeof TopicDataSchema>;
declare const TopicDataDto_base: import("nestjs-zod").ZodDto<{
    name: string;
    id: string;
    state: TopicState;
    priority: number;
    volume?: number | undefined;
    promptsCount?: number | undefined;
}, z.ZodObjectDef<{
    id: z.ZodString;
    name: z.ZodString;
    priority: z.ZodNumber;
    volume: z.ZodOptional<z.ZodNumber>;
    promptsCount: z.ZodOptional<z.ZodNumber>;
    state: z.ZodNativeEnum<typeof TopicState>;
}, "strip", z.ZodTypeAny>, {
    name: string;
    id: string;
    state: TopicState;
    priority: number;
    volume?: number | undefined;
    promptsCount?: number | undefined;
}>;
export declare class TopicDataDto extends TopicDataDto_base {
}
export type CreateTopic = z.infer<typeof CreateTopicRequestSchema>;
declare const CreateTopicRequestDto_base: import("nestjs-zod").ZodDto<{
    name: string;
    priority: number;
}, z.ZodObjectDef<{
    name: z.ZodString;
    priority: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    name: string;
    priority: number;
}>;
export declare class CreateTopicRequestDto extends CreateTopicRequestDto_base {
}
export type CreateTopicsBatch = z.infer<typeof CreateTopicsBatchRequestSchema>;
declare const CreateTopicsBatchRequestDto_base: import("nestjs-zod").ZodDto<{
    names: string[];
}, z.ZodObjectDef<{
    names: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny>, {
    names: string[];
}>;
export declare class CreateTopicsBatchRequestDto extends CreateTopicsBatchRequestDto_base {
}
export {};
