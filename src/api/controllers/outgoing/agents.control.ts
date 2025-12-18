import { AccountAdminGuard } from '@/auth/account.admin.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Put,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { DescopeAuthGuard } from '@/auth/descope.auth.guard';
import { DBUserAuthGuard } from '@/auth/db.user.auth.guard';
import { AccountFromRequest } from '@/auth/account.decorator';
import { Account } from '@prisma/client';
import { SocialMediaProvider } from '@/model.enums';
import {
  PostContentGenerationDto,
  UpdatePostRequestDto,
  RemoveImagesRequestDto,
  GetPostHistoryQueryDto,
  PostWithGenerationIdentifierDto,
  PostModificationOperationResponseDto,
  ContentGenerationResponsePayloadDto,
} from '../../dtos-schemes/agent.scheme';
import { AgentService } from '@/api/operations/agent.service';
import { SocialMediaConnectionRouterService } from '@/api/operations/social-media-connection-router.service';
import { PopulatedAccount } from '@/types/api';
import { AccountActiveGuard } from '@/auth/account.active.guard';
import { AccountMemberGuard } from '@/auth/account.member.guard';
import { AccountGuard } from '@/auth/account.guard';

@Controller('accounts/:accountId/agents')
@UseGuards(
  DescopeAuthGuard,
  DBUserAuthGuard,
  AccountGuard, // ensure account is loaded
  AccountMemberGuard,
  AccountActiveGuard,
)
@ApiBearerAuth()
export class AgentsController {
  constructor(
    private readonly agentService: AgentService,
    private readonly socialMediaConnectionService: SocialMediaConnectionRouterService,
  ) {}

  @Post('generateContent')
  @ZodSerializerDto(PostWithGenerationIdentifierDto)
  @ApiOkResponse({
    type: PostWithGenerationIdentifierDto,
    description: 'send generation request to lambda',
  })
  @UseGuards(AccountAdminGuard)
  async generatePostContent(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() body: PostContentGenerationDto,
  ) {
    return await this.agentService.createPostWithLambda(account, body);
  }

