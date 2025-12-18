import { z } from 'zod';
import { UserRole } from '@/model.enums';
export declare const GeographicRegionInformationSchema: z.ZodObject<{
    name: z.ZodString;
    country: z.ZodString;
    locale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    country: string;
    locale: string;
}, {
    name: string;
    country: string;
    locale: string;
}>;
export declare const UserProfileWithAccountMembershipsSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodString;
    isOnboarded: z.ZodBoolean;
    onboardingAccountId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isSystemAdmin: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    isAgency: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    userAccounts: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
        lastInsightsVisit: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        roles: UserRole[];
        lastInsightsVisit?: Date | null | undefined;
    }, {
        accountId: string;
        roles: UserRole[];
        lastInsightsVisit?: Date | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userAccounts: {
        accountId: string;
        roles: UserRole[];
        lastInsightsVisit?: Date | null | undefined;
    }[];
    isOnboarded: boolean;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
    isSystemAdmin?: boolean | null | undefined;
    isAgency?: boolean | null | undefined;
    onboardingAccountId?: string | null | undefined;
}, {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userAccounts: {
        accountId: string;
        roles: UserRole[];
        lastInsightsVisit?: Date | null | undefined;
    }[];
    isOnboarded: boolean;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
    isSystemAdmin?: boolean | null | undefined;
    isAgency?: boolean | null | undefined;
    onboardingAccountId?: string | null | undefined;
}>;
export declare const UserEntityWithRoleAssignmentsSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodString;
    roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
}, "strip", z.ZodTypeAny, {
    roles: UserRole[];
    id: string;
    email: string;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
}, {
    roles: UserRole[];
    id: string;
    email: string;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
}>;
export declare const CompleteUserDataWithAccountsSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodString;
    isOnboarded: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    userAccounts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        accountId: z.ZodString;
        roles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        accountId: string;
        roles: string[];
        id: string;
    }, {
        userId: string;
        accountId: string;
        roles: string[];
        id: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userAccounts: {
        userId: string;
        accountId: string;
        roles: string[];
        id: string;
    }[];
    isOnboarded: boolean;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
}, {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userAccounts: {
        userId: string;
        accountId: string;
        roles: string[];
        id: string;
    }[];
    isOnboarded: boolean;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
}>;
export declare const NewUserCreationRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    userAccounts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        roles: UserRole[];
    }, {
        accountId: string;
        roles: UserRole[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name?: string | undefined;
    lastName?: string | undefined;
    userAccounts?: {
        accountId: string;
        roles: UserRole[];
    }[] | undefined;
}, {
    email: string;
    name?: string | undefined;
    lastName?: string | undefined;
    userAccounts?: {
        accountId: string;
        roles: UserRole[];
    }[] | undefined;
}>;
export declare const UserRemovalRequestSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export declare const UserAccountAttachmentRequestSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">>;
}, "strip", z.ZodTypeAny, {
    email: string;
    roles?: UserRole[] | undefined;
    lastName?: string | undefined;
    firstName?: string | undefined;
}, {
    email: string;
    roles?: UserRole[] | undefined;
    lastName?: string | undefined;
    firstName?: string | undefined;
}>;
export declare const AccountTeamMemberAdditionRequestSchema: z.ZodObject<{
    email: z.ZodString;
    roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
}, "strip", z.ZodTypeAny, {
    roles: UserRole[];
    email: string;
}, {
    roles: UserRole[];
    email: string;
}>;
export declare const UserAccountDetachmentRequestSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export declare const UserRoleAssignmentUpdateRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
}, "strip", z.ZodTypeAny, {
    userId: string;
    roles: UserRole[];
}, {
    userId: string;
    roles: UserRole[];
}>;
declare const UserEntityWithRoleAssignmentsDto_base: import("nestjs-zod").ZodDto<{
    roles: UserRole[];
    id: string;
    email: string;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
}, z.ZodObjectDef<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodString;
    roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
}, "strip", z.ZodTypeAny>, {
    roles: UserRole[];
    id: string;
    email: string;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
}>;
export declare class UserEntityWithRoleAssignmentsDto extends UserEntityWithRoleAssignmentsDto_base {
}
declare const UserProfileWithAccountMembershipsDto_base: import("nestjs-zod").ZodDto<{
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userAccounts: {
        accountId: string;
        roles: UserRole[];
        lastInsightsVisit?: Date | null | undefined;
    }[];
    isOnboarded: boolean;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
    isSystemAdmin?: boolean | null | undefined;
    isAgency?: boolean | null | undefined;
    onboardingAccountId?: string | null | undefined;
}, z.ZodObjectDef<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodString;
    isOnboarded: z.ZodBoolean;
    onboardingAccountId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isSystemAdmin: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    isAgency: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    userAccounts: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
        lastInsightsVisit: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        roles: UserRole[];
        lastInsightsVisit?: Date | null | undefined;
    }, {
        accountId: string;
        roles: UserRole[];
        lastInsightsVisit?: Date | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userAccounts: {
        accountId: string;
        roles: UserRole[];
        lastInsightsVisit?: Date | null | undefined;
    }[];
    isOnboarded: boolean;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
    isSystemAdmin?: boolean | null | undefined;
    isAgency?: boolean | null | undefined;
    onboardingAccountId?: string | null | undefined;
}>;
export declare class UserProfileWithAccountMembershipsDto extends UserProfileWithAccountMembershipsDto_base {
}
declare const CompleteUserDataWithAccountsDto_base: import("nestjs-zod").ZodDto<{
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userAccounts: {
        userId: string;
        accountId: string;
        roles: string[];
        id: string;
    }[];
    isOnboarded: boolean;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
}, z.ZodObjectDef<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodString;
    isOnboarded: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    userAccounts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        accountId: z.ZodString;
        roles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        accountId: string;
        roles: string[];
        id: string;
    }, {
        userId: string;
        accountId: string;
        roles: string[];
        id: string;
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userAccounts: {
        userId: string;
        accountId: string;
        roles: string[];
        id: string;
    }[];
    isOnboarded: boolean;
    name?: string | null | undefined;
    lastName?: string | null | undefined;
}>;
export declare class CompleteUserDataWithAccountsDto extends CompleteUserDataWithAccountsDto_base {
}
declare const NewUserCreationRequestDto_base: import("nestjs-zod").ZodDto<{
    email: string;
    name?: string | undefined;
    lastName?: string | undefined;
    userAccounts?: {
        accountId: string;
        roles: UserRole[];
    }[] | undefined;
}, z.ZodObjectDef<{
    name: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    userAccounts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        roles: UserRole[];
    }, {
        accountId: string;
        roles: UserRole[];
    }>, "many">>;
}, "strip", z.ZodTypeAny>, {
    email: string;
    name?: string | undefined;
    lastName?: string | undefined;
    userAccounts?: {
        accountId: string;
        roles: UserRole[];
    }[] | undefined;
}>;
export declare class NewUserCreationRequestDto extends NewUserCreationRequestDto_base {
}
declare const UserRemovalRequestDto_base: import("nestjs-zod").ZodDto<{
    userId: string;
}, z.ZodObjectDef<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    userId: string;
}>;
export declare class UserRemovalRequestDto extends UserRemovalRequestDto_base {
}
declare const GeographicRegionInformationDto_base: import("nestjs-zod").ZodDto<{
    name: string;
    country: string;
    locale: string;
}, z.ZodObjectDef<{
    name: z.ZodString;
    country: z.ZodString;
    locale: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    name: string;
    country: string;
    locale: string;
}>;
export declare class GeographicRegionInformationDto extends GeographicRegionInformationDto_base {
}
declare const UserAccountAttachmentRequestDto_base: import("nestjs-zod").ZodDto<{
    email: string;
    roles?: UserRole[] | undefined;
    lastName?: string | undefined;
    firstName?: string | undefined;
}, z.ZodObjectDef<{
    email: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    roles: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">>;
}, "strip", z.ZodTypeAny>, {
    email: string;
    roles?: UserRole[] | undefined;
    lastName?: string | undefined;
    firstName?: string | undefined;
}>;
export declare class UserAccountAttachmentRequestDto extends UserAccountAttachmentRequestDto_base {
}
declare const UserAccountDetachmentRequestDto_base: import("nestjs-zod").ZodDto<{
    userId: string;
}, z.ZodObjectDef<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    userId: string;
}>;
export declare class UserAccountDetachmentRequestDto extends UserAccountDetachmentRequestDto_base {
}
declare const UserRoleAssignmentUpdateRequestDto_base: import("nestjs-zod").ZodDto<{
    userId: string;
    roles: UserRole[];
}, z.ZodObjectDef<{
    userId: z.ZodString;
    roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
}, "strip", z.ZodTypeAny>, {
    userId: string;
    roles: UserRole[];
}>;
export declare class UserRoleAssignmentUpdateRequestDto extends UserRoleAssignmentUpdateRequestDto_base {
}
export {};
