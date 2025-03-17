"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const serverless_express_1 = require("@vendia/serverless-express");
const app_module_1 = require("./app.module");
const app_logger_service_1 = require("./utils/app-logger.service");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const nestjs_zod_1 = require("nestjs-zod");
let cachedServer;
async function bootstrap() {
    if (cachedServer)
        return cachedServer;
    const expressApp = (0, express_1.default)();
    expressApp.use(body_parser_1.default.json({ limit: '10mb' }));
    const adapter = new platform_express_1.ExpressAdapter(expressApp);
    const app = await core_1.NestFactory.create(app_module_1.AppModule, adapter, {
        logger: ['error', 'warn'],
    });
    app.enableCors({
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
        allowedHeaders: 'Content-Type,Authorization',
    });
    if (process.env.NODE_ENV === 'dev') {
        addSwggerDocs(app);
    }
    await app.init();
    const logger = app.get(app_logger_service_1.AppLogger);
    app.useLogger(logger);
    cachedServer = (0, serverless_express_1.configure)({ app: expressApp });
    return cachedServer;
}
const handler = async (event, context) => {
    const server = await bootstrap();
    return server(event, context);
};
exports.handler = handler;
function addSwggerDocs(app) {
    (0, nestjs_zod_1.patchNestJsSwagger)();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Igeo API')
        .setDescription('The Igeo API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('swagger', app, document);
}
//# sourceMappingURL=lambda.js.map