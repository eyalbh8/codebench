import { z } from 'zod';
import { SocialMediaProvider } from '@/model.enums';
import { PostState } from '@/model.enums';
export declare const ImageRemovalRequestValidationSchema: z.ZodArray<z.ZodObject<{
    imageUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    imageUrl: string;
}, {
    imageUrl: string;
}>, "many">;
export declare const SocialMediaPostContentSchema: z.ZodObject<{
    text: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
    hashtags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    visibility: z.ZodEnum<["PUBLIC", "PROTECTED"]>;
}, "strip", z.ZodTypeAny, {
    text: string;
    visibility: "PUBLIC" | "PROTECTED";
    imageUrl?: string | undefined;
    hashtags?: string[] | undefined;
}, {
    text: string;
    visibility: "PUBLIC" | "PROTECTED";
    imageUrl?: string | undefined;
    hashtags?: string[] | undefined;
}>;
export declare const PostWithGenerationIdentifierSchema: z.ZodObject<{
    generationId: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    generationId: string;
}, {
    message: string;
    generationId: string;
}>;
export declare const SocialMediaContentGenerationRequestSchema: z.ZodObject<{
    generationId: z.ZodOptional<z.ZodString>;
    topic: z.ZodString;
    prompt: z.ZodString;
    style: z.ZodOptional<z.ZodEnum<["professional", "casual", "educational", "inspirational", "news", "story"]>>;
    socialMediaProvider: z.ZodNativeEnum<typeof SocialMediaProvider>;
    generateImage: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    visitSite: z.ZodOptional<z.ZodString>;
    selectedSubreddit: z.ZodOptional<z.ZodString>;
    recommendationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    topic: string;
    socialMediaProvider: SocialMediaProvider;
    generateImage: boolean;
    generationId?: string | undefined;
    style?: "professional" | "casual" | "educational" | "inspirational" | "news" | "story" | undefined;
    visitSite?: string | undefined;
    selectedSubreddit?: string | undefined;
    recommendationId?: string | undefined;
}, {
    prompt: string;
    topic: string;
    socialMediaProvider: SocialMediaProvider;
    generationId?: string | undefined;
    style?: "professional" | "casual" | "educational" | "inspirational" | "news" | "story" | undefined;
    generateImage?: boolean | undefined;
    visitSite?: string | undefined;
    selectedSubreddit?: string | undefined;
    recommendationId?: string | undefined;
}>;
export declare const PostUpdateModificationRequestSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hashtags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    focusKeyphrase: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    metaDescription: z.ZodOptional<z.ZodString>;
    textContentChange: z.ZodOptional<z.ZodString>;
    socialMediaProvider: z.ZodNativeEnum<typeof SocialMediaProvider>;
    removeImages: z.ZodOptional<z.ZodBoolean>;
    visitSite: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodNativeEnum<typeof PostState>>;
}, "strip", z.ZodTypeAny, {
    socialMediaProvider: SocialMediaProvider;
    title?: string | undefined;
    tags?: string[] | undefined;
    hashtags?: string[] | undefined;
    visitSite?: string | undefined;
    body?: string | undefined;
    focusKeyphrase?: string | undefined;
    slug?: string | undefined;
    metaDescription?: string | undefined;
    textContentChange?: string | undefined;
    removeImages?: boolean | undefined;
    state?: PostState | undefined;
}, {
    socialMediaProvider: SocialMediaProvider;
    title?: string | undefined;
    tags?: string[] | undefined;
    hashtags?: string[] | undefined;
    visitSite?: string | undefined;
    body?: string | undefined;
    focusKeyphrase?: string | undefined;
    slug?: string | undefined;
    metaDescription?: string | undefined;
    textContentChange?: string | undefined;
    removeImages?: boolean | undefined;
    state?: PostState | undefined;
}>, {
    socialMediaProvider: SocialMediaProvider;
    title?: string | undefined;
    tags?: string[] | undefined;
    hashtags?: string[] | undefined;
    visitSite?: string | undefined;
    body?: string | undefined;
    focusKeyphrase?: string | undefined;
    slug?: string | undefined;
    metaDescription?: string | undefined;
    textContentChange?: string | undefined;
    removeImages?: boolean | undefined;
    state?: PostState | undefined;
}, {
    socialMediaProvider: SocialMediaProvider;
    title?: string | undefined;
    tags?: string[] | undefined;
    hashtags?: string[] | undefined;
    visitSite?: string | undefined;
    body?: string | undefined;
    focusKeyphrase?: string | undefined;
    slug?: string | undefined;
    metaDescription?: string | undefined;
    textContentChange?: string | undefined;
    removeImages?: boolean | undefined;
    state?: PostState | undefined;
}>;
export declare const GeneratedPostContentItemSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    hashtags: z.ZodArray<z.ZodString, "many">;
    visibility: z.ZodEnum<["PUBLIC", "PROTECTED"]>;
    estimatedEngagement: z.ZodNumber;
    characterCount: z.ZodNumber;
    suggestedPostingTime: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    focusKeyphrase: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    metaDescription: z.ZodOptional<z.ZodString>;
    unsplashPhotoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotographerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotographerUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashDownloadLocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export declare const GeneratedPostContentCollectionSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    hashtags: z.ZodArray<z.ZodString, "many">;
    visibility: z.ZodEnum<["PUBLIC", "PROTECTED"]>;
    estimatedEngagement: z.ZodNumber;
    characterCount: z.ZodNumber;
    suggestedPostingTime: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    focusKeyphrase: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    metaDescription: z.ZodOptional<z.ZodString>;
    unsplashPhotoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotographerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotographerUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashDownloadLocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>, "many">;
