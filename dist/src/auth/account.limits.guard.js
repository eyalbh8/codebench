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
exports.LimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../prisma/prisma.service");
const limit_check_decorator_1 = require("./limit-check.decorator");
const model_enums_1 = require("../model.enums");
let LimitGuard = class LimitGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const limitOptions = this.reflector.get(limit_check_decorator_1.LIMIT_CHECK_KEY, context.getHandler());
        if (!limitOptions)
            return true;
        const req = context.switchToHttp().getRequest();
        const user = req.descopeUser;
        const accountId = user?.accountId;
        if (!accountId) {
            throw new common_1.ForbiddenException('Missing account ID');
        }
        const accountSettings = await this.prisma.accountSettings.findUnique({
            where: { accountId },
        });
        const prompts = await this.prisma.prompt.count({
            where: {
                accountId,
                state: model_enums_1.PromptState.ACTIVE,
            },
        });
        if (!accountSettings || !prompts) {
            throw new common_1.ForbiddenException('Missing usage or settings');
        }
        if (accountSettings.promptLimit == null) {
            throw new common_1.ForbiddenException('Prompt limit not set');
        }
        if (limitOptions.promptsLimit && prompts >= accountSettings.promptLimit) {
            throw new common_1.ForbiddenException('Prompt limit exceeded');
        }
        if (accountSettings.regionLimit == null) {
            throw new common_1.ForbiddenException('Region limit not set');
        }
        if (limitOptions.regionsLimit &&
            accountSettings.regions.length >= accountSettings.regionLimit) {
            throw new common_1.ForbiddenException('Region limit exceeded');
        }
        return true;
    }
};
exports.LimitGuard = LimitGuard;
exports.LimitGuard = LimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], LimitGuard);
//# sourceMappingURL=account.limits.guard.js.map