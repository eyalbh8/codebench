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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const config_service_1 = require("../../../config/config.service");
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const app_logger_service_1 = require("../../../utils/app-logger.service");
const model_enums_1 = require("../../../model.enums");
const axios_1 = __importDefault(require("axios"));
let GeminiProvider = class GeminiProvider {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is required');
        }
        this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async makeChatRequest(inputMessage, model) {
        try {
            const genAI = this.client.getGenerativeModel({ model });
            const result = await genAI.generateContent(inputMessage);
            const response = result.response;
            const text = response.text();
            const usageMetadata = result.response.usageMetadata;
            if (!text) {
                throw new Error('No content in Gemini response');
            }
            if (!usageMetadata) {
                throw new Error('No usage metadata in Gemini response');
            }
            return {
                provider: model_enums_1.Provider.GEMINI,
                model,
                inputMessage,
                output: text,
                usage: {
                    prompt_tokens: usageMetadata.promptTokenCount,
                    completion_tokens: usageMetadata.candidatesTokenCount,
                    total_tokens: usageMetadata.totalTokenCount,
                },
            };
        }
        catch (e) {
            this.logger.error('Error generating account suggested topics:', {
                error: e.message,
            });
            return {
                provider: model_enums_1.Provider.GEMINI,
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
                const apiKey = this.configService.get('GEMINI_API_KEY');
                const baseUrl = 'generativelanguage.googleapis.com';
                const response = await axios_1.default.post(`https://${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    contents: [
                        {
                            parts: [
                                {
                                    text: inputMessage,
                                },
                            ],
                            role: 'user',
                        },
                    ],
                    tools: [
                        {
                            googleSearch: {},
                        },
                    ],
                    generationConfig: {},
                }, {
                    headers: {
                        'nx-goog-api-key': apiKey,
                        'Content-Type': 'application/json',
                        'nx-goog-api-client': 'google-genai-sdk/1.2.0 gl-node/18.0.0',
                        'User-Agent': 'google-genai-sdk/1.2.0 gl-node/18.0.0',
                        'Accept-Encoding': 'gzip, deflate',
                        Accept: '*/*',
                        Connection: 'keep-alive',
                    },
                });
                const text = response.data.candidates[0].content.parts
                    .map((part) => part.text)
                    .join('\n');
                const usageMetadata = response.data.usageMetadata;
                if (!text) {
                    throw new Error('No output text in Gemini response');
                }
                this.logger.debug('Web search request successful', {
                    model,
                    attempt: retryCount + 1,
                });
                return {
                    provider: model_enums_1.Provider.GEMINI,
                    model,
                    inputMessage,
                    output: text,
                    usage: {
                        prompt_tokens: usageMetadata.promptTokenCount,
                        completion_tokens: usageMetadata.candidatesTokenCount,
                        total_tokens: usageMetadata.totalTokenCount,
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
                    statusCode: e.response?.status,
                    isRetryable: isRetryableError,
                    isLastAttempt,
                });
                if (!isRetryableError || isLastAttempt) {
                    this.logger.error('Web search request failed permanently', {
                        model,
                        totalAttempts: retryCount + 1,
                        error: e.message,
                        statusCode: e.response?.status,
                    });
                    return {
                        provider: model_enums_1.Provider.GEMINI,
                        model,
                        inputMessage,
                        error: `${e.message} - Status: ${e.response?.status} - Data: ${JSON.stringify(e.response?.data)}`,
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
            provider: model_enums_1.Provider.GEMINI,
            model,
            inputMessage,
            error: 'Maximum retries exceeded',
        };
    }
    isRetryableError(error) {
        const statusCode = error.response?.status;
        return statusCode === 429 || statusCode >= 500;
    }
    calculateSleepTime(retryCount) {
        const baseDelay = 500;
        const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount - 1), 10000);
        const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
        const finalDelay = Math.max(baseDelay, exponentialDelay + jitter);
        return Math.min(finalDelay, 5000);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.GeminiProvider = GeminiProvider;
exports.GeminiProvider = GeminiProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        app_logger_service_1.AppLogger])
], GeminiProvider);
//# sourceMappingURL=gemini.provider.js.map