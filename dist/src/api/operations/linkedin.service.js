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
exports.LinkedInConnectionServices = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const model_enums_1 = require("../../model.enums");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const tracked_insights_1 = require("./tracked-insights");
const axios_1 = __importDefault(require("axios"));
let LinkedInConnectionServices = class LinkedInConnectionServices {
    constructor(prisma, logger, configService, trackedRecommendationsService) {
        this.prisma = prisma;
        this.logger = logger;
        this.configService = configService;
        this.trackedRecommendationsService = trackedRecommendationsService;
        this.graphBaseUrl = 'https://api.linkedin.com/v2';
    }
    async getExistingTokens(accountId) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            include: { accountSettings: true },
        });
        return (account?.accountSettings
            ?.socialMediaProviderTokens || {
            provider: model_enums_1.SocialMediaProvider.LINKEDIN,
            accessToken: '',
            expiresAt: '',
        });
    }
    getLinkedInTokens(account) {
        try {
            const allTokens = account.accountSettings
                ?.socialMediaProviderTokens;
            return allTokens?.[model_enums_1.SocialMediaProvider.LINKEDIN] || null;
        }
        catch (error) {
            this.logger.error('Error parsing LinkedIn tokens:', {
                accountId: account.id,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }
    async updateSocialMediaTokens(accountId, tokenData) {
        try {
            const existingTokens = await this.getExistingTokens(accountId);
            const updatedTokens = {
                ...existingTokens,
                [model_enums_1.SocialMediaProvider.LINKEDIN]: tokenData,
            };
            await this.prisma.accountSettings.update({
                where: { accountId },
                data: { socialMediaProviderTokens: updatedTokens },
            });
            this.logger.log('LinkedIn tokens updated successfully', { accountId });
        }
        catch (error) {
            this.logger.error('Error updating LinkedIn tokens:', {
                accountId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    async exchangeLinkedInToken(code) {
        try {
            const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
            const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');
            const redirectUri = this.configService.get('SITE_URL') + '/igeo-agents';
            const response = await axios_1.default.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
                params: {
                    grant_type: 'authorization_code',
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return {
                accessToken: response.data.access_token,
                expiresIn: response.data.expires_in || 5184000,
            };
        }
        catch (error) {
            this.logger.error('[LinkedIn] Token exchange FAILED', {
                errorMessage: error.message,
                errorData: error.response?.data,
            });
            throw new Error(`Failed to exchange LinkedIn token: ${error.response?.data?.error_description || error.message}`);
        }
    }
    async fetchLinkedInOrganizations(accessToken) {
        try {
            const aclResponse = await axios_1.default.get(`${this.graphBaseUrl}/organizationAcls`, {
                params: {
                    q: 'roleAssignee',
                    projection: '(elements*(organization~(localizedName,logoV2,vanityName)))',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                },
            });
            this.logger.log('[LinkedIn] Organization ACLs response', {
                hasElements: !!aclResponse.data?.elements,
                elementCount: aclResponse.data?.elements?.length || 0,
                responseStatus: aclResponse.status,
                responseHeaders: aclResponse.headers,
                fullResponseData: JSON.stringify(aclResponse.data, null, 2),
            });
            const organizations = [];
            for (const element of aclResponse.data?.elements || []) {
                const orgId = element.organization?.split(':').pop();
                const org = element['organization~'];
                const orgError = element['organization!'];
                if (orgError && orgId) {
                    this.logger.warn('[LinkedIn] Organization projection failed but URN available', {
                        orgId,
                        error: orgError,
                        organizationUrn: element.organization,
                    });
                    organizations.push({
                        id: orgId,
                        name: `Organization ${orgId}`,
                        logoUrl: '',
                        vanityName: orgId,
                    });
                }
                else if (org && orgId) {
                    const logoUrl = org.logoV2?.original ||
                        org.logoV2?.['cropped~']?.elements?.[0]?.identifiers?.[0]
                            ?.identifier ||
                        '';
                    organizations.push({
                        id: orgId,
                        name: org.localizedName || 'Unknown Organization',
                        logoUrl,
                        vanityName: org.vanityName || orgId,
                    });
                }
            }
            if (organizations.length === 0) {
                this.logger.warn('[LinkedIn] No organizations found in organizationAcls', {
                    responseStatus: aclResponse.status,
                    responseData: JSON.stringify(aclResponse.data).substring(0, 1000),
                    fullResponse: aclResponse.data,
                });
                try {
                    const profileResponse = await axios_1.default.get(`${this.graphBaseUrl}/me`, {
                        params: {
                            projection: '(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
                        },
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'X-Restli-Protocol-Version': '2.0.0',
                        },
                    });
                    this.logger.log('[LinkedIn] User profile fetched as fallback', {
                        profileId: profileResponse.data?.id,
                    });
                }
                catch (profileError) {
                    this.logger.warn('[LinkedIn] Could not fetch user profile', {
                        error: profileError.message,
                    });
                }
            }
            return organizations;
        }
        catch (error) {
            const errorDetails = {
                errorMessage: error.message,
                errorStatus: error.response?.status,
                errorData: error.response?.data,
                errorHeaders: error.response?.headers,
            };
            this.logger.error('[LinkedIn] Error fetching organizations', errorDetails);
            if (error.response?.status === 403) {
                throw new Error('LinkedIn API returned 403 Forbidden. This usually means your OAuth scopes do not include organization permissions. Please ensure your LinkedIn app has the following scopes: w_organization_social, r_organization_social, or w_member_social. In developer mode, you may need to request these permissions from LinkedIn.');
            }
            else if (error.response?.status === 401) {
                throw new Error('LinkedIn API returned 401 Unauthorized. The access token may be invalid or expired.');
            }
            throw new Error(`Failed to fetch LinkedIn organizations: ${error.response?.data?.message || error.message}. Status: ${error.response?.status || 'N/A'}`);
        }
    }
    async setAccessToken(account, code) {
        try {
            const tokenResponse = await this.exchangeLinkedInToken(code);
            const organizations = await this.fetchLinkedInOrganizations(tokenResponse.accessToken);
            const expiresAt = new Date(Date.now() + tokenResponse.expiresIn * 1000).toISOString();
            const tokenData = {
                provider: model_enums_1.SocialMediaProvider.LINKEDIN,
                accessToken: tokenResponse.accessToken,
                expiresAt,
                organizations,
            };
            await this.updateSocialMediaTokens(account.id, tokenData);
            this.logger.log('LinkedIn OAuth callback successful', {
                accountId: account.id,
                organizationCount: organizations.length,
                organizations: organizations.map((org) => ({
                    id: org.id,
                    name: org.name,
                })),
            });
            return {
                message: 'LinkedIn OAuth callback successful',
                provider: model_enums_1.SocialMediaProvider.LINKEDIN,
                organizations,
                organizationCount: organizations.length,
            };
        }
        catch (error) {
            this.logger.error('[LinkedIn] Error setting access token', {
                accountId: account.id,
                errorMessage: error.message,
                errorData: error.response?.data,
            });
            throw error;
        }
    }
    async checkConnectionStatus(account) {
        try {
            const tokenData = this.getLinkedInTokens(account);
            if (!tokenData?.accessToken) {
                return false;
            }
            if (tokenData.expiresAt) {
                const expiresAt = new Date(tokenData.expiresAt);
                if (Date.now() >= expiresAt.getTime()) {
                    this.logger.warn('LinkedIn access token expired', {
                        accountId: account.id,
                    });
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error checking LinkedIn connection status:', {
                accountId: account.id,
                error: error.message,
            });
            return false;
        }
    }
    async logout(account) {
        try {
            this.logger.log('Logging out from LinkedIn', { accountId: account.id });
            const existingTokens = await this.getExistingTokens(account.id);
            return true;
        }
        catch (error) {
            this.logger.error('Error logging out from LinkedIn:', {
                accountId: account.id,
                error: error.message,
            });
            throw error;
        }
    }
    async selectPage(account, organizationId) {
        try {
            this.logger.log('Selecting LinkedIn organization', {
                accountId: account.id,
                organizationId,
            });
            const tokenData = this.getLinkedInTokens(account);
            if (!tokenData) {
                throw new Error('No LinkedIn tokens found for this account');
            }
            const updatedTokenData = {
                ...tokenData,
                selectedOrganizationId: organizationId,
            };
            await this.updateSocialMediaTokens(account.id, updatedTokenData);
            this.logger.log('LinkedIn organization selected successfully', {
                accountId: account.id,
                organizationId,
            });
            return {
                message: `Successfully selected LinkedIn organization: ${organizationId}`,
                provider: model_enums_1.SocialMediaProvider.LINKEDIN,
            };
        }
        catch (error) {
            this.logger.error('Error selecting LinkedIn organization:', {
                accountId: account.id,
                error: error.message,
            });
            throw error;
        }
    }
    async getSelectedPage(account) {
        try {
            const tokenData = this.getLinkedInTokens(account);
            if (!tokenData ||
                !tokenData.organizations ||
                tokenData.organizations.length === 0) {
                return null;
            }
            const selectedOrgId = tokenData.selectedOrganizationId || tokenData.organizations[0]?.id;
            const selectedOrg = tokenData.organizations.find((org) => org.id === selectedOrgId) ||
                tokenData.organizations[0];
            return {
                id: selectedOrg.id,
                name: selectedOrg.name,
                profileImage: selectedOrg.logoUrl || '',
            };
        }
        catch (error) {
            this.logger.error('Error getting selected LinkedIn organization:', {
                accountId: account.id,
                error: error.message,
            });
            return null;
        }
    }
    async uploadImageToLinkedIn(imageUrl, accessToken, organizationId) {
        try {
            const registerUploadRequest = {
                registerUploadRequest: {
                    recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                    owner: `urn:li:organization:${organizationId}`,
                    serviceRelationships: [
                        {
                            relationshipType: 'OWNER',
                            identifier: 'urn:li:userGeneratedContent',
                        },
                    ],
                },
            };
            const registerResponse = await axios_1.default.post(`${this.graphBaseUrl}/assets?action=registerUpload`, registerUploadRequest, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0',
                },
            });
            const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
            const asset = registerResponse.data.value.asset;
            const imageResponse = await axios_1.default.get(imageUrl, {
                responseType: 'arraybuffer',
            });
            const imageBuffer = Buffer.from(imageResponse.data);
            await axios_1.default.put(uploadUrl, imageBuffer, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': imageResponse.headers['content-type'] || 'image/png',
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            });
            return asset;
        }
        catch (error) {
            this.logger.error('[LinkedIn Image Upload] Upload FAILED', {
                errorMessage: error.message,
                errorData: error.response?.data,
            });
            throw error;
        }
    }
    async publish(account, postId) {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                this.logger.error('[LinkedIn Publish] Post not found', { postId });
                throw new Error(`Post with ID ${postId} not found`);
            }
            if (post.accountId !== account.id) {
                throw new Error('Post does not belong to this account');
            }
            if (post.socialMediaProvider !== model_enums_1.SocialMediaProvider.LINKEDIN) {
                throw new Error(`Post ${postId} is not configured for LinkedIn provider`);
            }
            const tokenData = this.getLinkedInTokens(account);
            if (!tokenData?.accessToken) {
                throw new Error('LinkedIn account is not connected or configured');
            }
            const postText = `${post.title}\n\n${post.body}`;
            const imageUrls = Array.isArray(post.imagesUrl) ? post.imagesUrl : [];
            let publishedUrl;
            if (imageUrls.length > 0) {
                const organizationId = tokenData.selectedOrganizationId || tokenData.organizations?.[0]?.id;
                if (!organizationId) {
                    throw new Error('No LinkedIn organization selected');
                }
                const assetUrn = await this.uploadImageToLinkedIn(imageUrls[0], tokenData.accessToken, organizationId);
                publishedUrl = this.constructLinkedInUrl(assetUrn);
            }
            const organizationId = tokenData.selectedOrganizationId || tokenData.organizations?.[0]?.id;
            if (!organizationId) {
                throw new Error('No LinkedIn organization selected');
            }
            const shareContent = {
                shareCommentary: {
                    text: postText,
                },
                shareMediaCategory: imageUrls.length > 0 ? 'IMAGE' : 'NONE',
                ...(imageUrls.length > 0 &&
                    publishedUrl && {
                    media: [
                        {
                            status: 'READY',
                            media: publishedUrl,
                        },
                    ],
                }),
            };
            const shareResponse = await axios_1.default.post(`${this.graphBaseUrl}/ugcPosts`, {
                author: `urn:li:organization:${organizationId}`,
                lifecycleState: 'PUBLISHED',
                specificContent: shareContent,
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                },
            }, {
                headers: {
                    Authorization: `Bearer ${tokenData.accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': 'application/json',
                },
            });
            const linkedInPostId = shareResponse.data?.id;
            if (!linkedInPostId) {
                throw new Error('Failed to publish post to LinkedIn');
            }
            publishedUrl =
                publishedUrl ||
                    `https://www.linkedin.com/feed/update/${linkedInPostId}`;
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    postIdInSocialMediaProvider: linkedInPostId,
                    publishedAt: new Date(),
                    state: model_enums_1.PostState.POSTED,
                    publishedUrl,
                },
            });
            if (publishedUrl) {
                try {
                    await this.trackedRecommendationsService.addUrlToTrackedRecommendation(account.id, post.recommendationId || post.id, publishedUrl);
                    this.logger.log('Successfully tracked published LinkedIn post:', {
                        postId,
                        publishedUrl,
                        recommendationId: post.recommendationId || post.id,
                    });
                }
                catch (trackingError) {
                    this.logger.error('Failed to track published LinkedIn post:', {
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
            return true;
        }
        catch (error) {
            this.logger.error('[LinkedIn Publish] Publication FAILED', {
                accountId: account.id,
                postId,
                errorMessage: error.message,
                errorData: error.response?.data,
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
    async getPostAnalytics(account, postId) {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId, accountId: account.id },
            });
            if (!post) {
                this.logger.error('[LinkedIn Analytics] Post not found', { postId });
                throw new Error('Post not found');
            }
            if (!post.postIdInSocialMediaProvider) {
                throw new Error('Post has not been published to LinkedIn');
            }
            const tokenData = this.getLinkedInTokens(account);
            if (!tokenData?.accessToken) {
                throw new Error('LinkedIn not connected');
            }
            const organizationId = tokenData.selectedOrganizationId || tokenData.organizations?.[0]?.id;
            const [likesResponse, commentsResponse, shareStatsResponse] = await Promise.all([
                axios_1.default
                    .get(`${this.graphBaseUrl}/socialActions/${encodeURIComponent(post.postIdInSocialMediaProvider)}/likes`, {
                    headers: {
                        Authorization: `Bearer ${tokenData.accessToken}`,
                        'X-Restli-Protocol-Version': '2.0.0',
                    },
                })
                    .catch((error) => {
                    this.logger.warn('[LinkedIn Analytics] Likes API failed, defaulting to 0', { errorMessage: error.message });
                    return { data: { paging: { total: 0 } } };
                }),
                axios_1.default
                    .get(`${this.graphBaseUrl}/socialActions/${encodeURIComponent(post.postIdInSocialMediaProvider)}/comments`, {
                    headers: {
                        Authorization: `Bearer ${tokenData.accessToken}`,
                        'X-Restli-Protocol-Version': '2.0.0',
                    },
                })
                    .catch((error) => {
                    this.logger.warn('[LinkedIn Analytics] Comments API failed, defaulting to 0', { errorMessage: error.message });
                    return { data: { paging: { total: 0 } } };
                }),
                organizationId && post.postIdInSocialMediaProvider
                    ? axios_1.default
                        .get(`${this.graphBaseUrl}/organizationalEntityShareStatistics`, {
                        params: {
                            q: 'organizationalEntity',
                            organizationalEntity: `urn:li:organization:${organizationId}`,
                            shares: `urn:li:ugcPost:${post.postIdInSocialMediaProvider}`,
                        },
                        headers: {
                            Authorization: `Bearer ${tokenData.accessToken}`,
                            'X-Restli-Protocol-Version': '2.0.0',
                        },
                    })
                        .catch(() => null)
                    : Promise.resolve(null),
            ]);
            const shareStats = shareStatsResponse?.data?.elements?.[0]?.totalShareStatistics;
            let impressions = 0;
            let clicks = 0;
            let shares = shareStats?.shareCount || 0;
            if (shareStats) {
                impressions = shareStats.impressionCount || 0;
                clicks = shareStats.clickCount || 0;
                shares = shareStats.shareCount || 0;
            }
            const likes = likesResponse.data?.paging?.total || 0;
            const comments = commentsResponse.data?.paging?.total || 0;
            const engagementRate = impressions > 0 ? ((likes + comments + shares) / impressions) * 100 : 0;
            return {
                impressions,
                clicks,
                likes,
                comments,
                shares,
                engagementRate: parseFloat(engagementRate.toFixed(2)),
            };
        }
        catch (error) {
            this.logger.error('[LinkedIn Analytics] Fetch FAILED', {
                accountId: account.id,
                postId,
                errorMessage: error.message,
                errorData: error.response?.data,
                errorStatus: error.response?.status,
            });
            throw error;
        }
    }
    async getPostComments(account, postId) {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId, accountId: account.id },
            });
            if (!post) {
                this.logger.error('[LinkedIn Comments] Post not found', { postId });
                throw new Error('Post not found');
            }
            if (!post.postIdInSocialMediaProvider) {
                throw new Error('Post has not been published to LinkedIn');
            }
            const tokenData = this.getLinkedInTokens(account);
            if (!tokenData?.accessToken) {
                throw new Error('LinkedIn not connected');
            }
            const commentsEndpoint = `${this.graphBaseUrl}/socialActions/${encodeURIComponent(post.postIdInSocialMediaProvider)}/comments`;
            const response = await axios_1.default.get(commentsEndpoint, {
                params: {
                    projection: '(elements*(id,message,created,actor~(localizedFirstName,localizedLastName,vanityName,headline,profilePicture(displayImage~:playableStreams))))',
                },
                headers: {
                    Authorization: `Bearer ${tokenData.accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                },
            });
            const comments = [];
            for (const element of response.data.elements || []) {
                const actor = element['actor~'];
                const isRateLimited = !!element['actor!'];
                if (isRateLimited) {
                    this.logger.warn('[LinkedIn Comments] Profile data rate limited', {
                        commentId: element.id,
                    });
                }
                if (element.message) {
                    const photoUrl = actor?.profilePicture?.['displayImage~']?.elements?.[0]
                        ?.identifiers?.[0]?.identifier || '';
                    const comment = {
                        id: element.id,
                        author: {
                            name: actor
                                ? `${actor.localizedFirstName} ${actor.localizedLastName}`
                                : 'LinkedIn User',
                            headline: actor?.headline?.localized?.en_US || '',
                            profileUrl: actor?.vanityName
                                ? `https://linkedin.com/in/${actor.vanityName}`
                                : '',
                            photoUrl,
                        },
                        text: element.message?.text || '',
                        createdAt: new Date(element.created?.time || Date.now()).toISOString(),
                    };
                    comments.push(comment);
                }
            }
            comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return comments;
        }
        catch (error) {
            this.logger.error('[LinkedIn Comments] Fetch FAILED', {
                accountId: account.id,
                postId,
                errorMessage: error.message,
                errorData: error.response?.data,
                errorStatus: error.response?.status,
            });
            throw error;
        }
    }
    async getPostReactions(account, postId) {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId, accountId: account.id },
            });
            if (!post) {
                this.logger.error('[LinkedIn Reactions] Post not found', { postId });
                throw new Error('Post not found');
            }
            if (!post.postIdInSocialMediaProvider) {
                throw new Error('Post has not been published to LinkedIn');
            }
            const tokenData = this.getLinkedInTokens(account);
            if (!tokenData?.accessToken) {
                throw new Error('LinkedIn not connected');
            }
            const reactionsEndpoint = `${this.graphBaseUrl}/socialActions/${encodeURIComponent(post.postIdInSocialMediaProvider)}/reactions`;
            const response = await axios_1.default.get(reactionsEndpoint, {
                headers: {
                    Authorization: `Bearer ${tokenData.accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                },
            });
            const reactions = {
                like: 0,
                celebrate: 0,
                support: 0,
                love: 0,
                insightful: 0,
                funny: 0,
            };
            for (const element of response.data.elements || []) {
                const reactionType = element.reactionType?.toLowerCase();
                if (reactionType && reactions.hasOwnProperty(reactionType)) {
                    reactions[reactionType]++;
                }
            }
            return reactions;
        }
        catch (error) {
            this.logger.error('[LinkedIn Reactions] Fetch FAILED', {
                accountId: account.id,
                postId,
                errorMessage: error.message,
                errorData: error.response?.data,
                errorStatus: error.response?.status,
            });
            throw error;
        }
    }
    constructLinkedInUrl(urn) {
        const match = urn.match(/urn:li:ugcPost:(\d+)/);
        if (match && match[1]) {
            return `https://www.linkedin.com/feed/update/${match[1]}`;
        }
        const numericMatch = urn.match(/(\d+)$/);
        if (numericMatch && numericMatch[1]) {
            return `https://www.linkedin.com/feed/update/${numericMatch[1]}`;
        }
        this.logger.warn('Could not construct LinkedIn URL from URN', { urn });
        return '';
    }
    async generateShareLink(account, postId) {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId, accountId: account.id },
            });
            if (!post) {
                throw new Error('Post not found');
            }
            if (!post.postIdInSocialMediaProvider) {
                throw new Error('Post has not been published to LinkedIn');
            }
            const baseShareUrl = post.publishedUrl ||
                this.constructLinkedInUrl(post.postIdInSocialMediaProvider);
            const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseShareUrl)}`;
            return { shareUrl };
        }
        catch (error) {
            this.logger.error('Error generating LinkedIn share link', {
                accountId: account.id,
                postId,
                error: error.message,
            });
            throw error;
        }
    }
};
exports.LinkedInConnectionServices = LinkedInConnectionServices;
exports.LinkedInConnectionServices = LinkedInConnectionServices = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger,
        config_1.ConfigService,
        tracked_insights_1.TrackedRecommendationsService])
], LinkedInConnectionServices);
//# sourceMappingURL=linkedin.service.js.map