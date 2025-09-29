import { z } from 'zod';
export declare const TrackedRecommendationEntitySchema: z.ZodObject<{
    id: z.ZodString;
    recommendationId: z.ZodNullable<z.ZodString>;
    accountId: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    urls: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    accountId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    recommendationId: string | null;
    urls: string[];
}, {
    accountId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    recommendationId: string | null;
    urls: string[];
}>;
export type TrackedRecommendationEntityType = z.infer<typeof TrackedRecommendationEntitySchema>;
declare const TrackedRecommendationEntityDto_base: import("nestjs-zod").ZodDto<{
    accountId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    recommendationId: string | null;
    urls: string[];
}, z.ZodObjectDef<{
    id: z.ZodString;
    recommendationId: z.ZodNullable<z.ZodString>;
    accountId: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    urls: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny>, {
    accountId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    recommendationId: string | null;
    urls: string[];
}>;
export declare class TrackedRecommendationEntityDto extends TrackedRecommendationEntityDto_base {
}
export declare const TrackedRecommendationCreationRequestSchema: z.ZodObject<{
    recommendationId: z.ZodOptional<z.ZodString>;
    urls: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    urls: string[];
    recommendationId?: string | undefined;
}, {
    urls: string[];
    recommendationId?: string | undefined;
}>;
declare const TrackedRecommendationCreationRequestDto_base: import("nestjs-zod").ZodDto<{
    urls: string[];
    recommendationId?: string | undefined;
}, z.ZodObjectDef<{
    recommendationId: z.ZodOptional<z.ZodString>;
    urls: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny>, {
    urls: string[];
    recommendationId?: string | undefined;
}>;
export declare class TrackedRecommendationCreationRequestDto extends TrackedRecommendationCreationRequestDto_base {
}
export declare const TrackedRecommendationUpdateRequestSchema: z.ZodObject<{
    urls: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    urls: string[];
}, {
    urls: string[];
}>;
declare const TrackedRecommendationUpdateRequestDto_base: import("nestjs-zod").ZodDto<{
    urls: string[];
}, z.ZodObjectDef<{
    urls: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny>, {
    urls: string[];
}>;
export declare class TrackedRecommendationUpdateRequestDto extends TrackedRecommendationUpdateRequestDto_base {
}
export declare const TrackedRecommendationWithFullRecommendationSchema: z.ZodObject<{
    id: z.ZodString;
    recommendationId: z.ZodNullable<z.ZodString>;
    accountId: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    urls: z.ZodArray<z.ZodString, "many">;
} & {
    recommendation: z.ZodNullable<z.ZodObject<{
        title: z.ZodString;
        type: z.ZodNativeEnum<typeof import("../../model.enums").RecommendationType>;
        effectiveness: z.ZodNativeEnum<typeof import("../../model.enums").ImpactLevels>;
        description: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        topic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        easyToDo: z.ZodDefault<z.ZodBoolean>;
        insight: z.ZodString;
        trackable: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodDefault<z.ZodNativeEnum<typeof import("../../model.enums").RecommendationStatus>>;
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
        status: import("../../model.enums").RecommendationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
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
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
        status?: import("../../model.enums").RecommendationStatus | undefined;
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
    }>>;
}, "strip", z.ZodTypeAny, {
    accountId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    recommendation: {
        description: string;
        title: string;
        status: import("../../model.enums").RecommendationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
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
    } | null;
    recommendationId: string | null;
    urls: string[];
}, {
    accountId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    recommendation: {
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
        status?: import("../../model.enums").RecommendationStatus | undefined;
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
    } | null;
    recommendationId: string | null;
    urls: string[];
}>;
export type TrackedRecommendationWithFullRecommendationType = z.infer<typeof TrackedRecommendationWithFullRecommendationSchema>;
declare const TrackedRecommendationWithFullRecommendationDto_base: import("nestjs-zod").ZodDto<{
    accountId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    recommendation: {
        description: string;
        title: string;
        status: import("../../model.enums").RecommendationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
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
    } | null;
    recommendationId: string | null;
    urls: string[];
}, z.ZodObjectDef<{
    id: z.ZodString;
    recommendationId: z.ZodNullable<z.ZodString>;
    accountId: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    urls: z.ZodArray<z.ZodString, "many">;
} & {
    recommendation: z.ZodNullable<z.ZodObject<{
        title: z.ZodString;
        type: z.ZodNativeEnum<typeof import("../../model.enums").RecommendationType>;
        effectiveness: z.ZodNativeEnum<typeof import("../../model.enums").ImpactLevels>;
        description: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        topic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        easyToDo: z.ZodDefault<z.ZodBoolean>;
        insight: z.ZodString;
        trackable: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodDefault<z.ZodNativeEnum<typeof import("../../model.enums").RecommendationStatus>>;
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
        status: import("../../model.enums").RecommendationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
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
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
        status?: import("../../model.enums").RecommendationStatus | undefined;
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
    }>>;
}, "strip", z.ZodTypeAny>, {
    accountId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    recommendation: {
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
        status?: import("../../model.enums").RecommendationStatus | undefined;
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
    } | null;
    recommendationId: string | null;
    urls: string[];
}>;
export declare class TrackedRecommendationWithFullRecommendationDto extends TrackedRecommendationWithFullRecommendationDto_base {
}
export declare const RecommendationImplementationAnalyticsSchema: z.ZodObject<{
    tracked_recommendation_id: z.ZodString;
    last_average: z.ZodUnion<[z.ZodNumber, z.ZodBigInt, z.ZodNull]>;
    new_average: z.ZodNullable<z.ZodNumber>;
    trend_percentage: z.ZodNullable<z.ZodNumber>;
    total_appearances_after_implementation: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    tracked_recommendation_id: string;
    last_average: number | bigint | null;
    new_average: number | null;
    trend_percentage: number | null;
    total_appearances_after_implementation: number;
}, {
    tracked_recommendation_id: string;
    last_average: number | bigint | null;
    new_average: number | null;
    trend_percentage: number | null;
    total_appearances_after_implementation: number;
}>;
export type RecommendationImplementationAnalyticsType = z.infer<typeof RecommendationImplementationAnalyticsSchema>;
export declare const RecommendationAnalyticsOverviewSchema: z.ZodObject<{
    tracked: z.ZodObject<{
        id: z.ZodString;
        recommendationId: z.ZodNullable<z.ZodString>;
        accountId: z.ZodString;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        urls: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    }, {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    }>;
    recommendation: z.ZodNullable<z.ZodObject<{
        title: z.ZodString;
        type: z.ZodNativeEnum<typeof import("../../model.enums").RecommendationType>;
        effectiveness: z.ZodNativeEnum<typeof import("../../model.enums").ImpactLevels>;
        description: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        topic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        easyToDo: z.ZodDefault<z.ZodBoolean>;
        insight: z.ZodString;
        trackable: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodDefault<z.ZodNativeEnum<typeof import("../../model.enums").RecommendationStatus>>;
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
        status: import("../../model.enums").RecommendationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
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
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
        status?: import("../../model.enums").RecommendationStatus | undefined;
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
    }>>;
    analytics: z.ZodObject<{
        tracked_recommendation_id: z.ZodString;
        last_average: z.ZodUnion<[z.ZodNumber, z.ZodBigInt, z.ZodNull]>;
        new_average: z.ZodNullable<z.ZodNumber>;
        trend_percentage: z.ZodNullable<z.ZodNumber>;
        total_appearances_after_implementation: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        tracked_recommendation_id: string;
        last_average: number | bigint | null;
        new_average: number | null;
        trend_percentage: number | null;
        total_appearances_after_implementation: number;
    }, {
        tracked_recommendation_id: string;
        last_average: number | bigint | null;
        new_average: number | null;
        trend_percentage: number | null;
        total_appearances_after_implementation: number;
    }>;
}, "strip", z.ZodTypeAny, {
    recommendation: {
        description: string;
        title: string;
        status: import("../../model.enums").RecommendationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
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
    } | null;
    tracked: {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    };
    analytics: {
        tracked_recommendation_id: string;
        last_average: number | bigint | null;
        new_average: number | null;
        trend_percentage: number | null;
        total_appearances_after_implementation: number;
    };
}, {
    recommendation: {
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
        status?: import("../../model.enums").RecommendationStatus | undefined;
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
    } | null;
    tracked: {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    };
    analytics: {
        tracked_recommendation_id: string;
        last_average: number | bigint | null;
        new_average: number | null;
        trend_percentage: number | null;
        total_appearances_after_implementation: number;
    };
}>;
export type RecommendationAnalyticsOverviewType = z.infer<typeof RecommendationAnalyticsOverviewSchema>;
declare const RecommendationAnalyticsOverviewDto_base: import("nestjs-zod").ZodDto<{
    recommendation: {
        description: string;
        title: string;
        status: import("../../model.enums").RecommendationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
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
    } | null;
    tracked: {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    };
    analytics: {
        tracked_recommendation_id: string;
        last_average: number | bigint | null;
        new_average: number | null;
        trend_percentage: number | null;
        total_appearances_after_implementation: number;
    };
}, z.ZodObjectDef<{
    tracked: z.ZodObject<{
        id: z.ZodString;
        recommendationId: z.ZodNullable<z.ZodString>;
        accountId: z.ZodString;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        urls: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    }, {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    }>;
    recommendation: z.ZodNullable<z.ZodObject<{
        title: z.ZodString;
        type: z.ZodNativeEnum<typeof import("../../model.enums").RecommendationType>;
        effectiveness: z.ZodNativeEnum<typeof import("../../model.enums").ImpactLevels>;
        description: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        topic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        easyToDo: z.ZodDefault<z.ZodBoolean>;
        insight: z.ZodString;
        trackable: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodDefault<z.ZodNativeEnum<typeof import("../../model.enums").RecommendationStatus>>;
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
        status: import("../../model.enums").RecommendationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
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
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
        status?: import("../../model.enums").RecommendationStatus | undefined;
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
    }>>;
    analytics: z.ZodObject<{
        tracked_recommendation_id: z.ZodString;
        last_average: z.ZodUnion<[z.ZodNumber, z.ZodBigInt, z.ZodNull]>;
        new_average: z.ZodNullable<z.ZodNumber>;
        trend_percentage: z.ZodNullable<z.ZodNumber>;
        total_appearances_after_implementation: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        tracked_recommendation_id: string;
        last_average: number | bigint | null;
        new_average: number | null;
        trend_percentage: number | null;
        total_appearances_after_implementation: number;
    }, {
        tracked_recommendation_id: string;
        last_average: number | bigint | null;
        new_average: number | null;
        trend_percentage: number | null;
        total_appearances_after_implementation: number;
    }>;
}, "strip", z.ZodTypeAny>, {
    recommendation: {
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        type: import("../../model.enums").RecommendationType;
        insight: string;
        isActive: boolean;
        effectiveness: import("../../model.enums").ImpactLevels;
        status?: import("../../model.enums").RecommendationStatus | undefined;
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
    } | null;
    tracked: {
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    };
    analytics: {
        tracked_recommendation_id: string;
        last_average: number | bigint | null;
        new_average: number | null;
        trend_percentage: number | null;
        total_appearances_after_implementation: number;
    };
}>;
export declare class RecommendationAnalyticsOverviewDto extends RecommendationAnalyticsOverviewDto_base {
}
export {};
