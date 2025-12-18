import { z } from 'zod';
import { Provider } from '@/model.enums';
export declare const AccountConfigurationSettingsSchema: z.ZodObject<{
    accountId: z.ZodString;
    providers: z.ZodArray<z.ZodObject<{
        name: z.ZodNativeEnum<typeof Provider>;
        apiKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: Provider;
        apiKey?: string | undefined;
    }, {
        name: Provider;
        apiKey?: string | undefined;
    }>, "many">;
    regions: z.ZodArray<z.ZodString, "many">;
    entitiesConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    accountId: string;
    regions: string[];
    providers: {
        name: Provider;
        apiKey?: string | undefined;
    }[];
    entitiesConfig?: Record<string, string[]> | undefined;
}, {
    accountId: string;
    regions: string[];
    providers: {
        name: Provider;
        apiKey?: string | undefined;
    }[];
    entitiesConfig?: Record<string, string[]> | undefined;
}>;
export type AccountConfigurationSettingsType = z.infer<typeof AccountConfigurationSettingsSchema>;
declare const AccountConfigurationSettingsDto_base: import("nestjs-zod").ZodDto<{
    accountId: string;
    regions: string[];
    providers: {
        name: Provider;
        apiKey?: string | undefined;
    }[];
    entitiesConfig?: Record<string, string[]> | undefined;
}, z.ZodObjectDef<{
    accountId: z.ZodString;
    providers: z.ZodArray<z.ZodObject<{
        name: z.ZodNativeEnum<typeof Provider>;
        apiKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: Provider;
        apiKey?: string | undefined;
    }, {
        name: Provider;
        apiKey?: string | undefined;
    }>, "many">;
    regions: z.ZodArray<z.ZodString, "many">;
    entitiesConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny>, {
    accountId: string;
    regions: string[];
    providers: {
        name: Provider;
        apiKey?: string | undefined;
    }[];
    entitiesConfig?: Record<string, string[]> | undefined;
}>;
export declare class AccountConfigurationSettingsDto extends AccountConfigurationSettingsDto_base {
}
export {};
