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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsController = void 0;
const account_admin_guard_1 = require("../../../auth/account.admin.guard");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const descope_auth_guard_1 = require("../../../auth/descope.auth.guard");
const db_user_auth_guard_1 = require("../../../auth/db.user.auth.guard");
const account_decorator_1 = require("../../../auth/account.decorator");
const model_enums_1 = require("../../../model.enums");
const agent_scheme_1 = require("../../dtos-schemes/agent.scheme");
const agent_service_1 = require("../../operations/agent.service");
const social_media_connection_router_service_1 = require("../../operations/social-media-connection-router.service");
const account_active_guard_1 = require("../../../auth/account.active.guard");
const account_member_guard_1 = require("../../../auth/account.member.guard");
const account_guard_1 = require("../../../auth/account.guard");
let AgentsController = class AgentsController {
    constructor(agentService, socialMediaConnectionService) {
        this.agentService = agentService;
        this.socialMediaConnectionService = socialMediaConnectionService;
    }
    async generatePostContent(account, body) {
        return await this.agentService.createPostWithLambda(account, body);
    }
    async getPostsHistory(account, query) {
        const result = await this.agentService.getPosts({
            account,
            generationId: query.generationId,
            socialNetwork: query.socialNetwork,
            state: query.state,
            take: query.take,
            skip: query.skip,
        });
        return { posts: result.posts, totalCount: result.totalCount };
    }
    async updatePostById(account, postId, body) {
        return await this.agentService.updatePost(account, postId, body);
    }
    async removeImagesFromPost(account, postId, body) {
        return await this.agentService.removeImages(account, postId, body);
    }
    async addImageToPost(account, postId) {
        return await this.agentService.uploadImageToS3AndAddToPost(account, postId);
    }
    async setSocialMediaAccessToken(account, body) {
        const result = await this.socialMediaConnectionService.setAccessToken(account, body.provider, body.code, body.codeVerifier);
        return result;
    }
    async getConnectionStatus(account, provider) {
        return await this.socialMediaConnectionService.checkConnectionStatus(account, provider);
    }
    async disconnectSocialMedia(account, body) {
        return await this.socialMediaConnectionService.logout(account, body.provider);
    }
    async publishPostToProvider(account, body) {
        return await this.socialMediaConnectionService.publish(account, body.postId, body.provider);
    }
    async selectFacebookPage(account, body) {
        return await this.socialMediaConnectionService.selectPage(account, body.provider, body.pageId);
    }
    async getSelectedFacebookPage(account, provider) {
        return await this.socialMediaConnectionService.getSelectedPage(account, provider);
    }
    async getLinkedInPostAnalytics(account, postId, provider) {
        if (provider !== model_enums_1.SocialMediaProvider.LINKEDIN) {
            throw new Error('Analytics only supported for LinkedIn');
        }
        const linkedInService = this.socialMediaConnectionService['linkedInConnectionService'];
        return await linkedInService.getPostAnalytics(account, postId);
    }
    async getLinkedInPostComments(account, postId, provider) {
        if (provider !== model_enums_1.SocialMediaProvider.LINKEDIN) {
            throw new Error('Comments only supported for LinkedIn');
        }
        const linkedInService = this.socialMediaConnectionService['linkedInConnectionService'];
        return await linkedInService.getPostComments(account, postId);
    }
    async getLinkedInPostReactions(account, postId, provider) {
        if (provider !== model_enums_1.SocialMediaProvider.LINKEDIN) {
            throw new Error('Reactions only supported for LinkedIn');
        }
        const linkedInService = this.socialMediaConnectionService['linkedInConnectionService'];
        return await linkedInService.getPostReactions(account, postId);
    }
    async generateLinkedInShareLink(account, postId) {
        const linkedInService = this.socialMediaConnectionService['linkedInConnectionService'];
        return await linkedInService.generateShareLink(account, postId);
    }
};
exports.AgentsController = AgentsController;
__decorate([
    (0, common_1.Post)('generateContent'),
    (0, nestjs_zod_1.ZodSerializerDto)(agent_scheme_1.PostWithGenerationIdentifierDto),
    (0, swagger_1.ApiOkResponse)({
        type: agent_scheme_1.PostWithGenerationIdentifierDto,
        description: 'send generation request to lambda',
    }),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "generatePostContent", null);
__decorate([
    (0, common_1.Get)('posts'),
    (0, nestjs_zod_1.ZodSerializerDto)(agent_scheme_1.ContentGenerationResponsePayloadDto),
    (0, swagger_1.ApiOkResponse)({
        type: agent_scheme_1.ContentGenerationResponsePayloadDto,
        description: 'Get X post history grouped by generation ID',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getPostsHistory", null);
__decorate([
    (0, common_1.Put)('updatePost/:postId'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, nestjs_zod_1.ZodSerializerDto)(agent_scheme_1.PostModificationOperationResponseDto),
    (0, swagger_1.ApiParam)({
        name: 'postId',
        description: 'The ID of the post to change tags for',
    }),
    (0, swagger_1.ApiOkResponse)({
        type: agent_scheme_1.PostModificationOperationResponseDto,
        description: 'Change tags of an X post',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "updatePostById", null);
__decorate([
    (0, common_1.Post)('updatePost/:postId/removeImages'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, swagger_1.ApiParam)({
        name: 'postId',
        description: 'The ID of the post to remove images from',
    }),
    (0, swagger_1.ApiOkResponse)({
        type: agent_scheme_1.PostModificationOperationResponseDto,
        description: 'Remove images from an X post',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "removeImagesFromPost", null);
__decorate([
    (0, common_1.Post)('updatePost/:postId/addImage'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, swagger_1.ApiParam)({
        name: 'postId',
        description: 'The ID of the post to add images to',
    }),
    (0, swagger_1.ApiOkResponse)({
        type: agent_scheme_1.PostModificationOperationResponseDto,
        description: 'Add images to an X post',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "addImageToPost", null);
__decorate([
    (0, common_1.Post)('auth/setAccessToken'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, swagger_1.ApiOkResponse)({
        description: 'Handle OAuth2 PKCE callback and connect account',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "setSocialMediaAccessToken", null);
__decorate([
    (0, common_1.Get)('auth/status'),
    (0, swagger_1.ApiOkResponse)({ description: 'Get social connection status' }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Query)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getConnectionStatus", null);
__decorate([
    (0, common_1.Post)('auth/logout'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, swagger_1.ApiOkResponse)({ description: 'Logout / disconnect from provider' }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "disconnectSocialMedia", null);
__decorate([
    (0, common_1.Post)('publish'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, swagger_1.ApiOkResponse)({ description: 'Publish a post to a provider' }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "publishPostToProvider", null);
__decorate([
    (0, common_1.Post)('selectPage'),
    (0, common_1.UseGuards)(account_admin_guard_1.AccountAdminGuard),
    (0, swagger_1.ApiOkResponse)({
        description: 'Select a Facebook page for posting',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "selectFacebookPage", null);
__decorate([
    (0, common_1.Get)('selectedPage'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get the selected Facebook page information',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Query)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getSelectedFacebookPage", null);
__decorate([
    (0, common_1.Get)('posts/:postId/analytics'),
    (0, swagger_1.ApiParam)({
        name: 'postId',
        description: 'The ID of the post to get analytics for',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get analytics for a LinkedIn post',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Query)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getLinkedInPostAnalytics", null);
__decorate([
    (0, common_1.Get)('posts/:postId/comments'),
    (0, swagger_1.ApiParam)({
        name: 'postId',
        description: 'The ID of the post to get comments for',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get comments for a LinkedIn post',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Query)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getLinkedInPostComments", null);
__decorate([
    (0, common_1.Get)('posts/:postId/reactions'),
    (0, swagger_1.ApiParam)({
        name: 'postId',
        description: 'The ID of the post to get reactions for',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get reactions for a LinkedIn post',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Query)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getLinkedInPostReactions", null);
__decorate([
    (0, common_1.Post)('posts/:postId/generateShareLink'),
    (0, swagger_1.ApiParam)({
        name: 'postId',
        description: 'The ID of the post to generate share link for',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Generate employee advocacy share link for LinkedIn post',
    }),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "generateLinkedInShareLink", null);
exports.AgentsController = AgentsController = __decorate([
    (0, common_1.Controller)('accounts/:accountId/agents'),
    (0, common_1.UseGuards)(descope_auth_guard_1.DescopeAuthGuard, db_user_auth_guard_1.DBUserAuthGuard, account_guard_1.AccountGuard, account_member_guard_1.AccountMemberGuard, account_active_guard_1.AccountActiveGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService,
        social_media_connection_router_service_1.SocialMediaConnectionRouterService])
], AgentsController);
//# sourceMappingURL=agents.control.js.map