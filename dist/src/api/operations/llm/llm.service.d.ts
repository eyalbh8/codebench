import { ConfigService } from '@/config/config.service';
import { AiModelsService } from '../ai.models.service';
import { AppLogger } from '@/utils/app-logger.service';
import { Account, Competitor } from '@prisma/client';
import { PromptIntentType, PromptType, SocialMediaProvider } from '@/model.enums';
import { S3Service } from '@/common/services/s3.service';
import { AccountData } from '@/api/dtos-schemes/agent.scheme';
import { PopulatedAccount } from '@/types/api';
import type { AccountWithCompetitors, SocialPostSharedBriefing, SocialPostVisibilityPlan } from '@/types/social-media';
import { OpenaiProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { BlogPatternsService } from '../blog-patterns.service';
import { PrismaService } from '../../../prisma/prisma.service';
export interface LlmProvider {
    makeWebSearchRequest: ({ model, inputMessage, }: {
        model: string;
        inputMessage: string;
    }) => Promise<LlmResponse>;
    makeChatRequest: (inputMessage: string, model: string) => Promise<LlmResponse>;
    makeImageRequest?: (prompt: string, model: string) => Promise<string>;
}
export interface LlmResponse {
    provider: string;
    model: string;
    inputMessage: string;
    output?: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    error?: string | null;
}
export interface GenerateAccountSuggestedPromptsParams {
    account: Account;
    numberOfPrompts: number;
    domain: string;
    topics: string[];
    region: string;
    language: string;
    intentType: PromptIntentType;
    promptType: PromptType;
    additionalInstructions?: string;
    excludeWords?: string;
    existingPrompts?: string[];
}
export declare class LlmService {
    private configService;
    private s3Service;
    private aiModelsService;
    private openaiProvider;
    private geminiProvider;
    private blogPatternsService;
    private prisma;
    private logger;
    private readonly client;
    constructor(configService: ConfigService, s3Service: S3Service, aiModelsService: AiModelsService, openaiProvider: OpenaiProvider, geminiProvider: GeminiProvider, blogPatternsService: BlogPatternsService, prisma: PrismaService, logger: AppLogger);
    generateSocialPostSharedBriefing(account: AccountWithCompetitors, accountData: AccountData): Promise<SocialPostSharedBriefing>;
    generateSocialPostVisibilityPlan(account: AccountWithCompetitors, accountData: AccountData, sharedBriefing: SocialPostSharedBriefing): Promise<SocialPostVisibilityPlan>;
    generateSocialMediaContent(account: Account, provider: SocialMediaProvider, accountData: AccountData): Promise<string>;
    getCompetitorSiteUrl(account: PopulatedAccount, competitor: Competitor): Promise<any>;
    private translateToEnglishIfNeeded;
    trackUnsplashDownload(downloadLocation: string): Promise<void>;
    private sanitizeSocialBriefing;
    private sanitizeVisibilityPlan;
    private parseJsonWithSanitization;
    private sanitizeJsonString;
    private sanitizeJsonForParsing;
    private sanitizeGeneratedContent;
    private escapeRegExp;
    private uploadResponse;
    private getProvider;
}
