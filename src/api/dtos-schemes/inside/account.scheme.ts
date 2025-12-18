import { createZodDto } from 'nestjs-zod';

import { z } from 'zod';

import { Provider } from '@/model.enums';

/**
 * Validation schema for account configuration settings
 * Defines AI provider configuration, regional settings, and entity mappings
 * Used for updating account operational parameters
 */
export const AccountConfigurationSettingsSchema = z.object({
  accountId: z.string().uuid(),
  providers: z.array(
    z.object({
      name: z.nativeEnum(Provider),
      apiKey: z.string().optional(),
    }),
  ),
  regions: z.array(z.string()),
  entitiesConfig: z.record(z.string(), z.array(z.string())).optional(),
});

/**
 * Type inference from account configuration settings schema
 * Represents the structure for account settings updates
 */
export type AccountConfigurationSettingsType = z.infer<
  typeof AccountConfigurationSettingsSchema
>;

/**
 * Data Transfer Object for account settings including providers, regions, and entity configuration
 * Validates and structures account configuration for settings management endpoints
 */
export class AccountConfigurationSettingsDto extends createZodDto(
  AccountConfigurationSettingsSchema,
) {}
