import { Account } from '@prisma/client';
import { SocialMediaProvider } from '@/model.enums';
import { PostContentGenerationDto, UpdatePostRequestDto, RemoveImagesRequestDto, GetPostHistoryQueryDto } from '../../dtos-schemes/agent.scheme';
import { AgentService } from '@/api/operations/agent.service';
import { SocialMediaConnectionRouterService } from '@/api/operations/social-media-connection-router.service';
import { PopulatedAccount } from '@/types/api';
export declare class AgentsController {
    private readonly agentService;
    private readonly socialMediaConnectionService;
    constructor(agentService: AgentService, socialMediaConnectionService: SocialMediaConnectionRouterService);
    generatePostContent(account: PopulatedAccount, body: PostContentGenerationDto): Promise<{
        message: string;
        generationId: string;
    }>;
    getPostsHistory(account: PopulatedAccount, query: GetPostHistoryQueryDto): Promise<{
        posts: any[];
        totalCount: number;
    }>;
    updatePostById(account: Account, postId: string, body: UpdatePostRequestDto): Promise<{
        success: boolean;
        message: string;
        postId: string;
        tags: string[];
        body: string;
        socialNetwork: SocialMediaProvider;
    }>;
    removeImagesFromPost(account: Account, postId: string, body: RemoveImagesRequestDto): Promise<{
        success: boolean;
        message: string;
        postId: string;
        imagesUrl: string[];
    }>;
    addImageToPost(account: Account, postId: string): Promise<{
        signedUrl: string;
        message: string;
    }>;
    setSocialMediaAccessToken(account: PopulatedAccount, body: {
        provider: SocialMediaProvider;
        code: string;
        codeVerifier?: string;
        state?: string;
    }): Promise<{
        [key: string]: any;
        message: string;
        provider: string;
    }>;
    getConnectionStatus(account: PopulatedAccount, provider: SocialMediaProvider): Promise<boolean>;
    disconnectSocialMedia(account: PopulatedAccount, body: {
        provider: SocialMediaProvider;
    }): Promise<boolean>;
    publishPostToProvider(account: PopulatedAccount, body: {
        postId: string;
        provider: SocialMediaProvider;
    }): Promise<boolean>;
    selectFacebookPage(account: PopulatedAccount, body: {
        provider: SocialMediaProvider;
        pageId: string;
    }): Promise<{
        message: string;
        provider: string;
    }>;
    getSelectedFacebookPage(account: PopulatedAccount, provider: SocialMediaProvider): Promise<{
        id: string;
        name: string;
        profileImage: string;
    } | null>;
    getLinkedInPostAnalytics(account: PopulatedAccount, postId: string, provider: SocialMediaProvider): Promise<any>;
    getLinkedInPostComments(account: PopulatedAccount, postId: string, provider: SocialMediaProvider): Promise<any[]>;
    getLinkedInPostReactions(account: PopulatedAccount, postId: string, provider: SocialMediaProvider): Promise<any>;
    generateLinkedInShareLink(account: PopulatedAccount, postId: string): Promise<{
        shareUrl: string;
    }>;
}
