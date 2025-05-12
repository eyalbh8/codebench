import { ImpactLevels, RecommendationType, RecommendationStatus } from '@/model.enums';
import { z } from 'zod';
export declare const RecommendationBasePropertiesSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodNativeEnum<typeof RecommendationType>;
    effectiveness: z.ZodNativeEnum<typeof ImpactLevels>;
    description: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    topic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    easyToDo: z.ZodDefault<z.ZodBoolean>;
    insight: z.ZodString;
    trackable: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof RecommendationStatus>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    status: RecommendationStatus;
    type: RecommendationType;
    insight: string;
    effectiveness: ImpactLevels;
    easyToDo: boolean;
    trackable: boolean;
    topic?: string | null | undefined;
    publishedAt?: Date | null | undefined;
}, {
    description: string;
    title: string;
    type: RecommendationType;
    insight: string;
    effectiveness: ImpactLevels;
    status?: RecommendationStatus | undefined;
    topic?: string | null | undefined;
    publishedAt?: Date | null | undefined;
    easyToDo?: boolean | undefined;
    trackable?: boolean | undefined;
}>;
export declare const RecommendationDataSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodNativeEnum<typeof RecommendationType>;
    effectiveness: z.ZodNativeEnum<typeof ImpactLevels>;
    description: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    topic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    easyToDo: z.ZodDefault<z.ZodBoolean>;
    insight: z.ZodString;
    trackable: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof RecommendationStatus>>;
} & {
    id: z.ZodString;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    deletedAt: z.ZodNullable<z.ZodDate>;
    promptId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    prompt: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        accountId: z.ZodString;
        prompt: z.ZodString;
        type: z.ZodString;
        ratingScore: z.ZodNumber;
        meInPrompt: z.ZodBoolean;
        topicId: z.ZodString;
        regions: z.ZodArray<z.ZodString, "many">;
        language: z.ZodNullable<z.ZodString>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        deletedAt: z.ZodNullable<z.ZodDate>;
        state: z.ZodString;
        topic: z.ZodObject<{
            id: z.ZodString;
            accountId: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            isActive: z.ZodOptional<z.ZodBoolean>;
            createdAt: z.ZodOptional<z.ZodDate>;
            updatedAt: z.ZodOptional<z.ZodDate>;
            deletedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
            state: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        }, {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        language: string | null;
        prompt: string;
        topic: {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        };
        type: string;
        meInPrompt: boolean;
        state: string;
        ratingScore: number;
        topicId: string;
        regions: string[];
        isActive: boolean;
    }, {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        language: string | null;
        prompt: string;
        topic: {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        };
        type: string;
        meInPrompt: boolean;
        state: string;
        ratingScore: number;
        topicId: string;
        regions: string[];
        isActive: boolean;
    }>>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    status: RecommendationStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    type: RecommendationType;
    insight: string;
    isActive: boolean;
    effectiveness: ImpactLevels;
    easyToDo: boolean;
    trackable: boolean;
    prompt?: {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        language: string | null;
        prompt: string;
        topic: {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        };
        type: string;
        meInPrompt: boolean;
        state: string;
        ratingScore: number;
        topicId: string;
        regions: string[];
        isActive: boolean;
    } | null | undefined;
    topic?: string | null | undefined;
    publishedAt?: Date | null | undefined;
    promptId?: string | null | undefined;
}, {
    description: string;
    title: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    type: RecommendationType;
    insight: string;
    isActive: boolean;
    effectiveness: ImpactLevels;
    status?: RecommendationStatus | undefined;
    prompt?: {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        language: string | null;
        prompt: string;
        topic: {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        };
        type: string;
        meInPrompt: boolean;
        state: string;
        ratingScore: number;
        topicId: string;
        regions: string[];
        isActive: boolean;
    } | null | undefined;
    topic?: string | null | undefined;
    publishedAt?: Date | null | undefined;
    promptId?: string | null | undefined;
    easyToDo?: boolean | undefined;
    trackable?: boolean | undefined;
}>;
declare const RecommendationDataDto_base: import("nestjs-zod").ZodDto<{
    description: string;
    title: string;
    status: RecommendationStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    type: RecommendationType;
    insight: string;
    isActive: boolean;
    effectiveness: ImpactLevels;
    easyToDo: boolean;
    trackable: boolean;
    prompt?: {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        language: string | null;
        prompt: string;
        topic: {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        };
        type: string;
        meInPrompt: boolean;
        state: string;
        ratingScore: number;
        topicId: string;
        regions: string[];
        isActive: boolean;
    } | null | undefined;
    topic?: string | null | undefined;
    publishedAt?: Date | null | undefined;
    promptId?: string | null | undefined;
}, z.ZodObjectDef<{
    title: z.ZodString;
    type: z.ZodNativeEnum<typeof RecommendationType>;
    effectiveness: z.ZodNativeEnum<typeof ImpactLevels>;
    description: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    topic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    easyToDo: z.ZodDefault<z.ZodBoolean>;
    insight: z.ZodString;
    trackable: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof RecommendationStatus>>;
} & {
    id: z.ZodString;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    deletedAt: z.ZodNullable<z.ZodDate>;
    promptId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    prompt: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        accountId: z.ZodString;
        prompt: z.ZodString;
        type: z.ZodString;
        ratingScore: z.ZodNumber;
        meInPrompt: z.ZodBoolean;
        topicId: z.ZodString;
        regions: z.ZodArray<z.ZodString, "many">;
        language: z.ZodNullable<z.ZodString>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        deletedAt: z.ZodNullable<z.ZodDate>;
        state: z.ZodString;
        topic: z.ZodObject<{
            id: z.ZodString;
            accountId: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            isActive: z.ZodOptional<z.ZodBoolean>;
            createdAt: z.ZodOptional<z.ZodDate>;
            updatedAt: z.ZodOptional<z.ZodDate>;
            deletedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
            state: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        }, {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        language: string | null;
        prompt: string;
        topic: {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        };
        type: string;
        meInPrompt: boolean;
        state: string;
        ratingScore: number;
        topicId: string;
        regions: string[];
        isActive: boolean;
    }, {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        language: string | null;
        prompt: string;
        topic: {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        };
        type: string;
        meInPrompt: boolean;
        state: string;
        ratingScore: number;
        topicId: string;
        regions: string[];
        isActive: boolean;
    }>>>;
}, "strip", z.ZodTypeAny>, {
    description: string;
    title: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    type: RecommendationType;
    insight: string;
    isActive: boolean;
    effectiveness: ImpactLevels;
    status?: RecommendationStatus | undefined;
    prompt?: {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        language: string | null;
        prompt: string;
        topic: {
            name: string;
            id: string;
            description?: string | undefined;
            accountId?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            deletedAt?: Date | null | undefined;
            state?: string | undefined;
            isActive?: boolean | undefined;
        };
        type: string;
        meInPrompt: boolean;
        state: string;
        ratingScore: number;
        topicId: string;
        regions: string[];
        isActive: boolean;
    } | null | undefined;
    topic?: string | null | undefined;
    publishedAt?: Date | null | undefined;
    promptId?: string | null | undefined;
    easyToDo?: boolean | undefined;
    trackable?: boolean | undefined;
}>;
export declare class RecommendationDataDto extends RecommendationDataDto_base {
}
declare const RecommendationCreationRequestDto_base: import("nestjs-zod").ZodDto<{
    description: string;
    title: string;
    status: RecommendationStatus;
    type: RecommendationType;
    insight: string;
    effectiveness: ImpactLevels;
    easyToDo: boolean;
    trackable: boolean;
    topic?: string | null | undefined;
    publishedAt?: Date | null | undefined;
}, z.ZodObjectDef<{
    title: z.ZodString;
    type: z.ZodNativeEnum<typeof RecommendationType>;
    effectiveness: z.ZodNativeEnum<typeof ImpactLevels>;
    description: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    topic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    easyToDo: z.ZodDefault<z.ZodBoolean>;
    insight: z.ZodString;
    trackable: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof RecommendationStatus>>;
}, "strip", z.ZodTypeAny>, {
    description: string;
    title: string;
    type: RecommendationType;
    insight: string;
    effectiveness: ImpactLevels;
    status?: RecommendationStatus | undefined;
    topic?: string | null | undefined;
    publishedAt?: Date | null | undefined;
    easyToDo?: boolean | undefined;
    trackable?: boolean | undefined;
}>;
export declare class RecommendationCreationRequestDto extends RecommendationCreationRequestDto_base {
}
export declare const RecommendationsGenerationRequestSchema: z.ZodObject<{
    promptId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    promptId: string;
}, {
    promptId: string;
}>;
declare const RecommendationsGenerationRequestDto_base: import("nestjs-zod").ZodDto<{
    promptId: string;
}, z.ZodObjectDef<{
    promptId: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    promptId: string;
}>;
export declare class RecommendationsGenerationRequestDto extends RecommendationsGenerationRequestDto_base {
}
export declare const RecommendationStatusUpdateRequestSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof RecommendationStatus>;
    urls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: RecommendationStatus;
    urls?: string[] | undefined;
}, {
    status: RecommendationStatus;
    urls?: string[] | undefined;
}>;
declare const RecommendationStatusUpdateRequestDto_base: import("nestjs-zod").ZodDto<{
    status: RecommendationStatus;
    urls?: string[] | undefined;
}, z.ZodObjectDef<{
    status: z.ZodNativeEnum<typeof RecommendationStatus>;
    urls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny>, {
    status: RecommendationStatus;
    urls?: string[] | undefined;
}>;
export declare class RecommendationStatusUpdateRequestDto extends RecommendationStatusUpdateRequestDto_base {
}
export {};
