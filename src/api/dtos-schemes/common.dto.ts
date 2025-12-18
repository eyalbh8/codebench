import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema for pagination parameters (limit and offset)
 */
export const PaginationSchema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

/**
 * Schema for count result containing a numeric count value
 */
export const CountResultSchema = z.object({
  count: z.coerce.number(),
});

export const NomineeSchema = z.object({
  entity: z.string(),
  entitySiteUrl: z.string(),
  count: z.number(),
});

export type Nominee = z.infer<typeof NomineeSchema>;

export type CountResult = z.infer<typeof CountResultSchema>;

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Data Transfer Object for pagination parameters (limit and offset)
 */
export class PaginationParamsDto extends createZodDto(PaginationSchema) {}

/**
 * Data Transfer Object for count result containing a numeric count value
 */
export class CountResultDto extends createZodDto(CountResultSchema) {}
