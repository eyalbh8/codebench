"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationStatus = exports.CompetitorStatus = exports.SocialMediaProvider = exports.PostState = exports.PromptState = exports.TopicState = exports.ImpactLevels = exports.RecommendationType = exports.UserRole = exports.RunStatus = exports.TaskStatus = exports.PromptIntentType = exports.PromptType = exports.Provider = exports.PromptResponseStatus = exports.AccountSubscriptionStatus = exports.AccountStatus = exports.UrgencyLevel = exports.FeatureRequestStatus = exports.AsyncJobStatus = exports.AsyncJobType = void 0;
var AsyncJobType;
(function (AsyncJobType) {
    AsyncJobType["GENERATE_ACCOUNT_WEEKLY_INSIGHTS"] = "GENERATE_ACCOUNT_WEEKLY_INSIGHTS";
    AsyncJobType["GENERATE_PROMPT_SUGGESTIONS"] = "GENERATE_PROMPT_SUGGESTIONS";
    AsyncJobType["GENERATE_PROMPT_INTENTIONS"] = "GENERATE_PROMPT_INTENTIONS";
    AsyncJobType["GENERATE_TOPICS_VOLUMES"] = "GENERATE_TOPICS_VOLUMES";
    AsyncJobType["GENERATE_PROMPT_VOLUMES"] = "GENERATE_PROMPT_VOLUMES";
    AsyncJobType["GENERATE_POSTS"] = "GENERATE_POSTS";
    AsyncJobType["GENERATE_TOPICS"] = "GENERATE_TOPICS";
    AsyncJobType["MERGE_ENTITIES"] = "MERGE_ENTITIES";
    AsyncJobType["GENERATE_ONBOARDING_INFO"] = "GENERATE_ONBOARDING_INFO";
    AsyncJobType["GET_COMPETITOR_SITE_URL"] = "GET_COMPETITOR_SITE_URL";
    AsyncJobType["GENERATE_PROMPT_RECOMMENDATIONS"] = "GENERATE_PROMPT_RECOMMENDATIONS";
    AsyncJobType["MERGE_CANDIDATE"] = "MERGE_CANDIDATE";
})(AsyncJobType || (exports.AsyncJobType = AsyncJobType = {}));
var AsyncJobStatus;
(function (AsyncJobStatus) {
    AsyncJobStatus["PENDING"] = "PENDING";
    AsyncJobStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AsyncJobStatus["COMPLETED"] = "COMPLETED";
    AsyncJobStatus["FAILED"] = "FAILED";
})(AsyncJobStatus || (exports.AsyncJobStatus = AsyncJobStatus = {}));
var FeatureRequestStatus;
(function (FeatureRequestStatus) {
    FeatureRequestStatus["PENDING"] = "PENDING";
    FeatureRequestStatus["IN_PROGRESS"] = "IN_PROGRESS";
    FeatureRequestStatus["COMPLETED"] = "COMPLETED";
    FeatureRequestStatus["FAILED"] = "FAILED";
})(FeatureRequestStatus || (exports.FeatureRequestStatus = FeatureRequestStatus = {}));
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["LOW"] = "LOW";
    UrgencyLevel["MID"] = "MID";
    UrgencyLevel["HIGH"] = "HIGH";
    UrgencyLevel["CRITICAL"] = "CRITICAL";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AccountStatus["INITIAL"] = "INITIAL";
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["CANCELLED"] = "CANCELLED";
    AccountStatus["DELETED"] = "DELETED";
    AccountStatus["FAILED_ONBOARDING"] = "FAILED_ONBOARDING";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var AccountSubscriptionStatus;
