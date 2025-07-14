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
exports.PinterestConnectionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const model_enums_1 = require("../../model.enums");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const tracked_insights_1 = require("./tracked-insights");
const axios_1 = __importDefault(require("axios"));
let PinterestConnectionService = class PinterestConnectionService {
    constructor(prisma, logger, configService, trackedRecommendationsService) {
        this.prisma = prisma;
        this.logger = logger;
        this.configService = configService;
        this.trackedRecommendationsService = trackedRecommendationsService;
        this.providerKey = model_enums_1.SocialMediaProvider.PINTEREST;
    }
    get isProd() {
        return (this.configService.get('NODE_ENV') || '').toLowerCase() === 'prod';
    }
    get baseUrl() {
        return this.isProd
            ? 'https://api.pinterest.com/v5'
            : 'https://api-sandbox.pinterest.com/v5';
    }
    get sandboxToken() {
        return this.configService.get('PINTEREST_SANDBOX_SECRET') || '';
    }
    parseExistingTokens(account) {
        return (account.accountSettings
            ?.socialMediaProviderTokens || {});
    }
    constructPinterestUrl(pinId) {
        return `https://www.pinterest.com/pin/${pinId}/`;
    }
    async getPinterestBoards(accessToken) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/boards`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const boards = response.data.items?.map((board) => ({
                id: board.id,
                name: board.name,
                description: board.description || '',
            })) || [];
            return boards;
        }
        catch (error) {
            this.logger.error('Error fetching Pinterest boards:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            return [];
        }
    }
    async exchangePinterestToken(code) {
        try {
            if (!this.isProd) {
                if (!this.sandboxToken) {
                    throw new Error('Missing PINTEREST_SANDBOX_ACCESS_TOKEN');
                }
                return {
                    accessToken: this.sandboxToken,
                    refreshToken: '',
                    expiresIn: 2592000,
                };
            }
            const clientId = this.configService.get('PINTEREST_CLIENT_ID');
            const clientSecret = this.configService.get('PINTEREST_CLIENT_SECRET');
            const siteUrl = this.configService.get('SITE_URL');
            const redirectUri = `${siteUrl}/igeo-agents`;
            if (!code) {
                throw new Error('Missing authorization code for Pinterest OAuth');
            }
            const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const formData = new URLSearchParams();
            formData.append('grant_type', 'authorization_code');
            formData.append('code', code);
            formData.append('redirect_uri', redirectUri);
            const response = await axios_1.default.post(`${this.baseUrl}/oauth/token`, formData.toString(), {
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in || 2592000,
            };
        }
        catch (error) {
            this.logger.error('Error exchanging Pinterest token:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            throw new Error(`Failed to exchange Pinterest token: ${error.message}`);
        }
    }
    async refreshAccessToken(tokens) {
        try {
            if (!this.isProd) {
                return tokens;
            }
            if (!tokens.refreshToken)
                return null;
            const clientId = this.configService.get('PINTEREST_CLIENT_ID');
            const clientSecret = this.configService.get('PINTEREST_CLIENT_SECRET');
            const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const formData = new URLSearchParams();
            formData.append('grant_type', 'refresh_token');
            formData.append('refresh_token', tokens.refreshToken);
            const response = await axios_1.default.post(`${this.baseUrl}/oauth/token`, formData.toString(), {
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
            });
            const now = Date.now();
            const expiresAt = response.data.expires_in
                ? new Date(now + response.data.expires_in * 1000).toISOString()
                : tokens.expiresAt;
            return {
                ...tokens,
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token || tokens.refreshToken,
                expiresAt,
                updatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('Error refreshing Pinterest access token:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            return null;
        }
    }
    async updateSocialMediaTokens(accountId, provider, tokenData) {
        const existing = this.parseExistingTokens({
            accountSettings: { socialMediaProviderTokens: {} },
        });
        const updated = {
            ...existing,
            [model_enums_1.SocialMediaProvider.PINTEREST]: tokenData,
        };
        await this.prisma.accountSettings.update({
            where: { accountId },
            data: { socialMediaProviderTokens: updated },
        });
    }
    async setAccessToken(account, code) {
        try {
            if (!this.isProd) {
                if (!this.sandboxToken) {
                    throw new Error('Missing PINTEREST_SANDBOX_ACCESS_TOKEN');
                }
                const boards = await this.getPinterestBoards(this.sandboxToken);
                const tokenData = {
                    provider: model_enums_1.SocialMediaProvider.PINTEREST,
                    accessToken: this.sandboxToken,
                    refreshToken: '',
                    expiresAt: new Date(Date.now() + 2592000 * 1000).toISOString(),
                    boards,
                    updatedAt: new Date(),
                };
                await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.PINTEREST, tokenData);
                return {
                    message: `PINTEREST sandbox connection successful`,
                    provider: model_enums_1.SocialMediaProvider.PINTEREST,
                    boards,
                };
            }
            const pinterestResponse = await this.exchangePinterestToken(code);
            const boards = await this.getPinterestBoards(pinterestResponse.accessToken);
            const now = Date.now();
            const expiresInSeconds = pinterestResponse.expiresIn;
            const expiresAt = new Date(now + expiresInSeconds * 1000).toISOString();
            const tokenData = {
                provider: model_enums_1.SocialMediaProvider.PINTEREST,
                accessToken: pinterestResponse.accessToken,
                refreshToken: pinterestResponse.refreshToken,
                expiresAt,
                boards,
                updatedAt: new Date(),
            };
            await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.PINTEREST, tokenData);
            return {
                message: `PINTEREST OAuth callback successful`,
                provider: model_enums_1.SocialMediaProvider.PINTEREST,
                boards,
            };
        }
        catch (error) {
            this.logger.error('Error setting Pinterest access token:', {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async checkConnectionStatus(account) {
        try {
            const existing = this.parseExistingTokens(account);
            const tokenData = existing[this.providerKey];
            if (!tokenData?.accessToken)
                return false;
            if (!tokenData.selectedBoardId)
                return false;
            const now = new Date();
            const expiresAt = new Date(tokenData.expiresAt);
            if (now >= expiresAt) {
                const refreshedToken = await this.refreshAccessToken(tokenData);
                if (refreshedToken) {
                    await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.PINTEREST, refreshedToken);
                    return !!refreshedToken.selectedBoardId;
                }
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error checking Pinterest connection status:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            return false;
        }
    }
    async selectBoard(account, boardId) {
        try {
            const existing = this.parseExistingTokens(account);
            const tokenData = existing[this.providerKey];
            if (!tokenData) {
                this.logger.error('No Pinterest tokens found for this account', {
                    accountId: account.id,
                });
                throw new Error('No Pinterest tokens found for this account');
            }
            const selectedBoard = tokenData.boards?.find((board) => board.id === boardId);
            if (!selectedBoard) {
                this.logger.error('Selected board not found', {
                    accountId: account.id,
                    boardId,
                });
                throw new Error('Selected board not found');
            }
            const updatedTokenData = {
                ...tokenData,
                selectedBoardId: selectedBoard.id,
                updatedAt: new Date(),
            };
            await this.updateSocialMediaTokens(account.id, model_enums_1.SocialMediaProvider.PINTEREST, updatedTokenData);
            return {
                message: `Pinterest board selected successfully`,
                provider: model_enums_1.SocialMediaProvider.PINTEREST,
            };
        }
        catch (error) {
            this.logger.error('Error selecting Pinterest board:', {
                message: error.message,
                accountId: account.id,
                boardId,
            });
            throw error;
        }
    }
    async getSelectedBoard(account) {
        try {
            const existing = this.parseExistingTokens(account);
            const tokenData = existing[this.providerKey];
            if (!tokenData?.selectedBoardId)
                return null;
            const selectedBoard = tokenData.boards?.find((board) => board.id === tokenData.selectedBoardId);
            if (!selectedBoard)
                return null;
            return {
                id: selectedBoard.id,
                name: selectedBoard.name,
                profileImage: '',
            };
        }
        catch (error) {
            this.logger.error('Error getting selected Pinterest board:', {
                message: error.message,
                accountId: account.id,
            });
            return null;
        }
    }
    async logout(account) {
        try {
            const existing = this.parseExistingTokens(account);
            const updated = { ...existing };
            delete updated[this.providerKey];
            await this.prisma.accountSettings.update({
                where: { accountId: account.id },
                data: { socialMediaProviderTokens: updated },
            });
            return true;
        }
        catch (error) {
            this.logger.error('Error logging out from Pinterest:', {
                message: error.message,
                accountId: account.id,
            });
            return false;
        }
    }
    async publish(account, postId) {
        this.logger.log('Starting Pinterest post publication');
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
            });
            if (!post)
                throw new Error(`Post not found: ${postId}`);
            if (post.publishedAt || post.state === model_enums_1.PostState.POSTED.toString()) {
                this.logger.warn(`Post ${postId} was already published on ${post.publishedAt?.toISOString()}`);
                throw new Error(`Post ${postId} was already published and cannot be published again`);
            }
            if (post.socialMediaProvider !== model_enums_1.SocialMediaProvider.PINTEREST) {
                throw new Error(`Post ${postId} is not for Pinterest provider: ${post.socialMediaProvider}`);
            }
            const isConnected = await this.checkConnectionStatus(account);
            if (!isConnected) {
                throw new Error('Pinterest connection expired or invalid');
            }
            const existing = this.parseExistingTokens(account);
            const tokenData = existing[this.providerKey];
            if (!tokenData?.accessToken) {
                throw new Error('No Pinterest access token found');
            }
            if (!tokenData.selectedBoardId) {
                throw new Error('No Pinterest board selected. Please select a board first.');
            }
            const imageUrl = post?.imagesUrl?.[post?.imagesUrl?.length - 1];
            if (!imageUrl) {
                throw new Error('Pinterest requires an image URL to create a pin');
            }
            const pinData = {
                board_id: tokenData.selectedBoardId,
                title: post.title,
                description: post.body,
                link: post.visitSite || '',
                media_source: {
                    source_type: 'image_url',
                    url: imageUrl,
                },
            };
            const response = await axios_1.default.post(`${this.baseUrl}/pins`, pinData, {
                headers: {
                    Authorization: `Bearer ${tokenData.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const pinId = response.data.id;
            const publishedUrl = this.constructPinterestUrl(pinId);
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    postIdInSocialMediaProvider: pinId,
                    state: model_enums_1.PostState.POSTED,
                    publishedAt: new Date(),
                    publishedUrl,
                },
            });
            if (publishedUrl) {
                try {
                    await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId, publishedUrl);
                    this.logger.log('Successfully tracked published Pinterest post:', {
                        postId,
                        publishedUrl,
                        recommendationId: post.recommendationId || 'dummy',
                    });
                }
                catch (trackingError) {
                    this.logger.error('Failed to track published Pinterest post:', {
                        postId,
                        publishedUrl,
                        message: trackingError.message,
                        stack: trackingError.stack,
                    });
                }
            }
            this.logger.log(`Successfully published post ${postId} to Pinterest as Pin ${pinId}`, { publishedUrl });
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
            this.logger.log('Pinterest post publication completed successfully');
            return true;
        }
        catch (error) {
            this.logger.error(`Error publishing post ${postId} to Pinterest:`, {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                postId,
                accountId: account.id,
            });
            await this.prisma.post.update({
                where: { id: postId },
                data: { state: model_enums_1.PostState.FAILED },
            });
            throw error;
        }
    }
};
exports.PinterestConnectionService = PinterestConnectionService;
exports.PinterestConnectionService = PinterestConnectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger,
        config_1.ConfigService,
        tracked_insights_1.TrackedRecommendationsService])
], PinterestConnectionService);
//# sourceMappingURL=pinterest.service.js.map