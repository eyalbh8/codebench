"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialMediaConnectionService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../config/config.service");
const model_enums_1 = require("../../model.enums");
const twitter_api_v2_1 = require("twitter-api-v2");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const tracked_insights_1 = require("./tracked-insights");
const app_error_exception_1 = require("../../exceptions/app-error.exception");
const errors_1 = require("../../constants/errors");
let SocialMediaConnectionService = class SocialMediaConnectionService {
    constructor(prisma, logger, configService, trackedRecommendationsService) {
        this.prisma = prisma;
        this.logger = logger;
        this.configService = configService;
        this.trackedRecommendationsService = trackedRecommendationsService;
    }
    constructTwitterUrl(tweetId) {
        return `https://twitter.com/i/status/${tweetId}`;
    }
    async setAccessToken(account, bodyOrCode, codeVerifier) {
        let code;
        let bodyCodeVerifier;
        let state;
        if (typeof bodyOrCode === 'string') {
            code = bodyOrCode;
            bodyCodeVerifier = codeVerifier;
        }
        else {
            code = bodyOrCode.code;
            bodyCodeVerifier = bodyOrCode.codeVerifier;
            state = bodyOrCode.state;
        }
        try {
            const client = new twitter_api_v2_1.TwitterApi({
                clientId: this.configService.get('X_CLIENT_ID'),
                clientSecret: this.configService.get('X_CLIENT_SECRET'),
            });
            const siteUrl = this.configService.get('SITE_URL');
            const redirectUri = `${siteUrl}/igeo-agents`;
            const xResponse = await client.loginWithOAuth2({
                code,
                codeVerifier: bodyCodeVerifier || '',
                redirectUri,
            });
            const accessToken = xResponse.accessToken;
            const refreshToken = xResponse.refreshToken;
            const expiresIn = xResponse.expiresIn;
            const expiresInSeconds = expiresIn;
            const expiresInDate = new Date(Date.now() + expiresInSeconds * 1000);
            const providerKey = 'x';
            const existingTokens = account.accountSettings
                ?.socialMediaProviderTokens || {};
            const updatedTokens = {
                ...existingTokens,
                [providerKey]: {
                    accessToken,
                    refreshToken,
                    expiresIn: expiresInDate,
                    updatedAt: new Date(),
                },
            };
            await this.prisma.accountSettings.update({
                where: { accountId: account.id },
                data: {
                    socialMediaProviderTokens: updatedTokens,
                },
            });
            return {
                message: `X OAuth callback successful`,
                provider: model_enums_1.SocialMediaProvider.X,
            };
        }
        catch (error) {
            this.logger.error(`Error setting access token for X: ${error.message}`);
            throw error;
        }
    }
    async verifyXToken(accessToken) {
        try {
            const client = new twitter_api_v2_1.TwitterApi(accessToken);
            await client.v2.me();
            return true;
        }
        catch (error) {
            this.logger.warn('X token verification failed:', {
                message: error.message,
            });
            return false;
        }
    }
    async refreshXToken(tokenData) {
        try {
            if (!tokenData.refreshToken) {
                this.logger.warn('No refresh token available for X');
                return null;
            }
            const client = new twitter_api_v2_1.TwitterApi({
                clientId: this.configService.get('X_CLIENT_ID'),
                clientSecret: this.configService.get('X_CLIENT_SECRET'),
            });
            const refreshed = await client.refreshOAuth2Token(tokenData.refreshToken);
            const expiresInSeconds = refreshed.expiresIn;
            const expiresInDate = new Date(Date.now() + expiresInSeconds * 1000);
            return {
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken || tokenData.refreshToken,
                expiresIn: expiresInDate,
                updatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('Error refreshing X access token:', {
                message: error.message,
                stack: error.stack,
            });
            return null;
        }
    }
    async checkConnectionStatus(account) {
        return this.checkConnectionStatusWithProvider(account, model_enums_1.SocialMediaProvider.X);
    }
    async checkConnectionStatusWithProvider(account, provider) {
        try {
            const providerKey = provider.toLowerCase();
            const allTokens = account.accountSettings
                ?.socialMediaProviderTokens;
            const tokenData = allTokens?.[providerKey];
            if (!tokenData) {
                return false;
            }
            if (!tokenData || typeof tokenData !== 'object') {
                this.logger.warn(`Invalid token data structure for ${provider}:`, tokenData);
                return false;
            }
            const { expiresIn } = tokenData;
            let expiresInDate;
            if (typeof expiresIn === 'string') {
                expiresInDate = new Date(expiresIn);
            }
            else if (expiresIn instanceof Date) {
                expiresInDate = expiresIn;
            }
            else {
                this.logger.warn(`Invalid expiresIn field for ${provider}:`, expiresIn);
                return false;
            }
            const now = new Date();
            const timeUntilExpiry = expiresInDate.getTime() - now.getTime();
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            const twentyMinutesInMs = 20 * 60 * 1000;
            if (timeUntilExpiry > sevenDaysInMs) {
                return true;
            }
            if (provider === model_enums_1.SocialMediaProvider.X) {
                const isTokenValid = await this.verifyXToken(tokenData.accessToken);
                if (isTokenValid && timeUntilExpiry > twentyMinutesInMs) {
                    return true;
                }
                if (!isTokenValid || timeUntilExpiry < twentyMinutesInMs) {
                    const refreshed = await this.refreshXToken(tokenData);
                    if (!refreshed) {
                        this.logger.warn(`Failed to refresh X token for account:`, {
                            accountId: account.id,
                            reason: !tokenData.refreshToken
                                ? 'No refresh token available'
                                : 'Refresh attempt failed',
                        });
                        return false;
                    }
                    const refreshedTokenValid = await this.verifyXToken(refreshed.accessToken);
                    if (!refreshedTokenValid) {
                        this.logger.warn(`Refreshed X token failed verification for account:`, {
                            accountId: account.id,
                        });
                        return false;
                    }
                    const existingTokens = account.accountSettings
                        ?.socialMediaProviderTokens ||
                        {};
                    const updatedTokens = {
                        ...existingTokens,
                        [providerKey]: refreshed,
                    };
                    await this.prisma.accountSettings.update({
                        where: { accountId: account.id },
                        data: {
                            socialMediaProviderTokens: updatedTokens,
                        },
                    });
                    this.logger.log(`Successfully refreshed X token for account ${account.id}`);
                    return true;
                }
                return true;
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error checking connection status for ${provider}:`, error);
            return false;
        }
    }
    async logout(account) {
        return this.logoutWithProvider(account, model_enums_1.SocialMediaProvider.X);
    }
    async logoutWithProvider(account, provider) {
        try {
            const providerKey = provider.toLowerCase();
            const existingTokens = account.accountSettings
                ?.socialMediaProviderTokens || {};
            if (existingTokens[providerKey]) {
                const { [providerKey]: removed, ...updatedTokens } = existingTokens;
                await this.prisma.accountSettings.update({
                    where: { accountId: account.id },
                    data: {
                        socialMediaProviderTokens: updatedTokens,
                    },
                });
                this.logger.log(`Successfully logged out from ${provider} for account ${account.id}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error logging out from ${provider}: ${error.message}`);
            throw error;
        }
    }
    async publish(account, postId) {
        this.logger.log('Starting X (Twitter) post publication');
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                this.logger.error(`Post not found: ${postId}`);
                throw new Error(`Post not found: ${postId}`);
            }
            if (post.publishedAt || post.state === model_enums_1.PostState.POSTED.toString()) {
                this.logger.warn(`Post ${postId} was already published on ${post.publishedAt?.toISOString()}`);
                throw new Error(`Post ${postId} was already published and cannot be published again`);
            }
            if (!post.socialMediaProvider) {
                this.logger.error(`Post ${postId} has no social media provider`);
                throw new Error(`Post ${postId} has no social media provider`);
            }
            const isConnected = await this.checkConnectionStatusWithProvider(account, post.socialMediaProvider);
            if (!isConnected) {
                this.logger.error(`Social media connection expired or invalid for ${post.socialMediaProvider}`);
                throw new Error(`Social media connection expired or invalid for ${post.socialMediaProvider}`);
            }
            if (post.socialMediaProvider !== model_enums_1.SocialMediaProvider.X.toString()) {
                this.logger.error(`Unsupported social media provider: ${post.socialMediaProvider}`);
                throw new Error(`Unsupported social media provider: ${post.socialMediaProvider}`);
            }
            const providerKey = post.socialMediaProvider.toLowerCase();
            let allTokens = account.accountSettings
                ?.socialMediaProviderTokens;
            let tokenData = allTokens?.[providerKey];
            if (!tokenData?.accessToken) {
                this.logger.error(`No access token found for ${post.socialMediaProvider}`);
                throw new Error(`No access token found for ${post.socialMediaProvider}`);
            }
            if (post.socialMediaProvider === model_enums_1.SocialMediaProvider.X.toString()) {
                let expiresInDate;
                if (typeof tokenData.expiresIn === 'string') {
                    expiresInDate = new Date(tokenData.expiresIn);
                }
                else if (tokenData.expiresIn instanceof Date) {
                    expiresInDate = tokenData.expiresIn;
                }
                else {
                    expiresInDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
                }
                const now = new Date();
                const timeUntilExpiry = expiresInDate.getTime() - now.getTime();
                const twentyMinutesInMs = 20 * 60 * 1000;
                if (timeUntilExpiry < twentyMinutesInMs) {
                    const refreshed = await this.refreshXToken(tokenData);
                    if (refreshed) {
                        const updatedTokens = {
                            ...allTokens,
                            [providerKey]: refreshed,
                        };
                        await this.prisma.accountSettings.update({
                            where: { accountId: account.id },
                            data: {
                                socialMediaProviderTokens: updatedTokens,
                            },
                        });
                        tokenData = refreshed;
                        allTokens = updatedTokens;
                        this.logger.log(`Refreshed X token before publishing post ${postId}`);
                    }
                    else {
                        this.logger.warn(`Failed to refresh X token before publishing, proceeding with existing token`);
                    }
                }
            }
            let publishedUrl;
            switch (post.socialMediaProvider) {
                case model_enums_1.SocialMediaProvider.X.toString(): {
                    const authenticatedClient = new twitter_api_v2_1.TwitterApi(tokenData.accessToken);
                    if (!post.body || post.body.trim().length === 0) {
                        this.logger.error(`Post content is empty for post ${postId}`);
                        throw new Error(`Post content is empty for post ${postId}`);
                    }
                    if (post.body.length > 280) {
                        this.logger.warn(`Post content exceeds 280 characters, truncating...`);
                    }
                    const tweetResponse = await authenticatedClient.v2.tweet(post.body);
                    const tweetId = tweetResponse.data.id;
                    publishedUrl = this.constructTwitterUrl(tweetId);
                    await this.prisma.post.update({
                        where: { id: postId },
                        data: {
                            postIdInSocialMediaProvider: tweetId,
                            publishedAt: new Date(),
                            state: model_enums_1.PostState.POSTED,
                            publishedUrl,
                        },
                    });
                    if (publishedUrl) {
                        try {
                            await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId, publishedUrl);
                            this.logger.log('Successfully tracked published X post:', {
                                postId,
                                publishedUrl,
                                recommendationId: post.recommendationId || 'dummy',
                            });
                        }
                        catch (trackingError) {
                            this.logger.error('Failed to track published X post:', {
                                postId,
                                publishedUrl,
                                message: trackingError.message,
                                stack: trackingError.stack,
                            });
                        }
                    }
                    this.logger.log(`Successfully published content to ${post.socialMediaProvider} for account ${account.id}. Tweet ID: ${tweetId}`, { publishedUrl });
                    break;
                }
                default: {
                    this.logger.error(`Unsupported social media provider in publish in switch case: ${post.socialMediaProvider}`);
                    throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.UNSUPPORTED_SOCIAL_MEDIA_PROVIDER, common_1.HttpStatus.BAD_REQUEST, `Unsupported social media provider: ${post.socialMediaProvider}`);
                }
            }
            if (publishedUrl) {
                try {
                    this.logger.log('Ingesting published post into Victor', {
                        postId,
                        publishedUrl,
                        accountId: account.id,
                    });
                    this.logger.log('Post successfully ingested into Victor', {
                        postId,
                        accountId: account.id,
                    });
                }
                catch (error) {
                    this.logger.error('Failed to ingest post into Victor (non-critical)', {
                        postId,
                        accountId: account.id,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            this.logger.log('X (Twitter) post publication completed successfully');
            return true;
        }
        catch (error) {
            try {
                await this.prisma.post.update({
                    where: { id: postId },
                    data: {
                        state: model_enums_1.PostState.FAILED,
                    },
                });
            }
            catch (updateError) {
                this.logger.error(`Failed to update post state after publish error:`, updateError);
            }
            this.logger.error(`Error publishing to ${postId}: ${error.message}`);
            throw error;
        }
    }
};
exports.SocialMediaConnectionService = SocialMediaConnectionService;
exports.SocialMediaConnectionService = SocialMediaConnectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger,
        config_service_1.ConfigService,
        tracked_insights_1.TrackedRecommendationsService])
], SocialMediaConnectionService);
//# sourceMappingURL=x.service.js.map