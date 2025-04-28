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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookConnectionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const model_enums_1 = require("../../model.enums");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const tracked_insights_1 = require("./tracked-insights");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
let FacebookConnectionService = class FacebookConnectionService {
    constructor(prisma, logger, configService, trackedRecommendationsService) {
        this.prisma = prisma;
        this.logger = logger;
        this.configService = configService;
        this.trackedRecommendationsService = trackedRecommendationsService;
    }
    async updateTokens(accountId, tokenData) {
        if (tokenData.expiresIn) {
            const expiresInDate = tokenData.expiresIn instanceof Date
                ? tokenData.expiresIn
                : new Date(tokenData.expiresIn);
            if (isNaN(expiresInDate.getTime())) {
                this.logger.error('Invalid expiresIn date when updating tokens:', {
                    accountId,
                    expiresIn: tokenData.expiresIn,
                });
                throw new Error('Invalid expiresIn date');
            }
        }
        const existingTokens = await this.getExistingTokens(accountId);
        const updatedTokens = {
            ...existingTokens,
            [model_enums_1.SocialMediaProvider.FACEBOOK]: tokenData,
        };
        await this.prisma.accountSettings.update({
            where: { accountId },
            data: { socialMediaProviderTokens: updatedTokens },
        });
    }
    async getExistingTokens(accountId) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            include: { accountSettings: true },
        });
        return (account?.accountSettings
            ?.socialMediaProviderTokens || {
            provider: model_enums_1.SocialMediaProvider.FACEBOOK,
            accessToken: '',
            expiresIn: new Date(),
            pages: [],
            updatedAt: new Date(),
        });
    }
    getFacebookTokens(account) {
        const allTokens = account.accountSettings
            ?.socialMediaProviderTokens;
        return allTokens;
    }
    async getFacebookPermalink(pageAccessToken, facebookPostId) {
        try {
            const response = await axios_1.default.get(`https://graph.facebook.com/v20.0/${facebookPostId}`, {
                params: {
                    fields: 'permalink_url',
                    access_token: pageAccessToken,
                },
            });
            return response.data.permalink_url || undefined;
        }
        catch (error) {
            this.logger.warn('Failed to fetch Facebook permalink:', {
                facebookPostId,
                message: error.message,
                stack: error.stack,
            });
            return undefined;
        }
    }
    async updatePostAfterPublishing(postId, facebookPostId, publishedUrl) {
        await this.prisma.post.update({
            where: { id: postId },
            data: {
                postIdInSocialMediaProvider: facebookPostId,
                publishedAt: new Date(),
                state: 'POSTED',
                ...(publishedUrl && { publishedUrl }),
            },
        });
    }
    createFacebookFormData(data, accessToken) {
        const formData = new form_data_1.default();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));
        formData.append('access_token', accessToken);
        return formData;
    }
    async exchangeFacebookToken(accessToken) {
        try {
            const res = await axios_1.default.get('https://graph.facebook.com/v20.0/oauth/access_token', {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: this.configService.get('FACEBOOK_APP_ID'),
                    client_secret: this.configService.get('FACEBOOK_APP_SECRET'),
                    fb_exchange_token: accessToken,
                },
            });
            return {
                accessToken: res.data.access_token,
                expiresIn: res.data.expires_in,
            };
        }
        catch (error) {
            this.logger.error('Error exchanging Facebook token:', {
                message: error.message,
                stack: error.stack,
            });
            throw new Error(`Failed to exchange Facebook token: ${error.message}`);
        }
    }
    async refreshFacebookToken(tokenData) {
        try {
            if (!tokenData.accessToken) {
                return null;
            }
            const exchangeResponse = await this.exchangeFacebookToken(tokenData.accessToken);
            const expiresInSeconds = exchangeResponse.expiresIn || 60 * 24 * 60 * 60;
            const expiresInDate = new Date(Date.now() + expiresInSeconds * 1000);
            const refreshedPages = await this.getFacebookPageAccessToken(exchangeResponse.accessToken);
            return {
                ...tokenData,
                accessToken: exchangeResponse.accessToken,
                expiresIn: expiresInDate,
                pages: refreshedPages,
                updatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('Error refreshing Facebook access token:', {
                message: error.message,
                stack: error.stack,
            });
            return null;
        }
    }
    async getPageAccessToken(userAccessToken, pageId) {
        try {
            const res = await axios_1.default.get(`https://graph.facebook.com/v20.0/${pageId}`, {
                params: {
                    fields: 'access_token',
                    access_token: userAccessToken,
                },
            });
            return res.data.access_token;
        }
        catch (error) {
            this.logger.error(`Error getting page access token for ${pageId}:`, {
                message: error.message,
                stack: error.stack,
            });
            throw new Error(`Failed to get page access token: ${error.message}`);
        }
    }
    async getFacebookPageAccessToken(userAccessToken) {
        try {
            const res = await axios_1.default.get('https://graph.facebook.com/v20.0/me/accounts', {
                params: {
                    fields: 'name,id,access_token',
                    access_token: userAccessToken,
                },
            });
            const pagesWithImages = await Promise.all(res.data.data.map(async (page) => {
                try {
                    const profileImageRes = await axios_1.default.get(`https://graph.facebook.com/v20.0/${page.id}/picture`, {
                        params: {
                            type: 'large',
                            redirect: false,
                            access_token: userAccessToken,
                        },
                    });
                    return {
                        name: page.name,
                        id: page.id,
                        profileImage: profileImageRes.data.data?.url || '',
                        accessToken: page.access_token,
                    };
                }
                catch (error) {
                    this.logger.warn(`Failed to get profile image for page ${page.id}:`, {
                        message: error.message,
                        stack: error.stack,
                    });
                    return {
                        name: page.name,
                        id: page.id,
                        profileImage: '',
                        accessToken: page.access_token,
                    };
                }
            }));
            return pagesWithImages;
        }
        catch (error) {
            this.logger.error('Error getting Facebook page access token:', {
                message: error.message,
                stack: error.stack,
            });
            throw new Error(`Failed to get Facebook page access token: ${error.message}`);
        }
    }
    async setAccessToken(account, code) {
        try {
            const facebookResponse = await this.exchangeFacebookToken(code);
            const pages = await this.getFacebookPageAccessToken(facebookResponse.accessToken);
            const expiresInSeconds = facebookResponse.expiresIn || 60 * 24 * 60 * 60;
            const expiresInDate = new Date(Date.now() + expiresInSeconds * 1000);
            const tokenData = {
                provider: model_enums_1.SocialMediaProvider.FACEBOOK,
                accessToken: facebookResponse.accessToken,
                expiresIn: expiresInDate,
                pages,
                updatedAt: new Date(),
            };
            await this.updateTokens(account.id, tokenData);
            return {
                message: `${model_enums_1.SocialMediaProvider.FACEBOOK} OAuth callback successful`,
                provider: model_enums_1.SocialMediaProvider.FACEBOOK,
                pages,
            };
        }
        catch (error) {
            this.logger.error(`Error setting Facebook access token:`, {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async selectPage(account, pageId) {
        try {
            const facebookTokens = this.getFacebookTokens(account);
            if (!facebookTokens) {
                this.logger.error('No Facebook tokens found for this account', {
                    accountId: account.id,
                });
                throw new Error('No Facebook tokens found for this account');
            }
            const selectedPage = facebookTokens.pages?.find((page) => page.id === pageId);
            if (!selectedPage) {
                this.logger.error('Selected page not found', {
                    accountId: account.id,
                    pageId,
                });
                throw new Error('Selected page not found');
            }
            const updatedTokenData = {
                ...facebookTokens,
                selectedPageId: selectedPage.id,
                updatedAt: new Date(),
            };
            await this.updateTokens(account.id, updatedTokenData);
            return {
                message: `Successfully selected Facebook page: ${selectedPage.name}`,
                provider: model_enums_1.SocialMediaProvider.FACEBOOK,
            };
        }
        catch (error) {
            this.logger.error(`Error selecting Facebook page:`, {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async checkConnectionStatus(account) {
        try {
            const tokenData = this.getFacebookTokens(account);
            if (!tokenData) {
                return false;
            }
            const { expiresIn, selectedPageId } = tokenData;
            if (!selectedPageId) {
                this.logger.warn(`No Facebook page selected for account:`, {
                    accountId: account.id,
                });
                return false;
            }
            if (!tokenData.accessToken) {
                this.logger.warn(`No Facebook access token found for account:`, {
                    accountId: account.id,
                });
                return false;
            }
            let expiresInDate;
            if (typeof expiresIn === 'number') {
                expiresInDate = new Date(Date.now() + expiresIn * 1000);
            }
            else if (expiresIn instanceof Date) {
                expiresInDate = expiresIn;
            }
            else if (typeof expiresIn === 'string') {
                expiresInDate = new Date(expiresIn);
                if (isNaN(expiresInDate.getTime())) {
                    this.logger.warn(`Invalid expiresIn date string for Facebook:`, {
                        accountId: account.id,
                        expiresIn,
                    });
                    return false;
                }
            }
            else {
                this.logger.warn(`Invalid expiresIn field for Facebook:`, {
                    accountId: account.id,
                    expiresInType: typeof expiresIn,
                });
                return false;
            }
            const now = new Date();
            const timeUntilExpiry = expiresInDate.getTime() - now.getTime();
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            if (timeUntilExpiry < 0) {
                this.logger.warn(`Facebook access token has expired for account:`, {
                    accountId: account.id,
                    expiresIn: expiresInDate,
                    now,
                });
                return false;
            }
            if (timeUntilExpiry < sevenDaysInMs) {
                const refreshed = await this.refreshFacebookToken(tokenData);
                if (!refreshed) {
                    this.logger.warn(`Failed to refresh Facebook token for account:`, {
                        accountId: account.id,
                    });
                    return false;
                }
                await this.updateTokens(account.id, model_enums_1.SocialMediaProvider.FACEBOOK);
                this.logger.log(`Successfully refreshed Facebook token for account ${account.id}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error checking Facebook connection status:`, {
                message: error.message,
                stack: error.stack,
            });
            return false;
        }
    }
    async logout(account) {
        try {
            const existingTokens = await this.getExistingTokens(account.id);
            if (existingTokens.accessToken) {
                await this.prisma.accountSettings.update({
                    where: { accountId: account.id },
                    data: {
                        socialMediaProviderTokens: { [model_enums_1.SocialMediaProvider.FACEBOOK]: null },
                    },
                });
            }
            this.logger.log(`Successfully logged out from Facebook for account ${account.id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error logging out from Facebook:`, {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async getSelectedPage(account) {
        try {
            const tokenData = this.getFacebookTokens(account);
            if (!tokenData || !tokenData.selectedPageId) {
                return null;
            }
            const selectedPage = tokenData.pages?.find((page) => page.id === tokenData.selectedPageId);
            if (!selectedPage) {
                return null;
            }
            return {
                id: selectedPage.id,
                name: selectedPage.name,
                profileImage: selectedPage.profileImage,
            };
        }
        catch (error) {
            this.logger.error(`Error getting selected Facebook page:`, {
                message: error.message,
                stack: error.stack,
            });
            return null;
        }
    }
    async publish(account, postId) {
        this.logger.log('Starting Facebook post publication');
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                this.logger.error('Post not found', {
                    postId,
                    accountId: account.id,
                });
                throw new Error(`Post with ID ${postId} not found`);
            }
            if (post.accountId !== account.id) {
                this.logger.error('Post does not belong to this account', {
                    postId,
                    accountId: account.id,
                });
                throw new Error('Post does not belong to this account');
            }
            let tokenData = this.getFacebookTokens(account);
            if (!tokenData || !tokenData.selectedPageId) {
                this.logger.error('No Facebook page selected for this account', {
                    postId,
                    accountId: account.id,
                });
                throw new Error('No Facebook page selected for this account');
            }
            if (!tokenData?.accessToken) {
                this.logger.error('No Facebook access token found', {
                    postId,
                    accountId: account.id,
                });
                throw new Error('No Facebook access token found');
            }
            let expiresInDate;
            if (typeof tokenData.expiresIn === 'number') {
                expiresInDate = new Date(Date.now() + tokenData.expiresIn * 1000);
            }
            else if (tokenData.expiresIn instanceof Date) {
                expiresInDate = tokenData.expiresIn;
            }
            else {
                expiresInDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
            }
            const now = new Date();
            const timeUntilExpiry = expiresInDate.getTime() - now.getTime();
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            if (timeUntilExpiry < sevenDaysInMs) {
                const refreshed = await this.refreshFacebookToken(tokenData);
                if (refreshed) {
                    await this.updateTokens(account.id, refreshed);
                    tokenData = refreshed;
                    this.logger.log(`Refreshed Facebook token before publishing post ${postId}`);
                }
                else {
                    this.logger.warn(`Failed to refresh Facebook token before publishing, proceeding with existing token`);
                }
            }
            const pageAccessToken = await this.getPageAccessToken(tokenData.accessToken, tokenData.selectedPageId);
            let message = post?.body || '';
            if (post?.tags && post?.tags?.length > 0) {
                const hashtags = post.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`);
                message += `\n\n${hashtags.join(' ')}`;
            }
            let facebookPostId;
            if (post?.imagesUrl && post?.imagesUrl?.length > 0) {
                const lastImageUrl = post.imagesUrl[post.imagesUrl.length - 1];
                const formData = this.createFacebookFormData({
                    url: lastImageUrl,
                    caption: message,
                }, pageAccessToken);
                const response = await axios_1.default.post(`https://graph.facebook.com/v20.0/${tokenData.selectedPageId}/photos`, formData, { headers: formData.getHeaders() });
                facebookPostId = response.data.id;
                const permalinkUrl = await this.getFacebookPermalink(pageAccessToken, facebookPostId);
                await this.updatePostAfterPublishing(postId, facebookPostId, permalinkUrl);
                if (permalinkUrl) {
                    try {
                        await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId, permalinkUrl);
                        this.logger.log('Successfully tracked published Facebook post:', {
                            postId,
                            permalinkUrl,
                            recommendationId: post.recommendationId || 'dummy',
                        });
                    }
                    catch (trackingError) {
                        this.logger.error('Failed to track published Facebook post:', {
                            postId,
                            permalinkUrl,
                            message: trackingError.message,
                            stack: trackingError.stack,
                        });
                    }
                }
                this.logger.log('Successfully published Facebook post with image:', {
                    postId,
                    facebookPostId,
                    pageId: tokenData.selectedPageId,
                    permalinkUrl,
                });
                return true;
            }
            else {
                const formData = this.createFacebookFormData({ message }, pageAccessToken);
                const response = await axios_1.default.post(`https://graph.facebook.com/v20.0/${tokenData.selectedPageId}/feed`, formData, { headers: formData.getHeaders() });
                facebookPostId = response.data.id;
                const permalinkUrl = await this.getFacebookPermalink(pageAccessToken, facebookPostId);
                await this.updatePostAfterPublishing(postId, facebookPostId, permalinkUrl);
                if (permalinkUrl) {
                    try {
                        await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId, permalinkUrl);
                        this.logger.log('Successfully tracked published Facebook post:', {
                            postId,
                            permalinkUrl,
                            recommendationId: post.recommendationId || 'dummy',
                        });
                    }
                    catch (trackingError) {
                        this.logger.error('Failed to track published Facebook post:', {
                            postId,
                            permalinkUrl,
                            message: trackingError.message,
                            stack: trackingError.stack,
                        });
                    }
                }
                this.logger.log('Successfully published Facebook text post:', {
                    postId,
                    facebookPostId,
                    pageId: tokenData.selectedPageId,
                    permalinkUrl,
                });
                if (permalinkUrl) {
                    try {
                        this.logger.log('Ingesting published post into Victor', {
                            postId,
                            publishedUrl: permalinkUrl,
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
                this.logger.log('Facebook post publication completed successfully');
                return true;
            }
        }
        catch (error) {
            this.logger.error('Error publishing Facebook post:', {
                message: error.response?.data || error.message,
                stack: error.stack,
                postId,
                accountId: account.id,
            });
            throw error;
        }
    }
};
exports.FacebookConnectionService = FacebookConnectionService;
exports.FacebookConnectionService = FacebookConnectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger,
        config_1.ConfigService,
        tracked_insights_1.TrackedRecommendationsService])
], FacebookConnectionService);
//# sourceMappingURL=facebook.service.js.map