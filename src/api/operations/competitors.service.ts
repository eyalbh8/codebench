import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Competitor, User } from '@prisma/client';
import { AsyncJobStatus, AsyncJobType, CompetitorStatus } from '@/model.enums';
import { Nominee } from '../dtos-schemes/common.dto';
import * as AWS from 'aws-sdk';
import { LlmService } from './llm/llm.service';
import { AppLogger } from '@/utils/app-logger.service';
import { GenerateAccountDataRequestContext } from '@/lambdas/generate-account-data-types';
import { PopulatedAccount } from '@/types/api';
const lambda = new AWS.Lambda();

@Injectable()
export class CompetitorsOperations {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
    private readonly logger: AppLogger,
  ) {}
  private readonly MIN_CANDIDATE_APPEARANCE_PERCENTAGE = 0.01;

  /**
   * Gets the competitors for an account
   * @param accountId - The id of the account to get the competitors for
   * @returns The competitors for the account
   */
  async getAllActiveCompetitors(
    account: PopulatedAccount,
  ): Promise<Competitor[]> {
    return await this.prisma.competitor.findMany({
      where: {
        accountId: account.id,
        status: CompetitorStatus.ACTIVE,
      },
    });
  }

  async createNewCompetitor(
    account: PopulatedAccount,
    competitor: Competitor,
  ): Promise<Competitor> {
    this.logger.log('Creating new competitor');

    const competitorDb = await this.prisma.competitor.create({
      data: {
        ...competitor,
        accountId: account.id,
        status: CompetitorStatus.ACTIVE,
      },
    });

    return competitorDb;
  }

  async updateCompetitorById(
    account: PopulatedAccount,
    competitorId: string,
    data: Partial<Competitor>,
  ): Promise<Competitor> {
    this.logger.log('Updating competitor by id');

    const result = await this.prisma.competitor.update({
      where: { id: competitorId },
      data: { ...data, accountId: account.id },
    });

    this.logger.log('Competitor update completed successfully');

    return result;
  }

  async deleteCompetitorById(
    account: PopulatedAccount,
    competitorId: string,
  ): Promise<Competitor> {
    this.logger.log('Deleting competitor');

    const result = await this.prisma.competitor.delete({
      where: { id: competitorId, accountId: account.id },
    });

    this.logger.log('Competitor deletion completed successfully');

    return result;
  }

  async deleteNomineeByName(account: PopulatedAccount, nominee: string) {
    this.logger.log('Deleting nominee results');

    const result = await this.prisma.results.deleteMany({
      where: { accountId: account.id, entity: nominee },
    });

    this.logger.log('Nominee deletion completed successfully');

    return result;
  }

  async getAllNominees(account: PopulatedAccount): Promise<Nominee[]> {
    const results = await this.prisma.results.groupBy({
      by: ['entity', 'companySiteUrl'],
      _count: true,
      where: { accountId: account.id },
    });
    const competitors = await this.getAllActiveCompetitors(account);

    const competitorsNames = competitors.map((competitor) => competitor.name);

    const candidates = results
      .filter((result) => !competitorsNames.includes(result.entity))
      .filter((result) => result.entity !== account.title)
      .filter(
        (result): result is typeof result & { companySiteUrl: string } =>
          result.companySiteUrl !== null,
      );

    const maxAppearances = Math.max(
      ...candidates.map((result) => result._count),
    );

    return candidates
      .filter(
        (candidate) =>
          candidate._count >
          maxAppearances * this.MIN_CANDIDATE_APPEARANCE_PERCENTAGE,
      )
      .map((candidate) => ({
        entity: candidate.entity,
        entitySiteUrl: candidate.companySiteUrl,
        count: candidate._count,
      }));
  }

  async createSuggestedMergeEntitiesJob(
    account: PopulatedAccount,
    submittedBy: string,
  ) {
    this.logger.log('Starting merge entities job creation');

    const inProgressJobs = await this.prisma.asyncJob.findMany({
      where: {
        accountId: account.id,
        type: AsyncJobType.MERGE_ENTITIES,
        status: {
          in: [AsyncJobStatus.PENDING, AsyncJobStatus.IN_PROGRESS],
        },
      },
    });
    if (inProgressJobs.length > 0) {
      const asyncJob = inProgressJobs[0];
      return {
        message: 'job already exists',
        id: asyncJob.id,
        type: asyncJob.type,
        status: asyncJob.status,
        createdAt: asyncJob.createdAt,
      };
    }

    const asyncJob = await this.prisma.asyncJob.create({
      data: {
        accountId: account.id,
        status: AsyncJobStatus.PENDING,
        type: AsyncJobType.MERGE_ENTITIES,
        submittedBy,
        data: {},
      },
    });

    const params: AWS.Lambda.InvocationRequest = {
      FunctionName: `${process.env.NODE_ENV}-generate-account-data`,
      InvocationType: 'Event',
      Payload: JSON.stringify({
        jobId: asyncJob.id,
      }),
    };

    await lambda.invoke(params).promise();

    this.logger.log('Merge entities job creation completed successfully');

    return {
      message: 'job created',
      id: asyncJob.id,
      type: asyncJob.type,
      status: asyncJob.status,
      createdAt: asyncJob.createdAt,
    };
  }

  async mergeNomineeBySiteUrl(
    account: PopulatedAccount,
    nominee: string,
    nomineeSiteUrl: string,
    entityName: string,
  ) {
    this.logger.log(
      `Merging nominee by site url ${nomineeSiteUrl} into ${entityName} updating results`,
    );
    const rowsUpdated = await this.prisma.results.updateMany({
      where: {
        accountId: account.id,
        entity: nominee,
        companySiteUrl: nomineeSiteUrl,
      },
      data: {
        entity: entityName,
      },
    });
    this.logger.log(
      `Merging nominee by site url ${nomineeSiteUrl} into ${entityName} updating results - Done`,
    );
    if (entityName === account.title) {
      this.logger.log(
        `identify my account name in prompts and set meInPrompt to true`,
      );
      const promptsUpdated = await this.prisma.prompt.updateMany({
        where: {
          accountId: account.id,
          prompt: {
            contains: nominee,
            mode: 'insensitive',
          },
        },
        data: { meInPrompt: true },
      });
      this.logger.log(`Updated ${promptsUpdated.count} prompts`);
      const accountPrompts = await this.prisma.prompt.findMany({
        where: {
          accountId: account.id,
        },
      });
      const CONCURRENCY = 5;
      this.logger.log(`Updating results for ${accountPrompts.length} prompts`);
      for (let i = 0; i < accountPrompts.length; i += CONCURRENCY) {
        const batch = accountPrompts.slice(i, i + CONCURRENCY);
        await Promise.all(
          batch.map(async (prompt) => {
            await this.prisma.results.updateMany({
              where: { promptId: prompt.id },
              data: { isCompanyInPrompt: prompt.meInPrompt },
            });
          }),
        );
      }
      this.logger.log(
        `Done updating results for ${accountPrompts.length} prompts`,
      );
    }
    return rowsUpdated;
  }
}
