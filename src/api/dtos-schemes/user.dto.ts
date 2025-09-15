import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserRole } from '@/model.enums';

/**
 * Validation schema for geographic region information
 * Contains region name, country identifier, and locale code
 */
export const GeographicRegionInformationSchema = z.object({
  name: z.string(),
  country: z.string(),
  locale: z.string(),
});

/**
 * Validation schema for user profile with associated account memberships
 * Includes user personal information and account-role relationships
 */
export const UserProfileWithAccountMembershipsSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string(),
  isOnboarded: z.boolean(),
  onboardingAccountId: z.string().optional().nullable(),
  isSystemAdmin: z.boolean().optional().nullable(),
  isAgency: z.boolean().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userAccounts: z.array(
    z.object({
      accountId: z.string(),
      roles: z.array(z.nativeEnum(UserRole)),
      lastInsightsVisit: z.date().nullable().optional(),
    }),
  ),
});

/**
 * Validation schema for user entity with role assignments
 * Represents user basic information with associated role permissions
 */
export const UserEntityWithRoleAssignmentsSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string(),
  roles: z.array(z.nativeEnum(UserRole)),
});

/**
 * Validation schema for complete user data with account relationships
 * Includes user profile and all account memberships with roles
 */
export const CompleteUserDataWithAccountsSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string(),
  isOnboarded: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userAccounts: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      accountId: z.string(),
      roles: z.array(z.string()),
    }),
  ),
});

/**
 * Validation schema for creating a new user account
 * Allows optional account assignments during user creation
 */
export const NewUserCreationRequestSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string(),
  userAccounts: z
    .array(
      z.object({
        accountId: z.string(),
        roles: z.array(z.nativeEnum(UserRole)),
      }),
    )
    .optional(),
});

/**
 * Validation schema for user removal/deletion request
 * Requires user identifier for targeted deletion
 */
export const UserRemovalRequestSchema = z.object({
  userId: z.string(),
});

/**
 * Validation schema for linking a user to an account
 * Supports user invitation by email with optional role assignment
 */
export const UserAccountAttachmentRequestSchema = z.object({
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roles: z.array(z.nativeEnum(UserRole)).optional(),
});

/**
 * Validation schema for adding user to account team
 * Requires explicit role specification for team membership
 */
export const AccountTeamMemberAdditionRequestSchema = z.object({
  email: z.string(),
  roles: z.array(z.nativeEnum(UserRole)),
});

/**
 * Validation schema for removing user from account
 * Disassociates user from account membership
 */
export const UserAccountDetachmentRequestSchema = z.object({
  userId: z.string(),
});

/**
 * Validation schema for updating user role assignments
 * Modifies user permissions within account context
 */
export const UserRoleAssignmentUpdateRequestSchema = z.object({
  userId: z.string(),
  roles: z.array(z.nativeEnum(UserRole)),
});

/**
 * Data Transfer Object for user entity with role assignments
 * Structures user data with role information for API responses
 */
export class UserEntityWithRoleAssignmentsDto extends createZodDto(
  UserEntityWithRoleAssignmentsSchema,
) {}

/**
 * Data Transfer Object for user profile with account memberships
 * Complete user profile including all account relationships
 */
export class UserProfileWithAccountMembershipsDto extends createZodDto(
  UserProfileWithAccountMembershipsSchema,
) {}

/**
 * Data Transfer Object for complete user data with accounts
 * Full user entity representation with nested account data
 */
export class CompleteUserDataWithAccountsDto extends createZodDto(
  CompleteUserDataWithAccountsSchema,
) {}

/**
 * Data Transfer Object for creating a new user
 * Validates user creation request payload
 */
export class NewUserCreationRequestDto extends createZodDto(
  NewUserCreationRequestSchema,
) {}

/**
 * Data Transfer Object for removing a user
 * Validates user deletion request parameters
 */
export class UserRemovalRequestDto extends createZodDto(
  UserRemovalRequestSchema,
) {}

/**
 * Data Transfer Object for geographic region information
 * Structures region data for API responses
 */
export class GeographicRegionInformationDto extends createZodDto(
  GeographicRegionInformationSchema,
) {}

/**
 * Data Transfer Object for attaching a user to an account
 * Validates user-account linking request
 */
export class UserAccountAttachmentRequestDto extends createZodDto(
  UserAccountAttachmentRequestSchema,
) {}

/**
 * Data Transfer Object for detaching a user from an account
 * Validates user-account disassociation request
 */
export class UserAccountDetachmentRequestDto extends createZodDto(
  UserAccountDetachmentRequestSchema,
) {}

/**
 * Data Transfer Object for updating user roles
 * Validates role modification request payload
 */
export class UserRoleAssignmentUpdateRequestDto extends createZodDto(
  UserRoleAssignmentUpdateRequestSchema,
) {}
