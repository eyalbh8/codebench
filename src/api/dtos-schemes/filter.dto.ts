import { PromptType, Provider } from '@/model.enums';
import { createZodDto } from 'nestjs-zod';
import { z, ZodType } from 'zod';

/**
 * Helper function to create a filter values schema for arrays
 */
export const FilterValuesSchema = <T extends ZodType>(type: T) => z.array(type);

/**
 * Schema for filter parameters including countries, topics, prompt types, AI engines, and tags
 */
export const FiltersSchema = z.object({
  countries: FilterValuesSchema(z.string()),
  topics: FilterValuesSchema(z.string()),
  meInPrompt: FilterValuesSchema(
    z.enum(['AccountIncluded', 'AccountNotIncluded']),
  ),
  promptTypes: FilterValuesSchema(z.nativeEnum(PromptType)),
  aiEngines: FilterValuesSchema(z.nativeEnum(Provider)),
  tags: FilterValuesSchema(z.string()),
});

export type Filters = z.infer<typeof FiltersSchema>;

/**
 * Data Transfer Object for filter parameters including countries, topics, prompt types, AI engines, and tags
 */
export class FiltersParamsDto extends createZodDto(FiltersSchema) {}
