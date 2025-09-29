"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleAssignmentUpdateRequestDto = exports.UserAccountDetachmentRequestDto = exports.UserAccountAttachmentRequestDto = exports.GeographicRegionInformationDto = exports.UserRemovalRequestDto = exports.NewUserCreationRequestDto = exports.CompleteUserDataWithAccountsDto = exports.UserProfileWithAccountMembershipsDto = exports.UserEntityWithRoleAssignmentsDto = exports.UserRoleAssignmentUpdateRequestSchema = exports.UserAccountDetachmentRequestSchema = exports.AccountTeamMemberAdditionRequestSchema = exports.UserAccountAttachmentRequestSchema = exports.UserRemovalRequestSchema = exports.NewUserCreationRequestSchema = exports.CompleteUserDataWithAccountsSchema = exports.UserEntityWithRoleAssignmentsSchema = exports.UserProfileWithAccountMembershipsSchema = exports.GeographicRegionInformationSchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const model_enums_1 = require("../../model.enums");
exports.GeographicRegionInformationSchema = zod_1.z.object({
    name: zod_1.z.string(),
    country: zod_1.z.string(),
    locale: zod_1.z.string(),
});
exports.UserProfileWithAccountMembershipsSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional().nullable(),
    lastName: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string(),
    isOnboarded: zod_1.z.boolean(),
    onboardingAccountId: zod_1.z.string().optional().nullable(),
    isSystemAdmin: zod_1.z.boolean().optional().nullable(),
    isAgency: zod_1.z.boolean().optional().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    userAccounts: zod_1.z.array(zod_1.z.object({
        accountId: zod_1.z.string(),
        roles: zod_1.z.array(zod_1.z.nativeEnum(model_enums_1.UserRole)),
        lastInsightsVisit: zod_1.z.date().nullable().optional(),
    })),
});
exports.UserEntityWithRoleAssignmentsSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional().nullable(),
    lastName: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string(),
    roles: zod_1.z.array(zod_1.z.nativeEnum(model_enums_1.UserRole)),
});
exports.CompleteUserDataWithAccountsSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional().nullable(),
    lastName: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string(),
    isOnboarded: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    userAccounts: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        userId: zod_1.z.string(),
        accountId: zod_1.z.string(),
        roles: zod_1.z.array(zod_1.z.string()),
    })),
});
exports.NewUserCreationRequestSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    email: zod_1.z.string(),
    userAccounts: zod_1.z
        .array(zod_1.z.object({
        accountId: zod_1.z.string(),
        roles: zod_1.z.array(zod_1.z.nativeEnum(model_enums_1.UserRole)),
    }))
        .optional(),
});
exports.UserRemovalRequestSchema = zod_1.z.object({
    userId: zod_1.z.string(),
});
exports.UserAccountAttachmentRequestSchema = zod_1.z.object({
    email: zod_1.z.string(),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    roles: zod_1.z.array(zod_1.z.nativeEnum(model_enums_1.UserRole)).optional(),
});
exports.AccountTeamMemberAdditionRequestSchema = zod_1.z.object({
    email: zod_1.z.string(),
    roles: zod_1.z.array(zod_1.z.nativeEnum(model_enums_1.UserRole)),
});
exports.UserAccountDetachmentRequestSchema = zod_1.z.object({
    userId: zod_1.z.string(),
});
exports.UserRoleAssignmentUpdateRequestSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    roles: zod_1.z.array(zod_1.z.nativeEnum(model_enums_1.UserRole)),
});
class UserEntityWithRoleAssignmentsDto extends (0, nestjs_zod_1.createZodDto)(exports.UserEntityWithRoleAssignmentsSchema) {
}
exports.UserEntityWithRoleAssignmentsDto = UserEntityWithRoleAssignmentsDto;
class UserProfileWithAccountMembershipsDto extends (0, nestjs_zod_1.createZodDto)(exports.UserProfileWithAccountMembershipsSchema) {
}
exports.UserProfileWithAccountMembershipsDto = UserProfileWithAccountMembershipsDto;
class CompleteUserDataWithAccountsDto extends (0, nestjs_zod_1.createZodDto)(exports.CompleteUserDataWithAccountsSchema) {
}
exports.CompleteUserDataWithAccountsDto = CompleteUserDataWithAccountsDto;
class NewUserCreationRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.NewUserCreationRequestSchema) {
}
exports.NewUserCreationRequestDto = NewUserCreationRequestDto;
class UserRemovalRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.UserRemovalRequestSchema) {
}
exports.UserRemovalRequestDto = UserRemovalRequestDto;
class GeographicRegionInformationDto extends (0, nestjs_zod_1.createZodDto)(exports.GeographicRegionInformationSchema) {
}
exports.GeographicRegionInformationDto = GeographicRegionInformationDto;
class UserAccountAttachmentRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.UserAccountAttachmentRequestSchema) {
}
exports.UserAccountAttachmentRequestDto = UserAccountAttachmentRequestDto;
class UserAccountDetachmentRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.UserAccountDetachmentRequestSchema) {
}
exports.UserAccountDetachmentRequestDto = UserAccountDetachmentRequestDto;
class UserRoleAssignmentUpdateRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.UserRoleAssignmentUpdateRequestSchema) {
}
exports.UserRoleAssignmentUpdateRequestDto = UserRoleAssignmentUpdateRequestDto;
//# sourceMappingURL=user.dto.js.map