  @Get('posts')
  @ZodSerializerDto(ContentGenerationResponsePayloadDto)
  @ApiOkResponse({
    type: ContentGenerationResponsePayloadDto,
    description: 'Get X post history grouped by generation ID',
  })
  async getPostsHistory(
    @AccountFromRequest() account: PopulatedAccount,
    @Query() query: GetPostHistoryQueryDto,
  ) {
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

  @Put('updatePost/:postId')
  @UseGuards(AccountAdminGuard)
  @ZodSerializerDto(PostModificationOperationResponseDto)
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to change tags for',
  })
  @ApiOkResponse({
    type: PostModificationOperationResponseDto,
    description: 'Change tags of an X post',
  })
  async updatePostById(
    @AccountFromRequest() account: Account,
    @Param('postId') postId: string,
    @Body() body: UpdatePostRequestDto,
  ) {
    return await this.agentService.updatePost(account, postId, body);
  }

  @Post('updatePost/:postId/removeImages')
  @UseGuards(AccountAdminGuard)
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to remove images from',
  })
  @ApiOkResponse({
    type: PostModificationOperationResponseDto,
    description: 'Remove images from an X post',
  })
  async removeImagesFromPost(
    @AccountFromRequest() account: Account,
    @Param('postId') postId: string,
    @Body() body: RemoveImagesRequestDto,
  ) {
    return await this.agentService.removeImages(account, postId, body);
  }

  @Post('updatePost/:postId/addImage')
  @UseGuards(AccountAdminGuard)
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to add images to',
  })
  @ApiOkResponse({
    type: PostModificationOperationResponseDto,
    description: 'Add images to an X post',
  })
  async addImageToPost(
    @AccountFromRequest() account: Account,
    @Param('postId') postId: string,
  ) {
    return await this.agentService.uploadImageToS3AndAddToPost(account, postId);
  }

  @Post('auth/setAccessToken')
  @UseGuards(AccountAdminGuard)
  @ApiOkResponse({
    description: 'Handle OAuth2 PKCE callback and connect account',
  })
  async setSocialMediaAccessToken(
    @AccountFromRequest() account: PopulatedAccount,
    @Body()
    body: {
      provider: SocialMediaProvider;
      code: string;
      codeVerifier?: string;
      state?: string;
    },
  ) {
    const result = await this.socialMediaConnectionService.setAccessToken(
      account,
      body.provider,
      body.code,
      body.codeVerifier,
    );

    return result;
  }

  @Get('auth/status')
  @ApiOkResponse({ description: 'Get social connection status' })
  async getConnectionStatus(
    @AccountFromRequest() account: PopulatedAccount,
    @Query('provider') provider: SocialMediaProvider,
  ) {
    return await this.socialMediaConnectionService.checkConnectionStatus(
      account,
      provider,
    );
  }

  @Post('auth/logout')
  @UseGuards(AccountAdminGuard)
  @ApiOkResponse({ description: 'Logout / disconnect from provider' })
  async disconnectSocialMedia(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() body: { provider: SocialMediaProvider },
  ) {
    return await this.socialMediaConnectionService.logout(
      account,
      body.provider,
    );
  }

  @Post('publish')
  @UseGuards(AccountAdminGuard)
  @ApiOkResponse({ description: 'Publish a post to a provider' })
  async publishPostToProvider(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() body: { postId: string; provider: SocialMediaProvider },
  ) {
    return await this.socialMediaConnectionService.publish(
      account,
      body.postId,
      body.provider,
    );
  }

  @Post('selectPage')
  @UseGuards(AccountAdminGuard)
  @ApiOkResponse({
    description: 'Select a Facebook page for posting',
  })
  async selectFacebookPage(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() body: { provider: SocialMediaProvider; pageId: string },
  ) {
    return await this.socialMediaConnectionService.selectPage(
      account,
      body.provider,
      body.pageId,
    );
  }

  @Get('selectedPage')
  @ApiOkResponse({
    description: 'Get the selected Facebook page information',
  })
  async getSelectedFacebookPage(
    @AccountFromRequest() account: PopulatedAccount,
    @Query('provider') provider: SocialMediaProvider,
  ) {
    return await this.socialMediaConnectionService.getSelectedPage(
      account,
      provider,
    );
  }

  @Get('posts/:postId/analytics')
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to get analytics for',
  })
  @ApiOkResponse({
    description: 'Get analytics for a LinkedIn post',
  })
  async getLinkedInPostAnalytics(
    @AccountFromRequest() account: PopulatedAccount,
    @Param('postId') postId: string,
    @Query('provider') provider: SocialMediaProvider,
  ) {
    if (provider !== SocialMediaProvider.LINKEDIN) {
      throw new Error('Analytics only supported for LinkedIn');
    }

    const linkedInService =
      this.socialMediaConnectionService['linkedInConnectionService'];
    return await linkedInService.getPostAnalytics(account, postId);
  }

  @Get('posts/:postId/comments')
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to get comments for',
  })
  @ApiOkResponse({
    description: 'Get comments for a LinkedIn post',
  })
  async getLinkedInPostComments(
    @AccountFromRequest() account: PopulatedAccount,
    @Param('postId') postId: string,
    @Query('provider') provider: SocialMediaProvider,
  ) {
    if (provider !== SocialMediaProvider.LINKEDIN) {
      throw new Error('Comments only supported for LinkedIn');
    }

    const linkedInService =
      this.socialMediaConnectionService['linkedInConnectionService'];
    return await linkedInService.getPostComments(account, postId);
  }

  @Get('posts/:postId/reactions')
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to get reactions for',
  })
  @ApiOkResponse({
    description: 'Get reactions for a LinkedIn post',
  })
  async getLinkedInPostReactions(
    @AccountFromRequest() account: PopulatedAccount,
    @Param('postId') postId: string,
    @Query('provider') provider: SocialMediaProvider,
  ) {
    if (provider !== SocialMediaProvider.LINKEDIN) {
      throw new Error('Reactions only supported for LinkedIn');
    }

    const linkedInService =
      this.socialMediaConnectionService['linkedInConnectionService'];
    return await linkedInService.getPostReactions(account, postId);
  }

  @Post('posts/:postId/generateShareLink')
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to generate share link for',
  })
  @ApiOkResponse({
    description: 'Generate employee advocacy share link for LinkedIn post',
  })
  async generateLinkedInShareLink(
    @AccountFromRequest() account: PopulatedAccount,
    @Param('postId') postId: string,
  ) {
    const linkedInService =
      this.socialMediaConnectionService['linkedInConnectionService'];
    return await linkedInService.generateShareLink(account, postId);
  }
}
