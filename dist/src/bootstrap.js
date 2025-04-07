"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapApp = bootstrapApp;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const app_module_1 = require("./app.module");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
async function bootstrapApp(expressInstance) {
    const expressApp = expressInstance || (0, express_1.default)();
    expressApp.use(body_parser_1.default.json({ limit: '10mb' }));
    expressApp.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp), {
        bodyParser: false,
    });
    app.enableCors({
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
        allowedHeaders: 'Content-Type,Authorization',
    });
    (0, nestjs_zod_1.patchNestJsSwagger)();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Igeo API')
        .setDescription('The Igeo API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('swagger', app, document);
    await app.init();
    return { app, expressApp };
}
//# sourceMappingURL=bootstrap.js.map