export declare enum Role {
    OWNER = "owner",
    USER = "user",
    ACCOUNT_ADMIN = "account_admin",
    SYSTEM_ADMIN = "system_admin",
    MACHINE = "machine"
}
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const ROLE_HIERARCHY: Record<Role, Role[]>;
