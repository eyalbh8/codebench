export declare enum AsyncJobType {
    GENERATE_ACCOUNT_WEEKLY_INSIGHTS = "GENERATE_ACCOUNT_WEEKLY_INSIGHTS",
    GENERATE_PROMPT_SUGGESTIONS = "GENERATE_PROMPT_SUGGESTIONS",
    GENERATE_PROMPT_INTENTIONS = "GENERATE_PROMPT_INTENTIONS",
    GENERATE_TOPICS_VOLUMES = "GENERATE_TOPICS_VOLUMES",
    GENERATE_PROMPT_VOLUMES = "GENERATE_PROMPT_VOLUMES",
    GENERATE_POSTS = "GENERATE_POSTS",
    GENERATE_TOPICS = "GENERATE_TOPICS",
    MERGE_ENTITIES = "MERGE_ENTITIES",
    GENERATE_ONBOARDING_INFO = "GENERATE_ONBOARDING_INFO",
    GET_COMPETITOR_SITE_URL = "GET_COMPETITOR_SITE_URL",
    GENERATE_PROMPT_RECOMMENDATIONS = "GENERATE_PROMPT_RECOMMENDATIONS",
    MERGE_CANDIDATE = "MERGE_CANDIDATE"
}
export declare enum AsyncJobStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum FeatureRequestStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum UrgencyLevel {
    LOW = "LOW",
    MID = "MID",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum AccountStatus {
    IN_PROGRESS = "IN_PROGRESS",
    INITIAL = "INITIAL",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    CANCELLED = "CANCELLED",
    DELETED = "DELETED",
    FAILED_ONBOARDING = "FAILED_ONBOARDING"
}
export declare enum AccountSubscriptionStatus {
    ACTIVE = "active",
    TRIALING = "trialing",
    PAST_DUE = "past_due",
    INCOMPLETE = "incomplete",
    INCOMPLETE_EXPIRED = "incomplete_expired",
    CANCELLED = "canceled",
    UNPAID = "unpaid"
}
export declare enum PromptResponseStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum Provider {
    GEMINI = "GEMINI",
    OPENAI = "OPENAI",
    ANTHROPIC = "ANTHROPIC",
    PERPLEXITY = "PERPLEXITY",
    GROK = "GROK",
    BD_GOOGLE_AI_MODE = "BD_GOOGLE_AI_MODE",
    BD_COPILOT = "BD_COPILOT"
}
export declare enum PromptType {
    COMMERCIAL = "COMMERCIAL",
    INFORMATIONAL = "INFORMATIONAL",
    NAVIGATIONAL = "NAVIGATIONAL",
    TRANSACTIONAL = "TRANSACTIONAL"
}
export declare enum PromptIntentType {
    ORGANIC = "ORGANIC",
    BRANDED = "BRANDED",
    COMPETITOR_COMPARISON = "COMPETITOR_COMPARISON"
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT",
    IN_RECOVERY = "IN_RECOVERY"
}
export declare enum RunStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT"
}
export declare enum UserRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare enum RecommendationType {
    CONTENT = "CONTENT",
    BLOG = "BLOG",
    TECHNICAL = "TECHNICAL",
    PR = "PR",
    THIRD_PARTY = "THIRD_PARTY"
}
export declare enum ImpactLevels {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}
export declare enum TopicState {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUGGESTED = "SUGGESTED",
    DELETED = "DELETED"
}
export declare enum PromptState {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUGGESTED = "SUGGESTED",
    DELETED = "DELETED"
}
export declare enum PostState {
    SUGGESTED = "SUGGESTED",
    TO_BE_PUBLISHED = "TO_BE_PUBLISHED",
    SCHEDULED = "SCHEDULED",
    POSTED = "POSTED",
    CANCELED = "CANCELED",
    FAILED = "FAILED",
    IN_PROGRESS = "IN_PROGRESS",
    DELETED = "DELETED"
}
export declare enum SocialMediaProvider {
    X = "X",
    LINKEDIN = "LINKEDIN",
    FACEBOOK = "FACEBOOK",
    INSTAGRAM = "INSTAGRAM",
    TIKTOK = "TIKTOK",
    GSC = "GSC",
    REDDIT = "REDDIT",
    PINTEREST = "PINTEREST",
    BLOG = "BLOG",
    LISTICLE = "LISTICLE"
}
export declare enum CompetitorStatus {
    ACTIVE = "ACTIVE",
    ONBOARDING = "ONBOARDING"
}
export declare enum RecommendationStatus {
    TO_DO = "TO_DO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}
