import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Recommendation } from '@prisma/client';
import { RecommendationDataDto } from '../dtos-schemes/recommendations.dto';
import { TrackedRecommendationsService } from './tracked-insights';
import { LlmService } from './llm/llm.service';
import { PopulatedAccount, UserWithAccounts } from '@/types/api';
import { AppLogger } from '@/utils/app-logger.service';
import {
  AsyncJobStatus,
  AsyncJobType,
  RecommendationStatus,
} from '@/model.enums';
import { GenerateAccountDataEvent } from '@/lambdas/generate-account-data-types';
import * as AWS from 'aws-sdk';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { ApplicationErrorException as AppError } from '@/exceptions/app-error.exception';

const lambda = new AWS.Lambda();

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackedRecommendationService: TrackedRecommendationsService,
    private readonly llmService: LlmService,
    private readonly logger: AppLogger,
  ) {}

  async getRecommendations(accountId: string): Promise<Recommendation[]> {
    const recommendations = await this.prisma.recommendation.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      include: {
        prompt: {
          include: {
            topic: true,
          },
        },
      },
    });

    return recommendations;
  }

  async getActive(accId: string): Promise<Recommendation[]> {
    const trackedIds = await this.getTrackedIds(accId);

    return this.prisma.recommendation.findMany({
      where: {
        accountId: accId,
        id: { notIn: trackedIds },
        publishedAt: { lte: new Date() },
      },
      include: {
        prompt: {
          include: {
            topic: true,
          },
        },
      },
    });
  }

  async createRecommendation(
    accountId: string,
    recommendation: RecommendationDataDto,
  ) {
    const {
      promptId,
      id,
      createdAt,
      updatedAt,
      deletedAt,
      prompt,
      ...recommendationData
    } = recommendation;
    const createdRecommendation = await this.prisma.recommendation.create({
      data: {
        ...recommendationData,
        accountId,
        promptId: promptId || null,
      },
    });

    // Trigger Victor ingestion for the new recommendation
    this.logger.log(
      `Recommendation ${createdRecommendation.id} created, triggering Victor ingestion for account ${accountId}`,
    );
    // Trigger asynchronously without blocking

    return createdRecommendation;
  }

  async updateRecommendation(
    accountId: string,
    recommendationId: string,
    recommendation: RecommendationDataDto,
  ) {
    const {
      promptId,
      id,
      createdAt,
      updatedAt,
      deletedAt,
      prompt,
      isActive,
      ...recommendationData
    } = recommendation;
    return this.prisma.recommendation.update({
      where: { id: recommendationId, accountId },
      data: {
        title: recommendationData.title,
        type: recommendationData.type,
        effectiveness: recommendationData.effectiveness,
        description: recommendationData.description,
        publishedAt: recommendationData.publishedAt,
        topic: recommendationData.topic,
        easyToDo: recommendationData.easyToDo,
        insight: recommendationData.insight,
        trackable: recommendationData.trackable,
        status: recommendationData.status,
        promptId: promptId || null,
      },
    });
  }

  async deleteRecommendation(accountId: string, recommendationId: string) {
    return this.prisma.recommendation.delete({
      where: { id: recommendationId, accountId },
    });
  }

  async updateRecommendationStatus(
    accountId: string,
    recommendationId: string,
    status: RecommendationStatus,
    urls?: string[],
  ) {
    const current = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId, accountId },
    });

    if (!current) {
      throw new ApplicationErrorException(ERROR_CODES.RECOMMENDATION_NOT_FOUND);
    }

    if (status === RecommendationStatus.DONE && (!urls || urls.length === 0)) {
      throw new ApplicationErrorException(
        ERROR_CODES.URLS_REQUIRED_FOR_DONE_STATUS,
      );
    }

    const updated = await this.prisma.recommendation.update({
      where: { id: recommendationId, accountId },
      data: { status },
    });

    if (status === RecommendationStatus.DONE) {
      const existing = await this.prisma.trackedRecommendation.findFirst({
        where: { recommendationId, accountId },
      });

      if (existing) {
        await this.trackedRecommendationService.update({ urls }, existing.id);
      } else {
        await this.trackedRecommendationService.create({
          recommendation: { connect: { id: recommendationId } },
          urls: urls!,
          account: { connect: { id: accountId } },
        });
      }
    }

    if (
      current.status === RecommendationStatus.DONE &&
      status === RecommendationStatus.IN_PROGRESS
    ) {
      const tracked = await this.prisma.trackedRecommendation.findFirst({
        where: { recommendationId, accountId },
      });
      if (tracked) {
        await this.trackedRecommendationService.delete(tracked.id);
      }
    }

    return updated;
  }

  async getTrackedIds(accountId: string) {
    return await this.trackedRecommendationService
      .get(accountId)
      .then(
        (allTracked) =>
          allTracked
            .map((entity) => entity.recommendationId)
            .filter((id) => id !== null) as string[],
      );
  }

  async getRemainingInsights(accountId: string): Promise<{
    used: number;
    limit: number;
    remaining: number;
  }> {
    const accountSettings = await this.prisma.accountSettings.findUnique({
      where: { accountId },
    });

    if (!accountSettings) {
      throw new ApplicationErrorException(
        ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND,
      );
    }

    const insightLimit = accountSettings.insightLimit ?? 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const recommendations = await this.prisma.recommendation.findMany({
      where: {
        accountId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      select: {
        id: true,
        batchId: true,
      },
    });

    const uniqueBatches = new Set(
      recommendations.map((r) => r.batchId || r.id),
    );
    const batchesThisMonth = uniqueBatches.size;

    return {
      used: batchesThisMonth,
      limit: insightLimit,
      remaining: Math.max(0, insightLimit - batchesThisMonth),
    };
  }

  async generateRecommendationsJob(
    account: PopulatedAccount,
    promptId: string,
    user: UserWithAccounts,
  ) {
    const inProgressJobs = await this.prisma.asyncJob.findMany({
      where: {
        accountId: account.id,
        type: AsyncJobType.GENERATE_PROMPT_RECOMMENDATIONS,
        status: {
          in: [AsyncJobStatus.PENDING, AsyncJobStatus.IN_PROGRESS],
        },
      },
    });
    if (inProgressJobs.length > 0) {
      return {
        message: 'job already exists',
      };
    }

    const data: GenerateAccountDataEvent = {
      jobId: '',
      userEmail: '',
      accountId: account.id,
    };
    const asyncJob = await this.prisma.asyncJob.create({
      data: {
        accountId: account.id,
        status: AsyncJobStatus.PENDING,
        type: AsyncJobType.GENERATE_PROMPT_RECOMMENDATIONS,
        submittedBy: user.email,
        data: data as any,
      },
    });

    const payload: GenerateAccountDataEvent = {
      jobId: asyncJob.id,
      userEmail: user.email,
      accountId: account.id,
    };
    const params: AWS.Lambda.InvocationRequest = {
      FunctionName: `${process.env.NODE_ENV}-generate-account-data`,
      InvocationType: 'Event',
      Payload: JSON.stringify(payload),
    };

    await lambda.invoke(params).promise();

    return {
      message: 'job created',
      jobId: asyncJob.id,
      type: asyncJob.type,
      status: asyncJob.status,
      createdAt: asyncJob.createdAt,
    };
  }
}
