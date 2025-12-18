import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { SocialMediaProvider } from '@/model.enums';
import { PostState } from '@/model.enums';

/**
 * Validation schema for bulk image removal request
 * Accepts an array of image URLs to be removed from posts
 */
export const ImageRemovalRequestValidationSchema = z.array(
  z.object({
    imageUrl: z.string().describe('The URL of the image to remove'),
  }),
);

/**
 * Validation schema for social media post content structure
 * Defines the core fields for agent-generated post content
 * Includes text, optional media, hashtags, and visibility settings
 */
export const SocialMediaPostContentSchema = z.object({
  text: z.string(),
  imageUrl: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  visibility: z.enum(['PUBLIC', 'PROTECTED']),
});

/**
 * Validation schema for post submission with generation tracking
 * Links a post message to its generation batch identifier
 */
export const PostWithGenerationIdentifierSchema = z.object({
  generationId: z.string(),
  message: z.string(),
});

/**
 * Validation schema for post content generation API request
 * Contains all parameters needed to generate social media post content
 * Supports multiple platforms, styles, and optional image generation
 */
export const SocialMediaContentGenerationRequestSchema = z.object({
  generationId: z.string().optional(),
  topic: z.string().describe('The main topic for the X post'),
  prompt: z.string().describe('Specific prompt or context for the post'),
  style: z
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
  socialMediaProvider: z.nativeEnum(SocialMediaProvider),
  generateImage: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to generate an image for the post'),
  visitSite: z
    .string()
    .optional()
    .describe('URL for Pinterest visit_site field'),
  selectedSubreddit: z.string().optional(),
  recommendationId: z
    .string()
    .optional()
    .describe('ID of the recommendation from insights'),
});

/**
 * Validation schema for post update/modification request
 * Allows partial updates to post content, metadata, and state
 * Requires at least one field to be provided for the update operation
 * Includes validation refinement to ensure non-empty update payload
 */
export const PostUpdateModificationRequestSchema = z
  .object({
    title: z.string().optional(),
    body: z.string().optional(),
    tags: z.array(z.string()).optional(),
    hashtags: z.array(z.string()).optional(),
    focusKeyphrase: z.string().optional(),
    slug: z.string().optional(),
    metaDescription: z.string().optional(),
    textContentChange: z.string().optional(),
    socialMediaProvider: z.nativeEnum(SocialMediaProvider),
    removeImages: z.boolean().optional(),
    visitSite: z.string().optional(),
    state: z.nativeEnum(PostState).optional(),
  })
  .refine(
    (requestPayload) => {
      // Ensure at least one field is provided for update operation
      return (
        requestPayload.body ||
        requestPayload.title ||
        requestPayload.tags ||
        requestPayload.hashtags ||
        requestPayload.focusKeyphrase ||
        requestPayload.slug ||
        requestPayload.metaDescription ||
        requestPayload.textContentChange ||
        requestPayload.removeImages ||
        requestPayload.visitSite ||
        requestPayload.state
      );
    },
    {
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
    },
  );

/**
 * Validation schema for individual AI-generated post content item
 * Contains complete post data including content, metadata, SEO fields,
 * engagement predictions, and optional image attribution information
 */
export const GeneratedPostContentItemSchema = z.object({
  id: z.string().describe('Unique identifier for the generated post'),
  text: z.string().describe('The main post content'),
  hashtags: z.array(z.string()).describe('Relevant hashtags'),
  visibility: z
    .enum(['PUBLIC', 'PROTECTED'])
    .describe('Recommended visibility'),
  estimatedEngagement: z.number().describe('Estimated engagement score (1-10)'),
  characterCount: z.number().describe('Character count of the post'),
  suggestedPostingTime: z
    .string()
    .optional()
    .describe('Suggested optimal posting time'),
  imageUrl: z.string().optional(),
  focusKeyphrase: z.string().optional().describe('SEO focus keyphrase'),
  slug: z.string().optional().describe('URL-friendly slug'),
  metaDescription: z.string().optional().describe('SEO meta description'),
  unsplashPhotoId: z.string().nullish().describe('Unsplash photo ID'),
  unsplashPhotographerName: z
    .string()
    .nullish()
    .describe('Unsplash photographer name'),
  unsplashPhotographerUsername: z
    .string()
    .nullish()
    .describe('Unsplash photographer username'),
  unsplashDownloadLocation: z
    .string()
    .nullish()
    .describe('Unsplash download location for tracking'),
});

