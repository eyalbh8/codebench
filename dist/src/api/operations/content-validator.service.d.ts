import { AppLogger } from '@/utils/app-logger.service';
export interface ValidationFinalResult {
    isAuthorityLevel: boolean;
    score: number;
    issues: ValidationFinalIssue[];
    passed: ValidationFinalCheck[];
}
export interface ValidationFinalIssue {
    severity: 'error' | 'warning';
    category: string;
    message: string;
    details?: string;
}
export interface ValidationFinalCheck {
    category: string;
    message: string;
}
export interface PostGuidelinesValidationFinalResult {
    hasBlockingViolations: boolean;
    violations: Array<{
        rule: string;
        severity: 'blocking' | 'warning';
        context: string;
    }>;
}
export interface ListicleValidationFinalResult {
    hasAllCompanyNames: boolean;
    missingCompanyNameItems: number[];
    score: number;
    issues: ValidationFinalIssue[];
    passed: ValidationFinalCheck[];
    totalItems: number;
    validItems: number;
}
export declare class FinalValidationService {
    private readonly logger;
    constructor(logger: AppLogger);
    validateBlogPostFinal(content: {
        title: string;
        content: string;
        focusKeyphrase?: string;
        language?: string;
    }): ValidationFinalResult;
    validatePostGuidelinesFinal(content: string, guidelines: {
        dos?: string[];
        donts?: string[];
    }): PostGuidelinesValidationFinalResult;
    validateListicleFinal(content: {
        content: string;
    }): ListicleValidationFinalResult;
    private normalizeLanguage;
    private getPersonalExperiencePatterns;
    private getCommonMistakesKeywords;
    private getStepByStepIndicators;
    private stripHtml;
    private countWords;
    private hasNumberedSteps;
    private hasFAQSection;
    private hasCommonMistakesSection;
    private getFirstParagraph;
    private countH2Headings;
    private containsRealData;
    private hasPersonalExperience;
    private countBulletLists;
    private detectGenericAIPhrases;
    private isKeyphraseBolded;
    private detectFabricatedLinks;
}
