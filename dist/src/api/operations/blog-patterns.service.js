"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPatternsService = void 0;
const common_1 = require("@nestjs/common");
const ai_models_service_1 = require("./ai.models.service");
let BlogPatternsService = class BlogPatternsService {
    getUsedStepForIntent(intent) {
        switch (intent) {
            case 'INFORMATIONAL':
                return ai_models_service_1.UsedStep.BLOG_CONTENT_POST_GENERATION;
            case 'COMMERCIAL':
                return ai_models_service_1.UsedStep.BLOG_CONTENT_POST_GENERATION;
            case 'NAVIGATIONAL':
                return ai_models_service_1.UsedStep.BLOG_CONTENT_POST_GENERATION;
            case 'TRANSACTIONAL':
                return ai_models_service_1.UsedStep.BLOG_CONTENT_POST_GENERATION;
            default:
                return ai_models_service_1.UsedStep.BLOG_CONTENT_POST_GENERATION;
        }
    }
};
exports.BlogPatternsService = BlogPatternsService;
exports.BlogPatternsService = BlogPatternsService = __decorate([
    (0, common_1.Injectable)()
], BlogPatternsService);
//# sourceMappingURL=blog-patterns.service.js.map