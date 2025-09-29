"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const config_service_1 = require("../config/config.service");
const descope_service_1 = require("./descope.service");
const role_based_auth_guard_1 = require("./role-based-auth.guard");
const db_user_auth_guard_1 = require("./db.user.auth.guard");
const core_module_1 = require("../core/core.module");
const nestjs_cls_1 = require("nestjs-cls");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_cls_1.ClsModule.forRoot({
                middleware: { mount: true },
            }),
            config_1.ConfigModule,
            core_module_1.CoreModule,
        ],
        providers: [
            config_service_1.ConfigService,
            descope_service_1.DescopeService,
            role_based_auth_guard_1.RoleBasedAuthGuard,
            db_user_auth_guard_1.DBUserAuthGuard,
        ],
        exports: [role_based_auth_guard_1.RoleBasedAuthGuard, db_user_auth_guard_1.DBUserAuthGuard, descope_service_1.DescopeService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map