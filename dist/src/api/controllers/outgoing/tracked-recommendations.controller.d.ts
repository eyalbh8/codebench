import { RecommendationAnalyticsOverviewType, TrackedRecommendationCreationRequestDto, TrackedRecommendationEntityType, TrackedRecommendationUpdateRequestDto } from '@/api/dtos-schemes/tracked-recommendations.dto';
import { TrackedRecommendationsService } from '@/api/operations/tracked-insights';
import { PopulatedAccount } from '@/types/api';
export declare class TrackedRecommendationsController {
    private readonly trackedRecommendationsService;
    constructor(trackedRecommendationsService: TrackedRecommendationsService);
    getAllTrackedRecommendations(account: PopulatedAccount): Promise<TrackedRecommendationEntityType[]>;
    getTrackedRecommendationsAnalytics(account: PopulatedAccount): Promise<RecommendationAnalyticsOverviewType[]>;
    createTrackedRecommendation(account: PopulatedAccount, data: TrackedRecommendationCreationRequestDto): Promise<{
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    }>;
    updateTrackedRecommendationById(trackedRecommendationId: string, account: PopulatedAccount, data: TrackedRecommendationUpdateRequestDto): Promise<{
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    }>;
    deleteTrackedRecommendationById(trackedRecommendationId: string): Promise<{
        accountId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        recommendationId: string | null;
        urls: string[];
    }>;
}
