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
exports.InstagramConnectionServices = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_logger_service_1 = require("../../utils/app-logger.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const model_enums_1 = require("../../model.enums");
const tracked_insights_1 = require("./tracked-insights");
const axios_1 = __importDefault(require("axios"));
let InstagramConnectionServices = class InstagramConnectionServices {
    constructor(prisma, logger, configService, trackedRecommendationsService) {
        this.prisma = prisma;
        this.logger = logger;
        this.configService = configService;
        this.trackedRecommendationsService = trackedRecommendationsService;
        this.graphBaseUrl = 'https://graph.facebook.com/v20.0';
    }
    parseInstagramTokens(account) {
        const rawTokens = account.accountSettings
            ?.socialMediaProviderTokens;
        if (!rawTokens || typeof rawTokens !== 'object') {
            return {};
        }
        return rawTokens;
    }
    async getExistingTokens(accountId) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            include: { accountSettings: true },
        });
        return (account?.accountSettings?.socialMediaProviderTokens || {});
    }
    getInstagramTokens(account) {
        const allTokens = this.parseInstagramTokens(account);
        return allTokens?.[model_enums_1.SocialMediaProvider.INSTAGRAM] || null;
    }
    async updateSocialMediaTokens(accountId, tokenData) {
        const existingTokens = await this.getExistingTokens(accountId);
        const updatedTokens = {
            ...existingTokens,
            [model_enums_1.SocialMediaProvider.INSTAGRAM]: tokenData,
        };
        await this.prisma.accountSettings.update({
            where: { accountId },
            data: { socialMediaProviderTokens: updatedTokens },
        });
    }
    async exchangeFacebookToken(code) {
        try {
            const redirectUri = this.configService.get('SITE_URL') + '/igeo-agents';
            const res = await axios_1.default.get(`${this.graphBaseUrl}/oauth/access_token`, {
                params: {
                    client_id: this.configService.get('FACEBOOK_APP_ID'),
                    client_secret: this.configService.get('FACEBOOK_APP_SECRET'),
                    redirect_uri: redirectUri,
                    code: code,
                },
            });
            const shortLivedToken = res.data.access_token;
            const expiresIn = res.data.expires_in || 5184000;
            try {
                const longLivedRes = await axios_1.default.get(`${this.graphBaseUrl}/oauth/access_token`, {
                    params: {
                        grant_type: 'fb_exchange_token',
                        client_id: this.configService.get('FACEBOOK_APP_ID'),
                        client_secret: this.configService.get('FACEBOOK_APP_SECRET'),
                        fb_exchange_token: shortLivedToken,
                    },
                });
                return {
                    accessToken: longLivedRes.data.access_token,
                    expiresIn: longLivedRes.data.expires_in || expiresIn,
                };
            }
            catch (exchangeError) {
                this.logger.warn('Failed to exchange for long-lived token, using short-lived', {
                    error: exchangeError,
                });
                return {
                    accessToken: shortLivedToken,
                    expiresIn: expiresIn,
                };
            }
        }
        catch (error) {
            this.logger.error('Error exchanging Instagram token:', {
                message: error.message,
                response: error.response?.data,
                stack: error.stack,
            });
            throw new Error(`Failed to exchange Instagram token: ${error.message}`);
        }
    }
    async fetchInstagramProfiles(userAccessToken) {
        try {
            const permissionsResponse = await axios_1.default.get(`${this.graphBaseUrl}/me/permissions`, {
                params: {
                    access_token: userAccessToken,
                },
            });
            this.logger.log('Token permissions:', {
                permissions: permissionsResponse.data?.data?.map((p) => ({
                    permission: p.permission,
                    status: p.status,
                })),
            });
            const meResponse = await axios_1.default.get(`${this.graphBaseUrl}/me`, {
                params: {
                    fields: 'id,name,email',
                    access_token: userAccessToken,
                },
            });
            this.logger.log('Token belongs to user:', {
                userId: meResponse.data.id,
                userName: meResponse.data.name,
                userEmail: meResponse.data.email,
            });
            const response = await axios_1.default.get(`${this.graphBaseUrl}/me/accounts`, {
                params: {
                    fields: 'name,id,access_token,instagram_business_account',
                    access_token: userAccessToken,
                },
            });
            let pages = response.data?.data || [];
            this.logger.log('Facebook /me/accounts response:', {
                pageCount: pages.length,
                pages: pages.map((p) => ({
                    id: p.id,
                    name: p.name,
                    hasInstagramAccount: !!p.instagram_business_account,
                    instagramAccountId: p.instagram_business_account?.id,
                })),
            });
            if (pages.length === 0) {
                try {
                    const businessResponse = await axios_1.default.get(`${this.graphBaseUrl}/me/businesses`, {
                        params: {
                            fields: 'id,name',
                            access_token: userAccessToken,
                        },
                    });
                    const businesses = businessResponse.data?.data || [];
                    this.logger.log('Facebook /me/businesses response:', {
                        businessCount: businesses.length,
                        businesses: businesses.map((b) => ({
                            id: b.id,
                            name: b.name,
                        })),
                    });
                    for (const business of businesses) {
                        try {
                            const businessPagesResponse = await axios_1.default.get(`${this.graphBaseUrl}/${business.id}/owned_pages`, {
                                params: {
                                    fields: 'name,id,access_token,instagram_business_account',
                                    access_token: userAccessToken,
                                },
                            });
                            const businessPages = businessPagesResponse.data?.data || [];
                            this.logger.log(`Business ${business.name} pages:`, {
                                pageCount: businessPages.length,
                                pages: businessPages.map((p) => ({
                                    id: p.id,
                                    name: p.name,
                                    hasInstagramAccount: !!p.instagram_business_account,
                                })),
                            });
                            pages = pages.concat(businessPages);
                        }
                        catch (error) {
                            this.logger.warn(`Failed to fetch pages for business ${business.id}:`, {
                                error: error.message,
                            });
                        }
                    }
                }
                catch (error) {
                    this.logger.warn('Failed to fetch business accounts:', {
                        error: error.message,
                    });
                }
            }
            const profiles = await Promise.all(pages.map(async (page) => {
                if (!page.instagram_business_account?.id) {
                    return null;
                }
                try {
                    const profileResponse = await axios_1.default.get(`${this.graphBaseUrl}/${page.instagram_business_account.id}`, {
                        params: {
                            fields: 'username,profile_picture_url',
                            access_token: page.access_token || userAccessToken,
                        },
                    });
                    return {
                        id: page.instagram_business_account.id,
                        username: profileResponse.data.username,
                        profileImage: profileResponse.data.profile_picture_url || '',
                        pageId: page.id,
                        pageName: page.name,
                    };
                }
                catch (error) {
                    this.logger.warn(`Failed to fetch Instagram profile for page ${page.id}:`, {
                        message: error.message,
                        stack: error.stack,
                    });
                    return null;
                }
            }));
            const validProfiles = profiles.filter((profile) => profile !== null);
            return validProfiles;
        }
        catch (error) {
            this.logger.error('Error fetching Instagram profiles:', {
                message: error.message,
                stack: error.stack,
            });
            throw new Error(`Failed to fetch Instagram business profiles: ${error.message}`);
        }
    }
    async getPageAccessToken(userAccessToken, pageId) {
        try {
            const res = await axios_1.default.get(`${this.graphBaseUrl}/${pageId}`, {
                params: {
                    fields: 'access_token',
                    access_token: userAccessToken,
                },
            });
            return res.data.access_token;
        }
        catch (error) {
            this.logger.error(`Error fetching Instagram page access token for ${pageId}:`, {
                message: error.message,
                stack: error.stack,
            });
            throw new Error(`Failed to fetch Instagram page access token: ${error.message}`);
        }
    }
    buildCaption(post) {
        const message = post?.body || '';
        if (!post?.tags || post.tags.length === 0) {
            return message;
        }
        const hashtags = post.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`);
        return `${message}\n\n${hashtags.join(' ')}`.trim();
    }
    async getInstagramPermalink(mediaId, accessToken) {
        try {
            const response = await axios_1.default.get(`${this.graphBaseUrl}/${mediaId}`, {
                params: {
                    fields: 'permalink',
                    access_token: accessToken,
                },
            });
            return response.data.permalink || undefined;
        }
        catch (error) {
            this.logger.warn('Failed to fetch Instagram permalink:', {
                mediaId,
                message: error.message,
                stack: error.stack,
            });
            return undefined;
        }
    }
    async setAccessToken(account, code) {
        try {
            const exchangeResponse = await this.exchangeFacebookToken(code);
            const profiles = await this.fetchInstagramProfiles(exchangeResponse.accessToken);
            const expiresAt = typeof exchangeResponse.expiresIn === 'number' &&
                Number.isFinite(exchangeResponse.expiresIn)
                ? new Date(Date.now() + exchangeResponse.expiresIn * 1000).toISOString()
                : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
            const tokenData = {
                provider: model_enums_1.SocialMediaProvider.INSTAGRAM,
                accessToken: exchangeResponse.accessToken,
                expiresAt,
                profiles,
                updatedAt: new Date(),
            };
            await this.updateSocialMediaTokens(account.id, tokenData);
            return {
                message: `${model_enums_1.SocialMediaProvider.INSTAGRAM} OAuth callback successful`,
                provider: model_enums_1.SocialMediaProvider.INSTAGRAM,
                profiles,
            };
        }
        catch (error) {
            this.logger.error('Error setting Instagram access token:', {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async checkConnectionStatus(account) {
        try {
            const tokenData = this.getInstagramTokens(account);
            if (!tokenData?.accessToken) {
                return false;
            }
            if (!tokenData.selectedProfileId || !tokenData.selectedPageId) {
                return false;
            }
            if (tokenData.expiresAt) {
                const expiresAt = new Date(tokenData.expiresAt);
                if (Date.now() >= expiresAt.getTime()) {
                    this.logger.warn(`Instagram access token expired for account ${account.id}`);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error checking Instagram connection status:', {
                message: error.message,
                stack: error.stack,
            });
            return false;
        }
    }
    async logout(account) {
        try {
            const existingTokens = await this.getExistingTokens(account.id);
            if (existingTokens[model_enums_1.SocialMediaProvider.INSTAGRAM]) {
                const { [model_enums_1.SocialMediaProvider.INSTAGRAM]: removed, ...updatedTokens } = existingTokens;
                await this.prisma.accountSettings.update({
                    where: { accountId: account.id },
                    data: {
                        socialMediaProviderTokens: updatedTokens,
                    },
                });
                this.logger.log(`Successfully logged out from Instagram for account ${account.id}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error logging out from Instagram:', {
                message: error.message,
                stack: error.stack,
                accountId: account.id,
            });
            throw error;
        }
    }
    async selectPage(account, profileId) {
        try {
            const tokenData = this.getInstagramTokens(account);
            if (!tokenData) {
                throw new Error('No Instagram tokens found for this account');
            }
            const selectedProfile = tokenData.profiles.find((profile) => profile.id === profileId);
            if (!selectedProfile) {
                throw new Error('Selected Instagram profile not found');
            }
            const updatedTokenData = {
                ...tokenData,
                selectedProfileId: selectedProfile.id,
                selectedPageId: selectedProfile.pageId,
                updatedAt: new Date(),
            };
            await this.updateSocialMediaTokens(account.id, updatedTokenData);
            return {
                message: `Successfully selected Instagram profile: ${selectedProfile.username}`,
                provider: model_enums_1.SocialMediaProvider.INSTAGRAM,
            };
        }
        catch (error) {
            this.logger.error('Error selecting Instagram profile:', {
                message: error.message,
                stack: error.stack,
                accountId: account.id,
            });
            throw error;
        }
    }
    async getSelectedPage(account) {
        try {
            const tokenData = this.getInstagramTokens(account);
            if (!tokenData?.selectedProfileId) {
                return null;
            }
            const selectedProfile = tokenData.profiles.find((profile) => profile.id === tokenData.selectedProfileId);
            if (!selectedProfile) {
                return null;
            }
            return {
                id: selectedProfile.id,
                name: selectedProfile.username,
                profileImage: selectedProfile.profileImage,
            };
        }
        catch (error) {
            this.logger.error('Error getting selected Instagram profile:', {
                message: error.message,
                stack: error.stack,
                accountId: account.id,
            });
            return null;
        }
    }
    async publish(account, postId) {
        this.logger.log('Starting Instagram post publication');
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                throw new Error(`Post with ID ${postId} not found`);
            }
            if (post.accountId !== account.id) {
                throw new Error('Post does not belong to this account');
            }
            if (post.socialMediaProvider !== model_enums_1.SocialMediaProvider.INSTAGRAM) {
                throw new Error(`Post ${postId} is not configured for Instagram provider`);
            }
            const tokenData = this.getInstagramTokens(account);
            if (!tokenData?.accessToken ||
                !tokenData.selectedProfileId ||
                !tokenData.selectedPageId) {
                throw new Error('Instagram account is not connected or configured');
            }
            const imageUrls = Array.isArray(post?.imagesUrl) ? post?.imagesUrl : [];
            const imageUrl = imageUrls[imageUrls.length - 1];
            if (!imageUrl) {
                throw new Error('Instagram publishing requires at least one image. Please add an image to the post.');
            }
            const pageAccessToken = await this.getPageAccessToken(tokenData.accessToken, tokenData.selectedPageId);
            const caption = this.buildCaption(post);
            const creationResponse = await axios_1.default.post(`${this.graphBaseUrl}/${tokenData.selectedProfileId}/media`, null, {
                params: {
                    image_url: imageUrl,
                    caption,
                    access_token: pageAccessToken,
                },
            });
            const creationId = creationResponse.data?.id;
            if (!creationId) {
                throw new Error('Failed to create Instagram media container');
            }
            const publishResponse = await axios_1.default.post(`${this.graphBaseUrl}/${tokenData.selectedProfileId}/media_publish`, null, {
                params: {
                    creation_id: creationId,
                    access_token: pageAccessToken,
                },
            });
            const instagramPostId = publishResponse.data?.id || creationId;
            const publishedUrl = await this.getInstagramPermalink(instagramPostId, pageAccessToken);
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    postIdInSocialMediaProvider: instagramPostId,
                    publishedAt: new Date(),
                    state: model_enums_1.PostState.POSTED,
                    ...(publishedUrl && { publishedUrl }),
                },
            });
            if (publishedUrl) {
                try {
                    await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId, publishedUrl);
                    this.logger.log('Successfully tracked published Instagram post:', {
                        postId,
                        publishedUrl,
                        recommendationId: post.recommendationId || 'dummy',
                    });
                }
                catch (trackingError) {
                    this.logger.error('Failed to track published Instagram post:', {
                        postId,
                        publishedUrl,
                        message: trackingError.message,
                        stack: trackingError.stack,
                    });
                }
            }
            if (publishedUrl) {
                try {
                    this.logger.log('Ingesting published post into Victor', {
                        postId,
                        publishedUrl,
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
            this.logger.log('Instagram post publication completed successfully', {
                accountId: account.id,
                postId,
                instagramPostId,
                publishedUrl,
            });
            return true;
        }
        catch (error) {
            this.logger.error('Error publishing Instagram post:', {
                message: error.response?.data || error.message,
                stack: error.stack,
                accountId: account.id,
                postId,
            });
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    state: model_enums_1.PostState.FAILED,
                },
            });
            throw error;
        }
    }
};
exports.InstagramConnectionServices = InstagramConnectionServices;
exports.InstagramConnectionServices = InstagramConnectionServices = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger,
        config_1.ConfigService,
        tracked_insights_1.TrackedRecommendationsService])
], InstagramConnectionServices);
//# sourceMappingURL=instagram.service.js.map