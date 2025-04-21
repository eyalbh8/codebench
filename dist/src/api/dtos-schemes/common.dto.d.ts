import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const CountResultSchema: z.ZodObject<{
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
}, {
    count: number;
}>;
export declare const NomineeSchema: z.ZodObject<{
    entity: z.ZodString;
    entitySiteUrl: z.ZodString;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
    entity: string;
    entitySiteUrl: string;
}, {
    count: number;
    entity: string;
    entitySiteUrl: string;
}>;
export type Nominee = z.infer<typeof NomineeSchema>;
export type CountResult = z.infer<typeof CountResultSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
declare const PaginationParamsDto_base: import("nestjs-zod").ZodDto<{
    limit?: number | undefined;
    offset?: number | undefined;
}, z.ZodObjectDef<{
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny>, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare class PaginationParamsDto extends PaginationParamsDto_base {
}
declare const CountResultDto_base: import("nestjs-zod").ZodDto<{
    count: number;
}, z.ZodObjectDef<{
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    count: number;
}>;
export declare class CountResultDto extends CountResultDto_base {
}
export {};
