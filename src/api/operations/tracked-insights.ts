import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Account, type Prisma, TrackedRecommendation } from '@prisma/client';
import {
  RecommendationImplementationAnalyticsType as Analytics,
  TrackedRecommendationWithFullRecommendationDto,
  RecommendationAnalyticsOverviewType as AnalyticsOverview,
} from '../dtos-schemes/tracked-recommendations.dto';
import { getTrackedAnalytics } from '@prisma/client/sql';
import { RecommendationStatus } from '@/model.enums';

// Special UUID to identify dummy recommendation for posts without recommendationId
const MANUAL_TRACKED_RECOMMENDATIONS = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class TrackedRecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(
    accountId: string,
  ): Promise<TrackedRecommendationWithFullRecommendationDto[]> {
    const result = await this.prisma.trackedRecommendation.findMany({
      where: { accountId: accountId },
      include: {
        recommendation: {
          include: {
            prompt: {
              include: {
                topic: true,
              },
            },
          },
        },
      },
    });

    return result.map((item) => {
      if (item.recommendation === null) {
        return {
          ...item,
          recommendation: null,
          recommendationId: item.recommendationId,
        };
      }

      return {
        ...item,
        recommendation: {
          ...item.recommendation,
          description: item.recommendation.description || '',
          title: item.recommendation.title || '',
          type: item.recommendation.type as any,
          effectiveness: item.recommendation.effectiveness as any,
          status: item.recommendation.status as RecommendationStatus,
        },
        recommendationId: item.recommendationId,
      };
    });
  }

  async create(
    data: Prisma.TrackedRecommendationCreateInput,
  ): Promise<TrackedRecommendation> {
    const trackedRec = await this.prisma.trackedRecommendation.create({
      data: { ...data },
    });

    return trackedRec;
  }

  async getTrackedTrends(account: Account): Promise<AnalyticsOverview[]> {
    const trackedRecommendations = await this.get(account.id);

    const trackIdToAnalyticsOverview =
      await this.getTrackedIdToOverviewAnalytics(account.id);

    return trackedRecommendations.map((tr) => {
      const analytics = trackIdToAnalyticsOverview.get(tr.id);

      // Provide default analytics if not found
      const defaultAnalytics: Analytics = {
        tracked_recommendation_id: tr.id,
        last_average: null,
        new_average: null,
        trend_percentage: null,
        total_appearances_after_implementation: 0,
      };

      return {
        tracked: {
          id: tr.id,
          recommendationId: tr.recommendationId,
          accountId: tr.accountId,
          createdAt: tr.createdAt,
          updatedAt: tr.updatedAt,
          urls: tr.urls,
        },
        recommendation: tr.recommendation,
        analytics: analytics || defaultAnalytics,
      };
    });
  }

  async update(
    data: Prisma.TrackedRecommendationUpdateInput,
    id: string,
  ): Promise<TrackedRecommendation> {
    return this.prisma.trackedRecommendation.update({
      where: { id: id },
      data: { ...data },
    });
  }

  async delete(id: string): Promise<TrackedRecommendation> {
    return this.prisma.trackedRecommendation.delete({
      where: { id: id },
    });
  }

  async getTrackedIdToOverviewAnalytics(
    accountId: string,
  ): Promise<Map<string, Analytics>> {
    const analyticsOverviewRaw = await this.prisma.$queryRawTyped(
      getTrackedAnalytics(accountId),
    );
    const analytics: Analytics[] = analyticsOverviewRaw.map((cur) => ({
      tracked_recommendation_id: cur.tracked_recommendation_id,
      last_average: Number(cur.last_average),
      new_average: Number(cur.new_average),
      trend_percentage:
        cur.trend_percentage === null ? null : Number(cur.trend_percentage),
      total_appearances_after_implementation: Number(
        cur.total_appearances_after_implementation,
      ),
    }));

    const analyticMap = new Map<string, Analytics>();
    for (const i of analytics) {
      analyticMap.set(i.tracked_recommendation_id, i);
    }

    return analyticMap;
  }

  private async ensureDummyRecommendation(accountId: string): Promise<string> {
    const dummyRecommendation = await this.prisma.recommendation.upsert({
      where: { id: MANUAL_TRACKED_RECOMMENDATIONS },
      update: {},
      create: {
        id: MANUAL_TRACKED_RECOMMENDATIONS,
        accountId,
        type: 'OTHER',
        effectiveness: 'LOW',
        targetKeywords: [],
        insight:
          'System-generated recommendation for tracking unlinked social media posts',
        title: '__SYSTEM_UNLINKED_POSTS__',
        description:
          'Automatically tracks published posts that are not linked to a specific recommendation',
        isActive: false,
        trackable: true,
      },
    });
    return dummyRecommendation.id;
  }

  async addUrlToTrackedRecommendation(
    accountId: string,
    recommendationId: string | null | undefined,
    url: string,
  ): Promise<TrackedRecommendation> {
    // Use recommendation ID if provided, otherwise use MANUAL_TRACKED_RECOMMENDATIONS
    let effectiveRecommendationId =
      recommendationId || MANUAL_TRACKED_RECOMMENDATIONS;

    // Find existing TrackedRecommendation by accountId and recommendationId
    const existing = await this.prisma.trackedRecommendation.findFirst({
      where: {
        accountId,
        recommendationId: effectiveRecommendationId,
      },
    });

    let updated: TrackedRecommendation;

    if (existing) {
      // Append URL to existing urls array (avoid duplicates)
      const updatedUrls = existing.urls.includes(url)
        ? existing.urls
        : [...existing.urls, url];

      updated = await this.prisma.trackedRecommendation.update({
        where: { id: existing.id },
        data: { urls: updatedUrls },
      });
    } else {
      // Create new TrackedRecommendation
      updated = await this.prisma.trackedRecommendation.create({
        data: {
          accountId,
          recommendationId: effectiveRecommendationId,
          urls: [url],
        },
      });
    }

    return updated;
  }
}
