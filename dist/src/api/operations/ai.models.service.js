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
exports.AiModelsService = exports.UsedStep = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const errors_1 = require("../../constants/errors");
const app_error_exception_1 = require("../../exceptions/app-error.exception");
var UsedStep;
(function (UsedStep) {
    UsedStep["LINKEDIN_CONTENT_POST_GENERATION"] = "linkedin_content_post_generation";
    UsedStep["X_CONTENT_POST_GENERATION"] = "x_content_post_generation";
    UsedStep["FACEBOOK_CONTENT_POST_GENERATION"] = "facebook_content_post_generation";
    UsedStep["INSTAGRAM_CONTENT_POST_GENERATION"] = "instagram_content_post_generation";
    UsedStep["PINTEREST_CONTENT_POST_GENERATION"] = "pinterest_content_post_generation";
    UsedStep["REDDIT_CONTENT_POST_GENERATION"] = "reddit_content_post_generation";
    UsedStep["LISTICLE_CONTENT_POST_GENERATION"] = "listicle_content_post_generation";
    UsedStep["BLOG_CONTENT_POST_GENERATION"] = "blog_content_post_generation";
})(UsedStep || (exports.UsedStep = UsedStep = {}));
let AiModelsService = class AiModelsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAiStepSettings(usedStep) {
        if (!usedStep) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.USED_STEP_NOT_FOUND);
        }
        const model = await this.prisma.aiSetting.findUnique({
            where: {
                usedStep,
            },
        });
        if (!model) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.USED_STEP_NOT_FOUND);
        }
        return model;
    }
    static renderTemplate(template, context) {
        return template
            .replace(/\$\{(\w+)\}/g, (_, key) => {
            if (key in context) {
                return context[key];
            }
            return `\${${key}}`;
        })
            .replace(/\{(\w+)\}/g, (_, key) => {
            if (key in context) {
                return context[key];
            }
            return `{${key}}`;
        });
    }
};
exports.AiModelsService = AiModelsService;
exports.AiModelsService = AiModelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiModelsService);
//# sourceMappingURL=ai.models.service.js.map