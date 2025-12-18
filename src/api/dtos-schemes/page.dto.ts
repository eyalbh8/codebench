import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema for a single page with its metadata and associated prompts
 */
export const PageSchema = z.object({
  title: z.string(),
  url: z.string(),
  domain: z.string(),
  occurrences: z.number().nullable(),
  occurrencesDelta: z.number().nullable(),
  lastUpdated: z.date(),
  prompts: z.array(
    z.union([
      z.string(),
      z.object({
        prompt: z.string(),
        promptId: z.string(),
      }),
    ]),
  ),
});

/**
 * Schema for page result data with metadata and prompts
 */
export const PageSchemaResult = z.object({
  title: z.string(),
  url: z.string(),
  domain: z.string(),
  occurrences: z.number().nullable(),
  occurrencesDelta: z.number().nullable(),
  lastUpdated: z.date(),
  prompts: z.array(
    z.union([
      z.string(),
      z.object({
        prompt: z.string(),
        promptId: z.string(),
      }),
    ]),
  ),
});

/**
 * Schema for a group of pages aggregated by domain
 */
export const PageGroupSchema = z.object({
  title: z.string(),
  domain: z.string(),
  occurrences: z.number().nullable(),
  occurrencesDelta: z.number().nullable(),
  lastUpdated: z.date(),
  pages: z.array(PageSchema),
});
export type PageType = z.infer<typeof PageSchema>;
export type PageTypeResult = z.infer<typeof PageSchemaResult>;
export type PageGroupType = z.infer<typeof PageGroupSchema>;

/**
 * Data Transfer Object for a single page with metadata and associated prompts
 */
export class PageDataDto extends createZodDto(PageSchema) {}

/**
 * Data Transfer Object for a group of pages aggregated by domain
 */
export class PageGroupDataDto extends createZodDto(PageGroupSchema) {}