/**
 * Validation schema for array of generated post content items
 * Represents a collection of posts generated in a single batch
 */
export const GeneratedPostContentCollectionSchema = z.array(
  GeneratedPostContentItemSchema,
);

/**
 * Validation schema for complete content generation API response
 * Wraps the generated posts array in a structured response object
 */
export const ContentGenerationResponsePayloadSchema = z.object({
  posts: GeneratedPostContentCollectionSchema,
});

/**
 * Validation schema for historical post record from database
 * Represents a complete post entity with all metadata, state tracking,
 * AI generation details, and optional social media integration fields
 */
export const HistoricalPostRecordSchema = z.object({
  id: z.string(),
  generationId: z.string(),
  accountId: z.string(),
  topic: z.string(),
  prompt: z.string(),
  socialMediaProvider: z.nativeEnum(SocialMediaProvider),
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  focusKeyphrase: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  readTime: z.number().nullable(),
  imagesUrl: z.array(z.string()),
  youtubeUrl: z.string().nullable(),
  visitSite: z.string().nullable(),
  state: z.enum([
    'SUGGESTED',
    'TO_BE_PUBLISHED',
    'SCHEDULED',
    'POSTED',
    'CANCELED',
    'FAILED',
    'IN_PROGRESS',
    'DELETED',
  ]),
  createdAt: z.date(),
  publishedAt: z.date().nullable(),
  publishAt: z.date().nullable(),
  aiModel: z.string(),
  aiProvider: z.string(),
  aiStyle: z.string().nullable(),
  data: z.any().optional(),
  postIdInSocialMediaProvider: z.string().nullable(),
  recommendationId: z.string().nullable().optional(),
  unsplashPhotoId: z.string().nullish(),
  unsplashPhotographerName: z.string().nullish(),
  unsplashPhotographerUsername: z.string().nullish(),
  unsplashDownloadLocation: z.string().nullish(),
});

/**
 * Validation schema for paginated post history response
 * Contains array of historical posts and total count for pagination
 */
export const PostHistoryPaginationResponseSchema = z.object({
  posts: z.array(HistoricalPostRecordSchema),
  totalCount: z.number(),
});

/**
 * Validation schema for account context data used in post generation
 * Provides comprehensive account information, brand guidelines, and
 * knowledge sources to inform AI-generated content creation
 */
export const AccountContextForContentGenerationSchema = z.object({
  topic: z.string(),
  prompt: z.string(),
  style: z.string().optional(),
  about: z.string().nullable().optional(),
  industryCategory: z.string().nullable().optional(),
  subIndustryCategory: z.string().nullable().optional(),
  keyFeatures: z.array(z.string()).nullable().optional(),
  toneOfVoice: z.array(z.string()).nullable().optional(),
  values: z.array(z.string()).nullable().optional(),
  personality: z.array(z.string()).nullable().optional(),
  language: z.string().nullable().optional(),
  insight: z.string().optional(),
  victorBrandbook: z.string().optional(),
  victorPastPosts: z.string().optional(),
  victorMarketIntel: z.string().optional(),
  victorSuccessfulBlogs: z.string().optional(),
  victorRealExamples: z.string().optional(),
  victorInternalLinks: z.string().optional(),
  victorCompetitorLearning: z.string().optional(),
  victorExternalLinks: z.string().optional(),
  sources: z
    .object({
      internal: z.array(
        z.object({
          url: z.string(),
          title: z.string().optional(),
        }),
      ),
      external: z.array(
        z.object({
          url: z.string(),
          title: z.string().optional(),
        }),
      ),
      all: z.array(
        z.object({
          url: z.string(),
          title: z.string().optional(),
        }),
      ),
    })
    .optional(),
  hasSources: z.boolean().optional(),
  sourceCount: z
    .object({
      internal: z.number(),
      external: z.number(),
    })
    .optional(),
});

