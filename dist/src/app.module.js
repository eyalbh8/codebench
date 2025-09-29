"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const nestjs_zod_1 = require("nestjs-zod");
const api_module_1 = require("./api/api.module");
const auth_module_1 = require("./auth/auth.module");
const core_module_1 = require("./core/core.module");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const prisma_module_1 = require("./prisma/prisma.module");
const localtunnel_service_1 = require("./utils/localtunnel.service");
const config_service_1 = require("./config/config.service");
const app_logger_service_1 = require("./utils/app-logger.service");
const nestjs_cls_1 = require("nestjs-cls");
const log_interceptor_1 = require("./utils/log.interceptor");
const request_id_middleware_1 = require("./utils/request.id.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_id_middleware_1.RequestIdMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_cls_1.ClsModule.forRoot({
                middleware: { mount: true },
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            core_module_1.CoreModule,
            api_module_1.ApiModule,
            auth_module_1.AuthModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_PIPE,
                useClass: nestjs_zod_1.ZodValidationPipe,
            },
            { provide: core_1.APP_INTERCEPTOR, useClass: nestjs_zod_1.ZodSerializerInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: log_interceptor_1.LogInterceptor },
            localtunnel_service_1.LocalTunnelService,
            config_service_1.ConfigService,
            app_logger_service_1.AppLogger,
        ],
        exports: [app_logger_service_1.AppLogger],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map