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
exports.LlmService = void 0;
const config_service_1 = require("../../../config/config.service");
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
const ai_models_service_1 = require("../ai.models.service");
const app_logger_service_1 = require("../../../utils/app-logger.service");
const model_enums_1 = require("../../../model.enums");
const s3_service_1 = require("../../../common/services/s3.service");
const calculations_1 = require("../../../utils/calculations");
const openai_provider_1 = require("./openai.provider");
const gemini_provider_1 = require("./gemini.provider");
const errors_1 = require("../../../constants/errors");
const app_error_exception_1 = require("../../../exceptions/app-error.exception");
const unsplash_js_1 = require("unsplash-js");
const blog_patterns_service_1 = require("../blog-patterns.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let LlmService = class LlmService {
    constructor(configService, s3Service, aiModelsService, openaiProvider, geminiProvider, blogPatternsService, prisma, logger) {
        this.configService = configService;
        this.s3Service = s3Service;
        this.aiModelsService = aiModelsService;
        this.openaiProvider = openaiProvider;
        this.geminiProvider = geminiProvider;
        this.blogPatternsService = blogPatternsService;
        this.prisma = prisma;
        this.logger = logger;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            const error = new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.CONFIGURATION_ERROR, undefined, 'OPENAI_API_KEY is required');
            throw error;
        }
        this.client = new openai_1.OpenAI({ apiKey });
    }
    async generateSocialPostSharedBriefing(account, accountData) {
        try {
            const existingKnowledgeSources = account.knowledgeSources || [];
            const model = await this.aiModelsService.getAiStepSettings(ai_models_service_1.UsedStep.LINKEDIN_CONTENT_POST_GENERATION);
            if (!model.inputMessage) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
            }
            const competitors = (account.competitors || [])
                .filter((c) => c.status !== 'INACTIVE')
                .map((c) => ({
                name: c.name,
                site: c.site ?? '',
                advantage: c.advantage ?? '',
            }));
            const inputParams = {
                brandName: account.title,
                brandAltNames: (account.names || []).join(', ') || 'N/A',
                brandAbout: account.about || '',
                brandKeyFeatures: (account.keyFeatures || []).join(', '),
                toneOfVoice: (account.toneOfVoice || []).join(', '),
                values: (account.values || []).join(', '),
                personality: (account.personality || []).join(', '),
                accountDomains: (account.domains || []).join(', '),
                topic: accountData.topic,
                prompt: accountData.prompt,
                competitorDetails: JSON.stringify(competitors, null, 2),
                knowledgeSources: JSON.stringify(existingKnowledgeSources, null, 2),
            };
            const inputMessage = ai_models_service_1.AiModelsService.renderTemplate(model.inputMessage, inputParams);
            const provider = this.getProvider(model);
            const response = await provider.makeChatRequest(inputMessage, model.model);
            if (!response.output) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.LLM_SERVICE_ERROR);
            }
            const raw = JSON.parse(extractJsonFromOutput(response.output));
            const sanitized = this.sanitizeSocialBriefing(raw);
            const s3_response_key = `llm/${account.id}/${(0, calculations_1.getFormattedDate)()}-social-post-briefing.json`;
            await Promise.all([
                this.uploadResponse(JSON.stringify({
                    provider: response.provider,
                    model: response.model,
                    inputMessage: response.inputMessage,
                    inputParams,
                    output: response.output,
                    usage: response.usage,
                    error: response.error,
                }, null, 2), s3_response_key),
            ]);
            this.logger.log('Social post shared briefing generated successfully', {
                accountId: account.id,
                accountName: account.title,
                provider: response.provider,
            });
            return sanitized;
        }
        catch (error) {
            this.logger.error(`Error generating social post shared briefing: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }
    async generateSocialPostVisibilityPlan(account, accountData, sharedBriefing) {
        try {
            const model = await this.aiModelsService.getAiStepSettings(ai_models_service_1.UsedStep.LINKEDIN_CONTENT_POST_GENERATION);
            if (!model.inputMessage) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
            }
            const inputParams = {
                brandName: account.title,
                topic: accountData.topic,
                prompt: accountData.prompt,
                accountDomains: (account.domains || []).join(', '),
                sharedBriefing: JSON.stringify(sharedBriefing, null, 2),
            };
            const inputMessage = ai_models_service_1.AiModelsService.renderTemplate(model.inputMessage, inputParams);
            const provider = this.getProvider(model);
            const response = await provider.makeChatRequest(inputMessage, model.model);
            if (!response.output) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.LLM_SERVICE_ERROR);
            }
            const raw = JSON.parse(extractJsonFromOutput(response.output));
            const sanitized = this.sanitizeVisibilityPlan(raw);
            const s3_response_key = `llm/${account.id}/${(0, calculations_1.getFormattedDate)()}-social-post-visibility-plan.json`;
            await Promise.all([
                this.uploadResponse(JSON.stringify({
                    provider: response.provider,
                    model: response.model,
                    inputMessage: response.inputMessage,
                    inputParams,
                    output: response.output,
                    usage: response.usage,
                    error: response.error,
                }, null, 2), s3_response_key),
            ]);
            this.logger.log('Social post visibility plan generated successfully', {
                accountId: account.id,
                accountName: account.title,
                provider: response.provider,
            });
            return sanitized;
        }
        catch (error) {
            this.logger.error(`Error generating social post visibility plan: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }
    async generateSocialMediaContent(account, provider, accountData) {
        try {
            let aiSettingsStep;
            if (provider === model_enums_1.SocialMediaProvider.BLOG) {
                try {
                    let prompt = null;
                    let queryMethod = null;
                    if (accountData.promptId) {
                        prompt = await this.prisma.prompt.findUnique({
                            where: { id: accountData.promptId },
                            select: { type: true, prompt: true },
                        });
                        if (prompt) {
                            queryMethod = 'promptId';
                        }
                    }
                    if (!prompt) {
                        const normalizedPromptText = accountData.prompt.trim();
                        prompt = await this.prisma.prompt.findFirst({
                            where: {
                                accountId: account.id,
                                prompt: normalizedPromptText,
                                isActive: true,
                                state: 'ACTIVE',
                                deletedAt: null,
                            },
                            select: { type: true, prompt: true },
                        });
                        if (!prompt) {
                            const allPrompts = await this.prisma.prompt.findMany({
                                where: {
                                    accountId: account.id,
                                    isActive: true,
                                    state: 'ACTIVE',
                                    deletedAt: null,
                                },
                                select: { type: true, prompt: true },
                            });
                            const matchedPrompt = allPrompts.find((p) => p.prompt.trim().toLowerCase() ===
                                normalizedPromptText.toLowerCase());
                            if (matchedPrompt) {
                                prompt = matchedPrompt;
                                queryMethod = 'promptText';
                            }
                        }
                        else {
                            queryMethod = 'promptText';
                        }
                    }
                    let derivedIntent = 'INFORMATIONAL';
                    if (prompt?.type) {
                        const rawPromptType = prompt.type;
                        const normalizedType = rawPromptType.toUpperCase().trim();
                        if ([
                            'COMMERCIAL',
                            'INFORMATIONAL',
                            'NAVIGATIONAL',
                            'TRANSACTIONAL',
                        ].includes(normalizedType)) {
                            derivedIntent = normalizedType;
                        }
                        else {
                            this.logger.warn(`Invalid prompt type "${rawPromptType}" found, defaulting to INFORMATIONAL`, {
                                accountId: account.id,
                                rawPromptType,
                                normalizedType,
                                validTypes: [
                                    'COMMERCIAL',
                                    'INFORMATIONAL',
                                    'NAVIGATIONAL',
                                    'TRANSACTIONAL',
                                ],
                            });
                        }
                    }
                    else {
                        this.logger.error('Could not find prompt in database, defaulting to INFORMATIONAL', {
                            accountId: account.id,
                            prompt: accountData.prompt,
                            queryMethod: queryMethod || 'none',
                        });
                        throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_REQUIRED_FIELD, undefined, 'Prompt not found in database');
                    }
                    aiSettingsStep =
                        this.blogPatternsService.getUsedStepForIntent(derivedIntent);
                }
                catch (error) {
                    this.logger.error(`Error retrieving prompt intent, defaulting to INFORMATIONAL`, {
                        accountId: account.id,
                        topic: accountData.topic,
                        prompt: accountData.prompt,
                        hasPromptId: !!accountData.promptId,
                        promptId: accountData.promptId || null,
                        error: error instanceof Error ? error.message : String(error),
                        errorStack: error instanceof Error ? error.stack : undefined,
                    });
                    throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_REQUIRED_FIELD, undefined, `Error retrieving prompt intent: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            else {
                const stepMap = {
                    LINKEDIN: ai_models_service_1.UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
                    X: ai_models_service_1.UsedStep.X_CONTENT_POST_GENERATION,
                    FACEBOOK: ai_models_service_1.UsedStep.FACEBOOK_CONTENT_POST_GENERATION,
                    INSTAGRAM: ai_models_service_1.UsedStep.INSTAGRAM_CONTENT_POST_GENERATION,
                    PINTEREST: ai_models_service_1.UsedStep.PINTEREST_CONTENT_POST_GENERATION,
                    REDDIT: ai_models_service_1.UsedStep.REDDIT_CONTENT_POST_GENERATION,
                    LISTICLE: ai_models_service_1.UsedStep.LISTICLE_CONTENT_POST_GENERATION,
                };
                aiSettingsStep = stepMap[provider];
            }
            const model = await this.aiModelsService.getAiStepSettings(aiSettingsStep);
            if (!model.inputMessage) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
            }
            const sources = accountData.sources;
            let sourcesText = '';
            let externalSourcesText = '';
            let internalSourcesText = '';
            if (sources) {
                if (sources.external && sources.external.length > 0) {
                    externalSourcesText = sources.external
                        .map((s, idx) => `${idx + 1}. ${s.title ? `${s.title} - ` : ''}${s.url}`)
                        .join('\n');
                }
                if (sources.internal && sources.internal.length > 0) {
                    internalSourcesText = sources.internal
                        .map((s, idx) => `${idx + 1}. ${s.title ? `${s.title} - ` : ''}${s.url}`)
                        .join('\n');
                }
                if (sources.all && sources.all.length > 0) {
                    sourcesText = sources.all
                        .map((s, idx) => `${idx + 1}. ${s.title ? `${s.title} - ` : ''}${s.url}`)
                        .join('\n');
                }
            }
            const systemPrompt = ai_models_service_1.AiModelsService.renderTemplate(model.inputMessage, {
                topic: accountData.topic,
                prompt: accountData.prompt,
                style: accountData.style || '',
                about: accountData.about || '',
                industryCategory: accountData.industryCategory || '',
                subIndustryCategory: accountData.subIndustryCategory || '',
                keyFeatures: (accountData.keyFeatures || []).join(', '),
                toneOfVoice: (accountData.toneOfVoice || []).join(', '),
                values: (accountData.values || []).join(', '),
                personality: (accountData.personality || []).join(', '),
                language: accountData.language || 'english',
                insight: accountData.insight || '',
                victorBrandbook: accountData.victorBrandbook || '',
                victorPastPosts: accountData.victorPastPosts || '',
                victorMarketIntel: accountData.victorMarketIntel || '',
                competitorBrands: accountData.competitorBrands || '',
                victorSuccessfulBlogs: accountData.victorSuccessfulBlogs || '',
                victorInternalLinks: accountData.victorInternalLinks || '',
                victorCompetitorLearning: accountData.victorCompetitorLearning || '',
                victorExternalLinks: accountData.victorExternalLinks || '',
                postGuidelinesDos: accountData.postGuidelinesDos || '',
                postGuidelinesDonts: accountData.postGuidelinesDonts || '',
                sources: sourcesText,
                externalSources: externalSourcesText,
                internalSources: internalSourcesText,
                hasSources: sources && sources.all && sources.all.length > 0 ? 'YES' : 'NO',
            });
            const llmProvider = this.getProvider(model);
            const response = await llmProvider.makeChatRequest(systemPrompt, model.model);
            this.logger.log('LLM raw response received', {
                provider: response.provider,
                model: response.model,
                outputLength: response.output?.length || 0,
                outputFull: response.output,
            });
            const content = response.output;
            if (!content) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.LLM_SERVICE_ERROR);
            }
            this.logger.log(`${provider} content generation completed successfully`);
            const s3_response_key = `llm/${account.id}/${(0, calculations_1.getFormattedDate)()}-social-media-content.json`;
            await Promise.all([
                this.uploadResponse(JSON.stringify({
                    provider: response.provider,
                    model: response.model,
                    inputMessage: response.inputMessage,
                    output: response.output,
                    usage: response.usage,
                    error: response.error,
                }, null, 2), s3_response_key),
            ]);
            return content;
        }
        catch (error) {
            this.logger.error(`Error generating ${provider} content: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async getCompetitorSiteUrl(account, competitor) {
        const siteUrlModel = await this.aiModelsService.getAiStepSettings(ai_models_service_1.UsedStep.LINKEDIN_CONTENT_POST_GENERATION);
        if (!siteUrlModel.inputMessage) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        const inputParams = {
            competitorName: competitor.name,
        };
        const inputMessage = ai_models_service_1.AiModelsService.renderTemplate(siteUrlModel.inputMessage, inputParams);
        const llmProvider = this.getProvider(siteUrlModel);
        const response = await llmProvider.makeWebSearchRequest({
            model: siteUrlModel.model,
            inputMessage,
        });
        const content = response.output;
        if (!content) {
            this.logger.error('No content in OpenAI response');
            throw new Error('No content in OpenAI response');
        }
        const s3_response_key = `llm/${account.id}/${competitor.name}-site-url.json`;
        await Promise.all([
            this.uploadResponse(JSON.stringify({
                provider: response.provider,
                model: response.model,
                inputMessage: response.inputMessage,
                inputParams,
                output: content,
                usage: response.usage,
                error: response.error,
            }, null, 2), s3_response_key),
        ]);
        const toReturn = JSON.parse(extractJsonFromOutput(content));
        return toReturn.siteUrl;
    }
    async translateToEnglishIfNeeded(text) {
        if (!text || text.trim().length === 0) {
            return text;
        }
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a language detection and translation assistant. If the provided text is in English, return it exactly as-is. If it is in any other language, translate it to English. Only return the text itself, no explanations or additional text.',
                    },
                    {
                        role: 'user',
                        content: text,
                    },
                ],
                temperature: 0.3,
                max_tokens: 100,
            });
            const translatedText = response.choices[0]?.message?.content?.trim();
            if (translatedText) {
                return translatedText;
            }
            this.logger.warn('Translation response was empty, using original text', {
                originalText: text,
            });
            return text;
        }
        catch (error) {
            this.logger.error('Error translating text to English:', {
                error: error instanceof Error ? error.message : String(error),
                originalText: text,
            });
            return text;
        }
    }
    async trackUnsplashDownload(downloadLocation) {
        try {
            const unsplash = (0, unsplash_js_1.createApi)({
                accessKey: this.configService.get('UNSPLASH_ACCESS_KEY'),
            });
            await unsplash.photos.trackDownload({ downloadLocation });
            this.logger.log('Unsplash download tracked successfully');
        }
        catch (error) {
            this.logger.error('Error tracking Unsplash download:', error);
        }
    }
    sanitizeSocialBriefing(raw) {
        const competitorAngles = (raw?.competitorAngles ?? [])
            .filter((angle) => Boolean(angle?.name))
            .map((angle) => ({
            name: angle.name,
            threatLevel: angle.threatLevel === 'HIGH' ||
                angle.threatLevel === 'MEDIUM' ||
                angle.threatLevel === 'LOW'
                ? angle.threatLevel
                : 'MEDIUM',
            differentiator: angle.differentiator || '',
            recommendedCounter: angle.recommendedCounter || '',
        }));
        return {
            brandSummary: raw?.brandSummary || '',
            mustHighlight: (raw?.mustHighlight || []).filter(Boolean),
            brandVoiceGuardrails: {
                tone: raw?.brandVoiceGuardrails?.tone || [],
                values: raw?.brandVoiceGuardrails?.values || [],
                personality: raw?.brandVoiceGuardrails?.personality || [],
            },
            competitorAngles,
        };
    }
    sanitizeVisibilityPlan(raw) {
        return {
            searchIntent: raw?.searchIntent || '',
            llmVisibilityAngles: raw?.llmVisibilityAngles || [],
            keywordFocus: raw?.keywordFocus || [],
            openingHook: raw?.openingHook || '',
            structure: {
                sections: raw?.structure?.sections?.map((section) => ({
                    name: section?.name || '',
                    purpose: section?.purpose || '',
                })) || [],
            },
            cta: raw?.cta || '',
            competitorDifferentiation: raw?.competitorDifferentiation || [],
        };
    }
    parseJsonWithSanitization(content) {
        const attempts = [];
        const cleanedResponse = content
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();
        const directTrimmed = cleanedResponse.trim();
        if (directTrimmed) {
            attempts.push(directTrimmed);
        }
        const firstBrace = directTrimmed.indexOf('{');
        const lastBrace = directTrimmed.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            attempts.push(directTrimmed.slice(firstBrace, lastBrace + 1));
        }
        const sanitized = this.sanitizeJsonString(directTrimmed);
        if (sanitized && !attempts.includes(sanitized)) {
            attempts.push(sanitized);
        }
        for (const attempt of attempts) {
            try {
                return JSON.parse(attempt);
            }
            catch (error) {
                if (attempt === attempts[attempts.length - 1]) {
                    throw error instanceof Error ? error : new Error(String(error));
                }
            }
        }
        throw new Error('Unable to parse JSON response');
    }
    sanitizeJsonString(content) {
        let result = '';
        let inString = false;
        let escapeNext = false;
        for (let i = 0; i < content.length; i += 1) {
            const char = content[i];
            if (inString) {
                if (escapeNext) {
                    result += char;
                    escapeNext = false;
                    continue;
                }
                if (char === '\\') {
                    result += char;
                    escapeNext = true;
                    continue;
                }
                if (char === '"') {
                    let j = i + 1;
                    let foundClosing = false;
                    while (j < content.length && /\s/.test(content[j])) {
                        j++;
                    }
                    if (j < content.length) {
                        const charAfterWhitespace = content[j];
                        if (charAfterWhitespace === ':' ||
                            charAfterWhitespace === ',' ||
                            charAfterWhitespace === '}' ||
                            charAfterWhitespace === ']') {
                            foundClosing = true;
                        }
                    }
                    else {
                        foundClosing = true;
                    }
                    if (foundClosing) {
                        result += char;
                        inString = false;
                        continue;
                    }
                    else {
                        result += '\\"';
                        continue;
                    }
                }
                if (char === '\n') {
                    result += '\\n';
                    continue;
                }
                if (char === '\r') {
                    result += '\\r';
                    continue;
                }
                if (char === '\t') {
                    result += '\\t';
                    continue;
                }
            }
            else if (char === '"') {
                inString = true;
            }
            result += char;
        }
        return result;
    }
    sanitizeJsonForParsing(content) {
        let extracted = extractJsonFromOutput(content);
        const firstBrace = extracted.indexOf('{');
        const lastBrace = extracted.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            extracted = extracted.slice(firstBrace, lastBrace + 1);
        }
        extracted = extracted.replace(/,(\s*[}\]])/g, '$1');
        extracted = extracted.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        const attempts = [extracted];
        try {
            let fixed = extracted;
            let inString = false;
            let escapeNext = false;
            let result = '';
            for (let i = 0; i < fixed.length; i++) {
                const char = fixed[i];
                if (escapeNext) {
                    result += char;
                    escapeNext = false;
                    continue;
                }
                if (char === '\\') {
                    result += char;
                    escapeNext = true;
                    continue;
                }
                if (char === '"') {
                    if (inString) {
                        const nextChar = fixed[i + 1];
                        if (nextChar === ',' ||
                            nextChar === '}' ||
                            nextChar === ']' ||
                            nextChar === ':') {
                            inString = false;
                            result += char;
                            continue;
                        }
                        result += '\\"';
                        continue;
                    }
                    else {
                        const prevChar = fixed[i - 1];
                        if (prevChar === ':' ||
                            prevChar === ',' ||
                            prevChar === '[' ||
                            prevChar === '{') {
                            inString = true;
                            result += char;
                            continue;
                        }
                    }
                }
                result += char;
            }
            if (result !== extracted) {
                attempts.push(result);
            }
        }
        catch (e) {
        }
        for (const attempt of attempts) {
            try {
                JSON.parse(attempt);
                return attempt;
            }
            catch (e) {
            }
        }
        return extracted;
    }
    sanitizeGeneratedContent(content, brandName) {
        let sanitized = content
            .replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
            .replace(/<a\s+href=["']["']\s*>([^<]*)<\/a>/gi, '$1')
            .replace(/\(\s*\)/g, '')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
        if (brandName) {
            const brandRegex = new RegExp(`\\b${this.escapeRegExp(brandName)}\\b`, 'i');
            if (!brandRegex.test(sanitized)) {
                sanitized = `${brandName}: ${sanitized}`;
            }
        }
        return sanitized;
    }
    escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    async uploadResponse(responseContent, fileName) {
        try {
            await this.s3Service.putObject(responseContent, fileName);
        }
        catch (error) {
            this.logger.error(`Error saving suggested merge entities to S3: ${error}`, error);
        }
    }
    getProvider(suggestedMergeEntitiesModel) {
        switch (suggestedMergeEntitiesModel.provider) {
            case model_enums_1.Provider.OPENAI.toString(): {
                return this.openaiProvider;
            }
            case model_enums_1.Provider.GEMINI.toString(): {
                return this.geminiProvider;
            }
            default:
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INVALID_INPUT);
        }
    }
};
exports.LlmService = LlmService;
exports.LlmService = LlmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        s3_service_1.S3Service,
        ai_models_service_1.AiModelsService,
        openai_provider_1.OpenaiProvider,
        gemini_provider_1.GeminiProvider,
        blog_patterns_service_1.BlogPatternsService,
        prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger])
], LlmService);
function extractJsonFromOutput(content) {
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '');
        cleanContent = cleanContent.replace(/\n?```\s*$/, '');
    }
    else {
        const match = cleanContent.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
        if (match) {
            cleanContent = match[1].trim();
        }
    }
    return cleanContent;
}
//# sourceMappingURL=llm.service.js.map