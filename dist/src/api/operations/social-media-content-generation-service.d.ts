import { Account } from '@prisma/client';
import { SocialMediaProvider } from '@/model.enums';
import { ConfigService } from '@/config/config.service';
import { LlmService } from '@/api/operations/llm/llm.service';
import { S3Service } from '@/common/services/s3.service';
import { AppLogger } from '@/utils/app-logger.service';
import { AccountData } from '../dtos-schemes/agent.scheme';
export declare class SocialContentGenerationService {
    private readonly configService;
    private readonly llmService;
    private readonly s3Service;
    private readonly logger;
    constructor(configService: ConfigService, llmService: LlmService, s3Service: S3Service, logger: AppLogger);
    private sanitizeDuplicateFaqHeadings;
    parseSocialMediaContent(response: string): any;
    private parseSocialMediaContentWithSanitization;
    private sanitizeJsonString;
    private buildFaqSchemaFromHtml;
    private repairFaqSchema;
    generateSinglePost<TGenerationData extends {
        topic: string;
        prompt: string;
        style?: string;
    }, TGeneratedPost>(generationData: TGenerationData, parseGeneratedPost: (response: string) => TGeneratedPost, socialMediaProvider: SocialMediaProvider, account: Account, generationId: string, generateImage?: boolean): Promise<TGeneratedPost & {
        id?: string;
        imageUrl?: string;
    }>;
    private getUsedStepForProvider;
    private processLinksForBlog;
    private removeLinks;
    private stripAllLinksAndFormatting;
    generatePosts<TGenerationData extends AccountData, TGeneratedPost>(generationData: TGenerationData, parseGeneratedPost: (response: string) => TGeneratedPost, socialMediaProvider: SocialMediaProvider, account: Account, generateImage?: boolean): Promise<{
        generatedPosts: (TGeneratedPost & {
            id?: string;
            imageUrl?: string;
        })[];
    }>;
}
