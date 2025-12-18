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
exports.AnalyticsAccountGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const app_logger_service_1 = require("../utils/app-logger.service");
const nestjs_cls_1 = require("nestjs-cls");
let AnalyticsAccountGuard = class AnalyticsAccountGuard {
    constructor(prismaService, cls, logger) {
        this.prismaService = prismaService;
        this.cls = cls;
        this.logger = logger;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        return await this.validateRequest(request);
    }
    async validateRequest(request) {
        const body = request.body;
        if (!body || !body.accountId) {
            this.logger.error(`AnalyticsAccountGuard - Missing account ID in request`);
            return false;
        }
        const accountId = request.body.accountId;
        const account = await this.prismaService.account.findUnique({
            where: { id: accountId },
        });
        if (!account) {
            this.logger.error(`AnalyticsAccountGuard - Account not found in database`);
            return false;
        }
        try {
            this.cls.set('accountId', accountId);
            this.cls.set('accountName', account.title);
        }
        catch (error) {
            this.logger.error(`AnalyticsAccountGuard - Error finding user in database ${error.message}`);
            return false;
        }
        return true;
    }
};
exports.AnalyticsAccountGuard = AnalyticsAccountGuard;
exports.AnalyticsAccountGuard = AnalyticsAccountGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_cls_1.ClsService,
        app_logger_service_1.AppLogger])
], AnalyticsAccountGuard);
//# sourceMappingURL=analytics.account.guard.js.map