(function (AccountSubscriptionStatus) {
    AccountSubscriptionStatus["ACTIVE"] = "active";
    AccountSubscriptionStatus["TRIALING"] = "trialing";
    AccountSubscriptionStatus["PAST_DUE"] = "past_due";
    AccountSubscriptionStatus["INCOMPLETE"] = "incomplete";
    AccountSubscriptionStatus["INCOMPLETE_EXPIRED"] = "incomplete_expired";
    AccountSubscriptionStatus["CANCELLED"] = "canceled";
    AccountSubscriptionStatus["UNPAID"] = "unpaid";
})(AccountSubscriptionStatus || (exports.AccountSubscriptionStatus = AccountSubscriptionStatus = {}));
var PromptResponseStatus;
(function (PromptResponseStatus) {
    PromptResponseStatus["PENDING"] = "PENDING";
    PromptResponseStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PromptResponseStatus["COMPLETED"] = "COMPLETED";
    PromptResponseStatus["FAILED"] = "FAILED";
})(PromptResponseStatus || (exports.PromptResponseStatus = PromptResponseStatus = {}));
var Provider;
(function (Provider) {
    Provider["GEMINI"] = "GEMINI";
    Provider["OPENAI"] = "OPENAI";
    Provider["ANTHROPIC"] = "ANTHROPIC";
    Provider["PERPLEXITY"] = "PERPLEXITY";
    Provider["GROK"] = "GROK";
    Provider["BD_GOOGLE_AI_MODE"] = "BD_GOOGLE_AI_MODE";
    Provider["BD_COPILOT"] = "BD_COPILOT";
})(Provider || (exports.Provider = Provider = {}));
var PromptType;
(function (PromptType) {
    PromptType["COMMERCIAL"] = "COMMERCIAL";
    PromptType["INFORMATIONAL"] = "INFORMATIONAL";
    PromptType["NAVIGATIONAL"] = "NAVIGATIONAL";
    PromptType["TRANSACTIONAL"] = "TRANSACTIONAL";
})(PromptType || (exports.PromptType = PromptType = {}));
var PromptIntentType;
(function (PromptIntentType) {
    PromptIntentType["ORGANIC"] = "ORGANIC";
    PromptIntentType["BRANDED"] = "BRANDED";
    PromptIntentType["COMPETITOR_COMPARISON"] = "COMPETITOR_COMPARISON";
})(PromptIntentType || (exports.PromptIntentType = PromptIntentType = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["FAILED"] = "FAILED";
    TaskStatus["TIMEOUT"] = "TIMEOUT";
    TaskStatus["IN_RECOVERY"] = "IN_RECOVERY";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var RunStatus;
(function (RunStatus) {
    RunStatus["PENDING"] = "PENDING";
    RunStatus["IN_PROGRESS"] = "IN_PROGRESS";
    RunStatus["COMPLETED"] = "COMPLETED";
    RunStatus["FAILED"] = "FAILED";
    RunStatus["TIMEOUT"] = "TIMEOUT";
})(RunStatus || (exports.RunStatus = RunStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MEMBER"] = "MEMBER";
})(UserRole || (exports.UserRole = UserRole = {}));
var RecommendationType;
(function (RecommendationType) {
    RecommendationType["CONTENT"] = "CONTENT";
    RecommendationType["BLOG"] = "BLOG";
    RecommendationType["TECHNICAL"] = "TECHNICAL";
    RecommendationType["PR"] = "PR";
    RecommendationType["THIRD_PARTY"] = "THIRD_PARTY";
})(RecommendationType || (exports.RecommendationType = RecommendationType = {}));
var ImpactLevels;
(function (ImpactLevels) {
    ImpactLevels["LOW"] = "LOW";
    ImpactLevels["MEDIUM"] = "MEDIUM";
    ImpactLevels["HIGH"] = "HIGH";
})(ImpactLevels || (exports.ImpactLevels = ImpactLevels = {}));
var TopicState;
(function (TopicState) {
    TopicState["ACTIVE"] = "ACTIVE";
    TopicState["INACTIVE"] = "INACTIVE";
    TopicState["SUGGESTED"] = "SUGGESTED";
    TopicState["DELETED"] = "DELETED";
})(TopicState || (exports.TopicState = TopicState = {}));
var PromptState;
(function (PromptState) {
    PromptState["ACTIVE"] = "ACTIVE";
    PromptState["INACTIVE"] = "INACTIVE";
    PromptState["SUGGESTED"] = "SUGGESTED";
    PromptState["DELETED"] = "DELETED";
})(PromptState || (exports.PromptState = PromptState = {}));
var PostState;
(function (PostState) {
    PostState["SUGGESTED"] = "SUGGESTED";
    PostState["TO_BE_PUBLISHED"] = "TO_BE_PUBLISHED";
    PostState["SCHEDULED"] = "SCHEDULED";
    PostState["POSTED"] = "POSTED";
    PostState["CANCELED"] = "CANCELED";
    PostState["FAILED"] = "FAILED";
    PostState["IN_PROGRESS"] = "IN_PROGRESS";
    PostState["DELETED"] = "DELETED";
})(PostState || (exports.PostState = PostState = {}));
var SocialMediaProvider;
(function (SocialMediaProvider) {
    SocialMediaProvider["X"] = "X";
    SocialMediaProvider["LINKEDIN"] = "LINKEDIN";
    SocialMediaProvider["FACEBOOK"] = "FACEBOOK";
    SocialMediaProvider["INSTAGRAM"] = "INSTAGRAM";
    SocialMediaProvider["TIKTOK"] = "TIKTOK";
    SocialMediaProvider["GSC"] = "GSC";
    SocialMediaProvider["REDDIT"] = "REDDIT";
    SocialMediaProvider["PINTEREST"] = "PINTEREST";
    SocialMediaProvider["BLOG"] = "BLOG";
    SocialMediaProvider["LISTICLE"] = "LISTICLE";
})(SocialMediaProvider || (exports.SocialMediaProvider = SocialMediaProvider = {}));
var CompetitorStatus;
(function (CompetitorStatus) {
    CompetitorStatus["ACTIVE"] = "ACTIVE";
    CompetitorStatus["ONBOARDING"] = "ONBOARDING";
})(CompetitorStatus || (exports.CompetitorStatus = CompetitorStatus = {}));
var RecommendationStatus;
(function (RecommendationStatus) {
    RecommendationStatus["TO_DO"] = "TO_DO";
    RecommendationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    RecommendationStatus["DONE"] = "DONE";
})(RecommendationStatus || (exports.RecommendationStatus = RecommendationStatus = {}));
//# sourceMappingURL=model.enums.js.map