export declare const ContentGenerationResponsePayloadSchema: z.ZodObject<{
    posts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        hashtags: z.ZodArray<z.ZodString, "many">;
        visibility: z.ZodEnum<["PUBLIC", "PROTECTED"]>;
        estimatedEngagement: z.ZodNumber;
        characterCount: z.ZodNumber;
        suggestedPostingTime: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        focusKeyphrase: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        metaDescription: z.ZodOptional<z.ZodString>;
        unsplashPhotoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotographerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotographerUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashDownloadLocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    posts: {
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
    }[];
}, {
    posts: {
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
    }[];
}>;
export declare const HistoricalPostRecordSchema: z.ZodObject<{
    id: z.ZodString;
    generationId: z.ZodString;
    accountId: z.ZodString;
    topic: z.ZodString;
    prompt: z.ZodString;
    socialMediaProvider: z.ZodNativeEnum<typeof SocialMediaProvider>;
    title: z.ZodString;
    body: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    focusKeyphrase: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    slug: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metaDescription: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    readTime: z.ZodNullable<z.ZodNumber>;
    imagesUrl: z.ZodArray<z.ZodString, "many">;
    youtubeUrl: z.ZodNullable<z.ZodString>;
    visitSite: z.ZodNullable<z.ZodString>;
    state: z.ZodEnum<["SUGGESTED", "TO_BE_PUBLISHED", "SCHEDULED", "POSTED", "CANCELED", "FAILED", "IN_PROGRESS", "DELETED"]>;
    createdAt: z.ZodDate;
    publishedAt: z.ZodNullable<z.ZodDate>;
    publishAt: z.ZodNullable<z.ZodDate>;
    aiModel: z.ZodString;
    aiProvider: z.ZodString;
    aiStyle: z.ZodNullable<z.ZodString>;
    data: z.ZodOptional<z.ZodAny>;
    postIdInSocialMediaProvider: z.ZodNullable<z.ZodString>;
    recommendationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotographerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotographerUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashDownloadLocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    accountId: string;
    id: string;
    createdAt: Date;
    prompt: string;
    topic: string;
    tags: string[];
    generationId: string;
    socialMediaProvider: SocialMediaProvider;
    visitSite: string | null;
    body: string;
    state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
    readTime: number | null;
    imagesUrl: string[];
    youtubeUrl: string | null;
    publishedAt: Date | null;
    publishAt: Date | null;
    aiModel: string;
    aiProvider: string;
    aiStyle: string | null;
    postIdInSocialMediaProvider: string | null;
    data?: any;
    recommendationId?: string | null | undefined;
    focusKeyphrase?: string | null | undefined;
    slug?: string | null | undefined;
    metaDescription?: string | null | undefined;
    unsplashPhotoId?: string | null | undefined;
    unsplashPhotographerName?: string | null | undefined;
    unsplashPhotographerUsername?: string | null | undefined;
    unsplashDownloadLocation?: string | null | undefined;
}, {
    title: string;
    accountId: string;
    id: string;
    createdAt: Date;
    prompt: string;
    topic: string;
    tags: string[];
    generationId: string;
    socialMediaProvider: SocialMediaProvider;
    visitSite: string | null;
    body: string;
    state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
    readTime: number | null;
    imagesUrl: string[];
    youtubeUrl: string | null;
    publishedAt: Date | null;
    publishAt: Date | null;
    aiModel: string;
    aiProvider: string;
    aiStyle: string | null;
    postIdInSocialMediaProvider: string | null;
    data?: any;
    recommendationId?: string | null | undefined;
    focusKeyphrase?: string | null | undefined;
    slug?: string | null | undefined;
    metaDescription?: string | null | undefined;
    unsplashPhotoId?: string | null | undefined;
    unsplashPhotographerName?: string | null | undefined;
    unsplashPhotographerUsername?: string | null | undefined;
    unsplashDownloadLocation?: string | null | undefined;
}>;
export declare const PostHistoryPaginationResponseSchema: z.ZodObject<{
    posts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        generationId: z.ZodString;
        accountId: z.ZodString;
        topic: z.ZodString;
        prompt: z.ZodString;
        socialMediaProvider: z.ZodNativeEnum<typeof SocialMediaProvider>;
        title: z.ZodString;
        body: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        focusKeyphrase: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        slug: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metaDescription: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        readTime: z.ZodNullable<z.ZodNumber>;
        imagesUrl: z.ZodArray<z.ZodString, "many">;
        youtubeUrl: z.ZodNullable<z.ZodString>;
        visitSite: z.ZodNullable<z.ZodString>;
        state: z.ZodEnum<["SUGGESTED", "TO_BE_PUBLISHED", "SCHEDULED", "POSTED", "CANCELED", "FAILED", "IN_PROGRESS", "DELETED"]>;
        createdAt: z.ZodDate;
        publishedAt: z.ZodNullable<z.ZodDate>;
        publishAt: z.ZodNullable<z.ZodDate>;
        aiModel: z.ZodString;
        aiProvider: z.ZodString;
        aiStyle: z.ZodNullable<z.ZodString>;
        data: z.ZodOptional<z.ZodAny>;
        postIdInSocialMediaProvider: z.ZodNullable<z.ZodString>;
        recommendationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotographerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotographerUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashDownloadLocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        accountId: string;
        id: string;
        createdAt: Date;
        prompt: string;
        topic: string;
        tags: string[];
        generationId: string;
        socialMediaProvider: SocialMediaProvider;
        visitSite: string | null;
        body: string;
        state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
        readTime: number | null;
        imagesUrl: string[];
        youtubeUrl: string | null;
        publishedAt: Date | null;
        publishAt: Date | null;
        aiModel: string;
        aiProvider: string;
        aiStyle: string | null;
        postIdInSocialMediaProvider: string | null;
        data?: any;
        recommendationId?: string | null | undefined;
        focusKeyphrase?: string | null | undefined;
        slug?: string | null | undefined;
        metaDescription?: string | null | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }, {
        title: string;
        accountId: string;
        id: string;
        createdAt: Date;
        prompt: string;
        topic: string;
        tags: string[];
        generationId: string;
        socialMediaProvider: SocialMediaProvider;
        visitSite: string | null;
        body: string;
        state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
        readTime: number | null;
        imagesUrl: string[];
        youtubeUrl: string | null;
        publishedAt: Date | null;
        publishAt: Date | null;
        aiModel: string;
        aiProvider: string;
        aiStyle: string | null;
        postIdInSocialMediaProvider: string | null;
        data?: any;
        recommendationId?: string | null | undefined;
        focusKeyphrase?: string | null | undefined;
        slug?: string | null | undefined;
        metaDescription?: string | null | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    posts: {
        title: string;
        accountId: string;
        id: string;
        createdAt: Date;
        prompt: string;
        topic: string;
        tags: string[];
        generationId: string;
        socialMediaProvider: SocialMediaProvider;
        visitSite: string | null;
        body: string;
        state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
        readTime: number | null;
        imagesUrl: string[];
        youtubeUrl: string | null;
        publishedAt: Date | null;
        publishAt: Date | null;
        aiModel: string;
        aiProvider: string;
        aiStyle: string | null;
        postIdInSocialMediaProvider: string | null;
        data?: any;
        recommendationId?: string | null | undefined;
        focusKeyphrase?: string | null | undefined;
        slug?: string | null | undefined;
        metaDescription?: string | null | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }[];
    totalCount: number;
}, {
    posts: {
        title: string;
        accountId: string;
        id: string;
        createdAt: Date;
        prompt: string;
        topic: string;
        tags: string[];
        generationId: string;
        socialMediaProvider: SocialMediaProvider;
        visitSite: string | null;
        body: string;
        state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
        readTime: number | null;
        imagesUrl: string[];
        youtubeUrl: string | null;
        publishedAt: Date | null;
        publishAt: Date | null;
        aiModel: string;
        aiProvider: string;
        aiStyle: string | null;
        postIdInSocialMediaProvider: string | null;
        data?: any;
        recommendationId?: string | null | undefined;
        focusKeyphrase?: string | null | undefined;
        slug?: string | null | undefined;
        metaDescription?: string | null | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }[];
    totalCount: number;
}>;
export declare const AccountContextForContentGenerationSchema: z.ZodObject<{
    topic: z.ZodString;
    prompt: z.ZodString;
    style: z.ZodOptional<z.ZodString>;
    about: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    industryCategory: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    subIndustryCategory: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    keyFeatures: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    toneOfVoice: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    values: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    personality: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    language: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    insight: z.ZodOptional<z.ZodString>;
    victorBrandbook: z.ZodOptional<z.ZodString>;
    victorPastPosts: z.ZodOptional<z.ZodString>;
    victorMarketIntel: z.ZodOptional<z.ZodString>;
    victorSuccessfulBlogs: z.ZodOptional<z.ZodString>;
    victorRealExamples: z.ZodOptional<z.ZodString>;
    victorInternalLinks: z.ZodOptional<z.ZodString>;
    victorCompetitorLearning: z.ZodOptional<z.ZodString>;
    victorExternalLinks: z.ZodOptional<z.ZodString>;
    sources: z.ZodOptional<z.ZodObject<{
        internal: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            title?: string | undefined;
        }, {
            url: string;
            title?: string | undefined;
        }>, "many">;
        external: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            title?: string | undefined;
        }, {
            url: string;
            title?: string | undefined;
        }>, "many">;
        all: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            title?: string | undefined;
        }, {
            url: string;
            title?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        internal: {
            url: string;
            title?: string | undefined;
        }[];
        external: {
            url: string;
            title?: string | undefined;
        }[];
        all: {
            url: string;
            title?: string | undefined;
        }[];
    }, {
        internal: {
            url: string;
            title?: string | undefined;
        }[];
        external: {
            url: string;
            title?: string | undefined;
        }[];
        all: {
            url: string;
            title?: string | undefined;
        }[];
    }>>;
    hasSources: z.ZodOptional<z.ZodBoolean>;
    sourceCount: z.ZodOptional<z.ZodObject<{
        internal: z.ZodNumber;
        external: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        internal: number;
        external: number;
    }, {
        internal: number;
        external: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    topic: string;
    about?: string | null | undefined;
    industryCategory?: string | null | undefined;
    subIndustryCategory?: string | null | undefined;
    language?: string | null | undefined;
    keyFeatures?: string[] | null | undefined;
    toneOfVoice?: string[] | null | undefined;
    values?: string[] | null | undefined;
    personality?: string[] | null | undefined;
    style?: string | undefined;
    insight?: string | undefined;
    victorBrandbook?: string | undefined;
    victorPastPosts?: string | undefined;
    victorMarketIntel?: string | undefined;
    victorSuccessfulBlogs?: string | undefined;
    victorRealExamples?: string | undefined;
    victorInternalLinks?: string | undefined;
    victorCompetitorLearning?: string | undefined;
    victorExternalLinks?: string | undefined;
    sources?: {
        internal: {
            url: string;
            title?: string | undefined;
        }[];
        external: {
            url: string;
            title?: string | undefined;
        }[];
        all: {
            url: string;
            title?: string | undefined;
        }[];
    } | undefined;
    hasSources?: boolean | undefined;
    sourceCount?: {
        internal: number;
        external: number;
    } | undefined;
}, {
    prompt: string;
    topic: string;
    about?: string | null | undefined;
    industryCategory?: string | null | undefined;
    subIndustryCategory?: string | null | undefined;
    language?: string | null | undefined;
    keyFeatures?: string[] | null | undefined;
    toneOfVoice?: string[] | null | undefined;
    values?: string[] | null | undefined;
    personality?: string[] | null | undefined;
    style?: string | undefined;
    insight?: string | undefined;
    victorBrandbook?: string | undefined;
    victorPastPosts?: string | undefined;
    victorMarketIntel?: string | undefined;
    victorSuccessfulBlogs?: string | undefined;
    victorRealExamples?: string | undefined;
    victorInternalLinks?: string | undefined;
    victorCompetitorLearning?: string | undefined;
    victorExternalLinks?: string | undefined;
    sources?: {
        internal: {
            url: string;
            title?: string | undefined;
        }[];
        external: {
            url: string;
            title?: string | undefined;
        }[];
        all: {
            url: string;
            title?: string | undefined;
        }[];
    } | undefined;
    hasSources?: boolean | undefined;
    sourceCount?: {
        internal: number;
        external: number;
    } | undefined;
}>;
export type AccountContextForContentGenerationType = z.infer<typeof AccountContextForContentGenerationSchema>;
export declare const PostModificationOperationResponseSchema: z.ZodObject<{
    signedUrl: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    signedUrl?: string | undefined;
}, {
    message: string;
    signedUrl?: string | undefined;
}>;
export declare const PostHistoryQueryParametersSchema: z.ZodObject<{
    take: z.ZodNumber;
    skip: z.ZodNumber;
    generationId: z.ZodOptional<z.ZodString>;
    socialNetwork: z.ZodOptional<z.ZodNativeEnum<typeof SocialMediaProvider>>;
    state: z.ZodOptional<z.ZodNativeEnum<typeof PostState>>;
}, "strip", z.ZodTypeAny, {
    take: number;
    skip: number;
    generationId?: string | undefined;
    state?: PostState | undefined;
    socialNetwork?: SocialMediaProvider | undefined;
}, {
    take: number;
    skip: number;
    generationId?: string | undefined;
    state?: PostState | undefined;
    socialNetwork?: SocialMediaProvider | undefined;
}>;
declare const ImageRemovalRequestDto_base: import("nestjs-zod").ZodDto<{
    imageUrl: string;
}[], z.ZodArrayDef<z.ZodObject<{
    imageUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    imageUrl: string;
}, {
    imageUrl: string;
}>>, {
    imageUrl: string;
}[]>;
export declare class ImageRemovalRequestDto extends ImageRemovalRequestDto_base {
}
declare const SocialMediaPostContentDto_base: import("nestjs-zod").ZodDto<{
    text: string;
    visibility: "PUBLIC" | "PROTECTED";
    imageUrl?: string | undefined;
    hashtags?: string[] | undefined;
}, z.ZodObjectDef<{
    text: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
    hashtags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    visibility: z.ZodEnum<["PUBLIC", "PROTECTED"]>;
}, "strip", z.ZodTypeAny>, {
    text: string;
    visibility: "PUBLIC" | "PROTECTED";
    imageUrl?: string | undefined;
    hashtags?: string[] | undefined;
}>;
export declare class SocialMediaPostContentDto extends SocialMediaPostContentDto_base {
}
declare const PostWithGenerationIdentifierDto_base: import("nestjs-zod").ZodDto<{
    message: string;
    generationId: string;
}, z.ZodObjectDef<{
    generationId: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    message: string;
    generationId: string;
}>;
export declare class PostWithGenerationIdentifierDto extends PostWithGenerationIdentifierDto_base {
}
declare const SocialMediaContentGenerationRequestDto_base: import("nestjs-zod").ZodDto<{
    prompt: string;
    topic: string;
    socialMediaProvider: SocialMediaProvider;
    generateImage: boolean;
    generationId?: string | undefined;
    style?: "professional" | "casual" | "educational" | "inspirational" | "news" | "story" | undefined;
    visitSite?: string | undefined;
    selectedSubreddit?: string | undefined;
    recommendationId?: string | undefined;
}, z.ZodObjectDef<{
    generationId: z.ZodOptional<z.ZodString>;
    topic: z.ZodString;
    prompt: z.ZodString;
    style: z.ZodOptional<z.ZodEnum<["professional", "casual", "educational", "inspirational", "news", "story"]>>;
    socialMediaProvider: z.ZodNativeEnum<typeof SocialMediaProvider>;
    generateImage: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    visitSite: z.ZodOptional<z.ZodString>;
    selectedSubreddit: z.ZodOptional<z.ZodString>;
    recommendationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny>, {
    prompt: string;
    topic: string;
    socialMediaProvider: SocialMediaProvider;
    generationId?: string | undefined;
    style?: "professional" | "casual" | "educational" | "inspirational" | "news" | "story" | undefined;
    generateImage?: boolean | undefined;
    visitSite?: string | undefined;
    selectedSubreddit?: string | undefined;
    recommendationId?: string | undefined;
}>;
export declare class SocialMediaContentGenerationRequestDto extends SocialMediaContentGenerationRequestDto_base {
}
declare const GeneratedPostContentItemDto_base: import("nestjs-zod").ZodDto<{
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
}, z.ZodObjectDef<{
    id: z.ZodString;
    text: z.ZodString;
    hashtags: z.ZodArray<z.ZodString, "many">;
    visibility: z.ZodEnum<["PUBLIC", "PROTECTED"]>;
    estimatedEngagement: z.ZodNumber;
    characterCount: z.ZodNumber;
    suggestedPostingTime: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    focusKeyphrase: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    metaDescription: z.ZodOptional<z.ZodString>;
    unsplashPhotoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotographerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashPhotographerUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unsplashDownloadLocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny>, {
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
}>;
export declare class GeneratedPostContentItemDto extends GeneratedPostContentItemDto_base {
}
declare const ContentGenerationResponsePayloadDto_base: import("nestjs-zod").ZodDto<{
    posts: {
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
    }[];
}, z.ZodObjectDef<{
    posts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        hashtags: z.ZodArray<z.ZodString, "many">;
        visibility: z.ZodEnum<["PUBLIC", "PROTECTED"]>;
        estimatedEngagement: z.ZodNumber;
        characterCount: z.ZodNumber;
        suggestedPostingTime: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        focusKeyphrase: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        metaDescription: z.ZodOptional<z.ZodString>;
        unsplashPhotoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotographerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotographerUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashDownloadLocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, "many">;
}, "strip", z.ZodTypeAny>, {
    posts: {
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
    }[];
}>;
export declare class ContentGenerationResponsePayloadDto extends ContentGenerationResponsePayloadDto_base {
}
declare const PostHistoryPaginationResponseDto_base: import("nestjs-zod").ZodDto<{
    posts: {
        title: string;
        accountId: string;
        id: string;
        createdAt: Date;
        prompt: string;
        topic: string;
        tags: string[];
        generationId: string;
        socialMediaProvider: SocialMediaProvider;
        visitSite: string | null;
        body: string;
        state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
        readTime: number | null;
        imagesUrl: string[];
        youtubeUrl: string | null;
        publishedAt: Date | null;
        publishAt: Date | null;
        aiModel: string;
        aiProvider: string;
        aiStyle: string | null;
        postIdInSocialMediaProvider: string | null;
        data?: any;
        recommendationId?: string | null | undefined;
        focusKeyphrase?: string | null | undefined;
        slug?: string | null | undefined;
        metaDescription?: string | null | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }[];
    totalCount: number;
}, z.ZodObjectDef<{
    posts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        generationId: z.ZodString;
        accountId: z.ZodString;
        topic: z.ZodString;
        prompt: z.ZodString;
        socialMediaProvider: z.ZodNativeEnum<typeof SocialMediaProvider>;
        title: z.ZodString;
        body: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        focusKeyphrase: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        slug: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metaDescription: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        readTime: z.ZodNullable<z.ZodNumber>;
        imagesUrl: z.ZodArray<z.ZodString, "many">;
        youtubeUrl: z.ZodNullable<z.ZodString>;
        visitSite: z.ZodNullable<z.ZodString>;
        state: z.ZodEnum<["SUGGESTED", "TO_BE_PUBLISHED", "SCHEDULED", "POSTED", "CANCELED", "FAILED", "IN_PROGRESS", "DELETED"]>;
        createdAt: z.ZodDate;
        publishedAt: z.ZodNullable<z.ZodDate>;
        publishAt: z.ZodNullable<z.ZodDate>;
        aiModel: z.ZodString;
        aiProvider: z.ZodString;
        aiStyle: z.ZodNullable<z.ZodString>;
        data: z.ZodOptional<z.ZodAny>;
        postIdInSocialMediaProvider: z.ZodNullable<z.ZodString>;
        recommendationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotographerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashPhotographerUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unsplashDownloadLocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        accountId: string;
        id: string;
        createdAt: Date;
        prompt: string;
        topic: string;
        tags: string[];
        generationId: string;
        socialMediaProvider: SocialMediaProvider;
        visitSite: string | null;
        body: string;
        state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
        readTime: number | null;
        imagesUrl: string[];
        youtubeUrl: string | null;
        publishedAt: Date | null;
        publishAt: Date | null;
        aiModel: string;
        aiProvider: string;
        aiStyle: string | null;
        postIdInSocialMediaProvider: string | null;
        data?: any;
        recommendationId?: string | null | undefined;
        focusKeyphrase?: string | null | undefined;
        slug?: string | null | undefined;
        metaDescription?: string | null | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }, {
        title: string;
        accountId: string;
        id: string;
        createdAt: Date;
        prompt: string;
        topic: string;
        tags: string[];
        generationId: string;
        socialMediaProvider: SocialMediaProvider;
        visitSite: string | null;
        body: string;
        state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
        readTime: number | null;
        imagesUrl: string[];
        youtubeUrl: string | null;
        publishedAt: Date | null;
        publishAt: Date | null;
        aiModel: string;
        aiProvider: string;
        aiStyle: string | null;
        postIdInSocialMediaProvider: string | null;
        data?: any;
        recommendationId?: string | null | undefined;
        focusKeyphrase?: string | null | undefined;
        slug?: string | null | undefined;
        metaDescription?: string | null | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    posts: {
        title: string;
        accountId: string;
        id: string;
        createdAt: Date;
        prompt: string;
        topic: string;
        tags: string[];
        generationId: string;
        socialMediaProvider: SocialMediaProvider;
        visitSite: string | null;
        body: string;
        state: "IN_PROGRESS" | "FAILED" | "DELETED" | "SUGGESTED" | "TO_BE_PUBLISHED" | "SCHEDULED" | "POSTED" | "CANCELED";
        readTime: number | null;
        imagesUrl: string[];
        youtubeUrl: string | null;
        publishedAt: Date | null;
        publishAt: Date | null;
        aiModel: string;
        aiProvider: string;
        aiStyle: string | null;
        postIdInSocialMediaProvider: string | null;
        data?: any;
        recommendationId?: string | null | undefined;
        focusKeyphrase?: string | null | undefined;
        slug?: string | null | undefined;
        metaDescription?: string | null | undefined;
        unsplashPhotoId?: string | null | undefined;
        unsplashPhotographerName?: string | null | undefined;
        unsplashPhotographerUsername?: string | null | undefined;
        unsplashDownloadLocation?: string | null | undefined;
    }[];
    totalCount: number;
}>;
export declare class PostHistoryPaginationResponseDto extends PostHistoryPaginationResponseDto_base {
}
declare const PostUpdateModificationRequestDto_base: import("nestjs-zod").ZodDto<{
    socialMediaProvider: SocialMediaProvider;
    title?: string | undefined;
    tags?: string[] | undefined;
    hashtags?: string[] | undefined;
    visitSite?: string | undefined;
    body?: string | undefined;
    focusKeyphrase?: string | undefined;
    slug?: string | undefined;
    metaDescription?: string | undefined;
    textContentChange?: string | undefined;
    removeImages?: boolean | undefined;
    state?: PostState | undefined;
}, z.ZodEffectsDef<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hashtags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    focusKeyphrase: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    metaDescription: z.ZodOptional<z.ZodString>;
    textContentChange: z.ZodOptional<z.ZodString>;
    socialMediaProvider: z.ZodNativeEnum<typeof SocialMediaProvider>;
    removeImages: z.ZodOptional<z.ZodBoolean>;
    visitSite: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodNativeEnum<typeof PostState>>;
}, "strip", z.ZodTypeAny, {
    socialMediaProvider: SocialMediaProvider;
    title?: string | undefined;
    tags?: string[] | undefined;
    hashtags?: string[] | undefined;
    visitSite?: string | undefined;
    body?: string | undefined;
    focusKeyphrase?: string | undefined;
    slug?: string | undefined;
    metaDescription?: string | undefined;
    textContentChange?: string | undefined;
    removeImages?: boolean | undefined;
    state?: PostState | undefined;
}, {
    socialMediaProvider: SocialMediaProvider;
    title?: string | undefined;
    tags?: string[] | undefined;
    hashtags?: string[] | undefined;
    visitSite?: string | undefined;
    body?: string | undefined;
    focusKeyphrase?: string | undefined;
    slug?: string | undefined;
    metaDescription?: string | undefined;
    textContentChange?: string | undefined;
    removeImages?: boolean | undefined;
    state?: PostState | undefined;
}>>, {
    socialMediaProvider: SocialMediaProvider;
    title?: string | undefined;
    tags?: string[] | undefined;
    hashtags?: string[] | undefined;
    visitSite?: string | undefined;
    body?: string | undefined;
    focusKeyphrase?: string | undefined;
    slug?: string | undefined;
    metaDescription?: string | undefined;
    textContentChange?: string | undefined;
    removeImages?: boolean | undefined;
    state?: PostState | undefined;
}>;
export declare class PostUpdateModificationRequestDto extends PostUpdateModificationRequestDto_base {
}
declare const PostModificationOperationResponseDto_base: import("nestjs-zod").ZodDto<{
    message: string;
    signedUrl?: string | undefined;
}, z.ZodObjectDef<{
    signedUrl: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    message: string;
    signedUrl?: string | undefined;
}>;
export declare class PostModificationOperationResponseDto extends PostModificationOperationResponseDto_base {
}
declare const PostHistoryQueryParametersDto_base: import("nestjs-zod").ZodDto<{
    take: number;
    skip: number;
    generationId?: string | undefined;
    state?: PostState | undefined;
    socialNetwork?: SocialMediaProvider | undefined;
}, z.ZodObjectDef<{
    take: z.ZodNumber;
    skip: z.ZodNumber;
    generationId: z.ZodOptional<z.ZodString>;
    socialNetwork: z.ZodOptional<z.ZodNativeEnum<typeof SocialMediaProvider>>;
    state: z.ZodOptional<z.ZodNativeEnum<typeof PostState>>;
}, "strip", z.ZodTypeAny>, {
    take: number;
    skip: number;
    generationId?: string | undefined;
    state?: PostState | undefined;
    socialNetwork?: SocialMediaProvider | undefined;
}>;
export declare class PostHistoryQueryParametersDto extends PostHistoryQueryParametersDto_base {
}
export declare const SocialMediaPostAnalyticsMetricsSchema: z.ZodObject<{
    impressions: z.ZodNumber;
    clicks: z.ZodNumber;
    likes: z.ZodNumber;
    comments: z.ZodNumber;
    shares: z.ZodNumber;
    engagementRate: z.ZodNumber;
    demographics: z.ZodOptional<z.ZodObject<{
        topLocations: z.ZodArray<z.ZodString, "many">;
        topIndustries: z.ZodArray<z.ZodString, "many">;
        seniorityLevels: z.ZodArray<z.ZodObject<{
            level: z.ZodString;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            level: string;
            percentage: number;
        }, {
            level: string;
            percentage: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        topLocations: string[];
        topIndustries: string[];
        seniorityLevels: {
            level: string;
            percentage: number;
        }[];
    }, {
        topLocations: string[];
        topIndustries: string[];
        seniorityLevels: {
            level: string;
            percentage: number;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    impressions: number;
    clicks: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    demographics?: {
        topLocations: string[];
        topIndustries: string[];
        seniorityLevels: {
            level: string;
            percentage: number;
        }[];
    } | undefined;
}, {
    impressions: number;
    clicks: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    demographics?: {
        topLocations: string[];
        topIndustries: string[];
        seniorityLevels: {
            level: string;
            percentage: number;
        }[];
    } | undefined;
}>;
export declare const CommentAuthorProfileSchema: z.ZodObject<{
    name: z.ZodString;
    headline: z.ZodString;
    profileUrl: z.ZodString;
    photoUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    headline: string;
    profileUrl: string;
    photoUrl: string;
}, {
    name: string;
    headline: string;
    profileUrl: string;
    photoUrl: string;
}>;
export declare const SocialMediaCommentDataSchema: z.ZodObject<{
    id: z.ZodString;
    author: z.ZodObject<{
        name: z.ZodString;
        headline: z.ZodString;
        profileUrl: z.ZodString;
        photoUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    }, {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    }>;
    text: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    text: string;
    author: {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    };
}, {
    id: string;
    createdAt: string;
    text: string;
    author: {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    };
}>;
export declare const PostReactionsMetricsSchema: z.ZodObject<{
    like: z.ZodNumber;
    celebrate: z.ZodNumber;
    support: z.ZodNumber;
    love: z.ZodNumber;
    insightful: z.ZodNumber;
    funny: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    like: number;
    celebrate: number;
    support: number;
    love: number;
    insightful: number;
    funny: number;
}, {
    like: number;
    celebrate: number;
    support: number;
    love: number;
    insightful: number;
    funny: number;
}>;
export declare const PostShareLinkResponseSchema: z.ZodObject<{
    shareUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shareUrl: string;
}, {
    shareUrl: string;
}>;
declare const SocialMediaPostAnalyticsMetricsDto_base: import("nestjs-zod").ZodDto<{
    impressions: number;
    clicks: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    demographics?: {
        topLocations: string[];
        topIndustries: string[];
        seniorityLevels: {
            level: string;
            percentage: number;
        }[];
    } | undefined;
}, z.ZodObjectDef<{
    impressions: z.ZodNumber;
    clicks: z.ZodNumber;
    likes: z.ZodNumber;
    comments: z.ZodNumber;
    shares: z.ZodNumber;
    engagementRate: z.ZodNumber;
    demographics: z.ZodOptional<z.ZodObject<{
        topLocations: z.ZodArray<z.ZodString, "many">;
        topIndustries: z.ZodArray<z.ZodString, "many">;
        seniorityLevels: z.ZodArray<z.ZodObject<{
            level: z.ZodString;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            level: string;
            percentage: number;
        }, {
            level: string;
            percentage: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        topLocations: string[];
        topIndustries: string[];
        seniorityLevels: {
            level: string;
            percentage: number;
        }[];
    }, {
        topLocations: string[];
        topIndustries: string[];
        seniorityLevels: {
            level: string;
            percentage: number;
        }[];
    }>>;
}, "strip", z.ZodTypeAny>, {
    impressions: number;
    clicks: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    demographics?: {
        topLocations: string[];
        topIndustries: string[];
        seniorityLevels: {
            level: string;
            percentage: number;
        }[];
    } | undefined;
}>;
export declare class SocialMediaPostAnalyticsMetricsDto extends SocialMediaPostAnalyticsMetricsDto_base {
}
declare const SocialMediaCommentDataDto_base: import("nestjs-zod").ZodDto<{
    id: string;
    createdAt: string;
    text: string;
    author: {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    };
}, z.ZodObjectDef<{
    id: z.ZodString;
    author: z.ZodObject<{
        name: z.ZodString;
        headline: z.ZodString;
        profileUrl: z.ZodString;
        photoUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    }, {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    }>;
    text: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    id: string;
    createdAt: string;
    text: string;
    author: {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    };
}>;
export declare class SocialMediaCommentDataDto extends SocialMediaCommentDataDto_base {
}
declare const SocialMediaCommentsCollectionDto_base: import("nestjs-zod").ZodDto<{
    id: string;
    createdAt: string;
    text: string;
    author: {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    };
}[], z.ZodArrayDef<z.ZodObject<{
    id: z.ZodString;
    author: z.ZodObject<{
        name: z.ZodString;
        headline: z.ZodString;
        profileUrl: z.ZodString;
        photoUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    }, {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    }>;
    text: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    text: string;
    author: {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    };
}, {
    id: string;
    createdAt: string;
    text: string;
    author: {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    };
}>>, {
    id: string;
    createdAt: string;
    text: string;
    author: {
        name: string;
        headline: string;
        profileUrl: string;
        photoUrl: string;
    };
}[]>;
export declare class SocialMediaCommentsCollectionDto extends SocialMediaCommentsCollectionDto_base {
}
declare const PostReactionsMetricsDto_base: import("nestjs-zod").ZodDto<{
    like: number;
    celebrate: number;
    support: number;
    love: number;
    insightful: number;
    funny: number;
}, z.ZodObjectDef<{
    like: z.ZodNumber;
    celebrate: z.ZodNumber;
    support: z.ZodNumber;
    love: z.ZodNumber;
    insightful: z.ZodNumber;
    funny: z.ZodNumber;
}, "strip", z.ZodTypeAny>, {
    like: number;
    celebrate: number;
    support: number;
    love: number;
    insightful: number;
    funny: number;
}>;
export declare class PostReactionsMetricsDto extends PostReactionsMetricsDto_base {
}
declare const PostShareLinkResponseDto_base: import("nestjs-zod").ZodDto<{
    shareUrl: string;
}, z.ZodObjectDef<{
    shareUrl: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    shareUrl: string;
}>;
export declare class PostShareLinkResponseDto extends PostShareLinkResponseDto_base {
}
export type PostContentGenerationData = z.infer<typeof SocialMediaContentGenerationRequestSchema>;
export type UpdatePostRequestDto = z.infer<typeof PostUpdateModificationRequestSchema>;
export type AgentGeneratedPostDto = z.infer<typeof GeneratedPostContentItemSchema>;
export type AgentPostWithGenerationIdDto = z.infer<typeof PostWithGenerationIdentifierSchema>;
export type AccountData = AccountContextForContentGenerationType;
export type RemoveImagesRequestDto = z.infer<typeof ImageRemovalRequestValidationSchema>;
export type PostContentGenerationDto = PostContentGenerationData;
export type AgentPostHistoryResponseDto = z.infer<typeof PostHistoryPaginationResponseSchema>;
export type AgentPostModificationResponseDto = z.infer<typeof PostModificationOperationResponseSchema>;
export type GetPostHistoryQueryDto = z.infer<typeof PostHistoryQueryParametersSchema>;
export {};
