"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../constants/errors");
const uuid_1 = require("uuid");
const app_error_exception_1 = require("../../exceptions/app-error.exception");
const model_enums_1 = require("../../model.enums");
const prisma_service_1 = require("../../prisma/prisma.service");
const social_media_content_generation_service_1 = require("./social-media-content-generation-service");
const content_validator_service_1 = require("./content-validator.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const ai_models_service_1 = require("./ai.models.service");
const config_service_1 = require("../../config/config.service");
const llm_service_1 = require("./llm/llm.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const AWS = __importStar(require("aws-sdk"));
const s3_service_1 = require("../../common/services/s3.service");
const lambda = new AWS.Lambda();
let AgentService = class AgentService {
    constructor(prisma, socialContentGenerationService, finalValidationService, s3Service, logger, aiModelsService, configService, llmService, httpService) {
        this.prisma = prisma;
        this.socialContentGenerationService = socialContentGenerationService;
        this.finalValidationService = finalValidationService;
        this.s3Service = s3Service;
        this.logger = logger;
        this.aiModelsService = aiModelsService;
        this.configService = configService;
        this.llmService = llmService;
        this.httpService = httpService;
        this.lastUsedChunkIds = [];
        this.retriedPosts = new Set();
        this.EXCLUDED_SOURCE_DOMAINS = [
            'google.com',
            'support.google.com',
            'maps.google.com',
            'accounts.google.com',
            'policies.google.com',
        ];
    }
    isNotGoodDomain(url) {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname.toLowerCase();
            return this.EXCLUDED_SOURCE_DOMAINS.some((domain) => {
                return hostname === domain || hostname.endsWith(`.${domain}`);
            });
        }
        catch {
            return true;
        }
    }
    async validateLinkSituation(url) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow',
            });
            clearTimeout(timeout);
            return response.status === 200;
        }
        catch (error) {
            this.logger.log('URL validation failed', {
                url,
                error: error.message,
            });
            return false;
        }
    }
    async validateLinksSituation(sources) {
        const validatedSources = [];
        const invalidUrls = [];
        const excludedUrls = [];
        const allowedSources = sources.filter((source) => {
            if (this.isNotGoodDomain(source.url)) {
                excludedUrls.push(source.url);
                return false;
            }
            return true;
        });
        if (excludedUrls.length > 0) {
            this.logger.log('Filtered out excluded domain URLs', {
                count: excludedUrls.length,
                urls: excludedUrls,
            });
        }
        const concurrencyLimit = 5;
        for (let i = 0; i < allowedSources.length; i += concurrencyLimit) {
            const batch = allowedSources.slice(i, i + concurrencyLimit);
            const validationResults = await Promise.all(batch.map(async (source) => {
                const isValid = await this.validateLinkSituation(source.url);
                return { source, isValid };
            }));
            for (const { source, isValid } of validationResults) {
                if (isValid) {
                    validatedSources.push(source);
                }
                else {
                    invalidUrls.push(source.url);
                }
            }
        }
        if (invalidUrls.length > 0) {
            this.logger.log('Filtered out invalid status code URLs', {
                count: invalidUrls.length,
                urls: invalidUrls,
            });
        }
        return validatedSources;
    }
    async checkPostCreationLimitForProvider(account, provider) {
        const setting = account.accountSettings;
        if (!setting) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND);
        }
        const postCreationLimit = setting.postCreationLimit;
        if (!postCreationLimit) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        if (postCreationLimit <= 0) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INVALID_INPUT);
        }
        return true;
    }
    async createPostWithLambda(account, generationData) {
        const generationId = (0, uuid_1.v4)();
        generationData.generationId = generationId;
        if (generationData.recommendationId) {
            const recommendation = await this.prisma.recommendation.findUnique({
                where: { id: generationData.recommendationId },
                include: {
                    prompt: true,
                },
            });
            if (recommendation) {
                generationData.insight = recommendation.insight;
                if (recommendation.promptId) {
                    const results = await this.prisma.results.findMany({
                        where: {
                            promptId: recommendation.promptId,
                            accountId: account.id,
                        },
                        select: {
                            urlSources: true,
                            companySources: true,
                        },
                        take: 10,
                        orderBy: {
                            timestamp: 'desc',
                        },
                    });
                    const allSources = [];
                    const seenUrls = new Set();
                    for (const result of results) {
                        if (result.urlSources && Array.isArray(result.urlSources)) {
                            for (const source of result.urlSources) {
                                let url;
                                let title;
                                if (typeof source === 'string') {
                                    url = source;
                                }
                                else if (source &&
                                    typeof source === 'object' &&
                                    !Array.isArray(source)) {
                                    url = source.url || source.source;
                                    title = source.title;
                                }
                                if (url && typeof url === 'string' && !seenUrls.has(url)) {
                                    seenUrls.add(url);
                                    allSources.push({
                                        url,
                                        title: title && typeof title === 'string' ? title : undefined,
                                    });
                                }
                            }
                        }
                        if (result.companySources && Array.isArray(result.companySources)) {
                            for (const source of result.companySources) {
                                let url;
                                let title;
                                if (typeof source === 'string') {
                                    url = source;
                                }
                                else if (source &&
                                    typeof source === 'object' &&
                                    !Array.isArray(source)) {
                                    url = source.url || source.source;
                                    title = source.title;
                                }
                                if (url && typeof url === 'string' && !seenUrls.has(url)) {
                                    seenUrls.add(url);
                                    allSources.push({
                                        url,
                                        title: title && typeof title === 'string' ? title : undefined,
                                    });
                                }
                            }
                        }
                    }
                    const validatedSources = await this.validateLinksSituation(allSources);
                    const accountDomains = account.domains || [];
                    const internalSources = [];
                    const externalSources = [];
                    for (const source of validatedSources) {
                        try {
                            const sourceUrl = new URL(source.url);
                            const sourceHostname = sourceUrl.hostname.replace(/^www\./, '');
                            const isInternal = accountDomains.some((domain) => {
                                const cleanDomain = domain
                                    .replace(/^https?:\/\//, '')
                                    .replace(/^www\./, '');
                                return (sourceHostname === cleanDomain ||
                                    sourceHostname.endsWith(`.${cleanDomain}`));
                            });
                            if (isInternal) {
                                internalSources.push(source);
                            }
                            else {
                                externalSources.push(source);
                            }
                        }
                        catch { }
                    }
                    generationData.sources = {
                        internal: internalSources,
                        external: externalSources,
                        all: validatedSources,
                    };
                }
            }
        }
        if (!generationData.recommendationId && generationData.prompt) {
            const normalizedPromptText = generationData.prompt.trim();
            const prompt = await this.prisma.prompt.findFirst({
                where: {
                    accountId: account.id,
                    prompt: normalizedPromptText,
                    isActive: true,
                    state: 'ACTIVE',
                    deletedAt: null,
                },
                select: { id: true },
            });
            if (prompt?.id) {
                const results = await this.prisma.results.findMany({
                    where: {
                        promptId: prompt.id,
                        accountId: account.id,
                    },
                    select: {
                        urlSources: true,
                        companySources: true,
                    },
                    take: 10,
                    orderBy: {
                        timestamp: 'desc',
                    },
                });
                const allSources = [];
                const seenUrls = new Set();
                for (const result of results) {
                    if (result.urlSources && Array.isArray(result.urlSources)) {
                        for (const source of result.urlSources) {
                            let url;
                            let title;
                            if (typeof source === 'string') {
                                url = source;
                            }
                            else if (source &&
                                typeof source === 'object' &&
                                !Array.isArray(source)) {
                                url = source.url || source.source;
                                title = source.title;
                            }
                            if (url && typeof url === 'string' && !seenUrls.has(url)) {
                                seenUrls.add(url);
                                allSources.push({
                                    url,
                                    title: title && typeof title === 'string' ? title : undefined,
                                });
                            }
                        }
                    }
                    if (result.companySources && Array.isArray(result.companySources)) {
                        for (const source of result.companySources) {
                            let url;
                            let title;
                            if (typeof source === 'string') {
                                url = source;
                            }
                            else if (source &&
                                typeof source === 'object' &&
                                !Array.isArray(source)) {
                                url = source.url || source.source;
                                title = source.title;
                            }
                            if (url && typeof url === 'string' && !seenUrls.has(url)) {
                                seenUrls.add(url);
                                allSources.push({
                                    url,
                                    title: title && typeof title === 'string' ? title : undefined,
                                });
                            }
                        }
                    }
                }
                const validatedSources = await this.validateLinksSituation(allSources);
                const accountDomains = account.domains || [];
                const internalSources = [];
                const externalSources = [];
                for (const source of validatedSources) {
                    try {
                        const sourceUrl = new URL(source.url);
                        const sourceHostname = sourceUrl.hostname.replace(/^www\./, '');
                        const isInternal = accountDomains.some((domain) => {
                            const cleanDomain = domain
                                .replace(/^https?:\/\//, '')
                                .replace(/^www\./, '');
                            return (sourceHostname === cleanDomain ||
                                sourceHostname.endsWith(`.${cleanDomain}`));
                        });
                        if (isInternal) {
                            internalSources.push(source);
                        }
                        else {
                            externalSources.push(source);
                        }
                    }
                    catch {
                        continue;
                    }
                }
                generationData.sources = {
                    internal: internalSources,
                    external: externalSources,
                    all: validatedSources,
                };
            }
        }
        const params = {
            FunctionName: `${process.env.NODE_ENV}-create-post`,
            InvocationType: 'Event',
            Payload: JSON.stringify({
                accountId: account.id,
                generationData: generationData,
            }),
        };
        await lambda.invoke(params).promise();
        return {
            generationId,
            message: 'Task started, processing in the background',
        };
    }
    async generatePost(account, generationData) {
        const generationId = generationData.generationId;
        if (!generationId) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_GENERATION_ID);
        }
        try {
            if (!generationData.sources &&
                generationData.prompt &&
                !generationData.recommendationId) {
                const normalizedPromptText = generationData.prompt.trim();
                const prompt = await this.prisma.prompt.findFirst({
                    where: {
                        accountId: account.id,
                        prompt: normalizedPromptText,
                        isActive: true,
                        state: 'ACTIVE',
                        deletedAt: null,
                    },
                    select: { id: true },
                });
                if (prompt?.id) {
                    const results = await this.prisma.results.findMany({
                        where: {
                            promptId: prompt.id,
                            accountId: account.id,
                        },
                        select: {
                            urlSources: true,
                            companySources: true,
                        },
                        take: 10,
                        orderBy: { timestamp: 'desc' },
                    });
                    const allSources = [];
                    const seenUrls = new Set();
                    for (const result of results) {
                        if (result.urlSources && Array.isArray(result.urlSources)) {
                            for (const source of result.urlSources) {
                                let url;
                                let title;
                                if (typeof source === 'string') {
                                    url = source;
                                }
                                else if (source &&
                                    typeof source === 'object' &&
                                    !Array.isArray(source)) {
                                    url = source.url || source.source;
                                    title = source.title;
                                }
                                if (url && typeof url === 'string' && !seenUrls.has(url)) {
                                    seenUrls.add(url);
                                    allSources.push({
                                        url,
                                        title: title && typeof title === 'string' ? title : undefined,
                                    });
                                }
                            }
                        }
                        if (result.companySources && Array.isArray(result.companySources)) {
                            for (const source of result.companySources) {
                                let url;
                                let title;
                                if (typeof source === 'string') {
                                    url = source;
                                }
                                else if (source &&
                                    typeof source === 'object' &&
                                    !Array.isArray(source)) {
                                    url = source.url || source.source;
                                    title = source.title;
                                }
                                if (url && typeof url === 'string' && !seenUrls.has(url)) {
                                    seenUrls.add(url);
                                    allSources.push({
                                        url,
                                        title: title && typeof title === 'string' ? title : undefined,
                                    });
                                }
                            }
                        }
                    }
                    const validatedSources = await this.validateLinksSituation(allSources);
                    const accountDomains = account.domains || [];
                    const internalSources = [];
                    const externalSources = [];
                    for (const source of validatedSources) {
                        try {
                            const sourceUrl = new URL(source.url);
                            const sourceHostname = sourceUrl.hostname.replace(/^www\./, '');
                            const isInternal = accountDomains.some((domain) => {
                                const cleanDomain = domain
                                    .replace(/^https?:\/\//, '')
                                    .replace(/^www\./, '');
                                return (sourceHostname === cleanDomain ||
                                    sourceHostname.endsWith(`.${cleanDomain}`));
                            });
                            if (isInternal) {
                                internalSources.push(source);
                            }
                            else {
                                externalSources.push(source);
                            }
                        }
                        catch {
                            continue;
                        }
                    }
                    generationData.sources = {
                        internal: internalSources,
                        external: externalSources,
                        all: validatedSources,
                    };
                }
            }
            const result = await this.generateSocialMediaContentWithLlm(generationData, account);
            for (const post of result) {
                let [title, ...bodyParts] = post.text.split('\n\n');
                let body = bodyParts.join('\n\n');
                let retryPostData = null;
                if (generationData.socialMediaProvider === model_enums_1.SocialMediaProvider.BLOG ||
                    generationData.socialMediaProvider === model_enums_1.SocialMediaProvider.LISTICLE) {
                    if (generationData.socialMediaProvider === model_enums_1.SocialMediaProvider.BLOG) {
                        let finalValidation = this.finalValidationService.validateBlogPostFinal({
                            title: title,
                            content: body,
                            language: account.language ?? undefined,
                        });
                        if (!finalValidation.isAuthorityLevel) {
                            this.logger.error('Generated blog failed final validation', {
                                postId: post.id,
                                score: finalValidation.score,
                                issueCount: finalValidation.issues.length,
                                issues: finalValidation.issues.map((i) => ({
                                    severity: i.severity,
                                    category: i.category,
                                    message: i.message,
                                })),
                                language: account.language,
                            });
                            if (this.shouldRetryGeneration(post.id, finalValidation)) {
                                try {
                                    const retryResult = await this.retryBlogGeneration(post, generationData, account, finalValidation);
                                    title = retryResult.title;
                                    body = retryResult.body;
                                    retryPostData = retryResult.retryPost;
                                    const retryTempPostForSchema = {
                                        id: post.id,
                                        title: title,
                                        body: body,
                                        slug: retryResult.retryPost.slug || post.slug || 'untitled',
                                        focusKeyphrase: retryResult.retryPost.focusKeyphrase ||
                                            post.focusKeyphrase,
                                        metaDescription: retryResult.retryPost.metaDescription ||
                                            post.metaDescription,
                                        tags: retryResult.retryPost.hashtags || post.hashtags || [],
                                        publishedUrl: null,
                                        readTime: this.calculateEstimatedReadingTime(retryResult.retryPost.text),
                                        createdAt: new Date(),
                                        updatedAt: new Date(),
                                        publishedAt: null,
                                        imagesUrl: retryResult.retryPost.imageUrl
                                            ? [retryResult.retryPost.imageUrl]
                                            : [],
                                    };
                                    finalValidation =
                                        this.finalValidationService.validateBlogPostFinal({
                                            title: title,
                                            content: body,
                                            focusKeyphrase: retryResult.retryPost.focusKeyphrase ||
                                                post.focusKeyphrase,
                                            language: account.language ?? undefined,
                                        });
                                    if (finalValidation.isAuthorityLevel) {
                                        this.logger.log('Blog passed authority validation after retry', {
                                            postId: post.id,
                                            score: finalValidation.score,
                                            passedChecks: finalValidation.passed.length,
                                            originalScore: finalValidation.score,
                                        });
                                    }
                                    else {
                                        this.logger.warn('Blog still failed validation after retry, accepting anyway', {
                                            postId: post.id,
                                            retryScore: finalValidation.score,
                                            retryIssueCount: finalValidation.issues.length,
                                            originalScore: finalValidation.score,
                                            language: account.language,
                                        });
                                    }
                                }
                                catch (retryError) {
                                    this.logger.error('Retry generation failed, accepting original result', {
                                        postId: post.id,
                                        retryError: retryError instanceof Error
                                            ? retryError.message
                                            : String(retryError),
                                    });
                                }
                            }
                            else {
                                this.logger.warn('Blog failed validation and cannot retry, accepting anyway', {
                                    postId: post.id,
                                    score: finalValidation.score,
                                    issueCount: finalValidation.issues.length,
                                    language: account.language,
                                });
                            }
                        }
                        else {
                            this.logger.log('Blog passed authority validation', {
                                postId: post.id,
                                score: finalValidation.score,
                                passedChecks: finalValidation.passed.length,
                            });
                        }
                    }
                    if (generationData.socialMediaProvider === model_enums_1.SocialMediaProvider.LISTICLE) {
                        const finalValidation = this.finalValidationService.validateListicleFinal({
                            content: body,
                        });
                        if (!finalValidation.hasAllCompanyNames) {
                            this.logger.error('Generated listicle failed company name validation', {
                                postId: post.id,
                                score: finalValidation.score,
                                totalItems: finalValidation.totalItems,
                                validItems: finalValidation.validItems,
                                missingItems: finalValidation.missingCompanyNameItems,
                                issueCount: finalValidation.issues.length,
                                issues: finalValidation.issues.map((i) => ({
                                    severity: i.severity,
                                    category: i.category,
                                    message: i.message,
                                    details: i.details,
                                })),
                            });
                            const filteredContent = this.filterInvalidListicleEntries(body, finalValidation.missingCompanyNameItems);
                            if (filteredContent) {
                                body = filteredContent.filteredBody;
                                if (filteredContent.newCount !== finalValidation.totalItems) {
                                    const titleMatch = title.match(/^(\d+)\s+(.+)$/);
                                    if (titleMatch) {
                                        title = `${filteredContent.newCount} ${titleMatch[2]}`;
                                    }
                                }
                                this.logger.log('Listicle content filtered to remove invalid entries', {
                                    postId: post.id,
                                    originalCount: finalValidation.totalItems,
                                    newCount: filteredContent.newCount,
                                    removedItems: finalValidation.missingCompanyNameItems,
                                });
                            }
                            else {
                                this.logger.warn('Failed to filter listicle content, accepting original', {
                                    postId: post.id,
                                    missingItems: finalValidation.missingCompanyNameItems,
                                });
                            }
                        }
                        else {
                            this.logger.log('Listicle passed company name validation', {
                                postId: post.id,
                                score: finalValidation.score,
                                totalItems: finalValidation.totalItems,
                                validItems: finalValidation.validItems,
                                passedChecks: finalValidation.passed.length,
                            });
                        }
                    }
                }
                const finalPostData = retryPostData || post;
                const finalText = retryPostData?.text || post.text;
                await this.prisma.post.update({
                    where: { id: post.id },
                    data: {
                        title: title,
                        body: body,
                        state: model_enums_1.PostState.SUGGESTED,
                        tags: finalPostData.hashtags || post.hashtags,
                        readTime: this.calculateEstimatedReadingTime(finalText),
                        imagesUrl: finalPostData.imageUrl
                            ? [finalPostData.imageUrl]
                            : post.imageUrl
                                ? [post.imageUrl]
                                : [],
                        ...(finalPostData.focusKeyphrase && {
                            focusKeyphrase: finalPostData.focusKeyphrase,
                        }),
                        ...(finalPostData.slug && {
                            slug: finalPostData.slug,
                        }),
                        ...(finalPostData.metaDescription && {
                            metaDescription: finalPostData.metaDescription,
                        }),
                        ...(finalPostData.unsplashPhotoId && {
                            unsplashPhotoId: finalPostData.unsplashPhotoId,
                        }),
                        ...(finalPostData.unsplashPhotographerName && {
                            unsplashPhotographerName: finalPostData
                                .unsplashPhotographerName,
                        }),
                        ...(finalPostData.unsplashPhotographerUsername && {
                            unsplashPhotographerUsername: finalPostData
                                .unsplashPhotographerUsername,
                        }),
                        ...(finalPostData.unsplashDownloadLocation && {
                            unsplashDownloadLocation: finalPostData
                                .unsplashDownloadLocation,
                        }),
                    },
                });
                if (this.lastUsedChunkIds.length > 0) {
                    try {
                        await this.trackChunkUsage(post.id, this.lastUsedChunkIds, 'context');
                    }
                    catch (error) {
                        this.logger.error('Failed to track chunk usage', {
                            postId: post.id,
                            error: error instanceof Error ? error.message : String(error),
                        });
                        throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.LLM_SERVICE_ERROR, undefined, `Failed to track chunk usage: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
            }
            this.retriedPosts.clear();
            this.logger.log('Post creation process completed successfully');
            return Array.isArray(result) ? result : [result];
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Post creation failed, marking as FAILED', {
                generationId,
                error: errorMessage,
            });
            await this.markGeneratedPostsAsFailed(generationId, errorMessage);
            throw error;
        }
    }
    calculateEstimatedReadingTime(text) {
        const words = text.split(/\s+/).length;
        return Math.ceil(words / 200);
    }
    calculateReadTime(text) {
        return this.calculateEstimatedReadingTime(text);
    }
    shouldRetryGeneratedPost(postId, validation) {
        if (validation.isAuthorityLevel) {
            return false;
        }
        if (this.retriedPosts.has(postId)) {
            this.logger.log('Generated post already retried once, skipping retry', {
                postId,
                score: validation.score,
            });
            return false;
        }
        this.logger.log('Generated post validation failed, will retry once', {
            postId,
            score: validation.score,
            errorCount: validation.issues.filter((i) => i.severity === 'error')
                .length,
            warningCount: validation.issues.filter((i) => i.severity === 'warning')
                .length,
        });
        return true;
    }
    shouldRetryGeneration(postId, finalValidation) {
        return this.shouldRetryGeneratedPost(postId, finalValidation);
    }
    async retryGeneratedPost(generatedPost, generationData, account, originalValidation) {
        const generatedPostId = generatedPost.id;
        this.retriedPosts.add(generatedPostId);
        const retryResult = await this.generateSocialMediaContentWithLlm(generationData, account);
        const retryGeneratedPost = retryResult[0];
        if (!retryGeneratedPost) {
            throw new Error(`Retry generated post not found for generatedPostId: ${generatedPostId}`);
        }
        const [retryTitle, ...retryBodyParts] = retryGeneratedPost.text.split('\n\n');
        const retryBody = retryBodyParts.join('\n\n');
        return {
            title: retryTitle,
            body: retryBody,
            retryGeneratedPost: retryGeneratedPost,
        };
    }
    async retryBlogGeneration(generatedPost, generationData, account, originalValidation) {
        const result = await this.retryGeneratedPost(generatedPost, generationData, account, originalValidation);
        return {
            title: result.title,
            body: result.body,
            retryPost: result.retryGeneratedPost,
        };
    }
    filterInvalidListicleEntries(content, invalidItemNumbers) {
        if (invalidItemNumbers.length === 0) {
            return null;
        }
        try {
            const h2Pattern = /<h2[^>]*>(\d+)\.\s*([^<]*)<\/h2>/gi;
            const sections = [];
            let match;
            while ((match = h2Pattern.exec(content)) !== null) {
                const itemNumber = parseInt(match[1], 10);
                const headingText = (match[2] || '').trim();
                if (!invalidItemNumbers.includes(itemNumber)) {
                    sections.push({
                        fullMatch: match[0],
                        number: itemNumber,
                        headingText: headingText,
                        startIndex: match.index,
                        endIndex: match.index + match[0].length,
                    });
                }
            }
            if (sections.length === 0) {
                this.logger.warn('All listicle entries would be filtered out, keeping original');
                return null;
            }
            const parts = [];
            let lastEnd = 0;
            if (sections.length > 0 && sections[0].startIndex > 0) {
                parts.push(content.substring(0, sections[0].startIndex));
            }
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const nextSection = sections[i + 1];
                const sectionEnd = nextSection
                    ? nextSection.startIndex
                    : content.length;
                const newHeading = section.fullMatch.replace(/(\d+)\./, `${i + 1}.`);
                const sectionContent = content.substring(section.endIndex, sectionEnd);
                parts.push(newHeading + sectionContent);
            }
            const filteredBody = parts.join('');
            return {
                filteredBody,
                newCount: sections.length,
            };
        }
        catch (error) {
            this.logger.error('Error filtering listicle entries', {
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }
    async markGeneratedPostsAsFailed(generationId, errorMessage) {
        this.logger.error('Marking generated posts as FAILED', {
            generationId,
            errorMessage,
        });
        await this.prisma.post.updateMany({
            where: {
                generationId: generationId,
                state: model_enums_1.PostState.IN_PROGRESS,
            },
            data: {
                state: model_enums_1.PostState.FAILED,
                body: errorMessage
                    ? `Post generation failed: ${errorMessage}`
                    : 'Post generation failed',
            },
        });
    }
    async addPostAsDraft(generationId, aiModelSetting, generationData, accountId, socialMediaProvider) {
        return await this.prisma.post.create({
            data: {
                generationId,
                socialMediaProvider: socialMediaProvider,
                title: '',
                body: '',
                tags: [],
                readTime: 0,
                imagesUrl: [],
                visitSite: generationData.visitSite || null,
                aiModel: aiModelSetting.model,
                aiProvider: aiModelSetting.provider,
                aiStyle: generationData.style,
                accountId: accountId,
                topic: generationData.topic,
                prompt: generationData.prompt,
                state: model_enums_1.PostState.IN_PROGRESS,
                recommendationId: generationData.recommendationId || null,
            },
        });
    }
    async getPosts({ account, generationId, socialNetwork, state, take, skip, }) {
        const where = {
            accountId: account.id,
            ...(generationId && { generationId }),
            ...(socialNetwork && { socialMediaProvider: socialNetwork }),
            ...(state ? { state } : { state: { in: ['SUGGESTED', 'POSTED'] } }),
        };
        const uniqueGenerations = await this.prisma.post.groupBy({
            by: ['generationId'],
            where,
            _min: {
                createdAt: true,
            },
            orderBy: {
                _min: {
                    createdAt: 'desc',
                },
            },
        });
        const totalGenerationCount = uniqueGenerations.length;
        const paginatedGenerations = uniqueGenerations.slice(skip, skip + take);
        const paginatedGenerationIds = paginatedGenerations.map((g) => g.generationId);
        const posts = await this.prisma.post.findMany({
            where: {
                ...where,
                generationId: {
                    in: paginatedGenerationIds,
                },
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                generationId: true,
                createdAt: true,
                socialMediaProvider: true,
                state: true,
                topic: true,
                prompt: true,
                title: true,
                body: true,
                publishedAt: true,
                publishAt: true,
                readTime: true,
                imagesUrl: true,
                tags: true,
                focusKeyphrase: true,
                slug: true,
                metaDescription: true,
                aiModel: true,
                aiProvider: true,
                aiStyle: true,
                youtubeUrl: true,
                visitSite: true,
                accountId: true,
                postIdInSocialMediaProvider: true,
                recommendationId: true,
                unsplashPhotoId: true,
                unsplashPhotographerName: true,
                unsplashPhotographerUsername: true,
                unsplashDownloadLocation: true,
            },
        });
        return {
            posts,
            totalCount: totalGenerationCount,
        };
    }
    async updatePost(account, postId, data) {
        this.logger.log('Starting generated post update process');
        if (!data.body &&
            !data.title &&
            !data.tags &&
            !data.hashtags &&
            !data.focusKeyphrase &&
            !data.slug &&
            !data.metaDescription &&
            !data.textContentChange &&
            !data.removeImages &&
            !data.visitSite &&
            !data.state) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.NO_DATA_TO_UPDATE);
        }
        const post = await this.prisma.post.findUnique({
            where: {
                accountId: account.id,
                id: postId,
            },
        });
        if (!post) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.POST_NOT_FOUND);
        }
        if (post.state === model_enums_1.PostState.POSTED.toString()) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.POST_ALREADY_POSTED);
        }
        const updatedPost = await this.prisma.post.update({
            where: {
                accountId: account.id,
                id: postId,
            },
            data: {
                ...(data.body && { body: data.body }),
                ...(data.title && { title: data.title }),
                ...(data.tags && { tags: data.tags }),
                ...(data.hashtags && { tags: data.hashtags }),
                ...(data.focusKeyphrase && { focusKeyphrase: data.focusKeyphrase }),
                ...(data.slug && { slug: data.slug }),
                ...(data.metaDescription && { metaDescription: data.metaDescription }),
                ...(data.textContentChange && { body: data.textContentChange }),
                ...(data.removeImages && { imagesUrl: [] }),
                ...(data.visitSite && { visitSite: data.visitSite }),
                ...(data.state && { state: data.state }),
            },
        });
        if (data.state === model_enums_1.PostState.POSTED &&
            post.state !== model_enums_1.PostState.POSTED.toString()) {
            this.logger.log(`Post ${postId} published, triggering Victor ingestion for account ${account.id}`);
        }
        this.logger.log('Post update process completed successfully');
        return {
            success: true,
            message: 'Post updated successfully',
            postId: updatedPost.id,
            tags: updatedPost.tags,
            body: updatedPost.body,
            socialNetwork: data.socialMediaProvider,
        };
    }
    async trackChunkUsage(generatedPostId, chunkIds, role) {
        await this.prisma.postChunkUsage.createMany({
            data: chunkIds.map((chunkId) => ({
                postId: generatedPostId,
                chunkId,
                role,
            })),
        });
        await Promise.all(chunkIds.map((chunkId) => this.prisma.embeddingChunk.update({
            where: { id: chunkId },
            data: { usageCount: { increment: 1 } },
        })));
    }
    buildVictorContextPreview(data) {
        const result = {};
        const keys = [
            'victorBrandbook',
            'victorSuccessfulBlogs',
            'victorRealExamples',
            'victorInternalLinks',
            'victorCompetitorLearning',
            'victorExternalLinks',
            'victorPastPosts',
            'victorMarketIntel',
        ];
        keys.forEach((key) => {
            const value = data[key];
            if (typeof value === 'string' && value.trim()) {
                result[key] = {
                    length: value.length,
                    full: value,
                };
            }
        });
        return result;
    }
    async generateSocialMediaContentWithLlm(generationData, account) {
        const generationId = generationData.generationId;
        if (!generationId) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.MISSING_GENERATION_ID);
        }
        let generatedContent = null;
        if (!account) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_NOT_FOUND);
        }
        const postGuidelinesData = account.postGuidelines;
        const postGuidelinesDos = postGuidelinesData?.dos?.filter((item) => item.trim()).join(', ') || '';
        const postGuidelinesDonts = postGuidelinesData?.donts?.filter((item) => item.trim()).join(', ') || '';
        const enhancedGenerationData = {
            topic: generationData.topic,
            prompt: generationData.prompt,
            style: generationData.style,
            industryCategory: account.industryCategory,
            subIndustryCategory: account.subIndustryCategory,
            keyFeatures: account.keyFeatures,
            toneOfVoice: account.toneOfVoice,
            values: account.values,
            personality: account.personality,
            about: account.about,
            language: account.language || 'english',
            insight: generationData.insight || '',
            postGuidelinesDos,
            postGuidelinesDonts,
            ...(generationData.sources && {
                sources: generationData.sources,
                hasSources: generationData.sources.all.length > 0,
                sourceCount: {
                    internal: generationData.sources.internal.length,
                    external: generationData.sources.external.length,
                },
            }),
        };
        if (!account) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_NOT_FOUND);
        }
        const usedStepMap = {
            [model_enums_1.SocialMediaProvider.X]: ai_models_service_1.UsedStep.X_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.LINKEDIN]: ai_models_service_1.UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.FACEBOOK]: ai_models_service_1.UsedStep.FACEBOOK_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.INSTAGRAM]: ai_models_service_1.UsedStep.INSTAGRAM_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.PINTEREST]: ai_models_service_1.UsedStep.PINTEREST_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.REDDIT]: ai_models_service_1.UsedStep.REDDIT_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.BLOG]: ai_models_service_1.UsedStep.BLOG_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.LISTICLE]: ai_models_service_1.UsedStep.LISTICLE_CONTENT_POST_GENERATION,
        };
        const usedStep = usedStepMap[generationData.socialMediaProvider];
        if (!usedStep) {
            this.logger.error('Invalid social network for AI settings', {
                socialNetwork: generationData.socialMediaProvider,
            });
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INVALID_SOCIAL_NETWORK_FOR_AI_SETTINGS);
        }
        const aiModelSetting = await this.aiModelsService.getAiStepSettings(usedStep);
        const configKey = `${generationData.socialMediaProvider.toUpperCase()}_POSTS_GENERATION_COUNT`;
        const postsCount = this.configService.get(configKey);
        if (!postsCount) {
            this.logger.error(`${configKey} environment variable is required`);
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.CONFIGURATION_ERROR);
        }
        const draftPosts = await Promise.all(Array.from({ length: postsCount }, async () => {
            return await this.addPostAsDraft(generationId, aiModelSetting, generationData, account.id, generationData.socialMediaProvider);
        }));
        this.lastUsedChunkIds = [];
        const result = await this.socialContentGenerationService.generatePosts(enhancedGenerationData, this.socialContentGenerationService.parseSocialMediaContent.bind(this.socialContentGenerationService), generationData.socialMediaProvider, account, generationData.generateImage);
        generatedContent = {
            posts: result.generatedPosts,
        };
        if (generatedContent == null || !generatedContent.posts) {
            this.logger.error(`No content generated socialMediaProvider ${generationData.socialMediaProvider}`, {
                socialMediaProvider: generationData.socialMediaProvider,
                accountId: account.id,
            });
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.NO_CONTENT_GENERATED);
        }
        const postsWithDraftIds = generatedContent.posts.map((post, index) => ({
            ...post,
            id: draftPosts[index].id,
        }));
        return postsWithDraftIds;
    }
    async removeImages(account, postId, body) {
        const post = await this.prisma.post.findUnique({
            where: {
                accountId: account.id,
                id: postId,
            },
        });
        if (!post) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.POST_NOT_FOUND);
        }
        const imagesToRemove = body.map((image) => image.imageUrl);
        if (!imagesToRemove) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.NO_IMAGES_TO_REMOVE);
        }
        post.imagesUrl = post.imagesUrl.filter((image) => !imagesToRemove.includes(image));
        const updatedPost = await this.prisma.post.update({
            where: {
                accountId: account.id,
                id: postId,
            },
            data: {
                imagesUrl: post.imagesUrl,
            },
        });
        return {
            success: true,
            message: 'Images removed successfully',
            postId: updatedPost.id,
            imagesUrl: updatedPost.imagesUrl,
        };
    }
    async uploadImageToS3AndAddToPost(account, postId) {
        const post = await this.prisma.post.findUnique({
            where: {
                accountId: account.id,
                id: postId,
            },
        });
        if (!post) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.POST_NOT_FOUND);
        }
        const fileIdKey = (0, uuid_1.v4)();
        const imageKey = `user_uploads/${account.id}/images/${postId}/${fileIdKey}.png`;
        const region = this.configService.get('AWS_REGION');
        const bucket = this.configService.get('S3_BUCKET_IGEO_PUBLIC_RESOURCES');
        const preSignedUrl = await this.s3Service.generatePresignedUrl(imageKey, bucket);
        const imageFinalUrl = `https://${bucket}.s3.${region}.amazonaws.com/${imageKey}`;
        post.imagesUrl.push(imageFinalUrl);
        await this.prisma.post.update({
            where: {
                accountId: account.id,
                id: postId,
            },
            data: {
                imagesUrl: post.imagesUrl,
            },
        });
        return {
            signedUrl: preSignedUrl,
            message: 'uploaded image to S3',
        };
    }
    async downloadPictureFromUrl(pictureUrl) {
        try {
            this.logger.log('Fetching picture from URL', { pictureUrl });
            this.logger.log('Fetching picture from URL', { pictureUrl });
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(pictureUrl, {
                responseType: 'arraybuffer',
            }));
            const buffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || 'image/jpeg';
            const filename = `${pictureUrl.split('/').pop() || 'image'}.jpg`;
            this.logger.log('Picture downloaded successfully', { filename });
            return { buffer, contentType, filename };
        }
        catch (error) {
            this.logger.error('Error downloading picture:', error);
            throw error;
        }
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        social_media_content_generation_service_1.SocialContentGenerationService,
        content_validator_service_1.FinalValidationService,
        s3_service_1.S3Service,
        app_logger_service_1.AppLogger,
        ai_models_service_1.AiModelsService,
        config_service_1.ConfigService,
        llm_service_1.LlmService,
        axios_1.HttpService])
], AgentService);
//# sourceMappingURL=agent.service.js.map