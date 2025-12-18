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
exports.SocialContentGenerationService = void 0;
const common_1 = require("@nestjs/common");
const model_enums_1 = require("../../model.enums");
const uuid_1 = require("uuid");
const config_service_1 = require("../../config/config.service");
const llm_service_1 = require("./llm/llm.service");
const s3_service_1 = require("../../common/services/s3.service");
const ai_models_service_1 = require("./ai.models.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const app_error_exception_1 = require("../../exceptions/app-error.exception");
const errors_1 = require("../../constants/errors");
let SocialContentGenerationService = class SocialContentGenerationService {
    constructor(configService, llmService, s3Service, logger) {
        this.configService = configService;
        this.llmService = llmService;
        this.s3Service = s3Service;
        this.logger = logger;
    }
    sanitizeDuplicateFaqHeadings(content) {
        const faqHeadingPattern = /<h2>\s*Frequently Asked Questions\s*<\/h2>/gi;
        const matches = content.match(faqHeadingPattern);
        if (!matches || matches.length <= 1) {
            return content;
        }
        const firstMatch = content.search(faqHeadingPattern);
        if (firstMatch === -1)
            return content;
        const beforeFirst = content.substring(0, firstMatch);
        const afterFirst = content.substring(firstMatch);
        const sanitizedAfter = afterFirst.replace(faqHeadingPattern, (match, offset) => {
            return offset === 0 ? match : '';
        });
        return beforeFirst + sanitizedAfter;
    }
    parseSocialMediaContent(response) {
        let initialCleaned = response.trim();
        if (initialCleaned.startsWith('```')) {
            initialCleaned = initialCleaned.replace(/^```(?:json)?\s*\n?/i, '');
            initialCleaned = initialCleaned.replace(/\n?```\s*$/, '');
            initialCleaned = initialCleaned.trim();
        }
        initialCleaned = initialCleaned
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
        initialCleaned = initialCleaned.replace(/<a href=\\"(?![^"]*https?:\/\/)[^"]*"/g, '<a href=\\"#\\"');
        let repairedResponse = this.repairFaqSchema(initialCleaned);
        const cleanedResponse = this.repairFaqSchema(repairedResponse);
        try {
            const jsonData = this.parseSocialMediaContentWithSanitization(cleanedResponse);
            if (jsonData.slug && typeof jsonData.slug === 'string') {
                try {
                    if (jsonData.slug.includes('%')) {
                        const decodedSlug = decodeURIComponent(jsonData.slug);
                        if (decodedSlug !== jsonData.slug) {
                            this.logger.log(`[parseGeneratedPost] Decoded URL-encoded slug from "${jsonData.slug}" to "${decodedSlug}"`);
                            jsonData.slug = decodedSlug;
                        }
                    }
                }
                catch (slugError) {
                    this.logger.warn(`[parseGeneratedPost] Failed to decode slug: ${slugError}`);
                }
            }
            if (jsonData.content) {
                let contentWithoutSchemas = jsonData.content;
                contentWithoutSchemas = contentWithoutSchemas.replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/gi, '');
                contentWithoutSchemas = contentWithoutSchemas.replace(/<script type=\\"application\/ld\+json\\"[\s\S]*?<\/script>/gi, '');
                contentWithoutSchemas = contentWithoutSchemas.replace(/<script[^>]*ld\+json[^>]*>[\s\S]*?<\/script>/gi, '');
                const removedCount = (jsonData.content.match(/<script[^>]*ld\+json/gi) || []).length;
                if (removedCount > 0) {
                    this.logger.warn(`Removed ${removedCount} LLM-generated schema block(s) - LLM violated prompt instructions`);
                }
                jsonData.content = contentWithoutSchemas.trim();
            }
            if (jsonData.content && jsonData.focusKeyphrase) {
                const originalContent = jsonData.content;
                const keyphrase = jsonData.focusKeyphrase;
                const escapedKeyphrase = keyphrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                jsonData.content = jsonData.content.replace(new RegExp(`<b[^>]*>(${escapedKeyphrase})</b>`, 'gi'), '$1');
                jsonData.content = jsonData.content.replace(new RegExp(`<strong[^>]*>(${escapedKeyphrase})</strong>`, 'gi'), '$1');
                jsonData.content = jsonData.content.replace(new RegExp(`<mark[^>]*>(${escapedKeyphrase})</mark>`, 'gi'), '$1');
                jsonData.content = jsonData.content.replace(new RegExp(`<em[^>]*>(${escapedKeyphrase})</em>`, 'gi'), '$1');
                if (originalContent !== jsonData.content) {
                    this.logger.warn('Auto-removed bold/emphasis from focus keyphrase - LLM violated formatting rules');
                }
            }
            if (jsonData.content) {
                const originalContent = jsonData.content;
                const fabricatedDomains = [
                    'example.com',
                    'example.org',
                    'placeholder.com',
                    'test.com',
                    'authority-site.com',
                    'fake-url.com',
                    'your-site.com',
                    'website.com',
                ];
                for (const domain of fabricatedDomains) {
                    const linkPattern = new RegExp(`<a\\s+[^>]*href=["']https?://[^"']*${domain}[^"']*["'][^>]*>([^<]*)</a>`, 'gi');
                    jsonData.content = jsonData.content.replace(linkPattern, '$1');
                }
                if (originalContent !== jsonData.content) {
                    this.logger.warn('Auto-removed fabricated placeholder links - LLM violated link generation rules');
                }
            }
            if (jsonData.content && jsonData.focusKeyphrase) {
                const originalContent = jsonData.content;
                const keyphrase = jsonData.focusKeyphrase;
                const escapedKeyphrase = keyphrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const keyphraseLinksPattern = new RegExp(`<a\\s+[^>]*href=["'][^"']*["'][^>]*>(${escapedKeyphrase})</a>`, 'gi');
                jsonData.content = jsonData.content.replace(keyphraseLinksPattern, '$1');
                if (originalContent !== jsonData.content) {
                    this.logger.warn('Auto-removed links on focus keyphrase - linking keywords is forbidden');
                }
            }
            if (jsonData.content) {
                jsonData.content = this.stripAllLinksAndFormatting(jsonData.content);
            }
            if (jsonData.content && jsonData.metaDescription) {
                let content = jsonData.content.replace(/\\n/g, '\n');
                content = this.sanitizeDuplicateFaqHeadings(content);
                return {
                    text: `${jsonData.title}\n\n${content}`,
                    hashtags: jsonData.tags || [],
                    visibility: 'PUBLIC',
                    estimatedEngagement: jsonData.seoScore || 5,
                    characterCount: content.length,
                    suggestedPostingTime: undefined,
                    metaDescription: jsonData.metaDescription,
                    excerpt: jsonData.excerpt,
                    readingTime: jsonData.readingTime,
                    seoScore: jsonData.seoScore,
                    focusKeyphrase: jsonData.focusKeyphrase,
                    slug: jsonData.slug,
                };
            }
            if (jsonData.title && jsonData.content && !jsonData.metaDescription) {
                let content = jsonData.content.replace(/\\n/g, '\n');
                content = this.sanitizeDuplicateFaqHeadings(content);
                if (jsonData.excerpt && jsonData.slug) {
                    return {
                        text: `${jsonData.title}\n\n${content}`,
                        hashtags: jsonData.tags || jsonData.hashtags || [],
                        visibility: jsonData.visibility || 'PUBLIC',
                        estimatedEngagement: jsonData.seoScore || jsonData.engagement || 5,
                        characterCount: content.length,
                        suggestedPostingTime: jsonData.posting_time === 'none'
                            ? undefined
                            : jsonData.posting_time,
                        metaDescription: jsonData.metaDescription || jsonData.excerpt,
                        excerpt: jsonData.excerpt,
                        readingTime: jsonData.readingTime,
                        seoScore: jsonData.seoScore,
                        focusKeyphrase: jsonData.focusKeyphrase,
                        slug: jsonData.slug,
                    };
                }
                return {
                    text: `${jsonData.title}\n\n${content}`,
                    hashtags: jsonData.hashtags,
                    visibility: jsonData.visibility,
                    estimatedEngagement: jsonData.engagement,
                    characterCount: content.length,
                    suggestedPostingTime: jsonData.posting_time === 'none'
                        ? undefined
                        : jsonData.posting_time,
                };
            }
            if (jsonData.title && jsonData.description) {
                return {
                    text: `${jsonData.title}\n\n${jsonData.description}`,
                    hashtags: jsonData.hashtags,
                    visibility: jsonData.visibility,
                    estimatedEngagement: jsonData.engagement,
                    characterCount: jsonData.description.length,
                    suggestedPostingTime: jsonData.posting_time === 'none'
                        ? undefined
                        : jsonData.posting_time,
                };
            }
        }
        catch (e) {
            this.logger.error('JSON parsing failed', {
                response,
                error: e instanceof Error ? e.message : String(e),
            });
        }
        this.logger.error('All parsing methods failed', { response });
        throw new Error('Structured parsing failed');
    }
    parseSocialMediaContentWithSanitization(content) {
        const attempts = [];
        const directTrimmed = content.trim();
        if (directTrimmed) {
            attempts.push({ strategy: 'direct', content: directTrimmed });
        }
        const fixedEscaping = directTrimmed.replace(/\\\\\"/g, '\\"');
        if (fixedEscaping !== directTrimmed) {
            attempts.push({ strategy: 'escape-fix', content: fixedEscaping });
        }
        const firstBrace = directTrimmed.indexOf('{');
        const lastBrace = directTrimmed.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const extracted = directTrimmed.slice(firstBrace, lastBrace + 1);
            attempts.push({ strategy: 'brace-extraction', content: extracted });
            const extractedFixed = extracted.replace(/\\\\\"/g, '\\"');
            if (extractedFixed !== extracted) {
                attempts.push({
                    strategy: 'brace-extraction-escaped',
                    content: extractedFixed,
                });
            }
        }
        const sanitized = this.sanitizeJsonString(directTrimmed);
        if (sanitized && !attempts.some((a) => a.content === sanitized)) {
            attempts.push({ strategy: 'sanitized', content: sanitized });
        }
        for (const attempt of attempts) {
            try {
                const parsed = JSON.parse(attempt.content);
                return parsed;
            }
            catch (error) {
                if (attempt === attempts[attempts.length - 1]) {
                    this.logger.error('JSON parsing failed with all strategies', {
                        strategies: attempts.map((a) => a.strategy),
                        firstError: error instanceof Error ? error.message : String(error),
                    });
                    throw error instanceof Error ? error : new Error(String(error));
                }
            }
        }
        throw new Error('Unable to parse JSON response');
    }
    sanitizeJsonString(content) {
        let preprocessed = content;
        preprocessed = preprocessed.replace(/\\\\\"/g, '\\"');
        preprocessed = preprocessed.replace(/\\\\\\\\\"/g, '\\"');
        let result = '';
        let inString = false;
        let escapeNext = false;
        for (let i = 0; i < preprocessed.length; i += 1) {
            const char = preprocessed[i];
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
                    result += char;
                    inString = false;
                    continue;
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
    buildFaqSchemaFromHtml(htmlContent) {
        try {
            const faqSectionMatch = htmlContent.match(/<section class="faq-section">(.*?)<\/section>/s);
            if (!faqSectionMatch) {
                return null;
            }
            const faqHtml = faqSectionMatch[1];
            const questions = [];
            const faqItemRegex = /<div class="faq-item">.*?<h3>(.*?)<\/h3>.*?<p>(.*?)<\/p>.*?<\/div>/gs;
            let match;
            while ((match = faqItemRegex.exec(faqHtml)) !== null) {
                questions.push({
                    question: match[1].trim(),
                    answer: match[2].trim().replace(/<[^>]*>/g, ''),
                });
            }
            if (questions.length === 0) {
                return null;
            }
            const mainEntity = questions.map((q) => ({
                '@type': 'Question',
                name: q.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: q.answer,
                },
            }));
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: mainEntity,
            };
            const schemaStr = JSON.stringify(schema, null, 2);
            return `\n<script type="application/ld+json">\n${schemaStr}\n</script>`;
        }
        catch (error) {
            this.logger.error('Failed to build FAQ schema from HTML', error);
            return null;
        }
    }
    repairFaqSchema(content) {
        if (!content.includes('<script type="application/ld+json">') &&
            !content.includes('"faqSchema"')) {
            return content;
        }
        let repaired = content;
        let fixesApplied = 0;
        if (repaired.includes('"@context":') ||
            repaired.includes('\\"@context\\"')) {
            const spacePattern = /"@context":\s*"\s*"\s*"@type"/g;
            if (spacePattern.test(repaired)) {
                repaired = repaired.replace(/"@context":\s*"\s*"\s*"@type"/g, '"@context": "https://schema.org",\n "@type"');
                fixesApplied++;
                this.logger.warn('Fixed CRITICAL @context with space then @type');
            }
            const escapedSpacePattern = /\\"@context\\":\s*\\"\s*\\"\s*\\"@type\\"/g;
            if (escapedSpacePattern.test(repaired)) {
                repaired = repaired.replace(/\\"@context\\":\s*\\"\s*\\"\s*\\"@type\\"/g, '\\"@context\\": \\"https://schema.org\\",\\n \\"@type\\"');
                fixesApplied++;
                this.logger.warn('Fixed CRITICAL @context (escaped) with space then @type');
            }
            const newlinePattern = /"@context":\s*"(?:\s*[\r\n]|\\n)/g;
            if (newlinePattern.test(repaired)) {
                repaired = repaired.replace(/"@context":\s*"(?:\s*[\r\n]|\\n)/g, '"@context": "https://schema.org",\n');
                fixesApplied++;
                this.logger.warn('Fixed CRITICAL @context with newline');
            }
        }
        const severelyMalformedPattern = /\{"@context"\s*:\s*"(?!https:\/\/schema\.org)[^"]*"/g;
        if (severelyMalformedPattern.test(repaired)) {
            this.logger.warn('Detected severely malformed FAQ schema - attempting full repair');
            const scriptMatch = repaired.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
            if (scriptMatch) {
                try {
                    const faqSectionMatch = repaired.match(/<section class="faq-section">(.*?)<\/section>/s);
                    if (faqSectionMatch) {
                        const faqHtml = faqSectionMatch[1];
                        const questions = [];
                        const faqItemRegex = /<div class="faq-item">.*?<h3>(.*?)<\/h3>.*?<p>(.*?)<\/p>.*?<\/div>/gs;
                        let match;
                        while ((match = faqItemRegex.exec(faqHtml)) !== null) {
                            questions.push({
                                question: match[1].trim(),
                                answer: match[2].trim().replace(/<[^>]*>/g, ''),
                            });
                        }
                        if (questions.length > 0) {
                            const mainEntity = questions.map((q) => ({
                                '@type': 'Question',
                                name: q.question,
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: q.answer,
                                },
                            }));
                            const properSchema = {
                                '@context': 'https://schema.org',
                                '@type': 'FAQPage',
                                mainEntity: mainEntity,
                            };
                            const properSchemaStr = JSON.stringify(properSchema, null, 2);
                            repaired = repaired.replace(/<script type="application\/ld\+json">.*?<\/script>/s, `<script type="application/ld+json">\n${properSchemaStr}\n</script>`);
                            fixesApplied++;
                            this.logger.log('Successfully reconstructed FAQ schema from HTML', { questionsFound: questions.length });
                        }
                    }
                }
                catch (error) {
                    this.logger.error('Failed to reconstruct FAQ schema', error);
                }
            }
        }
        const incompleteUrlPattern = /"@context":\s*"https?:\/?\/?(?!schema\.org)[^"]*",?/g;
        if (incompleteUrlPattern.test(repaired)) {
            const before = repaired;
            repaired = repaired.replace(/"@context":\s*"https?:\/?\/?(?!schema\.org)[^"]*"/g, '"@context": "https://schema.org"');
            if (before !== repaired) {
                fixesApplied++;
                this.logger.warn('Fixed incomplete @context URL (e.g., "https://" → "https://schema.org")');
            }
        }
        const contextPatterns = [
            /"@context":\s*"\s*\\n/g,
            /"@context":\s*"\s*\n/g,
            /"@context":\s*""\s*,?\s*\n/g,
            /"@context":\s*"\s+"/g,
            /"@context":\\s*"\\s*\\n/g,
        ];
        for (const pattern of contextPatterns) {
            const before = repaired;
            repaired = repaired.replace(pattern, '"@context": "https://schema.org",\n');
            if (before !== repaired) {
                fixesApplied++;
                this.logger.warn('Fixed truncated @context pattern', {
                    pattern: pattern.toString(),
                });
            }
        }
        if (fixesApplied > 0) {
            this.logger.warn('Repaired FAQ schema', {
                fixesApplied,
                method: 'pattern-matching and reconstruction',
            });
        }
        return repaired;
    }
    async generateSinglePost(generationData, parseGeneratedPost, socialMediaProvider, account, generationId, generateImage = false) {
        try {
            this.logger.log(`[generateSinglePost] Starting generation for provider: ${socialMediaProvider}, topic: ${generationData.topic}`);
            const content = await this.llmService.generateSocialMediaContent(account, socialMediaProvider, generationData);
            this.logger.log(`[generateSinglePost] LLM content generated successfully, length: ${JSON.stringify(content).length}`);
            const uniqueId = (0, uuid_1.v4)();
            try {
                await this.s3Service.putObject(JSON.stringify(content, null, 2), `${socialMediaProvider}/content-generation/${account.id}/${generationId}_${uniqueId}.json`);
            }
            catch (error) {
                this.logger.warn(`Error uploading content to S3: ${error}`);
            }
            this.logger.log(`[generateSinglePost] Parsing generated post...`);
            const parsedPost = parseGeneratedPost(content);
            this.logger.log(`[generateSinglePost] Post parsed successfully`);
            let imageUrl;
            let unsplashData;
            const result = {
                ...parsedPost,
                imageUrl,
            };
            const unsplashUrl = 'https://unsplash.com?utm_source=igeo_app&utm_medium=referral';
            let creditLine;
            if (unsplashData?.photographerName && imageUrl) {
                const photographerLabel = unsplashData.photographerUsername
                    ? `${unsplashData.photographerName} (@${unsplashData.photographerUsername})`
                    : unsplashData.photographerName;
                const photographerUrl = unsplashData.photographerUsername
                    ? `https://unsplash.com/@${unsplashData.photographerUsername}?utm_source=igeo_app&utm_medium=referral`
                    : unsplashUrl;
                creditLine = `\n\nPhoto by [${photographerLabel}](${photographerUrl}) via [Unsplash](${unsplashUrl})`;
            }
            if (socialMediaProvider !== model_enums_1.SocialMediaProvider.BLOG &&
                socialMediaProvider !== model_enums_1.SocialMediaProvider.LISTICLE) {
                creditLine = '';
            }
            const resultWithText = result;
            if (creditLine) {
                if (typeof resultWithText.text === 'string' && resultWithText.text) {
                    resultWithText.text = `${resultWithText.text}${creditLine}`;
                }
                else {
                    resultWithText.text = creditLine.trimStart();
                }
            }
            if (typeof resultWithText.text === 'string') {
                const shouldKeepLinks = socialMediaProvider === model_enums_1.SocialMediaProvider.BLOG ||
                    socialMediaProvider === model_enums_1.SocialMediaProvider.LISTICLE;
                this.logger.log(`[generateSinglePost] Processing text links, shouldKeepLinks: ${shouldKeepLinks}`);
                if (!shouldKeepLinks) {
                    resultWithText.text = this.removeLinks(resultWithText.text, !!imageUrl);
                }
                else {
                    resultWithText.text = this.processLinksForBlog(resultWithText.text, !!imageUrl);
                }
                this.logger.log(`[generateSinglePost] Text processing completed`);
            }
            this.logger.log(`[generateSinglePost] Successfully completed generation for provider: ${socialMediaProvider}`);
            return result;
        }
        catch (error) {
            this.logger.error(`[generateSinglePost] Error generating post:`, error);
            this.logger.log(`[generateSinglePost] Error stack: ${error instanceof Error ? error.stack : 'N/A'}`);
            throw new app_error_exception_1.ApplicationErrorException(errors_1.EXTERNAL_SERVICE_ERRORS.LLM_SERVICE_ERROR, undefined, `Error generating post: ${error}`);
        }
    }
    getUsedStepForProvider(provider) {
        const stepMap = {
            [model_enums_1.SocialMediaProvider.X]: ai_models_service_1.UsedStep.X_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.LINKEDIN]: ai_models_service_1.UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.FACEBOOK]: ai_models_service_1.UsedStep.FACEBOOK_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.INSTAGRAM]: ai_models_service_1.UsedStep.INSTAGRAM_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.PINTEREST]: ai_models_service_1.UsedStep.PINTEREST_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.REDDIT]: ai_models_service_1.UsedStep.REDDIT_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.BLOG]: ai_models_service_1.UsedStep.BLOG_CONTENT_POST_GENERATION,
            [model_enums_1.SocialMediaProvider.LISTICLE]: ai_models_service_1.UsedStep.LISTICLE_CONTENT_POST_GENERATION,
        };
        return stepMap[provider];
    }
    processLinksForBlog(content, keepImageCredit = false) {
        const creditRegex = /\n*\s*Photo by \[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s+via\s+\[Unsplash\]\((https?:\/\/[^\s)]+)\)/i;
        const creditMatch = content.match(creditRegex);
        const creditLine = creditMatch ? creditMatch[0].trim() : '';
        let processed = creditMatch
            ? content.replace(creditRegex, '').trimEnd()
            : content;
        const protectedUrls = new Map();
        let counter = 0;
        processed = processed.replace(/<a\s+([^>]*?)href\s*=\s*(["'])([^"']+)\2([^>]*?)>/gi, (match, beforeHref, quote, url, afterHref) => {
            const placeholder = `__HREF_PROTECTED_${counter}__`;
            protectedUrls.set(placeholder, url);
            counter++;
            return `<a ${beforeHref}href=${quote}${placeholder}${quote}${afterHref}>`;
        });
        processed = processed
            .replace(/\[([^\]]+)\]\(https?:\/\/[^\s)]+\)/g, '$1')
            .replace(/(?<!["'=])https?:\/\/[^\s<>"']+/g, '')
            .replace(/(?<!["'=])\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,})(?:\/[^\s<>"']*)?/gi, '')
            .replace(/\(\s*\)/g, '')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
        protectedUrls.forEach((url, placeholder) => {
            processed = processed.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), url);
        });
        const remainingPlaceholders = (processed.match(/__HREF_PROTECTED_\d+__/g) || []).length;
        if (remainingPlaceholders > 0) {
            this.logger.error(`Failed to restore ${remainingPlaceholders} link placeholders!`);
        }
        if (creditLine && keepImageCredit) {
            const htmlCredit = creditLine.replace(/Photo by \[([^\]]+)\]\(([^)]+)\)\s+via\s+\[Unsplash\]\(([^)]+)\)/i, '<p>Photo by <a href="$2" target="_blank" rel="noopener noreferrer">$1</a> via <a href="$3" target="_blank" rel="noopener noreferrer">Unsplash</a></p>');
            processed = processed ? `${processed}\n\n${htmlCredit}` : htmlCredit;
        }
        return processed;
    }
    removeLinks(content, keepImageCredit = false) {
        const creditRegex = /\n*\s*Photo by \[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s+via\s+\[Unsplash\]\((https?:\/\/[^\s)]+)\)/i;
        const creditMatch = content.match(creditRegex);
        const creditLine = creditMatch ? creditMatch[0].trim() : '';
        let sanitized = creditMatch
            ? content.replace(creditRegex, '').trimEnd()
            : content;
        sanitized = sanitized
            .replace(/<a\s+[^>]*>([^<]*)<\/a>/gi, '$1')
            .replace(/\[([^\]]+)\]\(https?:\/\/[^\s)]+\)/g, '$1')
            .replace(/https?:\/\/[^\s<>"']+/g, '')
            .replace(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,})(?:\/[^\s]*)?/gi, '')
            .replace(/\(\s*\)/g, '')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
        return sanitized;
    }
    stripAllLinksAndFormatting(content) {
        let sanitized = content;
        sanitized = sanitized.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
        sanitized = sanitized.replace(/<a[^>]*?\s+([^<]+)<\/a>/gi, '$1');
        sanitized = sanitized.replace(/<\/?a[^>]*>/gi, '');
        sanitized = sanitized.replace(/<\/?(strong|b|em|i)[^>]*>/gi, '');
        sanitized = sanitized.replace(/\[(.*?)\]\s*\((https?:\/\/[^\s)]+)\)/g, '$1');
        sanitized = sanitized.replace(/https?:\/\/\S+/g, '');
        sanitized = sanitized.replace(/\b(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,})(?:\/[^\s]*)?/gi, '');
        sanitized = sanitized
            .replace(/\(\s*\)/g, '')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
        return sanitized;
    }
    async generatePosts(generationData, parseGeneratedPost, socialMediaProvider, account, generateImage = false) {
        const configKey = `${socialMediaProvider.toUpperCase()}_POSTS_GENERATION_COUNT`;
        const postsCount = this.configService.get(configKey);
        if (!postsCount) {
            this.logger.error(`${configKey} environment variable is required`);
            throw new Error(`${configKey} environment variable is required`);
        }
        const generationId = (0, uuid_1.v4)();
        const postPromises = Array.from({ length: postsCount }, async () => {
            return await this.generateSinglePost(generationData, parseGeneratedPost, socialMediaProvider, account, generationId, generateImage);
        });
        const results = await Promise.all(postPromises);
        return { generatedPosts: results };
    }
};
exports.SocialContentGenerationService = SocialContentGenerationService;
exports.SocialContentGenerationService = SocialContentGenerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        llm_service_1.LlmService,
        s3_service_1.S3Service,
        app_logger_service_1.AppLogger])
], SocialContentGenerationService);
//# sourceMappingURL=social-media-content-generation-service.js.map