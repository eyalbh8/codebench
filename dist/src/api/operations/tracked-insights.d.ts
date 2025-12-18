import { PrismaService } from '@/prisma/prisma.service';
import { Account, type Prisma, TrackedRecommendation } from '@prisma/client';
import { RecommendationImplementationAnalyticsType as Analytics, TrackedRecommendationWithFullRecommendationDto, RecommendationAnalyticsOverviewType as AnalyticsOverview } from '../dtos-schemes/tracked-recommendations.dto';
export declare class TrackedRecommendationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    get(accountId: string): Promise<TrackedRecommendationWithFullRecommendationDto[]>;
    create(data: Prisma.TrackedRecommendationCreateInput): Promise<TrackedRecommendation>;
    getTrackedTrends(account: Account): Promise<AnalyticsOverview[]>;
    update(data: Prisma.TrackedRecommendationUpdateInput, id: string): Promise<TrackedRecommendation>;
    delete(id: string): Promise<TrackedRecommendation>;
    getTrackedIdToOverviewAnalytics(accountId: string): Promise<Map<string, Analytics>>;
    private ensureDummyRecommendation;
    addUrlToTrackedRecommendation(accountId: string, recommendationId: string | null | undefined, url: string): Promise<TrackedRecommendation>;
}
