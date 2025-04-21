"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostShareLinkResponseDto = exports.PostReactionsMetricsDto = exports.SocialMediaCommentsCollectionDto = exports.SocialMediaCommentDataDto = exports.SocialMediaPostAnalyticsMetricsDto = exports.PostShareLinkResponseSchema = exports.PostReactionsMetricsSchema = exports.SocialMediaCommentDataSchema = exports.CommentAuthorProfileSchema = exports.SocialMediaPostAnalyticsMetricsSchema = exports.PostHistoryQueryParametersDto = exports.PostModificationOperationResponseDto = exports.PostUpdateModificationRequestDto = exports.PostHistoryPaginationResponseDto = exports.ContentGenerationResponsePayloadDto = exports.GeneratedPostContentItemDto = exports.SocialMediaContentGenerationRequestDto = exports.PostWithGenerationIdentifierDto = exports.SocialMediaPostContentDto = exports.ImageRemovalRequestDto = exports.PostHistoryQueryParametersSchema = exports.PostModificationOperationResponseSchema = exports.AccountContextForContentGenerationSchema = exports.PostHistoryPaginationResponseSchema = exports.HistoricalPostRecordSchema = exports.ContentGenerationResponsePayloadSchema = exports.GeneratedPostContentCollectionSchema = exports.GeneratedPostContentItemSchema = exports.PostUpdateModificationRequestSchema = exports.SocialMediaContentGenerationRequestSchema = exports.PostWithGenerationIdentifierSchema = exports.SocialMediaPostContentSchema = exports.ImageRemovalRequestValidationSchema = void 0;
const zod_1 = require("zod");
const nestjs_zod_1 = require("nestjs-zod");
const model_enums_1 = require("../../model.enums");
const model_enums_2 = require("../../model.enums");
exports.ImageRemovalRequestValidationSchema = zod_1.z.array(zod_1.z.object({
    imageUrl: zod_1.z.string().describe('The URL of the image to remove'),
}));
exports.SocialMediaPostContentSchema = zod_1.z.object({
    text: zod_1.z.string(),
    imageUrl: zod_1.z.string().optional(),
    hashtags: zod_1.z.array(zod_1.z.string()).optional(),
    visibility: zod_1.z.enum(['PUBLIC', 'PROTECTED']),
});
exports.PostWithGenerationIdentifierSchema = zod_1.z.object({
    generationId: zod_1.z.string(),
    message: zod_1.z.string(),
});
exports.SocialMediaContentGenerationRequestSchema = zod_1.z.object({
    generationId: zod_1.z.string().optional(),
    topic: zod_1.z.string().describe('The main topic for the X post'),
    prompt: zod_1.z.string().describe('Specific prompt or context for the post'),
    style: zod_1.z
        .enum([
        'professional',
        'casual',
        'educational',
        'inspirational',
        'news',
        'story',
    ])
        .optional()
        .describe('The tone and style of the post'),
    socialMediaProvider: zod_1.z.nativeEnum(model_enums_1.SocialMediaProvider),
    generateImage: zod_1.z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to generate an image for the post'),
    visitSite: zod_1.z
        .string()
        .optional()
        .describe('URL for Pinterest visit_site field'),
    selectedSubreddit: zod_1.z.string().optional(),
    recommendationId: zod_1.z
        .string()
        .optional()
        .describe('ID of the recommendation from insights'),
});
exports.PostUpdateModificationRequestSchema = zod_1.z
    .object({
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    hashtags: zod_1.z.array(zod_1.z.string()).optional(),
    focusKeyphrase: zod_1.z.string().optional(),
    slug: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    textContentChange: zod_1.z.string().optional(),
    socialMediaProvider: zod_1.z.nativeEnum(model_enums_1.SocialMediaProvider),
    removeImages: zod_1.z.boolean().optional(),
    visitSite: zod_1.z.string().optional(),
    state: zod_1.z.nativeEnum(model_enums_2.PostState).optional(),
})
    .refine((requestPayload) => {
    return (requestPayload.body ||
        requestPayload.title ||
        requestPayload.tags ||
        requestPayload.hashtags ||
        requestPayload.focusKeyphrase ||
        requestPayload.slug ||
        requestPayload.metaDescription ||
        requestPayload.textContentChange ||
        requestPayload.removeImages ||
        requestPayload.visitSite ||
        requestPayload.state);
}, {
    message: 'At least one field must be provided for update',
    path: [
        'body',
        'title',
        'tags',
        'hashtags',
        'focusKeyphrase',
        'slug',
        'metaDescription',
        'removeImages',
        'visitSite',
        'state',
    ],
});
exports.GeneratedPostContentItemSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique identifier for the generated post'),
    text: zod_1.z.string().describe('The main post content'),
    hashtags: zod_1.z.array(zod_1.z.string()).describe('Relevant hashtags'),
    visibility: zod_1.z
        .enum(['PUBLIC', 'PROTECTED'])
        .describe('Recommended visibility'),
    estimatedEngagement: zod_1.z.number().describe('Estimated engagement score (1-10)'),
    characterCount: zod_1.z.number().describe('Character count of the post'),
    suggestedPostingTime: zod_1.z
        .string()
        .optional()
        .describe('Suggested optimal posting time'),
    imageUrl: zod_1.z.string().optional(),
    focusKeyphrase: zod_1.z.string().optional().describe('SEO focus keyphrase'),
    slug: zod_1.z.string().optional().describe('URL-friendly slug'),
    metaDescription: zod_1.z.string().optional().describe('SEO meta description'),
    unsplashPhotoId: zod_1.z.string().nullish().describe('Unsplash photo ID'),
    unsplashPhotographerName: zod_1.z
        .string()
        .nullish()
        .describe('Unsplash photographer name'),
    unsplashPhotographerUsername: zod_1.z
        .string()
        .nullish()
        .describe('Unsplash photographer username'),
    unsplashDownloadLocation: zod_1.z
        .string()
        .nullish()
        .describe('Unsplash download location for tracking'),
});
exports.GeneratedPostContentCollectionSchema = zod_1.z.array(exports.GeneratedPostContentItemSchema);
exports.ContentGenerationResponsePayloadSchema = zod_1.z.object({
    posts: exports.GeneratedPostContentCollectionSchema,
});
exports.HistoricalPostRecordSchema = zod_1.z.object({
    id: zod_1.z.string(),
    generationId: zod_1.z.string(),
    accountId: zod_1.z.string(),
    topic: zod_1.z.string(),
    prompt: zod_1.z.string(),
    socialMediaProvider: zod_1.z.nativeEnum(model_enums_1.SocialMediaProvider),
    title: zod_1.z.string(),
    body: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    focusKeyphrase: zod_1.z.string().nullable().optional(),
    slug: zod_1.z.string().nullable().optional(),
    metaDescription: zod_1.z.string().nullable().optional(),
    readTime: zod_1.z.number().nullable(),
    imagesUrl: zod_1.z.array(zod_1.z.string()),
    youtubeUrl: zod_1.z.string().nullable(),
    visitSite: zod_1.z.string().nullable(),
    state: zod_1.z.enum([
        'SUGGESTED',
        'TO_BE_PUBLISHED',
        'SCHEDULED',
        'POSTED',
        'CANCELED',
        'FAILED',
        'IN_PROGRESS',
        'DELETED',
    ]),
    createdAt: zod_1.z.date(),
    publishedAt: zod_1.z.date().nullable(),
    publishAt: zod_1.z.date().nullable(),
    aiModel: zod_1.z.string(),
    aiProvider: zod_1.z.string(),
    aiStyle: zod_1.z.string().nullable(),
    data: zod_1.z.any().optional(),
    postIdInSocialMediaProvider: zod_1.z.string().nullable(),
    recommendationId: zod_1.z.string().nullable().optional(),
    unsplashPhotoId: zod_1.z.string().nullish(),
    unsplashPhotographerName: zod_1.z.string().nullish(),
    unsplashPhotographerUsername: zod_1.z.string().nullish(),
    unsplashDownloadLocation: zod_1.z.string().nullish(),
});
exports.PostHistoryPaginationResponseSchema = zod_1.z.object({
    posts: zod_1.z.array(exports.HistoricalPostRecordSchema),
    totalCount: zod_1.z.number(),
});
exports.AccountContextForContentGenerationSchema = zod_1.z.object({
    topic: zod_1.z.string(),
    prompt: zod_1.z.string(),
    style: zod_1.z.string().optional(),
    about: zod_1.z.string().nullable().optional(),
    industryCategory: zod_1.z.string().nullable().optional(),
    subIndustryCategory: zod_1.z.string().nullable().optional(),
    keyFeatures: zod_1.z.array(zod_1.z.string()).nullable().optional(),
    toneOfVoice: zod_1.z.array(zod_1.z.string()).nullable().optional(),
    values: zod_1.z.array(zod_1.z.string()).nullable().optional(),
    personality: zod_1.z.array(zod_1.z.string()).nullable().optional(),
    language: zod_1.z.string().nullable().optional(),
    insight: zod_1.z.string().optional(),
    victorBrandbook: zod_1.z.string().optional(),
    victorPastPosts: zod_1.z.string().optional(),
    victorMarketIntel: zod_1.z.string().optional(),
    victorSuccessfulBlogs: zod_1.z.string().optional(),
    victorRealExamples: zod_1.z.string().optional(),
    victorInternalLinks: zod_1.z.string().optional(),
    victorCompetitorLearning: zod_1.z.string().optional(),
    victorExternalLinks: zod_1.z.string().optional(),
    sources: zod_1.z
        .object({
        internal: zod_1.z.array(zod_1.z.object({
            url: zod_1.z.string(),
            title: zod_1.z.string().optional(),
        })),
        external: zod_1.z.array(zod_1.z.object({
            url: zod_1.z.string(),
            title: zod_1.z.string().optional(),
        })),
        all: zod_1.z.array(zod_1.z.object({
            url: zod_1.z.string(),
            title: zod_1.z.string().optional(),
        })),
    })
        .optional(),
    hasSources: zod_1.z.boolean().optional(),
    sourceCount: zod_1.z
        .object({
        internal: zod_1.z.number(),
        external: zod_1.z.number(),
    })
        .optional(),
});
exports.PostModificationOperationResponseSchema = zod_1.z.object({
    signedUrl: zod_1.z.string().optional(),
    message: zod_1.z.string(),
});
exports.PostHistoryQueryParametersSchema = zod_1.z.object({
    take: zod_1.z.coerce.number().int().positive().describe('Number of posts to take'),
    skip: zod_1.z.coerce.number().int().min(0).describe('Number of posts to skip'),
    generationId: zod_1.z.string().optional().describe('Filter by generation ID'),
    socialNetwork: zod_1.z
        .nativeEnum(model_enums_1.SocialMediaProvider)
        .optional()
        .describe('Filter by social network'),
    state: zod_1.z.nativeEnum(model_enums_2.PostState).optional().describe('Filter by post state'),
});
class ImageRemovalRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.ImageRemovalRequestValidationSchema) {
}
exports.ImageRemovalRequestDto = ImageRemovalRequestDto;
class SocialMediaPostContentDto extends (0, nestjs_zod_1.createZodDto)(exports.SocialMediaPostContentSchema) {
}
exports.SocialMediaPostContentDto = SocialMediaPostContentDto;
class PostWithGenerationIdentifierDto extends (0, nestjs_zod_1.createZodDto)(exports.PostWithGenerationIdentifierSchema) {
}
exports.PostWithGenerationIdentifierDto = PostWithGenerationIdentifierDto;
class SocialMediaContentGenerationRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.SocialMediaContentGenerationRequestSchema) {
}
exports.SocialMediaContentGenerationRequestDto = SocialMediaContentGenerationRequestDto;
class GeneratedPostContentItemDto extends (0, nestjs_zod_1.createZodDto)(exports.GeneratedPostContentItemSchema) {
}
exports.GeneratedPostContentItemDto = GeneratedPostContentItemDto;
class ContentGenerationResponsePayloadDto extends (0, nestjs_zod_1.createZodDto)(exports.ContentGenerationResponsePayloadSchema) {
}
exports.ContentGenerationResponsePayloadDto = ContentGenerationResponsePayloadDto;
class PostHistoryPaginationResponseDto extends (0, nestjs_zod_1.createZodDto)(exports.PostHistoryPaginationResponseSchema) {
}
exports.PostHistoryPaginationResponseDto = PostHistoryPaginationResponseDto;
class PostUpdateModificationRequestDto extends (0, nestjs_zod_1.createZodDto)(exports.PostUpdateModificationRequestSchema) {
}
exports.PostUpdateModificationRequestDto = PostUpdateModificationRequestDto;
class PostModificationOperationResponseDto extends (0, nestjs_zod_1.createZodDto)(exports.PostModificationOperationResponseSchema) {
}
exports.PostModificationOperationResponseDto = PostModificationOperationResponseDto;
class PostHistoryQueryParametersDto extends (0, nestjs_zod_1.createZodDto)(exports.PostHistoryQueryParametersSchema) {
}
exports.PostHistoryQueryParametersDto = PostHistoryQueryParametersDto;
exports.SocialMediaPostAnalyticsMetricsSchema = zod_1.z.object({
    impressions: zod_1.z.number().describe('Total impressions'),
    clicks: zod_1.z.number().describe('Total clicks'),
    likes: zod_1.z.number().describe('Total reactions/likes'),
    comments: zod_1.z.number().describe('Total comments'),
    shares: zod_1.z.number().describe('Total shares'),
    engagementRate: zod_1.z.number().describe('Engagement rate percentage'),
    demographics: zod_1.z
        .object({
        topLocations: zod_1.z.array(zod_1.z.string()),
        topIndustries: zod_1.z.array(zod_1.z.string()),
        seniorityLevels: zod_1.z.array(zod_1.z.object({
            level: zod_1.z.string(),
            percentage: zod_1.z.number(),
        })),
    })
        .optional(),
});
exports.CommentAuthorProfileSchema = zod_1.z.object({
    name: zod_1.z.string(),
    headline: zod_1.z.string(),
    profileUrl: zod_1.z.string(),
    photoUrl: zod_1.z.string(),
});
exports.SocialMediaCommentDataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    author: exports.CommentAuthorProfileSchema,
    text: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
