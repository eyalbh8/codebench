import { PromptType, Provider } from '@/model.enums';
import { z, ZodType } from 'zod';
export declare const FilterValuesSchema: <T extends ZodType>(type: T) => z.ZodArray<T, "many">;
export declare const FiltersSchema: z.ZodObject<{
    countries: z.ZodArray<z.ZodString, "many">;
    topics: z.ZodArray<z.ZodString, "many">;
    meInPrompt: z.ZodArray<z.ZodEnum<["AccountIncluded", "AccountNotIncluded"]>, "many">;
    promptTypes: z.ZodArray<z.ZodNativeEnum<typeof PromptType>, "many">;
    aiEngines: z.ZodArray<z.ZodNativeEnum<typeof Provider>, "many">;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    topics: string[];
    countries: string[];
    meInPrompt: ("AccountIncluded" | "AccountNotIncluded")[];
    promptTypes: PromptType[];
    aiEngines: Provider[];
    tags: string[];
}, {
    topics: string[];
    countries: string[];
    meInPrompt: ("AccountIncluded" | "AccountNotIncluded")[];
    promptTypes: PromptType[];
    aiEngines: Provider[];
    tags: string[];
}>;
export type Filters = z.infer<typeof FiltersSchema>;
declare const FiltersParamsDto_base: import("nestjs-zod").ZodDto<{
    topics: string[];
    countries: string[];
    meInPrompt: ("AccountIncluded" | "AccountNotIncluded")[];
    promptTypes: PromptType[];
    aiEngines: Provider[];
    tags: string[];
}, z.ZodObjectDef<{
    countries: z.ZodArray<z.ZodString, "many">;
    topics: z.ZodArray<z.ZodString, "many">;
    meInPrompt: z.ZodArray<z.ZodEnum<["AccountIncluded", "AccountNotIncluded"]>, "many">;
    promptTypes: z.ZodArray<z.ZodNativeEnum<typeof PromptType>, "many">;
    aiEngines: z.ZodArray<z.ZodNativeEnum<typeof Provider>, "many">;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny>, {
    topics: string[];
    countries: string[];
    meInPrompt: ("AccountIncluded" | "AccountNotIncluded")[];
    promptTypes: PromptType[];
    aiEngines: Provider[];
    tags: string[];
}>;
export declare class FiltersParamsDto extends FiltersParamsDto_base {
}
export {};
