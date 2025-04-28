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
exports.FinalValidationService = void 0;
const common_1 = require("@nestjs/common");
const app_logger_service_1 = require("../../utils/app-logger.service");
let FinalValidationService = class FinalValidationService {
    constructor(logger) {
        this.logger = logger;
    }
    validateBlogPostFinal(content) {
        const issues = [];
        const passed = [];
        let score = 100;
        const normalizedLanguage = this.normalizeLanguage(content.language);
        const plainText = this.stripHtml(content.content);
        const wordCount = this.countWords(plainText);
        if (wordCount < 1500) {
            issues.push({
                severity: 'warning',
                category: 'word_count',
                message: `Content is ${wordCount} words. Authority content should be 1500-2500 words.`,
            });
            score -= 15;
        }
        else if (wordCount > 2500) {
            issues.push({
                severity: 'warning',
                category: 'word_count',
                message: `Content is ${wordCount} words. Consider condensing to 1500-2500 words for optimal engagement.`,
            });
            score -= 5;
        }
        else {
            passed.push({
                category: 'word_count',
                message: `Good word count: ${wordCount} words (authority range)`,
            });
        }
        const hasSteps = this.hasNumberedSteps(content.content, normalizedLanguage);
        if (!hasSteps) {
            issues.push({
                severity: 'warning',
                category: 'howto_section',
                message: 'No step-by-step process found. Authority content should include actionable steps.',
            });
            score -= 15;
        }
        else {
            passed.push({
                category: 'howto_section',
                message: 'Contains numbered step-by-step process',
            });
        }
        const hasFAQ = this.hasFAQSection(content.content);
        if (!hasFAQ) {
            issues.push({
                severity: 'error',
                category: 'faq_section',
                message: 'FAQ section is missing or incomplete.',
            });
            score -= 20;
        }
        else {
            passed.push({
                category: 'faq_section',
                message: 'FAQ section present',
            });
        }
        const hasErrorsSection = this.hasCommonMistakesSection(content.content, normalizedLanguage);
        if (!hasErrorsSection) {
            issues.push({
                severity: 'warning',
                category: 'errors_section',
                message: 'No "common mistakes" or "what to avoid" section found.',
            });
            score -= 10;
        }
        else {
            passed.push({
                category: 'errors_section',
                message: 'Contains common mistakes/pitfalls section',
            });
        }
        if (content.focusKeyphrase) {
            const firstParagraph = this.getFirstParagraph(plainText);
            const hasKeyphraseInFirst = firstParagraph
                .toLowerCase()
                .includes(content.focusKeyphrase.toLowerCase());
            if (!hasKeyphraseInFirst) {
                issues.push({
                    severity: 'warning',
                    category: 'seo_keyphrase',
                    message: 'Focus keyphrase not found in first paragraph.',
                });
                score -= 10;
            }
            else {
                passed.push({
                    category: 'seo_keyphrase',
                    message: 'Focus keyphrase appears in first paragraph',
                });
            }
        }
        const h2Count = this.countH2Headings(content.content);
        if (h2Count < 3) {
            issues.push({
                severity: 'warning',
                category: 'heading_structure',
                message: `Only ${h2Count} H2 headings found. Should have at least 3 major sections.`,
            });
            score -= 10;
        }
        else {
            passed.push({
                category: 'heading_structure',
                message: `Good heading structure: ${h2Count} H2 headings`,
            });
        }
        const hasRealData = this.containsRealData(plainText);
        if (!hasRealData) {
            issues.push({
                severity: 'warning',
                category: 'real_examples',
                message: 'No specific metrics, percentages, or timelines found. Authority content should include real data.',
            });
            score -= 10;
        }
        else {
            passed.push({
                category: 'real_examples',
                message: 'Contains specific data/metrics',
            });
        }
        const hasPersonalExp = this.hasPersonalExperience(plainText, normalizedLanguage);
        if (!hasPersonalExp) {
            issues.push({
                severity: 'error',
                category: 'personal_experience',
                message: 'No personal experience or first-person narrative found. Authority content requires real case studies.',
            });
            score -= 20;
        }
        else {
            passed.push({
                category: 'personal_experience',
                message: 'Contains personal experience narrative',
            });
        }
        const bulletListCount = this.countBulletLists(content.content);
        if (bulletListCount > 3) {
            issues.push({
                severity: 'warning',
                category: 'bullet_overuse',
                message: `Found ${bulletListCount} bullet lists. Maximum 3 recommended for narrative flow.`,
            });
            score -= 15;
        }
        else {
            passed.push({
                category: 'bullet_lists',
                message: `Good use of bullets: ${bulletListCount} lists`,
            });
        }
        const aiPhrases = this.detectGenericAIPhrases(plainText);
        if (aiPhrases.length > 0) {
            issues.push({
                severity: 'warning',
                category: 'ai_phrases',
                message: `Generic AI phrases detected: ${aiPhrases.join(', ')}`,
                details: 'Content sounds AI-generated rather than human-written.',
            });
            score -= 10;
        }
        else {
            passed.push({
                category: 'natural_voice',
                message: 'Natural, human-like voice',
            });
        }
        if (content.focusKeyphrase) {
            const isBolded = this.isKeyphraseBolded(content.content, content.focusKeyphrase);
            if (isBolded) {
                issues.push({
                    severity: 'error',
                    category: 'keyword_bolding',
                    message: 'Focus keyphrase is bolded/emphasized. Keywords should be written naturally without formatting.',
                });
                score -= 20;
            }
            else {
                passed.push({
                    category: 'keyword_formatting',
                    message: 'Focus keyphrase not over-emphasized',
                });
            }
        }
        const fabricatedLinks = this.detectFabricatedLinks(content.content);
        if (fabricatedLinks.length > 0) {
            issues.push({
                severity: 'error',
                category: 'fabricated_links',
                message: `Fabricated placeholder links detected: ${fabricatedLinks.join(', ')}`,
                details: 'Links to example.com or similar placeholders are forbidden. Only use real URLs provided by Victor context.',
            });
            score -= 30;
        }
        else {
            passed.push({
                category: 'link_authenticity',
                message: 'No fabricated placeholder links',
            });
        }
        const isAuthorityLevel = score >= 70 && issues.filter((i) => i.severity === 'error').length === 0;
        return {
            isAuthorityLevel,
            score,
            issues,
            passed,
        };
    }
    validatePostGuidelinesFinal(content, guidelines) {
        const violations = [];
        const plainText = this.stripHtml(content).toLowerCase();
        if (guidelines.donts && guidelines.donts.length > 0) {
            for (const dontRule of guidelines.donts) {
                if (!dontRule || dontRule.trim() === '')
                    continue;
                const dontPhrase = dontRule.trim().toLowerCase();
                if (plainText.includes(dontPhrase)) {
                    const contextStart = plainText.indexOf(dontPhrase);
                    const context = plainText.substring(Math.max(0, contextStart - 50), Math.min(plainText.length, contextStart + dontPhrase.length + 50));
                    violations.push({
                        rule: dontRule,
                        severity: 'blocking',
                        context: `...${context}...`,
                    });
                }
            }
        }
        if (guidelines.dos && guidelines.dos.length > 0) {
            for (const doRule of guidelines.dos) {
                if (!doRule || doRule.trim() === '')
                    continue;
                const doPhrase = doRule.trim().toLowerCase();
                if (!plainText.includes(doPhrase)) {
                    violations.push({
                        rule: doRule,
                        severity: 'warning',
                        context: 'Required guideline may not be followed',
                    });
                }
            }
        }
        const hasBlockingViolations = violations.some((v) => v.severity === 'blocking');
        return {
            hasBlockingViolations,
            violations,
        };
    }
    validateListicleFinal(content) {
        const issues = [];
        const passed = [];
        const h2Pattern = /<h2[^>]*>.*?<\/h2>/gi;
        const headings = [];
        const matches = content.content.match(h2Pattern);
        if (matches) {
            for (const match of matches) {
                const headingText = this.stripHtml(match).trim();
                const numberMatch = headingText.match(/^(\d+)\./);
                if (numberMatch) {
                    headings.push({
                        number: parseInt(numberMatch[1], 10),
                        text: headingText,
                        fullMatch: match,
                        contentAfter: content.content
                            .substring(match.indexOf(match) + match.length, match.indexOf(match) + match.length + 200)
                            .trim()
                            .toLowerCase(),
                        headingEndIndex: match.indexOf(match) + match.length,
                    });
                }
            }
        }
        const totalItems = headings.length;
        if (totalItems === 0) {
            issues.push({
                severity: 'error',
                category: 'no_headings',
                message: 'No h2 headings found in listicle content.',
            });
            return {
                hasAllCompanyNames: false,
                missingCompanyNameItems: [],
                score: 0,
                validItems: 0,
                issues,
                passed,
                totalItems,
            };
        }
        const missingNamePatterns = [
            /^\d+\.\s+(is|are|was|were|offers|provides|focuses|serves|caters|specializes|boasts|features|includes|delivers|presents|showcases|represents|stands|emerges|appears|seems|becomes|renowned|known|primarily|mainly|famous)\s+/i,
            /^\d+\.\s+is\s+(renowned|known|primarily|mainly|famous)/i,
            /^\d+\.\s+[a-z]/i,
            /^\d+\.\s*$/i,
            /^\d+\.\s+\[/i,
            /^\d+\.\s+\s*$/i,
            /^\d+\.\s*$/i,
        ];
        const validCompanyNamePattern = /^\d+\.\s+[A-Z][A-Za-z0-9&\s-]+$/;
        let validItems = 0;
        for (const heading of headings) {
            const headingText = heading.text.trim();
            let isValid = false;
            const afterNumber = headingText.replace(/^\d+\.\s*/, '').trim();
            if (afterNumber.length === 0 || afterNumber.length < 2) {
                isValid = false;
            }
            else if (/^(boasts|offers|provides|features|includes|delivers|presents|showcases|represents|stands|is|are|was|were|focuses|serves|caters|specializes|emerges|appears|seems|becomes|renowned|known|primarily|mainly|famous)\s+/i.test(afterNumber)) {
                isValid = false;
            }
            else if (/^(boasts|offers|provides|features|includes|delivers|presents|showcases|represents|stands|is|are|was|were|focuses|serves|caters|specializes|emerges|appears|seems|becomes)\s+/i.test(heading.contentAfter)) {
                isValid = false;
            }
            else if (validCompanyNamePattern.test(headingText)) {
                const matchesMissingPattern = missingNamePatterns.some((pattern) => pattern.test(headingText));
                if (!matchesMissingPattern) {
                    if (afterNumber.length >= 2 &&
                        /^[A-Z]/.test(afterNumber) &&
                        !/^(Is|Are|Was|Were|Offers|Provides|Focuses|Serves|Caters|Specializes|Boasts|Features|Includes|Delivers|Presents|Showcases|Represents|Stands|Emerges|Appears|Seems|Becomes|Renowned|Known|Primarily|Mainly|Famous)\s+/.test(afterNumber)) {
                        isValid = true;
                        validItems++;
                    }
                }
            }
            else if (/^[a-z]/.test(afterNumber)) {
                isValid = false;
            }
            else if (missingNamePatterns.some((pattern) => pattern.test(headingText))) {
                isValid = false;
            }
            if (!isValid) {
                issues.push({
                    severity: 'error',
                    category: 'missing_company_name',
                    message: `Item ${heading.number} is missing a company name: "${headingText}"`,
                    details: `Heading "${headingText}" does not contain a valid company/brand name. Headings must start with a number followed by a company name. Empty headings or headings that start with verbs are invalid.`,
                });
            }
        }
        if (validItems === totalItems) {
            passed.push({
                category: 'company_names',
                message: `All ${totalItems} list items have valid company names`,
            });
        }
        else {
            passed.push({
                category: 'company_names',
                message: `${validItems} of ${totalItems} list items have valid company names`,
            });
        }
        const hasAllCompanyNames = issues.filter((i) => i.category === 'missing_company_name').length === 0;
        if (!hasAllCompanyNames) {
            issues.push({
                severity: 'error',
                category: 'incomplete_listicle',
                message: `Listicle has ${issues.filter((i) => i.category === 'missing_company_name').length} item(s) missing company names: ${issues
                    .filter((i) => i.category === 'missing_company_name')
                    .map((i) => i.message)
                    .join(', ')}`,
                details: `Items without company names should be removed or replaced. Missing items: ${issues
                    .filter((i) => i.category === 'missing_company_name')
                    .map((i) => i.message)
                    .join(', ')}`,
            });
        }
        return {
            hasAllCompanyNames,
            missingCompanyNameItems: issues
                .filter((i) => i.category === 'missing_company_name')
                .map((i) => headings.find((h) => h.text === i.message)?.number ?? 0),
            score: issues.filter((i) => i.severity === 'error').length * 10,
            issues: issues.filter((i) => i.severity !== 'error'),
            passed: passed.filter((p) => p.category !== 'company_names'),
            totalItems,
            validItems: validItems,
        };
    }
    normalizeLanguage(language) {
        if (!language)
            return 'en';
        const normalized = language.toLowerCase().trim();
        const languageMap = {
            english: 'en',
            hebrew: 'he',
            spanish: 'es',
            russian: 'ru',
            german: 'de',
            french: 'fr',
            italian: 'it',
            portuguese: 'pt',
            chinese: 'zh',
            japanese: 'ja',
            korean: 'ko',
            arabic: 'ar',
            hindi: 'hi',
            dutch: 'nl',
            polish: 'pl',
            romanian: 'ro',
        };
        if (normalized.length <= 3 && /^[a-z]{2,3}$/.test(normalized)) {
            return normalized;
        }
        return languageMap[normalized] || 'en';
    }
    getPersonalExperiencePatterns(language) {
        const patterns = {
            en: [
                /\b(?:i|we)\s+(?:found|discovered|noticed|observed|worked with|helped|tested|implemented)/i,
                /\bin my experience\b/i,
                /\bwhen i\b/i,
                /\bwhen we\b/i,
                /\bafter (?:i|we)\b/i,
                /\b(?:i|we)'ve\s+(?:seen|noticed|found)\b/i,
                /\b(?:i|we)\s+(?:saw|tried|experimented)\b/i,
                /\bfrom my work\b/i,
                /\bin \d{4}\s*,?\s*(?:i|we)/i,
            ],
            he: [
                /\b(?:אני|אנחנו)\s+(?:מצאתי|גילינו|שמתי לב|עבדנו|עזרנו|בדקנו|יישמנו)/,
                /דוגמה\s+מהניסיון/,
                /כשסייענו/,
                /מעבודתנו/,
                /ב\s*\d{4}\s*,?\s*(?:אנחנו|אני)/,
                /\b(?:ראינו|שמנו לב|ניסינו)/,
                /אחרי\s+ש(?:אנחנו|אני)/,
            ],
        };
        return patterns[language] || patterns.en;
    }
    getCommonMistakesKeywords(language) {
        const keywords = {
            en: [
                'mistake',
                'error',
                'avoid',
                "don't",
                'pitfall',
                'wrong',
                'common problems',
                'what not to',
            ],
            he: [
                'טעות',
                'טעויות',
                'נפוצות',
                'להימנע',
                'לא',
                'שגיאות',
                'בעיות',
                'מה לא',
                'טעויות נפוצות',
                'להימנע מהן',
            ],
        };
        return keywords[language] || keywords.en;
    }
    getStepByStepIndicators(language) {
        const patterns = {
            en: [/(?:Step\s+\d+[:\-\.]|^\d+\.|<ol[^>]*>)/im],
            he: [
                /שלב\s+\d+[:\-\.]/,
                /^\d+\./m,
                /<ol[^>]*>/i,
                /שלב\s*[א-ת]+\s*[:\-\.]/,
            ],
        };
        return patterns[language] || patterns.en;
    }
    stripHtml(html) {
        return html
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    countWords(text) {
        return text.split(/\s+/).filter((word) => word.length > 0).length;
    }
    hasNumberedSteps(content, language) {
        const stepPatterns = this.getStepByStepIndicators(language);
        return stepPatterns.some((pattern) => pattern.test(content));
    }
    hasFAQSection(content) {
        const faqPattern = /<section[^>]*class="faq-section"[^>]*>|<h2[^>]*>.*?FAQ.*?<\/h2>/i;
        if (!faqPattern.test(content))
            return false;
        const questionCount = (content.match(/<h3[^>]*>.*?\?.*?<\/h3>/gi) || [])
            .length;
        return questionCount >= 3;
    }
    hasCommonMistakesSection(content, language) {
        const plainText = this.stripHtml(content).toLowerCase();
        const errorKeywords = this.getCommonMistakesKeywords(language);
        return errorKeywords.some((keyword) => plainText.includes(keyword));
    }
    getFirstParagraph(text) {
        const paragraphs = text.split(/\n\n+/);
        return paragraphs[0] || '';
    }
    countH2Headings(content) {
        const h2Pattern = /<h2[^>]*>.*?<\/h2>/gi;
        return (content.match(h2Pattern) || []).length;
    }
    containsRealData(text) {
        const dataPatterns = [
            /\d+%/,
            /\d+\s*(?:days?|weeks?|months?|years?|hours?|minutes?)/i,
            /\d+x|x\d+/,
            /\d+\s*(?:increase|decrease|improvement|growth)/i,
            /\$\d+/,
        ];
        return dataPatterns.some((pattern) => pattern.test(text));
    }
    hasPersonalExperience(text, language) {
        const personalPatterns = this.getPersonalExperiencePatterns(language);
        return personalPatterns.some((pattern) => pattern.test(text));
    }
    countBulletLists(content) {
        const ulCount = (content.match(/<ul[^>]*>/gi) || []).length;
        const olCount = (content.match(/<ol[^>]*>/gi) || []).length;
        return ulCount + olCount;
    }
    detectGenericAIPhrases(text) {
        const aiClichés = [
            { pattern: /\bbrimming with\b/i, phrase: 'brimming with' },
            { pattern: /\bvast and wondrous\b/i, phrase: 'vast and wondrous' },
            { pattern: /\bworld is waiting\b/i, phrase: 'world is waiting' },
            {
                pattern: /\bembark on (?:a|your) journey\b/i,
                phrase: 'embark on journey',
            },
            {
                pattern: /\blasting memories await\b/i,
                phrase: 'lasting memories await',
            },
            { pattern: /\bare you yearning for\b/i, phrase: 'are you yearning' },
            { pattern: /\bwhether you're a\b/i, phrase: "whether you're a" },
            { pattern: /\bpack your bags\b/i, phrase: 'pack your bags' },
        ];
        const detected = [];
        for (const cliché of aiClichés) {
            if (cliché.pattern.test(text)) {
                detected.push(cliché.phrase);
            }
        }
        return detected;
    }
    isKeyphraseBolded(content, keyphrase) {
        const escapedKeyphrase = keyphrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boldPatterns = [
            new RegExp(`<b[^>]*>${escapedKeyphrase}</b>`, 'gi'),
            new RegExp(`<strong[^>]*>${escapedKeyphrase}</strong>`, 'gi'),
            new RegExp(`<mark[^>]*>${escapedKeyphrase}</mark>`, 'gi'),
            new RegExp(`<em[^>]*>${escapedKeyphrase}</em>`, 'gi'),
        ];
        return boldPatterns.some((pattern) => pattern.test(content));
    }
    detectFabricatedLinks(content) {
        const fabricatedDomains = [
            'example.com',
            'example.org',
            'placeholder.com',
            'test.com',
            'fake-url.com',
            'your-site.com',
            'website.com',
        ];
        const detected = [];
        for (const domain of fabricatedDomains) {
            const pattern = new RegExp(`href=["']https?://[^"']*${domain}[^"']*["']`, 'gi');
            if (pattern.test(content)) {
                detected.push(domain);
            }
        }
        return detected;
    }
};
exports.FinalValidationService = FinalValidationService;
exports.FinalValidationService = FinalValidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_logger_service_1.AppLogger])
], FinalValidationService);
//# sourceMappingURL=content-validator.service.js.map