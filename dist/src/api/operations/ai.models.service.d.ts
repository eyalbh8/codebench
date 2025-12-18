import { PrismaService } from '../../prisma/prisma.service';
export declare enum UsedStep {
    LINKEDIN_CONTENT_POST_GENERATION = "linkedin_content_post_generation",
    X_CONTENT_POST_GENERATION = "x_content_post_generation",
    FACEBOOK_CONTENT_POST_GENERATION = "facebook_content_post_generation",
    INSTAGRAM_CONTENT_POST_GENERATION = "instagram_content_post_generation",
    PINTEREST_CONTENT_POST_GENERATION = "pinterest_content_post_generation",
    REDDIT_CONTENT_POST_GENERATION = "reddit_content_post_generation",
    LISTICLE_CONTENT_POST_GENERATION = "listicle_content_post_generation",
    BLOG_CONTENT_POST_GENERATION = "blog_content_post_generation"
}
export declare class AiModelsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAiStepSettings(usedStep: UsedStep): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        provider: string;
        model: string;
        usedStep: string;
        inputMessage: string | null;
        enabled: boolean;
    }>;
    static renderTemplate(template: string, context: Record<string, string>): string;
}
