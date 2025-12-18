import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GetLlmCallsQueryDto } from '@/api/dtos-schemes/llm-calls.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LlmCallsOperations {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves LLM calls (prompt responses) for an account with optional filters
   * @param accountId - The account ID to filter by
   * @param queryParams - Query parameters including date range, provider, promptId, topicId, model, and purpose filters
   * @returns Array of prompt responses matching the filters
   */
  async getAccountLlmCalls(
    accountId: string,
    queryParams: GetLlmCallsQueryDto,
  ) {
    const where: Prisma.PromptResponseWhereInput = {
      accountId,
    };

    // Date range filters
    if (queryParams.startDate || queryParams.endDate) {
      where.timestamp = {};
      if (queryParams.startDate) {
        where.timestamp.gte = queryParams.startDate;
      }
      if (queryParams.endDate) {
        where.timestamp.lte = queryParams.endDate;
      }
    }

    // Provider filter
    if (queryParams.provider && queryParams.provider.length > 0) {
      where.provider = {
        in: queryParams.provider,
      };
    }

    // Prompt ID filter
    if (queryParams.promptId && queryParams.promptId.length > 0) {
      where.promptId = {
        in: queryParams.promptId,
      };
    }

    // Topic ID filter
    if (queryParams.topicId && queryParams.topicId.length > 0) {
      where.topicId = {
        in: queryParams.topicId,
      };
    }

    // Model filter
    if (queryParams.model && queryParams.model.length > 0) {
      where.model = {
        in: queryParams.model,
      };
    }

    // Purpose filter
    if (queryParams.purpose && queryParams.purpose.length > 0) {
      where.purpose = {
        in: queryParams.purpose,
      };
    }

    const [promptResponses, totalCount] = await Promise.all([
      this.prisma.promptResponse.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
      }),
      this.prisma.promptResponse.count({ where }),
    ]);

    return {
      data: promptResponses,
      totalCount,
    };
  }
}
