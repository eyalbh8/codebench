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
exports.SocialMediaConnectionRouterService = void 0;
const common_1 = require("@nestjs/common");
const model_enums_1 = require("../../model.enums");
const facebook_service_1 = require("./facebook.service");
const x_service_1 = require("./x.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const reddit_service_1 = require("./reddit.service");
const pinterest_service_1 = require("./pinterest.service");
const blog_service_1 = require("./blog.service");
const instagram_service_1 = require("./instagram.service");
const linkedin_service_1 = require("./linkedin.service");
let SocialMediaConnectionRouterService = class SocialMediaConnectionRouterService {
    constructor(facebookConnectionService, linkedInConnectionService, xConnectionService, instagramConnectionService, redditConnectionService, pinterestConnectionService, blogConnectionService, logger) {
        this.facebookConnectionService = facebookConnectionService;
        this.linkedInConnectionService = linkedInConnectionService;
        this.xConnectionService = xConnectionService;
        this.instagramConnectionService = instagramConnectionService;
        this.redditConnectionService = redditConnectionService;
        this.pinterestConnectionService = pinterestConnectionService;
        this.blogConnectionService = blogConnectionService;
        this.logger = logger;
    }
    buildResultSummary(provider, result) {
        const summary = {
            provider,
            message: result?.message,
        };
        if (provider === model_enums_1.SocialMediaProvider.FACEBOOK && result?.pages) {
            summary.pages = result.pages.map((page) => ({
                id: page.id,
                name: page.name,
            }));
            summary.pageCount = result.pages.length;
        }
        if (provider === model_enums_1.SocialMediaProvider.INSTAGRAM && result?.profiles) {
            summary.profileCount = result.profiles.length;
            summary.profiles = result.profiles.map((profile) => ({
                id: profile.id,
                name: profile.username || profile.name,
            }));
        }
        if (provider === model_enums_1.SocialMediaProvider.PINTEREST && result?.boards) {
            summary.boardCount = result.boards.length;
            summary.boards = result.boards.map((board) => ({
                id: board.id,
                name: board.name,
            }));
        }
        if (provider === model_enums_1.SocialMediaProvider.REDDIT) {
            if (result?.user) {
                summary.user = {
                    id: result.user.id,
                    name: result.user.name,
                };
            }
            if (result?.subreddits) {
                summary.subredditCount = result.subreddits.length;
                summary.subreddits = result.subreddits.map((subreddit) => ({
                    id: subreddit.id,
                    name: subreddit.name,
                }));
            }
        }
        if ((provider === model_enums_1.SocialMediaProvider.BLOG ||
            provider === model_enums_1.SocialMediaProvider.LISTICLE) &&
            result?.siteUrl) {
            summary.siteUrl = result.siteUrl;
        }
        if (provider === model_enums_1.SocialMediaProvider.X && result?.username) {
            summary.username = result.username;
        }
        if (provider === model_enums_1.SocialMediaProvider.GSC && result?.sites) {
            summary.siteCount = result.sites.length;
            summary.sites = result.sites.map((site) => ({
                id: site.siteUrl,
                name: site.siteUrl,
            }));
        }
        if (provider === model_enums_1.SocialMediaProvider.LINKEDIN && result?.organizations) {
            summary.organizationCount = result.organizations.length;
            summary.organizations = result.organizations.map((org) => ({
                id: org.id,
                name: org.name,
            }));
        }
        return summary;
    }
    getServiceForProvider(provider) {
        switch (provider) {
            case model_enums_1.SocialMediaProvider.FACEBOOK:
                return this.facebookConnectionService;
            case model_enums_1.SocialMediaProvider.LINKEDIN:
                return this.linkedInConnectionService;
            case model_enums_1.SocialMediaProvider.INSTAGRAM:
                return this.instagramConnectionService;
            case model_enums_1.SocialMediaProvider.X:
                return this.xConnectionService;
            case model_enums_1.SocialMediaProvider.REDDIT:
                return this.redditConnectionService;
            case model_enums_1.SocialMediaProvider.PINTEREST:
                return this.pinterestConnectionService;
            case model_enums_1.SocialMediaProvider.LISTICLE:
            case model_enums_1.SocialMediaProvider.BLOG:
                return this.blogConnectionService;
            default:
                this.logger.error(`Unsupported social media provider: ${provider}`);
                throw new Error(`Unsupported social media provider: ${provider}`);
        }
    }
    async setAccessToken(account, provider, code, codeVerifier) {
        try {
            const service = this.getServiceForProvider(provider);
            this.logger.log('Starting social media token exchange', {
                provider,
                accountId: account.id,
            });
            if (provider === model_enums_1.SocialMediaProvider.X) {
                const result = await service.setAccessToken(account, code, codeVerifier);
                this.logger.log('Completed social media token exchange', {
                    accountId: account.id,
                    ...this.buildResultSummary(provider, result),
                });
                return result;
            }
            const result = await service.setAccessToken(account, code);
            this.logger.log('Completed social media token exchange', {
                accountId: account.id,
                ...this.buildResultSummary(provider, result),
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error setting access token for ${provider}: ${error.message}`, {
                accountId: account.id,
                provider,
            });
            throw error;
        }
    }
    async checkConnectionStatus(account, provider) {
        try {
            const service = this.getServiceForProvider(provider);
            return await service.checkConnectionStatus(account);
        }
        catch (error) {
            this.logger.error(`Error checking connection status for ${provider}:`, error);
            return false;
        }
    }
    async logout(account, provider) {
        try {
            const service = this.getServiceForProvider(provider);
            return await service.logout(account);
        }
        catch (error) {
            this.logger.error(`Error logging out from ${provider}: ${error.message}`);
            throw error;
        }
    }
    async publish(account, postId, provider) {
        try {
            const service = this.getServiceForProvider(provider);
            return await service.publish(account, postId);
        }
        catch (error) {
            this.logger.error(`Error publishing post ${postId} to ${provider}:`, {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            throw error;
        }
    }
    async selectPage(account, provider, pageId) {
        try {
            const service = this.getServiceForProvider(provider);
            if (provider === model_enums_1.SocialMediaProvider.FACEBOOK &&
                'selectPage' in service) {
                return await service.selectPage(account, pageId);
            }
            if (provider === model_enums_1.SocialMediaProvider.INSTAGRAM &&
                'selectPage' in service) {
                return await service.selectPage(account, pageId);
            }
            if (provider === model_enums_1.SocialMediaProvider.GSC && 'selectSite' in service) {
                return await service.selectSite(account, pageId);
            }
            if (provider === model_enums_1.SocialMediaProvider.PINTEREST &&
                'selectBoard' in service) {
                return await service.selectBoard(account, pageId);
            }
            if (provider === model_enums_1.SocialMediaProvider.REDDIT && 'selectPage' in service) {
                return await service.selectPage(account, pageId);
            }
            if (provider === model_enums_1.SocialMediaProvider.LINKEDIN &&
                'selectPage' in service) {
                return await service.selectPage(account, pageId);
            }
            throw new Error(`Page selection not supported for provider: ${provider}`);
        }
        catch (error) {
            this.logger.error(`Error selecting page for ${provider}: ${error.message}`);
            throw error;
        }
    }
    async getSelectedPage(account, provider) {
        try {
            const service = this.getServiceForProvider(provider);
            if (provider === model_enums_1.SocialMediaProvider.FACEBOOK &&
                'getSelectedPage' in service) {
                return await service.getSelectedPage(account);
            }
            if (provider === model_enums_1.SocialMediaProvider.INSTAGRAM &&
                'getSelectedPage' in service) {
                return await service.getSelectedPage(account);
            }
            if (provider === model_enums_1.SocialMediaProvider.GSC &&
                'getSelectedSite' in service) {
                const selectedSite = await service.getSelectedSite(account);
                if (selectedSite) {
                    return {
                        id: selectedSite.siteUrl,
                        name: selectedSite.siteUrl,
                        profileImage: '',
                    };
                }
            }
            if (provider === model_enums_1.SocialMediaProvider.PINTEREST &&
                'getSelectedBoard' in service) {
                return await service.getSelectedBoard(account);
            }
            if (provider === model_enums_1.SocialMediaProvider.REDDIT &&
                'getSelectedPage' in service) {
                return await service.getSelectedPage(account);
            }
            if (provider === model_enums_1.SocialMediaProvider.LINKEDIN &&
                'getSelectedPage' in service) {
                return await service.getSelectedPage(account);
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Error getting selected page for ${provider}: ${error.message}`);
            return null;
        }
    }
};
exports.SocialMediaConnectionRouterService = SocialMediaConnectionRouterService;
exports.SocialMediaConnectionRouterService = SocialMediaConnectionRouterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [facebook_service_1.FacebookConnectionService,
        linkedin_service_1.LinkedInConnectionServices,
        x_service_1.SocialMediaConnectionService,
        instagram_service_1.InstagramConnectionServices,
        reddit_service_1.RedditConnectionService,
        pinterest_service_1.PinterestConnectionService,
        blog_service_1.BlogConnectionService,
        app_logger_service_1.AppLogger])
], SocialMediaConnectionRouterService);
//# sourceMappingURL=social-media-connection-router.service.js.map