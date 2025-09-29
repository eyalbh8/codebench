import { z } from 'zod';
export declare const AsyncJobStatusResponseSchema: z.ZodObject<{
    message: z.ZodString;
    jobId: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    message: string;
    status?: string | undefined;
    id?: string | undefined;
    createdAt?: Date | undefined;
    type?: string | undefined;
    jobId?: string | undefined;
}, {
    message: string;
    status?: string | undefined;
    id?: string | undefined;
    createdAt?: Date | undefined;
    type?: string | undefined;
    jobId?: string | undefined;
}>;
export type AsyncJobStatusResponse = z.infer<typeof AsyncJobStatusResponseSchema>;
declare const AsyncJobStatusResponseDataDto_base: import("nestjs-zod").ZodDto<{
    message: string;
    status?: string | undefined;
    id?: string | undefined;
    createdAt?: Date | undefined;
    type?: string | undefined;
    jobId?: string | undefined;
}, z.ZodObjectDef<{
    message: z.ZodString;
    jobId: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny>, {
    message: string;
    status?: string | undefined;
    id?: string | undefined;
    createdAt?: Date | undefined;
    type?: string | undefined;
    jobId?: string | undefined;
}>;
export declare class AsyncJobStatusResponseDataDto extends AsyncJobStatusResponseDataDto_base {
}
export {};
