import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema for a merge candidate entity
 */
export const MergeCandidateSchema = z.object({
  candidate: z.string(),
  entityId: z.string(),
});

export type MergeCandidate = z.infer<typeof MergeCandidateSchema>;

/**
 * Data Transfer Object for a merge candidate entity
 */
export class MergeCandidateDataDto extends createZodDto(MergeCandidateSchema) {}

/**
 * Schema for basic competitor information
 */
export const CompetitorSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  site: z.string().nullish(),
  logo: z.string().nullish(),
  advantage: z.string().nullish(),
});

/**
 * Schema for competitor performance metrics including occurrences, sentiment, and historical data
 */
export const CompetitorPerformanceSchema = CompetitorSchema.extend({
  occurrences: z.number().nullish(),
  occurrencesDelta: z.number().nullish(),
  topics: z.array(z.string()).nullish(),
  position: z.number().nullish(),
  sentimentScore: z.number().nullish(),
  historicalData: z
    .array(
      z.object({
        date: z.string(),
        value: z.number(),
      }),
    )
    .nullish(),
});

/**
 * Schema for deleting a nominee entity
 */
export const NomineeDeleteSchema = z.object({
  entity: z.string(),
});

export type Competitor = z.infer<typeof CompetitorSchema>;
export type CompetitorPerformance = z.infer<typeof CompetitorPerformanceSchema>;

/**
 * Data Transfer Object for deleting a nominee entity
 */
export class DeleteNomineeRequestDto extends createZodDto(
  NomineeDeleteSchema,
) {}

/**
 * Data Transfer Object for basic competitor information
 */
export class CompetitorDataDto extends createZodDto(CompetitorSchema) {}

/**
 * Data Transfer Object for competitor performance metrics including occurrences, sentiment, and historical data
 */
export class CompetitorPerformanceDataDto extends createZodDto(
  CompetitorPerformanceSchema,
) {}

/**
 * Schema for a candidate entity with count
 */
export const CandidateSchema = z.object({
  entity: z.string(),
  count: z.number(),
});

export type Candidate = z.infer<typeof CandidateSchema>;

/**
 * Data Transfer Object for a candidate entity with count
 */
export class CandidateDataDto extends createZodDto(CandidateSchema) {}

/**
 * Schema for suggested merge entities mapping
 */
export const SuggestedMergeEntitiesSchema = z.record(
  z.string(),
  z.array(z.string()),
);

export type SuggestedMergeEntities = z.infer<
  typeof SuggestedMergeEntitiesSchema
>;

/**
 * Data Transfer Object for suggested merge entities mapping
 */
export class SuggestedMergeEntitiesDataDto extends createZodDto(
  SuggestedMergeEntitiesSchema,
) {}
