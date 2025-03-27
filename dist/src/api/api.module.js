"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("../auth/auth.module");
const descope_service_1 = require("../auth/descope.service");
const config_service_1 = require("../config/config.service");
const prisma_module_1 = require("../prisma/prisma.module");
const prisma_service_1 = require("../prisma/prisma.service");
const competitor_1 = require("./controllers/outgoing/competitor");
const recommendations_control_1 = require("./controllers/outgoing/recommendations.control");
const tracked_recommendations_controller_1 = require("./controllers/outgoing/tracked-recommendations.controller");
const users_controller_1 = require("./controllers/outgoing/users.controller");
const llm_calls_1 = require("./controllers/outgoing/llm.calls");
const accounts_service_1 = require("./operations/accounts.service");
const competitors_service_1 = require("./operations/competitors.service");
const lambda_service_1 = require("./operations/lambda.service");
const llm_service_1 = require("./operations/llm/llm.service");
const recommendations_service_1 = require("./operations/recommendations.service");
const users_service_1 = require("./operations/users.service");
const tracked_insights_1 = require("./operations/tracked-insights");
const descope_auth_guard_1 = require("../auth/descope.auth.guard");
const ai_models_service_1 = require("./operations/ai.models.service");
const common_module_1 = require("../common/common.module");
const core_module_1 = require("../core/core.module");
const nestjs_cls_1 = require("nestjs-cls");
const agents_moduls_1 = require("./controllers/outgoing/agents.moduls");
const openai_provider_1 = require("./operations/llm/openai.provider");
const gemini_provider_1 = require("./operations/llm/gemini.provider");
const content_validator_service_1 = require("./operations/content-validator.service");
const blog_patterns_service_1 = require("./operations/blog-patterns.service");
const llm_calls_operations_1 = require("./operations/llm-calls.operations");
let ApiModule = class ApiModule {
};
exports.ApiModule = ApiModule;
exports.ApiModule = ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
            axios_1.HttpModule,
            common_module_1.CommonModule,
            core_module_1.CoreModule,
            nestjs_cls_1.ClsModule.forRoot({
                middleware: { mount: true },
            }),
            agents_moduls_1.AgentModule,
        ],
        controllers: [
            recommendations_control_1.RecommendationsController,
            competitor_1.CompetitorsController,
            tracked_recommendations_controller_1.TrackedRecommendationsController,
            users_controller_1.UsersController,
            llm_calls_1.AccountLlmCallsController,
        ],
        providers: [
            descope_service_1.DescopeService,
            descope_auth_guard_1.DescopeAuthGuard,
            config_service_1.ConfigService,
            prisma_service_1.PrismaService,
            accounts_service_1.AccountsService,
            competitors_service_1.CompetitorsOperations,
            llm_service_1.LlmService,
            openai_provider_1.OpenaiProvider,
            gemini_provider_1.GeminiProvider,
            lambda_service_1.LambdaOperations,
            recommendations_service_1.RecommendationsService,
            tracked_insights_1.TrackedRecommendationsService,
            users_service_1.UsersService,
            ai_models_service_1.AiModelsService,
            content_validator_service_1.FinalValidationService,
            blog_patterns_service_1.BlogPatternsService,
            llm_calls_operations_1.LlmCallsOperations,
        ],
        exports: [accounts_service_1.AccountsService, config_service_1.ConfigService],
    })
], ApiModule);
//# sourceMappingURL=api.module.js.map