"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemAdminAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../constants/errors");
const app_error_exception_1 = require("../exceptions/app-error.exception");
const app_logger_service_1 = require("../utils/app-logger.service");
let SystemAdminAuthGuard = class SystemAdminAuthGuard {
    constructor(logger) {
        this.logger = logger;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }
    validateRequest(request) {
        const user = request.user;
        if (!user) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.AUTH_USER_NOT_FOUND);
        }
        if (user.isSystemAdmin) {
            return true;
        }
        throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.SYSTEM_ASMIN_INSUFFICIENT_PERMISSIONS);
    }
};
exports.SystemAdminAuthGuard = SystemAdminAuthGuard;
exports.SystemAdminAuthGuard = SystemAdminAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_logger_service_1.AppLogger])
], SystemAdminAuthGuard);
//# sourceMappingURL=system-admin-auth.guard.js.map