"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_service_1 = require("../../../config/config.service");
const llm_service_1 = require("../../operations/llm/llm.service");
const ai_models_service_1 = require("../../operations/ai.models.service");
const agents_control_1 = require("./agents.control");
const agent_service_1 = require("../../operations/agent.service");
const nestjs_cls_1 = require("nestjs-cls");
const auth_module_1 = require("../../../auth/auth.module");
const descope_service_1 = require("../../../auth/descope.service");
const social_media_content_generation_service_1 = require("../../operations/social-media-content-generation-service");
const core_module_1 = require("../../../core/core.module");
const x_service_1 = require("../../operations/x.service");
const social_media_connection_router_service_1 = require("../../operations/social-media-connection-router.service");
const facebook_service_1 = require("../../operations/facebook.service");
const pinterest_service_1 = require("../../operations/pinterest.service");
const reddit_service_1 = require("../../operations/reddit.service");
const blog_service_1 = require("../../operations/blog.service");
const instagram_service_1 = require("../../operations/instagram.service");
const linkedin_service_1 = require("../../operations/linkedin.service");
const openai_provider_1 = require("../../operations/llm/openai.provider");
const gemini_provider_1 = require("../../operations/llm/gemini.provider");
const recommendations_service_1 = require("../../operations/recommendations.service");
const tracked_insights_1 = require("../../operations/tracked-insights");
const content_validator_service_1 = require("../../operations/content-validator.service");
const blog_patterns_service_1 = require("../../operations/blog-patterns.service");
const competitors_service_1 = require("../../operations/competitors.service");
let AgentModule = class AgentModule {
};
exports.AgentModule = AgentModule;
exports.AgentModule = AgentModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, nestjs_cls_1.ClsModule, auth_module_1.AuthModule, core_module_1.CoreModule],
        controllers: [agents_control_1.AgentsController],
        providers: [
            config_service_1.ConfigService,
            llm_service_1.LlmService,
            ai_models_service_1.AiModelsService,
            agent_service_1.AgentService,
            descope_service_1.DescopeService,
            social_media_content_generation_service_1.SocialContentGenerationService,
            x_service_1.SocialMediaConnectionService,
            social_media_connection_router_service_1.SocialMediaConnectionRouterService,
            facebook_service_1.FacebookConnectionService,
            linkedin_service_1.LinkedInConnectionServices,
            reddit_service_1.RedditConnectionService,
            pinterest_service_1.PinterestConnectionService,
            instagram_service_1.InstagramConnectionServices,
            blog_service_1.BlogConnectionService,
            openai_provider_1.OpenaiProvider,
            gemini_provider_1.GeminiProvider,
            recommendations_service_1.RecommendationsService,
            tracked_insights_1.TrackedRecommendationsService,
            content_validator_service_1.FinalValidationService,
            blog_patterns_service_1.BlogPatternsService,
            competitors_service_1.CompetitorsOperations,
        ],
        exports: [agent_service_1.AgentService],
    })
], AgentModule);
//# sourceMappingURL=agents.moduls.js.map