/**
 * Type inference from account context for content generation schema
 * Represents the complete account context structure for AI content generation
 */
export type AccountContextForContentGenerationType = z.infer<
  typeof AccountContextForContentGenerationSchema
>;

/**
 * Validation schema for post modification operation response
 * Returns operation status message and optional signed URL for media access
 */
export const PostModificationOperationResponseSchema = z.object({
  signedUrl: z.string().optional(),
  message: z.string(),
});

/**
 * Validation schema for post history query parameters
 * Supports pagination, filtering by generation ID, social network, and post state
 */
export const PostHistoryQueryParametersSchema = z.object({
  take: z.coerce.number().int().positive().describe('Number of posts to take'),
  skip: z.coerce.number().int().min(0).describe('Number of posts to skip'),
  generationId: z.string().optional().describe('Filter by generation ID'),
  socialNetwork: z
    .nativeEnum(SocialMediaProvider)
    .optional()
    .describe('Filter by social network'),
  state: z.nativeEnum(PostState).optional().describe('Filter by post state'),
});

/**
 * Data Transfer Object for removing images request
 * Validates and structures bulk image removal operations
 */
export class ImageRemovalRequestDto extends createZodDto(
  ImageRemovalRequestValidationSchema,
) {}

/**
 * Data Transfer Object for social media post content
 * Structures post content with validation for API endpoints
 */
export class SocialMediaPostContentDto extends createZodDto(
  SocialMediaPostContentSchema,
) {}

/**
 * Data Transfer Object for post with generation identifier
 * Links post submissions to their generation batch tracking
 */
export class PostWithGenerationIdentifierDto extends createZodDto(
  PostWithGenerationIdentifierSchema,
) {}

/**
 * Data Transfer Object for post content generation request
 * Handles all parameters needed for AI-powered content generation
 */
export class SocialMediaContentGenerationRequestDto extends createZodDto(
  SocialMediaContentGenerationRequestSchema,
) {}

/**
 * Data Transfer Object for generated post content item
 * Represents a single AI-generated post with all metadata
 */
export class GeneratedPostContentItemDto extends createZodDto(
  GeneratedPostContentItemSchema,
) {}

/**
 * Data Transfer Object for content generation response
 * Wraps generated posts in a structured API response
 */
export class ContentGenerationResponsePayloadDto extends createZodDto(
  ContentGenerationResponsePayloadSchema,
) {}

/**
 * Data Transfer Object for post history pagination response
 * Provides paginated historical post data with total count
 */
export class PostHistoryPaginationResponseDto extends createZodDto(
  PostHistoryPaginationResponseSchema,
) {}

/**
 * Data Transfer Object for updating a post request
 * Enables partial post updates with validation
 */
export class PostUpdateModificationRequestDto extends createZodDto(
  PostUpdateModificationRequestSchema,
) {}

/**
 * Data Transfer Object for post modification operation response
 * Returns status and optional signed URLs after post modifications
 */
export class PostModificationOperationResponseDto extends createZodDto(
  PostModificationOperationResponseSchema,
) {}

/**
 * Data Transfer Object for getting post history query parameters
 * Validates query string parameters for post history filtering and pagination
 */
export class PostHistoryQueryParametersDto extends createZodDto(
  PostHistoryQueryParametersSchema,
) {}

// Reusable agent schemas and DTOs for cross-platform social media operations

/**
 * Validation schema for social media post analytics and engagement metrics
 * Aggregates performance data including impressions, clicks, engagement rate,
 * and optional demographic breakdowns for audience analysis
 */
export const SocialMediaPostAnalyticsMetricsSchema = z.object({
  impressions: z.number().describe('Total impressions'),
  clicks: z.number().describe('Total clicks'),
  likes: z.number().describe('Total reactions/likes'),
  comments: z.number().describe('Total comments'),
  shares: z.number().describe('Total shares'),
  engagementRate: z.number().describe('Engagement rate percentage'),
  demographics: z
    .object({
      topLocations: z.array(z.string()),
      topIndustries: z.array(z.string()),
      seniorityLevels: z.array(
        z.object({
          level: z.string(),
          percentage: z.number(),
        }),
      ),
    })
    .optional(),
});

