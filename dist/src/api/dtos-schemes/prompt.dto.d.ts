import { Prompt, Topic } from '@prisma/client';
import { PromptIntentType, PromptState, PromptType } from '@/model.enums';
import { z } from 'zod';
export declare const GetAccountPromptResponsesQuerySchema: z.ZodObject<{
    topicId: z.ZodOptional<z.ZodString>;
    promptId: z.ZodOptional<z.ZodString>;
    scanId: z.ZodOptional<z.ZodString>;
    isMeInResponse: z.ZodOptional<z.ZodBoolean>;
    providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    take: z.ZodNumber;
    skip: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    take: number;
    skip: number;
    promptId?: string | undefined;
    topicId?: string | undefined;
    providers?: string[] | undefined;
    scanId?: string | undefined;
    isMeInResponse?: boolean | undefined;
}, {
    take: number;
    skip: number;
    promptId?: string | undefined;
    topicId?: string | undefined;
    providers?: string[] | undefined;
    scanId?: string | undefined;
    isMeInResponse?: boolean | undefined;
}>;
declare const GetAccountPromptResponsesQueryDto_base: import("nestjs-zod").ZodDto<{
    take: number;
    skip: number;
    promptId?: string | undefined;
    topicId?: string | undefined;
    providers?: string[] | undefined;
    scanId?: string | undefined;
    isMeInResponse?: boolean | undefined;
}, z.ZodObjectDef<{
    topicId: z.ZodOptional<z.ZodString>;
    promptId: z.ZodOptional<z.ZodString>;
    scanId: z.ZodOptional<z.ZodString>;
    isMeInResponse: z.ZodOptional<z.ZodBoolean>;
    providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    take: z.ZodNumber;
    skip: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    take: number;
    skip: number;
    promptId?: string | undefined;
    topicId?: string | undefined;
    providers?: string[] | undefined;
    scanId?: string | undefined;
    isMeInResponse?: boolean | undefined;
}>;
export declare class GetAccountPromptResponsesQueryDto extends GetAccountPromptResponsesQueryDto_base {
}
export declare const PromptResultsDataSchema: z.ZodObject<{
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
}>;
export declare const TelepromptRequestSchema: z.ZodObject<{
    prompt: z.ZodString;
    providers: z.ZodArray<z.ZodString, "many">;
    promptId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    providers: string[];
    promptId?: string | undefined;
}, {
    prompt: string;
    providers: string[];
    promptId?: string | undefined;
}>;
export declare const PromptDataSchema: z.ZodObject<{
    id: z.ZodString;
    prompt: z.ZodString;
    type: z.ZodNativeEnum<typeof PromptType>;
    meInPrompt: z.ZodBoolean;
    topic: z.ZodObject<{
        id: z.ZodNullable<z.ZodString>;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string | null;
    }, {
        name: string;
        id: string | null;
    }>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ratingScore: z.ZodOptional<z.ZodNumber>;
    language: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    generationId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    avgVisibility: z.ZodOptional<z.ZodNumber>;
    avgSentimentScore: z.ZodOptional<z.ZodNumber>;
    volume: z.ZodOptional<z.ZodNumber>;
    state: z.ZodNativeEnum<typeof PromptState>;
    active: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    prompt: string;
    topic: {
        name: string;
        id: string | null;
    };
    type: PromptType;
    meInPrompt: boolean;
    state: PromptState;
    active?: boolean | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: Date | null | undefined;
    language?: string | null | undefined;
    generationId?: string | null | undefined;
    ratingScore?: number | undefined;
    regions?: string[] | undefined;
    avgVisibility?: number | undefined;
    avgSentimentScore?: number | undefined;
    volume?: number | undefined;
}, {
    id: string;
    prompt: string;
    topic: {
        name: string;
        id: string | null;
    };
    type: PromptType;
    meInPrompt: boolean;
    state: PromptState;
    active?: boolean | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: Date | null | undefined;
    language?: string | null | undefined;
    generationId?: string | null | undefined;
    ratingScore?: number | undefined;
    regions?: string[] | undefined;
    avgVisibility?: number | undefined;
    avgSentimentScore?: number | undefined;
    volume?: number | undefined;
}>;
export declare const UpdatePromptRequestSchema: z.ZodObject<{
    prompt: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    state: z.ZodOptional<z.ZodNativeEnum<typeof PromptState>>;
}, "strip", z.ZodTypeAny, {
    prompt?: string | undefined;
    type?: string | undefined;
    state?: PromptState | undefined;
    regions?: string[] | undefined;
}, {
    prompt?: string | undefined;
    type?: string | undefined;
    state?: PromptState | undefined;
    regions?: string[] | undefined;
}>;
export declare const CreatePromptRequestSchema: z.ZodObject<{
    prompt: z.ZodString;
    type: z.ZodNativeEnum<typeof PromptType>;
    regions: z.ZodArray<z.ZodString, "many">;
    topic: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    topic: {
        id: string;
    };
    type: PromptType;
    regions: string[];
}, {
    prompt: string;
    topic: {
        id: string;
    };
    type: PromptType;
    regions: string[];
}>;
export declare const GeneratePromptSuggestionsRequestSchema: z.ZodObject<{
    topicId: z.ZodString;
    numberOfPrompts: z.ZodNumber;
    intentType: z.ZodNativeEnum<typeof PromptIntentType>;
    promptType: z.ZodNativeEnum<typeof PromptType>;
    region: z.ZodString;
    language: z.ZodString;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    excludeWords: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    language: string;
    region: string;
    topicId: string;
    promptType: PromptType;
    numberOfPrompts: number;
    intentType: PromptIntentType;
    additionalInstructions?: string | undefined;
    excludeWords?: string | undefined;
}, {
    language: string;
    region: string;
    topicId: string;
    promptType: PromptType;
    numberOfPrompts: number;
    intentType: PromptIntentType;
    additionalInstructions?: string | undefined;
    excludeWords?: string | undefined;
}>;
export declare const CreatePromptsByTopicRequestSchema: z.ZodObject<{
    topicId: z.ZodString;
    region: z.ZodString;
    prompts: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    prompts: string[];
    region: string;
    topicId: string;
}, {
    prompts: string[];
    region: string;
    topicId: string;
}>;
declare const PromptResultsDataDto_base: import("nestjs-zod").ZodDto<{
    prompt: string;
    urls: string[];
    market_players: string[];
}, z.ZodObjectDef<{
    prompt: z.ZodString;
    market_players: z.ZodArray<z.ZodString, "many">;
    urls: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny>, {
    prompt: string;
    urls: string[];
    market_players: string[];
}>;
export declare class PromptResultsDataDto extends PromptResultsDataDto_base {
}
declare const TelepromptRequestDto_base: import("nestjs-zod").ZodDto<{
    prompt: string;
    providers: string[];
    promptId?: string | undefined;
}, z.ZodObjectDef<{
    prompt: z.ZodString;
    providers: z.ZodArray<z.ZodString, "many">;
    promptId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny>, {
    prompt: string;
    providers: string[];
    promptId?: string | undefined;
}>;
export declare class TelepromptRequestDto extends TelepromptRequestDto_base {
}
declare const PromptDataDto_base: import("nestjs-zod").ZodDto<{
    id: string;
    prompt: string;
    topic: {
        name: string;
        id: string | null;
    };
    type: PromptType;
    meInPrompt: boolean;
    state: PromptState;
    active?: boolean | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: Date | null | undefined;
    language?: string | null | undefined;
    generationId?: string | null | undefined;
    ratingScore?: number | undefined;
    regions?: string[] | undefined;
    avgVisibility?: number | undefined;
    avgSentimentScore?: number | undefined;
    volume?: number | undefined;
}, z.ZodObjectDef<{
    id: z.ZodString;
    prompt: z.ZodString;
    type: z.ZodNativeEnum<typeof PromptType>;
    meInPrompt: z.ZodBoolean;
    topic: z.ZodObject<{
        id: z.ZodNullable<z.ZodString>;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string | null;
    }, {
        name: string;
        id: string | null;
    }>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ratingScore: z.ZodOptional<z.ZodNumber>;
    language: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    generationId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    avgVisibility: z.ZodOptional<z.ZodNumber>;
    avgSentimentScore: z.ZodOptional<z.ZodNumber>;
    volume: z.ZodOptional<z.ZodNumber>;
    state: z.ZodNativeEnum<typeof PromptState>;
    active: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny>, {
    id: string;
    prompt: string;
    topic: {
        name: string;
        id: string | null;
    };
    type: PromptType;
    meInPrompt: boolean;
    state: PromptState;
    active?: boolean | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: Date | null | undefined;
    language?: string | null | undefined;
    generationId?: string | null | undefined;
    ratingScore?: number | undefined;
    regions?: string[] | undefined;
    avgVisibility?: number | undefined;
    avgSentimentScore?: number | undefined;
    volume?: number | undefined;
}>;
export declare class PromptDataDto extends PromptDataDto_base {
}
declare const UpdatePromptRequestDto_base: import("nestjs-zod").ZodDto<{
    prompt?: string | undefined;
    type?: string | undefined;
    state?: PromptState | undefined;
    regions?: string[] | undefined;
}, z.ZodObjectDef<{
    prompt: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    state: z.ZodOptional<z.ZodNativeEnum<typeof PromptState>>;
}, "strip", z.ZodTypeAny>, {
    prompt?: string | undefined;
    type?: string | undefined;
    state?: PromptState | undefined;
    regions?: string[] | undefined;
}>;
export declare class UpdatePromptRequestDto extends UpdatePromptRequestDto_base {
}
declare const CreatePromptRequestDto_base: import("nestjs-zod").ZodDto<{
    prompt: string;
    topic: {
        id: string;
    };
    type: PromptType;
    regions: string[];
}, z.ZodObjectDef<{
    prompt: z.ZodString;
    type: z.ZodNativeEnum<typeof PromptType>;
    regions: z.ZodArray<z.ZodString, "many">;
    topic: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny>, {
    prompt: string;
    topic: {
        id: string;
    };
    type: PromptType;
    regions: string[];
}>;
export declare class CreatePromptRequestDto extends CreatePromptRequestDto_base {
}
declare const GeneratePromptSuggestionsRequestDto_base: import("nestjs-zod").ZodDto<{
    language: string;
    region: string;
    topicId: string;
    promptType: PromptType;
    numberOfPrompts: number;
    intentType: PromptIntentType;
    additionalInstructions?: string | undefined;
    excludeWords?: string | undefined;
}, z.ZodObjectDef<{
    topicId: z.ZodString;
    numberOfPrompts: z.ZodNumber;
    intentType: z.ZodNativeEnum<typeof PromptIntentType>;
    promptType: z.ZodNativeEnum<typeof PromptType>;
    region: z.ZodString;
    language: z.ZodString;
    additionalInstructions: z.ZodOptional<z.ZodString>;
    excludeWords: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny>, {
    language: string;
    region: string;
    topicId: string;
    promptType: PromptType;
    numberOfPrompts: number;
    intentType: PromptIntentType;
    additionalInstructions?: string | undefined;
    excludeWords?: string | undefined;
}>;
export declare class GeneratePromptSuggestionsRequestDto extends GeneratePromptSuggestionsRequestDto_base {
}
declare const CreatePromptsByTopicRequestDto_base: import("nestjs-zod").ZodDto<{
    prompts: string[];
    region: string;
    topicId: string;
}, z.ZodObjectDef<{
    topicId: z.ZodString;
    region: z.ZodString;
    prompts: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny>, {
    prompts: string[];
    region: string;
    topicId: string;
}>;
export declare class CreatePromptsByTopicRequestDto extends CreatePromptsByTopicRequestDto_base {
}
export declare const mapPromptDtoToPrompt: (promptDto: PromptDataDto, accountId: string, topics?: Topic[]) => Prompt;
export {};
