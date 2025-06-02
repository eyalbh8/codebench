import { PostContentGenerationData, UpdatePostRequestDto, AgentPostWithGenerationIdDto, RemoveImagesRequestDto } from '../dtos-schemes/agent.scheme';
import { PostState, SocialMediaProvider } from '@/model.enums';
import { PrismaService } from '@/prisma/prisma.service';
import { Account } from '@prisma/client';
import { SocialContentGenerationService } from './social-media-content-generation-service';
import { FinalValidationService } from './content-validator.service';
import { AppLogger } from '@/utils/app-logger.service';
import { AiModelsService } from './ai.models.service';
import { ConfigService } from '@/config/config.service';
import { LlmService } from './llm/llm.service';
import { HttpService } from '@nestjs/axios';
import { S3Service } from '@/common/services/s3.service';
import { PopulatedAccount } from '@/types/api';
export declare class AgentService {
    private readonly prisma;
    private readonly socialContentGenerationService;
    private readonly finalValidationService;
    private readonly s3Service;
    private readonly logger;
    private readonly aiModelsService;
    private readonly configService;
    private readonly llmService;
    private readonly httpService;
    private lastUsedChunkIds;
    private retriedPosts;
    constructor(prisma: PrismaService, socialContentGenerationService: SocialContentGenerationService, finalValidationService: FinalValidationService, s3Service: S3Service, logger: AppLogger, aiModelsService: AiModelsService, configService: ConfigService, llmService: LlmService, httpService: HttpService);
    private readonly EXCLUDED_SOURCE_DOMAINS;
    private isNotGoodDomain;
    private validateLinkSituation;
    private validateLinksSituation;
    checkPostCreationLimitForProvider(account: PopulatedAccount, provider: SocialMediaProvider): Promise<boolean>;
    createPostWithLambda(account: PopulatedAccount, generationData: PostContentGenerationData): Promise<AgentPostWithGenerationIdDto>;
    generatePost(account: PopulatedAccount, generationData: PostContentGenerationData): Promise<{
        id: string;
        text: string;
        hashtags: string[];
        visibility: "PUBLIC" | "PROTECTED";
        estimatedEngagement: number;
        characterCount: number;
        imageUrl?: string | undefined;
        focusKeyphrase?: string | undefined;
        slug?: string | undefined;
        metaDescription?: string | undefined;
        suggestedPostingTime?: string | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }[]>;
    private calculateEstimatedReadingTime;
    private calculateReadTime;
    private shouldRetryGeneratedPost;
    private shouldRetryGeneration;
    private retryGeneratedPost;
    private retryBlogGeneration;
    private filterInvalidListicleEntries;
    markGeneratedPostsAsFailed(generationId: string, errorMessage?: string): Promise<void>;
    private addPostAsDraft;
    getPosts({ account, generationId, socialNetwork, state, take, skip, }: {
        account: PopulatedAccount;
        generationId?: string;
        socialNetwork?: SocialMediaProvider;
        state?: PostState;
        take: number;
        skip: number;
    }): Promise<{
        posts: any[];
        totalCount: number;
    }>;
    updatePost(account: Account, postId: string, data: UpdatePostRequestDto): Promise<{
        success: boolean;
        message: string;
        postId: string;
        tags: string[];
        body: string;
        socialNetwork: SocialMediaProvider;
    }>;
    private trackChunkUsage;
    private buildVictorContextPreview;
    private generateSocialMediaContentWithLlm;
    removeImages(account: Account, postId: string, body: RemoveImagesRequestDto): Promise<{
        success: boolean;
        message: string;
        postId: string;
        imagesUrl: string[];
    }>;
    uploadImageToS3AndAddToPost(account: Account, postId: string): Promise<{
        signedUrl: string;
        message: string;
    }>;
    downloadPictureFromUrl(pictureUrl: string): Promise<{
        buffer: Buffer;
        contentType: string;
        filename: string;
    }>;
}
