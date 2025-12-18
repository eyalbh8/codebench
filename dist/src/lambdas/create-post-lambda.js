"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const agent_service_1 = require("../api/operations/agent.service");
const app_logger_service_1 = require("../utils/app-logger.service");
const model_enums_1 = require("../model.enums");
const accounts_service_1 = require("../api/operations/accounts.service");
let cachedApp;
async function bootstrap() {
    if (cachedApp) {
        return cachedApp;
    }
    try {
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
            logger: false,
        });
        await app.init();
        app.useLogger(app.get(app_logger_service_1.AppLogger));
        cachedApp = app;
        return app;
    }
    catch (error) {
        console.error(`Error bootstrapping application: ${error.message}`);
        throw error;
    }
}
function validateEvent(event) {
    if (!event.accountId || typeof event.accountId !== 'string') {
        throw new Error('accountId is required and must be a string');
    }
    if (!event.generationData) {
        throw new Error('generationData is required');
    }
    const { generationData } = event;
    if (!generationData.generationId ||
        typeof generationData.generationId !== 'string') {
        throw new Error('generationId is required and must be a string');
    }
    if (!generationData.topic || typeof generationData.topic !== 'string') {
        throw new Error('generationData.topic is required and must be a string');
    }
    if (!generationData.prompt || typeof generationData.prompt !== 'string') {
        throw new Error('generationData.prompt is required and must be a string');
    }
    if (!generationData.socialMediaProvider ||
        !Object.values(model_enums_1.SocialMediaProvider).includes(generationData.socialMediaProvider)) {
        throw new Error('generationData.socialMediaProvider is required and must be a valid SocialMediaProvider');
    }
    if (generationData.style &&
        ![
            'professional',
            'casual',
            'educational',
            'inspirational',
            'news',
            'story',
        ].includes(generationData.style)) {
        throw new Error('generationData.style must be one of: professional, casual, educational, inspirational, news, story');
    }
    if (generationData.generateImage !== undefined &&
        typeof generationData.generateImage !== 'boolean') {
        throw new Error('generationData.generateImage must be a boolean');
    }
    return true;
}
const handler = async (event, context) => {
    const app = await bootstrap();
    const logger = app.get(app_logger_service_1.AppLogger);
    logger.log('CreatePost Lambda started', {
        requestId: context.awsRequestId,
        event: JSON.stringify(event),
    });
    try {
        validateEvent(event);
        const agentService = app.get(agent_service_1.AgentService);
        const account = await app
            .get(accounts_service_1.AccountsService)
            .getAccount(event.accountId);
        logger.log('Calling AgentService.createPost', {
            accountId: event.accountId,
            generationId: event.generationId,
            generationData: event.generationData,
        });
        const result = await agentService.generatePost(account, event.generationData);
        logger.log('CreatePost Lambda completed successfully', {
            accountId: event.accountId,
            resultCount: Array.isArray(result) ? result.length : 1,
        });
        return {
            success: true,
            message: 'Posts created successfully',
            data: result,
            accountId: event.accountId,
        };
    }
    catch (error) {
        logger.error('CreatePost Lambda failed', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            requestId: context.awsRequestId,
        });
        if (event.generationData?.generationId) {
            try {
                const agentService = app.get(agent_service_1.AgentService);
                await agentService.markGeneratedPostsAsFailed(event.generationData.generationId, error instanceof Error ? error.message : String(error));
                logger.log('Marked posts as FAILED for generationId', {
                    generationId: event.generationData.generationId,
                });
            }
            catch (updateError) {
                logger.error('Failed to update post state to FAILED', {
                    error: updateError instanceof Error
                        ? updateError.message
                        : String(updateError),
                    generationId: event.generationData.generationId,
                });
            }
        }
        throw error;
    }
};
exports.handler = handler;
//# sourceMappingURL=create-post-lambda.js.map