exports.PostReactionsMetricsSchema = zod_1.z.object({
    like: zod_1.z.number(),
    celebrate: zod_1.z.number(),
    support: zod_1.z.number(),
    love: zod_1.z.number(),
    insightful: zod_1.z.number(),
    funny: zod_1.z.number(),
});
exports.PostShareLinkResponseSchema = zod_1.z.object({
    shareUrl: zod_1.z.string(),
});
class SocialMediaPostAnalyticsMetricsDto extends (0, nestjs_zod_1.createZodDto)(exports.SocialMediaPostAnalyticsMetricsSchema) {
}
exports.SocialMediaPostAnalyticsMetricsDto = SocialMediaPostAnalyticsMetricsDto;
class SocialMediaCommentDataDto extends (0, nestjs_zod_1.createZodDto)(exports.SocialMediaCommentDataSchema) {
}
exports.SocialMediaCommentDataDto = SocialMediaCommentDataDto;
class SocialMediaCommentsCollectionDto extends (0, nestjs_zod_1.createZodDto)(zod_1.z.array(exports.SocialMediaCommentDataSchema)) {
}
exports.SocialMediaCommentsCollectionDto = SocialMediaCommentsCollectionDto;
class PostReactionsMetricsDto extends (0, nestjs_zod_1.createZodDto)(exports.PostReactionsMetricsSchema) {
}
exports.PostReactionsMetricsDto = PostReactionsMetricsDto;
class PostShareLinkResponseDto extends (0, nestjs_zod_1.createZodDto)(exports.PostShareLinkResponseSchema) {
}
exports.PostShareLinkResponseDto = PostShareLinkResponseDto;
//# sourceMappingURL=agent.scheme.js.map