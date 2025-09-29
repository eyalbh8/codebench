import { RecommendationsService } from '@/api/operations/recommendations.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { DescopeAuthGuard } from '@/auth/descope.auth.guard';
import { DBUserAuthGuard } from '@/auth/db.user.auth.guard';
import { AccountMemberGuard } from '@/auth/account.member.guard';
import { AccountFromRequest } from '@/auth/account.decorator';
import { AuthRequest, PopulatedAccount } from '@/types/api';
import { AccountActiveGuard } from '@/auth/account.active.guard';
import { AccountGuard } from '@/auth/account.guard';
import {
  RecommendationDataDto,
  RecommendationsGenerationRequestDto,
  RecommendationStatusUpdateRequestDto,
} from '@/api/dtos-schemes/recommendations.dto';
@Controller('accounts/:accountId/recommendations')
@UseGuards(
  DescopeAuthGuard,
  DBUserAuthGuard,
  AccountGuard, // ensure account is loaded
  AccountMemberGuard,
  AccountActiveGuard,
)
@ApiBearerAuth()
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  // GET /accounts/:accountId/recommendations - Get all recommendations for an account
  @Get()
  @ApiOkResponse({
    type: [RecommendationDataDto],
    description: 'Get all recommendations for an account',
  })
  async getAllRecommendations(@AccountFromRequest() account: PopulatedAccount) {
    return await this.recommendationsService.getRecommendations(account.id);
  }

  // GET /accounts/:accountId/recommendations/active - Get active recommendations
  @Get('active')
  @ApiOkResponse({
    type: [RecommendationDataDto],
    description: 'Get the active recommendations for an account',
  })
  async getActiveRecommendations(
    @AccountFromRequest() account: PopulatedAccount,
  ) {
    return await this.recommendationsService.getActive(account.id);
  }

  // GET /accounts/:accountId/recommendations/remaining - Get remaining insight generation count
  @Get('remaining')
  @ApiOkResponse({
    description: 'Get remaining insight generation count for this month',
  })
  async getRemainingInsightsCount(
    @AccountFromRequest() account: PopulatedAccount,
  ) {
    return await this.recommendationsService.getRemainingInsights(account.id);
  }

  // POST /accounts/:accountId/recommendations - Create a new recommendation
  @Post()
  @ApiOkResponse({
    type: RecommendationDataDto,
    description: 'Create a recommendation for an account',
  })
  async createNewRecommendation(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() recommendation: RecommendationDataDto,
  ) {
    return await this.recommendationsService.createRecommendation(
      account.id,
      recommendation,
    );
  }

  // PUT /accounts/:accountId/recommendations/:recommendationId - Update recommendation details
  @Put(':recommendationId')
  @ApiOkResponse({
    type: RecommendationDataDto,
    description: 'Update a recommendation for an account',
  })
  async updateRecommendationById(
    @AccountFromRequest() account: PopulatedAccount,
    @Param('recommendationId') recommendationId: string,
    @Body() recommendation: RecommendationDataDto,
  ) {
    return await this.recommendationsService.updateRecommendation(
      account.id,
      recommendationId,
      recommendation,
    );
  }

  // PUT /accounts/:accountId/recommendations/:recommendationId/status - Update recommendation status
  @Put(':recommendationId/status')
  @ApiOkResponse({
    type: RecommendationDataDto,
    description: 'Update recommendation status',
  })
  async updateRecommendationStatusById(
    @AccountFromRequest() account: PopulatedAccount,
    @Param('recommendationId') recommendationId: string,
    @Body() body: RecommendationStatusUpdateRequestDto,
  ) {
    return await this.recommendationsService.updateRecommendationStatus(
      account.id,
      recommendationId,
      body.status,
      body.urls,
    );
  }

  // DELETE /accounts/:accountId/recommendations/:recommendationId - Delete a recommendation
  @Delete(':recommendationId')
  @ApiOkResponse({
    type: RecommendationDataDto,
    description: 'Delete a recommendation for an account',
  })
  async deleteRecommendationById(
    @Param('accountId') accountId: string,
    @Param('recommendationId') recommendationId: string,
  ) {
    return await this.recommendationsService.deleteRecommendation(
      accountId,
      recommendationId,
    );
  }

  // POST /accounts/:accountId/recommendations/generate - Generate AI-powered recommendations
  @Post('generate')
  @ApiOkResponse({
    type: [RecommendationDataDto],
    description: 'Generate AI-powered recommendations from prompt response',
  })
  async generateRecommendations(
    @Req() req: AuthRequest,
    @AccountFromRequest() account: PopulatedAccount,
    @Body() body: RecommendationsGenerationRequestDto,
  ) {
    const result = await this.recommendationsService.generateRecommendationsJob(
      account,
      body.promptId,
      req.user,
    );
    return result;
  }
}
