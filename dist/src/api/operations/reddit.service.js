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
exports.RedditConnectionService = void 0;
const common_1 = require("@nestjs/common");
const model_enums_1 = require("../../model.enums");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const tracked_insights_1 = require("./tracked-insights");
const axios_1 = __importDefault(require("axios"));
const config_service_1 = require("../../config/config.service");
const errors_1 = require("../../constants/errors");
const app_error_exception_1 = require("../../exceptions/app-error.exception");
const app_error_exception_2 = require("../../exceptions/app-error.exception");
let RedditConnectionService = class RedditConnectionService {
    constructor(prisma, logger, configService, trackedRecommendationsService) {
        this.prisma = prisma;
        this.logger = logger;
        this.configService = configService;
        this.trackedRecommendationsService = trackedRecommendationsService;
    }
    async updateSocialMediaTokens(accountId, provider, tokenData) {
        const existingTokens = await this.getExistingTokens(accountId);
        const updatedTokens = { ...existingTokens, [provider]: tokenData };
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
        return account?.accountSettings?.socialMediaProviderTokens || {};
    }
    getRedditTokens(account) {
        const allTokens = account.accountSettings?.socialMediaProviderTokens;
        return allTokens?.[model_enums_1.SocialMediaProvider.REDDIT];
    }
    constructRedditUrl(subreddit, postId) {
        return `https://www.reddit.com/r/${subreddit}/comments/${postId}/`;
    }
    async updatePostAfterPublishing(postId, redditPostId, publishedUrl) {
        await this.prisma.post.update({
            where: { id: postId },
            data: {
                postIdInSocialMediaProvider: redditPostId,
                publishedAt: new Date(),
                state: 'POSTED',
                ...(publishedUrl && { publishedUrl }),
            },
        });
    }
    async exchangeRedditToken(code) {
        try {
            const clientId = this.configService.get('REDDIT_CLIENT_ID');
            const clientSecret = this.configService.get('REDDIT_CLIENT_SECRET');
            const siteUrl = this.configService.get('SITE_URL');
            const redirectUri = `${siteUrl}/igeo-agents`;
            if (!clientId || !clientSecret || !siteUrl) {
                throw new app_error_exception_2.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_CONFIGURATION_NOT_SET);
            }
            const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const response = await axios_1.default.post('https://www.reddit.com/api/v1/access_token', new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            }), {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                },
            });
            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in,
                tokenType: response.data.token_type,
                scope: response.data.scope,
            };
        }
        catch (error) {
            this.logger.error('Error exchanging Reddit token:', {
                message: error.message,
                stack: error.stack,
            });
            throw new app_error_exception_2.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async refreshRedditToken(refreshToken) {
        try {
            const clientId = this.configService.get('REDDIT_CLIENT_ID');
            const clientSecret = this.configService.get('REDDIT_CLIENT_SECRET');
            if (!clientId || !clientSecret) {
                throw new app_error_exception_2.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_CONFIGURATION_NOT_SET, common_1.HttpStatus.BAD_REQUEST);
            }
            const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const response = await axios_1.default.post('https://www.reddit.com/api/v1/access_token', new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }), {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                },
            });
            return {
                accessToken: response.data.access_token,
                expiresIn: response.data.expires_in,
            };
        }
        catch (error) {
            this.logger.error('Error refreshing Reddit token:', {
                message: error.message,
                stack: error.stack,
            });
            throw new app_error_exception_2.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRedditUserInfo(accessToken) {
        try {
            const response = await axios_1.default.get('https://oauth.reddit.com/api/v1/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                },
            });
            return {
                id: response.data.id,
                name: response.data.name,
                profileImage: response.data.icon_img || '',
            };
        }
        catch (error) {
            this.logger.error('Error getting Reddit user info:', {
                message: error.message,
                stack: error.stack,
            });
            throw new app_error_exception_2.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async setAccessToken(account, code) {
        try {
            const redditResponse = await this.exchangeRedditToken(code);
            const userInfo = await this.getRedditUserInfo(redditResponse.accessToken);
            const subreddits = await this.fetchRedditSubreddits(redditResponse.accessToken);
            if (!subreddits || subreddits.length === 0) {
                this.logger.warn('No Reddit subreddits found for user', {
                    accountId: account.id,
                    userId: userInfo.id,
                });
                const tokenData = {
                    provider: model_enums_1.SocialMediaProvider.REDDIT,
                    accessToken: redditResponse.accessToken,
                    refreshToken: redditResponse.refreshToken,
                    expiresIn: redditResponse.expiresIn,
                    tokenType: redditResponse.tokenType,
                    scope: redditResponse.scope,
                    subreddits: [],
                    updatedAt: new Date(),
                };
                await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.REDDIT, tokenData);
                return {
                    message: `${model_enums_1.SocialMediaProvider.REDDIT} OAuth callback successful, but no subreddits found`,
                    provider: model_enums_1.SocialMediaProvider.REDDIT,
                    user: userInfo,
                    subreddits: [],
                };
            }
            const tokenData = {
                provider: model_enums_1.SocialMediaProvider.REDDIT,
                accessToken: redditResponse.accessToken,
                refreshToken: redditResponse.refreshToken,
                expiresIn: redditResponse.expiresIn,
                tokenType: redditResponse.tokenType,
                scope: redditResponse.scope,
                subreddits: subreddits,
                updatedAt: new Date(),
            };
            await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.REDDIT, tokenData);
            return {
                message: `${model_enums_1.SocialMediaProvider.REDDIT} OAuth callback successful`,
                provider: model_enums_1.SocialMediaProvider.REDDIT,
                user: userInfo,
                subreddits: subreddits,
            };
        }
        catch (error) {
            this.logger.error(`Error setting Reddit access token:`, {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async checkConnectionStatus(account) {
        try {
            const tokenData = this.getRedditTokens(account);
            if (!tokenData) {
                return false;
            }
            const { accessToken, expiresIn, selectedSubreddit } = tokenData;
            if (!accessToken) {
                this.logger.warn(`No Reddit access token found for account:`, {
                    accountId: account.id,
                });
                return false;
            }
            if (!selectedSubreddit) {
                this.logger.warn(`No Reddit subreddit selected for account:`, {
                    accountId: account.id,
                });
                return false;
            }
            const now = new Date();
            const updatedAt = tokenData.updatedAt instanceof Date
                ? tokenData.updatedAt
                : new Date(tokenData.updatedAt);
            const expiresInSeconds = expiresIn || 3600;
            const tokenExpiry = new Date(updatedAt.getTime() + expiresInSeconds * 1000);
            const bufferTime = 5 * 60 * 1000;
            if (tokenExpiry.getTime() - now.getTime() < bufferTime) {
                this.logger.warn(`Reddit access token is expired or expiring soon for account:`, {
                    accountId: account.id,
                    expiresAt: tokenExpiry,
                    now,
                });
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error checking Reddit connection status:`, {
                message: error.message,
                stack: error.stack,
            });
            return false;
        }
    }
    async logout(account) {
        try {
            const existingTokens = await this.getExistingTokens(account.id);
            if (existingTokens[model_enums_1.SocialMediaProvider.REDDIT]) {
                const { [model_enums_1.SocialMediaProvider.REDDIT]: removed, ...updatedTokens } = existingTokens;
                await this.prisma.accountSettings.update({
                    where: { accountId: account.id },
                    data: {
                        socialMediaProviderTokens: updatedTokens,
                    },
                });
                this.logger.log(`Successfully logged out from Reddit for account ${account.id}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error logging out from Reddit:`, {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async fetchRedditSubreddits(accessToken) {
        try {
            const response = await axios_1.default.get('https://oauth.reddit.com/subreddits/mine/subscriber?limit=100', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                },
            });
            const subreddits = response.data.data.children.map((subreddit) => ({
                id: subreddit.data.display_name,
                name: subreddit.data.display_name,
                description: subreddit.data.public_description || subreddit.data.description || '',
                displayName: subreddit.data.display_name,
                icon: subreddit.data.icon_img || subreddit.data.community_icon || '',
            }));
            return subreddits;
        }
        catch (error) {
            this.logger.error('Error fetching Reddit subreddits:', {
                message: error.message,
                stack: error.stack,
            });
            return [];
        }
    }
    async getRedditSubreddits(account) {
        try {
            const tokenData = this.getRedditTokens(account);
            if (!tokenData?.accessToken) {
                this.logger.error('No Reddit access token found', {
                    accountId: account.id,
                });
                throw new app_error_exception_2.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            let accessToken = tokenData.accessToken;
            const now = new Date();
            const expiresInSeconds = tokenData.expiresIn || 3600;
            const tokenExpiry = new Date(new Date(tokenData.updatedAt).getTime() + expiresInSeconds * 1000);
            const bufferTime = 5 * 60 * 1000;
            if (tokenExpiry.getTime() - now.getTime() < bufferTime) {
                this.logger.log('Refreshing Reddit access token');
                const refreshResponse = await this.refreshRedditToken(tokenData.refreshToken);
                const updatedTokenData = {
                    ...tokenData,
                    accessToken: refreshResponse.accessToken,
                    expiresIn: refreshResponse.expiresIn,
                    updatedAt: new Date(),
                };
                await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.REDDIT, updatedTokenData);
                accessToken = refreshResponse.accessToken;
            }
            const subreddits = await this.fetchRedditSubreddits(accessToken);
            const updatedTokenData = {
                ...tokenData,
                subreddits,
                updatedAt: new Date(),
            };
            await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.REDDIT, updatedTokenData);
            return subreddits;
        }
        catch (error) {
            this.logger.error('Error getting Reddit subreddits:', {
                message: error.message,
                stack: error.stack,
                accountId: account.id,
            });
            throw error;
        }
    }
    async selectPage(account, subredditName) {
        try {
            const tokenData = this.getRedditTokens(account);
            if (!tokenData) {
                this.logger.error('No Reddit tokens found for this account', {
                    accountId: account.id,
                });
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_TOKEN_NOT_FOUND);
            }
            const isProfileSelection = subredditName.startsWith('u_');
            let subreddit = null;
            if (!isProfileSelection) {
                subreddit = tokenData.subreddits?.find((sub) => sub.name === subredditName);
                if (!subreddit) {
                    this.logger.error('Subreddit not found in user subscriptions', {
                        accountId: account.id,
                        subredditName,
                    });
                    throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SUBREDDIT_NOT_FOUND);
                }
            }
            const updatedTokenData = {
                ...tokenData,
                selectedSubreddit: subredditName,
                updatedAt: new Date(),
            };
            await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.REDDIT, updatedTokenData);
            this.logger.log('Successfully selected Reddit target:', {
                accountId: account.id,
                subredditName,
            });
            return {
                message: isProfileSelection
                    ? `Successfully selected profile: ${subredditName}`
                    : `Successfully selected subreddit: ${subreddit.displayName}`,
                provider: model_enums_1.SocialMediaProvider.REDDIT,
            };
        }
        catch (error) {
            this.logger.error('Error selecting Reddit subreddit:', {
                message: error.message,
                stack: error.stack,
                accountId: account.id,
                subredditName,
            });
            throw error;
        }
    }
    async getSelectedPage(account) {
        try {
            const tokenData = this.getRedditTokens(account);
            if (!tokenData?.selectedSubreddit) {
                return null;
            }
            const isProfileSelection = tokenData.selectedSubreddit.startsWith('u_');
            const selectedSubreddit = isProfileSelection
                ? null
                : tokenData.subreddits?.find((sub) => sub.name === tokenData.selectedSubreddit);
            if (!isProfileSelection && !selectedSubreddit) {
                return null;
            }
            if (!isProfileSelection &&
                !tokenData.profileImage &&
                selectedSubreddit.icon) {
                await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.REDDIT, {
                    ...tokenData,
                    profileImage: selectedSubreddit.icon,
                });
            }
            if (isProfileSelection) {
                return {
                    id: tokenData.selectedSubreddit,
                    name: tokenData.selectedSubreddit,
                    profileImage: tokenData.profileImage || '',
                    selectedSubreddit: tokenData.selectedSubreddit,
                    subreddits: tokenData.subreddits || [],
                };
            }
            else {
                return {
                    id: selectedSubreddit.name,
                    name: selectedSubreddit.displayName,
                    profileImage: tokenData.profileImage || selectedSubreddit.icon,
                    selectedSubreddit: tokenData.selectedSubreddit,
                    subreddits: tokenData.subreddits || [],
                };
            }
        }
        catch (error) {
            this.logger.error('Error getting selected Reddit subreddit:', {
                message: error.message,
                stack: error.stack,
                accountId: account.id,
            });
            return null;
        }
    }
    async publish(account, postId) {
        this.logger.log('Starting Reddit post publication');
        let postData = {};
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                this.logger.error('Post not found', {
                    postId,
                    accountId: account.id,
                });
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.POST_NOT_FOUND);
            }
            if (post.accountId !== account.id) {
                this.logger.error('Post does not belong to this account', {
                    postId,
                    accountId: account.id,
                });
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.INSUFFICIENT_PERMISSIONS);
            }
            const tokenData = this.getRedditTokens(account);
            if (!tokenData?.accessToken) {
                this.logger.error('No Reddit access token found', {
                    postId,
                    accountId: account.id,
                });
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_TOKEN_NOT_FOUND);
            }
            let accessToken = tokenData.accessToken;
            const now = new Date();
            const expiresInSeconds = tokenData.expiresIn;
            const tokenExpiry = new Date(new Date(tokenData.updatedAt).getTime() + expiresInSeconds * 1000);
            const bufferTime = 5 * 60 * 1000;
            if (tokenExpiry.getTime() - now.getTime() < bufferTime) {
                this.logger.log('Refreshing Reddit access token');
                const refreshResponse = await this.refreshRedditToken(tokenData.refreshToken);
                const updatedTokenData = {
                    ...tokenData,
                    accessToken: refreshResponse.accessToken,
                    expiresIn: refreshResponse.expiresIn,
                    updatedAt: new Date(),
                };
                await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.REDDIT, updatedTokenData);
                accessToken = refreshResponse.accessToken;
            }
            let title = post.title || '';
            let text = post.body || '';
            if (post?.tags && post?.tags?.length > 0) {
                const hashtags = post.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`);
                text += `\n\n${hashtags.join(' ')}`;
            }
            const selectedSubreddit = tokenData.selectedSubreddit;
            const subreddit = selectedSubreddit;
            if (!selectedSubreddit) {
                this.logger.warn('No subreddit selected, using default subreddit', {
                    postId,
                    accountId: account.id,
                    defaultSubreddit: subreddit,
                });
            }
            let flairId = null;
            if (subreddit && !subreddit.startsWith('u_')) {
                try {
                    this.logger.log('Fetching flairs for subreddit:', {
                        subreddit,
                        postId,
                        accountId: account.id,
                    });
                    const flairResponse = await axios_1.default.get(`https://oauth.reddit.com/r/${subreddit}/api/link_flair`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                        },
                    });
                    this.logger.log('Flair API response:', {
                        subreddit,
                        status: flairResponse.status,
                        data: flairResponse.data,
                        postId,
                        accountId: account.id,
                    });
                    const flairs = Array.isArray(flairResponse.data)
                        ? flairResponse.data
                        : flairResponse.data?.choices || [];
                    if (flairs.length > 0) {
                        flairId = flairs[0].id || flairs[0].flair_template_id || null;
                        this.logger.log('Using default flair for subreddit:', {
                            subreddit,
                            flairId,
                            flairText: flairs[0].text || flairs[0].flair_text,
                            totalFlairs: flairs.length,
                        });
                    }
                    else {
                        this.logger.warn('No flairs available for subreddit:', {
                            subreddit,
                            responseData: flairResponse.data,
                        });
                    }
                }
                catch (flairError) {
                    this.logger.error('Could not fetch flairs for subreddit:', {
                        subreddit,
                        error: flairError.message,
                        status: flairError.response?.status,
                        statusText: flairError.response?.statusText,
                        responseData: flairError.response?.data,
                        postId,
                        accountId: account.id,
                    });
                    if (subreddit === 'react') {
                        const reactFlairIds = [
                            '94e0c0d4-1f9e-11e2-892e-12313d0b60e8',
                            '94e0c0d6-1f9e-11e2-892e-12313d0b60e8',
                            '94e0c0d8-1f9e-11e2-892e-12313d0b60e8',
                        ];
                        for (const testFlairId of reactFlairIds) {
                            try {
                                const testResponse = await axios_1.default.post('https://oauth.reddit.com/api/submit', new URLSearchParams({
                                    sr: subreddit,
                                    kind: 'self',
                                    title: 'Test flair validation',
                                    text: 'Test',
                                    api_type: 'json',
                                    flair_id: testFlairId,
                                }), {
                                    headers: {
                                        Authorization: `Bearer ${accessToken}`,
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                                    },
                                });
                                if (!testResponse.data.json?.errors?.some((error) => error[0] === 'SUBMIT_VALIDATION_FLAIR_REQUIRED')) {
                                    flairId = testFlairId;
                                    this.logger.log('Found valid flair ID for r/react:', {
                                        subreddit,
                                        flairId: testFlairId,
                                        postId,
                                        accountId: account.id,
                                    });
                                    break;
                                }
                            }
                            catch (testError) {
                                continue;
                            }
                        }
                    }
                }
            }
            postData = {
                sr: subreddit,
                kind: 'self',
                title: title,
                text: text,
                api_type: 'json',
            };
            if (flairId) {
                postData.flair_id = flairId;
            }
            const response = await axios_1.default.post('https://oauth.reddit.com/api/submit', new URLSearchParams(postData), {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                },
            });
            this.logger.log('Reddit API response:', {
                status: response.status,
                data: response.data,
                postId,
                accountId: account.id,
            });
            if (response.data.json?.errors?.length > 0) {
                const errors = response.data.json.errors;
                const isFlairError = errors.some((error) => error[0] === 'SUBMIT_VALIDATION_FLAIR_REQUIRED');
                this.logger.log('Reddit API errors detected:', {
                    errors,
                    isFlairError,
                    flairId,
                    postId,
                    accountId: account.id,
                });
                if (isFlairError) {
                    this.logger.warn('Flair error detected, retrying without flair:', {
                        subreddit,
                        originalFlairId: flairId,
                        postId,
                        accountId: account.id,
                    });
                    const retryPostData = {
                        sr: subreddit,
                        kind: 'self',
                        title: title,
                        text: text,
                        api_type: 'json',
                    };
                    const retryResponse = await axios_1.default.post('https://oauth.reddit.com/api/submit', new URLSearchParams(retryPostData), {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                        },
                    });
                    if (retryResponse.data.json?.errors?.length > 0) {
                        const retryErrors = retryResponse.data.json.errors;
                        const isRetryFlairError = retryErrors.some((error) => error[0] === 'SUBMIT_VALIDATION_FLAIR_REQUIRED');
                        if (isRetryFlairError) {
                            this.logger.warn('Subreddit requires flair but none available, posting to profile instead:', {
                                subreddit,
                                postId,
                                accountId: account.id,
                            });
                            const userInfo = await this.getRedditUserInfo(accessToken);
                            const profileSubreddit = `u_${userInfo.name}`;
                            const profilePostData = {
                                sr: profileSubreddit,
                                kind: 'self',
                                title: title,
                                text: text,
                                api_type: 'json',
                            };
                            const profileResponse = await axios_1.default.post('https://oauth.reddit.com/api/submit', new URLSearchParams(profilePostData), {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'User-Agent': this.configService.get('REDDIT_USER_AGENT'),
                                },
                            });
                            if (profileResponse.data.json?.errors?.length > 0) {
                                this.logger.error('Reddit API error posting to profile:', {
                                    error: profileResponse.data.json.errors,
                                    fullResponse: profileResponse.data,
                                    postId,
                                    accountId: account.id,
                                });
                                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR);
                            }
                            const redditPostId = profileResponse.data.json?.data?.id;
                            if (!redditPostId) {
                                this.logger.error('No Reddit post ID returned from profile post:', {
                                    fullResponse: profileResponse.data,
                                    postId,
                                    accountId: account.id,
                                });
                                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR);
                            }
                            const publishedUrl = this.constructRedditUrl(profileSubreddit, redditPostId);
                            await this.updatePostAfterPublishing(postId, redditPostId, publishedUrl);
                            if (publishedUrl) {
                                try {
                                    await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId, publishedUrl);
                                    this.logger.log('Successfully tracked published Reddit post:', {
                                        postId,
                                        publishedUrl,
                                        recommendationId: post.recommendationId || 'dummy',
                                    });
                                }
                                catch (trackingError) {
                                    this.logger.error('Failed to track published Reddit post:', {
                                        postId,
                                        publishedUrl,
                                        message: trackingError.message,
                                        stack: trackingError.stack,
                                    });
                                }
                            }
                            this.logger.log('Successfully published Reddit post to profile:', {
                                postId,
                                redditPostId,
                                profileSubreddit,
                                originalSubreddit: subreddit,
                                publishedUrl,
                            });
                            return true;
                        }
                        this.logger.error('Reddit API error after retry:', {
                            error: retryResponse.data.json.errors,
                            fullResponse: retryResponse.data,
                            postId,
                            accountId: account.id,
                        });
                        throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR);
                    }
                    const redditPostId = retryResponse.data.json?.data?.id;
                    if (!redditPostId) {
                        this.logger.error('No Reddit post ID returned after retry:', {
                            fullResponse: retryResponse.data,
                            postId,
                            accountId: account.id,
                        });
                        throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR);
                    }
                    const publishedUrl = this.constructRedditUrl(subreddit, redditPostId);
                    await this.updatePostAfterPublishing(postId, redditPostId, publishedUrl);
                    if (publishedUrl) {
                        try {
                            await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId, publishedUrl);
                            this.logger.log('Successfully tracked published Reddit post:', {
                                postId,
                                publishedUrl,
                                recommendationId: post.recommendationId || 'dummy',
                            });
                        }
                        catch (trackingError) {
                            this.logger.error('Failed to track published Reddit post:', {
                                postId,
                                publishedUrl,
                                message: trackingError.message,
                                stack: trackingError.stack,
                            });
                        }
                    }
                    this.logger.log('Successfully published Reddit post (retry without flair):', {
                        postId,
                        redditPostId,
                        subreddit,
                        publishedUrl,
                    });
                    return true;
                }
                this.logger.error('Reddit API error:', {
                    error: errors,
                    fullResponse: response.data,
                    postId,
                    accountId: account.id,
                });
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR);
            }
            const redditPostId = response.data.json?.data?.id;
            if (!redditPostId) {
                this.logger.error('No Reddit post ID returned:', {
                    fullResponse: response.data,
                    postId,
                    accountId: account.id,
                });
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR);
            }
            const publishedUrl = this.constructRedditUrl(subreddit, redditPostId);
            await this.updatePostAfterPublishing(postId, redditPostId, publishedUrl);
            if (publishedUrl) {
                try {
                    await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId, publishedUrl);
                    this.logger.log('Successfully tracked published Reddit post:', {
                        postId,
                        publishedUrl,
                        recommendationId: post.recommendationId || 'dummy',
                    });
                }
                catch (trackingError) {
                    this.logger.error('Failed to track published Reddit post:', {
                        postId,
                        publishedUrl,
                        message: trackingError.message,
                        stack: trackingError.stack,
                    });
                }
            }
            this.logger.log('Successfully published Reddit post:', {
                postId,
                redditPostId,
                subreddit,
                publishedUrl,
            });
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
            this.logger.log('Reddit post publication completed successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Error publishing Reddit post:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                stack: error.stack,
                postId,
                accountId: account.id,
                postData: {
                    sr: postData.sr,
                    kind: postData.kind,
                    title: postData.title,
                    textLength: postData.text?.length || 0,
                },
            });
            if (error.response) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REDDIT_SERVICE_ERROR);
            }
            throw error;
        }
    }
};
exports.RedditConnectionService = RedditConnectionService;
exports.RedditConnectionService = RedditConnectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger,
        config_service_1.ConfigService,
        tracked_insights_1.TrackedRecommendationsService])
], RedditConnectionService);
//# sourceMappingURL=reddit.service.js.map