import {
  RecommendationAnalyticsOverviewDto,
  RecommendationAnalyticsOverviewType,
  TrackedRecommendationCreationRequestDto,
  TrackedRecommendationEntityDto,
  TrackedRecommendationEntityType,
  TrackedRecommendationUpdateRequestDto,
} from '@/api/dtos-schemes/tracked-recommendations.dto';
import { TrackedRecommendationsService } from '@/api/operations/tracked-insights';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { DescopeAuthGuard } from '@/auth/descope.auth.guard';
import { DBUserAuthGuard } from '@/auth/db.user.auth.guard';
import { AccountMemberGuard } from '@/auth/account.member.guard';
import { AccountFromRequest } from '@/auth/account.decorator';
import { PopulatedAccount } from '@/types/api';
import { AccountAdminGuard } from '@/auth/account.admin.guard';
import { AccountActiveGuard } from '@/auth/account.active.guard';
import { AccountGuard } from '@/auth/account.guard';
import { TrackedRecommendation } from '@prisma/client';

@Controller('accounts/:accountId/tracked-recommendations')
@UseGuards(
  DescopeAuthGuard,
  DBUserAuthGuard,
  AccountGuard,
  AccountMemberGuard,
  AccountActiveGuard,
)
@ApiBearerAuth()
export class TrackedRecommendationsController {
  constructor(
    private readonly trackedRecommendationsService: TrackedRecommendationsService,
  ) {}

  // GET /accounts/:accountId/tracked-recommendations - Get all tracked recommendations
  @Get()
  @ZodSerializerDto(TrackedRecommendationEntityDto)
  @ApiOkResponse({
    type: [TrackedRecommendationEntityDto],
  })
  async getAllTrackedRecommendations(
    @AccountFromRequest() account: PopulatedAccount,
  ): Promise<TrackedRecommendationEntityType[]> {
    return await this.trackedRecommendationsService.get(account.id);
  }

  // GET /accounts/:accountId/tracked-recommendations/analytics - Get analytics overview for tracked recommendations
  @Get('analytics')
  @ZodSerializerDto(RecommendationAnalyticsOverviewDto)
  @ApiOkResponse({
    type: [RecommendationAnalyticsOverviewDto],
  })
  async getTrackedRecommendationsAnalytics(
    @AccountFromRequest() account: PopulatedAccount,
  ): Promise<RecommendationAnalyticsOverviewType[]> {
    return await this.trackedRecommendationsService.getTrackedTrends(account);
  }

  // POST /accounts/:accountId/tracked-recommendations - Create a new tracked recommendation
  @Post()
  @ZodSerializerDto(TrackedRecommendationEntityDto)
  @ApiOkResponse({
    type: TrackedRecommendationEntityDto,
  })
  async createTrackedRecommendation(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() data: TrackedRecommendationCreationRequestDto,
  ) {
    const createData: TrackedRecommendation = {
      id: '',
      urls: data.urls,
      accountId: account.id,
      recommendationId: data.recommendationId ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.trackedRecommendationsService.create({
      account: {
        connect: {
          id: account.id,
        },
      },
      recommendation: {
        connect: {
          id: data.recommendationId ?? '',
        },
      },
      urls: data.urls,
    });
  }

  // PUT /accounts/:accountId/tracked-recommendations/:trackedRecommendationId - Update tracked recommendation (Admin only)
  @Put(':trackedRecommendationId')
  @UseGuards(AccountAdminGuard)
  @ZodSerializerDto(TrackedRecommendationEntityDto)
  @ApiOkResponse({
    type: TrackedRecommendationEntityDto,
  })
  async updateTrackedRecommendationById(
    @Param('trackedRecommendationId') trackedRecommendationId: string,
    @AccountFromRequest() account: PopulatedAccount,
    @Body() data: TrackedRecommendationUpdateRequestDto,
  ) {
    return await this.trackedRecommendationsService.update(
      data,
      trackedRecommendationId,
    );
  }

  // DELETE /accounts/:accountId/tracked-recommendations/:trackedRecommendationId - Delete tracked recommendation (Admin only)
  @Delete(':trackedRecommendationId')
  @UseGuards(AccountAdminGuard)
  @ApiOkResponse({
    type: TrackedRecommendationEntityDto,
  })
  async deleteTrackedRecommendationById(
    @Param('trackedRecommendationId') trackedRecommendationId: string,
  ) {
    return await this.trackedRecommendationsService.delete(
      trackedRecommendationId,
    );
  }
}
