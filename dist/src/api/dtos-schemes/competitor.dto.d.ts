import { z } from 'zod';
export declare const MergeCandidateSchema: z.ZodObject<{
    candidate: z.ZodString;
    entityId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    candidate: string;
    entityId: string;
}, {
    candidate: string;
    entityId: string;
}>;
export type MergeCandidate = z.infer<typeof MergeCandidateSchema>;
declare const MergeCandidateDataDto_base: import("nestjs-zod").ZodDto<{
    candidate: string;
    entityId: string;
}, z.ZodObjectDef<{
    candidate: z.ZodString;
    entityId: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    candidate: string;
    entityId: string;
}>;
export declare class MergeCandidateDataDto extends MergeCandidateDataDto_base {
}
export declare const CompetitorSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    site: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    advantage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id?: string | undefined;
    logo?: string | null | undefined;
    site?: string | null | undefined;
    advantage?: string | null | undefined;
}, {
    name: string;
    id?: string | undefined;
    logo?: string | null | undefined;
    site?: string | null | undefined;
    advantage?: string | null | undefined;
}>;
export declare const CompetitorPerformanceSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    site: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    advantage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    occurrences: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occurrencesDelta: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    topics: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    position: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sentimentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    historicalData: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        date: string;
    }, {
        value: number;
        date: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id?: string | undefined;
    logo?: string | null | undefined;
    topics?: string[] | null | undefined;
    site?: string | null | undefined;
    advantage?: string | null | undefined;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
    position?: number | null | undefined;
    sentimentScore?: number | null | undefined;
    historicalData?: {
        value: number;
        date: string;
    }[] | null | undefined;
}, {
    name: string;
    id?: string | undefined;
    logo?: string | null | undefined;
    topics?: string[] | null | undefined;
    site?: string | null | undefined;
    advantage?: string | null | undefined;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
    position?: number | null | undefined;
    sentimentScore?: number | null | undefined;
    historicalData?: {
        value: number;
        date: string;
    }[] | null | undefined;
}>;
export declare const NomineeDeleteSchema: z.ZodObject<{
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entity: string;
}, {
    entity: string;
}>;
export type Competitor = z.infer<typeof CompetitorSchema>;
export type CompetitorPerformance = z.infer<typeof CompetitorPerformanceSchema>;
declare const DeleteNomineeRequestDto_base: import("nestjs-zod").ZodDto<{
    entity: string;
}, z.ZodObjectDef<{
    entity: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    entity: string;
}>;
export declare class DeleteNomineeRequestDto extends DeleteNomineeRequestDto_base {
}
declare const CompetitorDataDto_base: import("nestjs-zod").ZodDto<{
    name: string;
    id?: string | undefined;
    logo?: string | null | undefined;
    site?: string | null | undefined;
    advantage?: string | null | undefined;
}, z.ZodObjectDef<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    site: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    advantage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny>, {
    name: string;
    id?: string | undefined;
    logo?: string | null | undefined;
    site?: string | null | undefined;
    advantage?: string | null | undefined;
}>;
export declare class CompetitorDataDto extends CompetitorDataDto_base {
}
declare const CompetitorPerformanceDataDto_base: import("nestjs-zod").ZodDto<{
    name: string;
    id?: string | undefined;
    logo?: string | null | undefined;
    topics?: string[] | null | undefined;
    site?: string | null | undefined;
    advantage?: string | null | undefined;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
    position?: number | null | undefined;
    sentimentScore?: number | null | undefined;
    historicalData?: {
        value: number;
        date: string;
    }[] | null | undefined;
}, z.ZodObjectDef<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    site: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    advantage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    occurrences: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occurrencesDelta: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    topics: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    position: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sentimentScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    historicalData: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        date: string;
    }, {
        value: number;
        date: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny>, {
    name: string;
    id?: string | undefined;
    logo?: string | null | undefined;
    topics?: string[] | null | undefined;
    site?: string | null | undefined;
    advantage?: string | null | undefined;
    occurrences?: number | null | undefined;
    occurrencesDelta?: number | null | undefined;
    position?: number | null | undefined;
    sentimentScore?: number | null | undefined;
    historicalData?: {
        value: number;
        date: string;
    }[] | null | undefined;
}>;
export declare class CompetitorPerformanceDataDto extends CompetitorPerformanceDataDto_base {
}
export declare const CandidateSchema: z.ZodObject<{
    entity: z.ZodString;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
    entity: string;
}, {
    count: number;
    entity: string;
}>;
export type Candidate = z.infer<typeof CandidateSchema>;
declare const CandidateDataDto_base: import("nestjs-zod").ZodDto<{
    count: number;
    entity: string;
}, z.ZodObjectDef<{
    entity: z.ZodString;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    count: number;
    entity: string;
}>;
export declare class CandidateDataDto extends CandidateDataDto_base {
}
export declare const SuggestedMergeEntitiesSchema: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
export type SuggestedMergeEntities = z.infer<typeof SuggestedMergeEntitiesSchema>;
declare const SuggestedMergeEntitiesDataDto_base: import("nestjs-zod").ZodDto<Record<string, string[]>, z.ZodRecordDef<z.ZodString, z.ZodArray<z.ZodString, "many">>, Record<string, string[]>>;
export declare class SuggestedMergeEntitiesDataDto extends SuggestedMergeEntitiesDataDto_base {
}
export {};
