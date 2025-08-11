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
exports.OpenaiProvider = void 0;
const config_service_1 = require("../../../config/config.service");
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
const app_logger_service_1 = require("../../../utils/app-logger.service");
const model_enums_1 = require("../../../model.enums");
let OpenaiProvider = class OpenaiProvider {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is required');
        }
        this.client = new openai_1.OpenAI({ apiKey });
    }
    async makeChatRequest(inputMessage, model) {
        try {
            const response = await this.client.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'user',
                        content: inputMessage,
                    },
                ],
            });
            if (!response.choices[0]?.message?.content) {
                throw new Error('No content in OpenAI response');
            }
            if (!response.usage) {
                throw new Error('No usage in OpenAI response');
            }
            return {
                provider: model_enums_1.Provider.OPENAI,
                model,
                inputMessage,
                output: response.choices[0].message.content,
                usage: {
                    prompt_tokens: response.usage.prompt_tokens,
                    completion_tokens: response.usage.completion_tokens,
                    total_tokens: response.usage.total_tokens,
                },
            };
        }
        catch (e) {
            this.logger.error('Error generating account suggested topics:', {
                error: e.message,
            });
            return {
                provider: model_enums_1.Provider.OPENAI,
                model,
                inputMessage,
                error: e.message,
            };
        }
    }
    async makeWebSearchRequest({ model, inputMessage, }) {
        const maxRetries = 10;
        let retryCount = 0;
        while (retryCount <= maxRetries) {
            try {
                this.logger.debug('Making web search request', {
                    model,
                    attempt: retryCount + 1,
                    maxRetries: maxRetries + 1,
                });
                const response = await this.client.responses.create({
                    model,
                    input: inputMessage,
                    tools: [
                        {
                            type: 'web_search_preview',
                        },
                    ],
                });
                if (!response.output_text) {
                    throw new Error('No output text in OpenAI response');
                }
                if (!response.usage) {
                    throw new Error('No usage in OpenAI response');
                }
                this.logger.debug('Web search request successful', {
                    model,
                    attempt: retryCount + 1,
                });
                return {
                    provider: model_enums_1.Provider.OPENAI,
                    model,
                    inputMessage,
                    output: response.output_text,
                    usage: {
                        prompt_tokens: response.usage.input_tokens,
                        completion_tokens: response.usage.output_tokens,
                        total_tokens: response.usage.total_tokens,
                    },
                };
            }
            catch (e) {
                const isRetryableError = this.isRetryableError(e);
                const isLastAttempt = retryCount === maxRetries;
                this.logger.warn('Web search request failed', {
                    model,
                    attempt: retryCount + 1,
                    maxRetries: maxRetries + 1,
                    error: e.message,
                    statusCode: e.status || e.statusCode,
                    isRetryable: isRetryableError,
                    isLastAttempt,
                });
                if (!isRetryableError || isLastAttempt) {
                    this.logger.error('Web search request failed permanently', {
                        model,
                        totalAttempts: retryCount + 1,
                        error: e.message,
                        statusCode: e.status || e.statusCode,
                    });
                    return {
                        provider: model_enums_1.Provider.OPENAI,
                        model,
                        inputMessage,
                        error: e.message,
                    };
                }
                retryCount++;
                const sleepTime = this.calculateSleepTime(retryCount);
                this.logger.log('Retrying web search request', {
                    model,
                    nextAttempt: retryCount + 1,
                    sleepTimeMs: sleepTime,
                });
                await this.sleep(sleepTime);
            }
        }
        return {
            provider: model_enums_1.Provider.OPENAI,
            model,
            inputMessage,
            error: 'Maximum retries exceeded',
        };
    }
    isRetryableError(error) {
        const statusCode = error.status || error.statusCode;
        return statusCode === 429 || statusCode >= 500;
    }
    calculateSleepTime(retryCount) {
        const baseDelay = 1000;
        const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount - 1), 10000);
        const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
        const finalDelay = Math.max(baseDelay, exponentialDelay + jitter);
        return Math.min(finalDelay, 10000);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async makeImageRequest(prompt, model) {
        try {
            const response = await this.client.images.generate({
                model,
                prompt,
                n: 1,
                size: '1024x1024',
            });
            if (!response.data || !response.data[0] || !response.data[0].url) {
                throw new Error('No image data returned from DALL-E');
            }
            return response.data[0].url;
        }
        catch (e) {
            this.logger.error('Error generating image:', {
                error: e.message,
            });
            throw new Error(`Image generation failed: ${e.message}`);
        }
    }
};
exports.OpenaiProvider = OpenaiProvider;
exports.OpenaiProvider = OpenaiProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        app_logger_service_1.AppLogger])
], OpenaiProvider);
//# sourceMappingURL=openai.provider.js.map