/**
 * Validation schema for comment author profile information
 * Contains user profile details for comment attribution
 */
export const CommentAuthorProfileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  profileUrl: z.string(),
  photoUrl: z.string(),
});

/**
 * Validation schema for individual comment data structure
 * Links comment content with author information and timestamp
 */
export const SocialMediaCommentDataSchema = z.object({
  id: z.string(),
  author: CommentAuthorProfileSchema,
  text: z.string(),
  createdAt: z.string(),
});

/**
 * Validation schema for post reaction/engagement metrics
 * Tracks various reaction types available on social media platforms
 */
export const PostReactionsMetricsSchema = z.object({
  like: z.number(),
  celebrate: z.number(),
  support: z.number(),
  love: z.number(),
  insightful: z.number(),
  funny: z.number(),
});

/**
 * Validation schema for post share link response
 * Provides shareable URL for post distribution
 */
export const PostShareLinkResponseSchema = z.object({
  shareUrl: z.string(),
});

/**
 * Data Transfer Object for social media post analytics metrics
 * Structures engagement and performance data for analytics endpoints
 */
export class SocialMediaPostAnalyticsMetricsDto extends createZodDto(
  SocialMediaPostAnalyticsMetricsSchema,
) {}

/**
 * Data Transfer Object for social media comment data
 * Validates and structures comment information with author details
 */
export class SocialMediaCommentDataDto extends createZodDto(
  SocialMediaCommentDataSchema,
) {}

/**
 * Data Transfer Object for agent comments response array
 * Wraps multiple comments in a collection response
 */
export class SocialMediaCommentsCollectionDto extends createZodDto(
  z.array(SocialMediaCommentDataSchema),
) {}

/**
 * Data Transfer Object for post reactions metrics
 * Structures reaction counts for engagement analytics
 */
export class PostReactionsMetricsDto extends createZodDto(
  PostReactionsMetricsSchema,
) {}

/**
 * Data Transfer Object for post share link response
 * Provides validated share URL structure for API responses
 */
export class PostShareLinkResponseDto extends createZodDto(
  PostShareLinkResponseSchema,
) {}

// Type aliases for backward compatibility and cleaner imports
/**
 * Alias for SocialMediaContentGenerationRequestDto
 * Used in service layer for post content generation
 */
export type PostContentGenerationData = z.infer<
  typeof SocialMediaContentGenerationRequestSchema
>;

/**
 * Alias for PostUpdateModificationRequestDto
 * Used in service layer for post updates
 */
export type UpdatePostRequestDto = z.infer<
  typeof PostUpdateModificationRequestSchema
>;

/**
 * Alias for GeneratedPostContentItemDto
 * Used in service layer for generated post content
 */
export type AgentGeneratedPostDto = z.infer<
  typeof GeneratedPostContentItemSchema
>;

/**
 * Alias for PostWithGenerationIdentifierDto
 * Used in service layer and controller for generation tracking
 */
export type AgentPostWithGenerationIdDto = z.infer<
  typeof PostWithGenerationIdentifierSchema
>;

/**
 * Alias for AccountContextForContentGenerationType
 * Used in service layer for account data in content generation
 */
export type AccountData = AccountContextForContentGenerationType;

/**
 * Alias for ImageRemovalRequestDto
 * Used in service layer for image removal operations
 */
export type RemoveImagesRequestDto = z.infer<
  typeof ImageRemovalRequestValidationSchema
>;

/**
 * Alias for PostContentGenerationData
 * Used in controller layer
 */
export type PostContentGenerationDto = PostContentGenerationData;

/**
 * Alias for PostHistoryPaginationResponseDto
 * Used in controller layer for post history responses
 */
export type AgentPostHistoryResponseDto = z.infer<
  typeof PostHistoryPaginationResponseSchema
>;

/**
 * Alias for PostModificationOperationResponseDto
 * Used in controller layer for post modification responses
 */
export type AgentPostModificationResponseDto = z.infer<
  typeof PostModificationOperationResponseSchema
>;

/**
 * Alias for PostHistoryQueryParametersDto
 * Used in controller layer for query parameters
 */
export type GetPostHistoryQueryDto = z.infer<
  typeof PostHistoryQueryParametersSchema
>;
