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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackedRecommendationsService = void 0;
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const sql_1 = require("@prisma/client/sql");
const MANUAL_TRACKED_RECOMMENDATIONS = '00000000-0000-0000-0000-000000000001';
let TrackedRecommendationsService = class TrackedRecommendationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(accountId) {
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
                    type: item.recommendation.type,
                    effectiveness: item.recommendation.effectiveness,
                    status: item.recommendation.status,
                },
                recommendationId: item.recommendationId,
            };
        });
    }
    async create(data) {
        const trackedRec = await this.prisma.trackedRecommendation.create({
            data: { ...data },
        });
        return trackedRec;
    }
    async getTrackedTrends(account) {
        const trackedRecommendations = await this.get(account.id);
        const trackIdToAnalyticsOverview = await this.getTrackedIdToOverviewAnalytics(account.id);
        return trackedRecommendations.map((tr) => {
            const analytics = trackIdToAnalyticsOverview.get(tr.id);
            const defaultAnalytics = {
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
    async update(data, id) {
        return this.prisma.trackedRecommendation.update({
            where: { id: id },
            data: { ...data },
        });
    }
    async delete(id) {
        return this.prisma.trackedRecommendation.delete({
            where: { id: id },
        });
    }
    async getTrackedIdToOverviewAnalytics(accountId) {
        const analyticsOverviewRaw = await this.prisma.$queryRawTyped((0, sql_1.getTrackedAnalytics)(accountId));
        const analytics = analyticsOverviewRaw.map((cur) => ({
            tracked_recommendation_id: cur.tracked_recommendation_id,
            last_average: Number(cur.last_average),
            new_average: Number(cur.new_average),
            trend_percentage: cur.trend_percentage === null ? null : Number(cur.trend_percentage),
            total_appearances_after_implementation: Number(cur.total_appearances_after_implementation),
        }));
        const analyticMap = new Map();
        for (const i of analytics) {
            analyticMap.set(i.tracked_recommendation_id, i);
        }
        return analyticMap;
    }
    async ensureDummyRecommendation(accountId) {
        const dummyRecommendation = await this.prisma.recommendation.upsert({
            where: { id: MANUAL_TRACKED_RECOMMENDATIONS },
            update: {},
            create: {
                id: MANUAL_TRACKED_RECOMMENDATIONS,
                accountId,
                type: 'OTHER',
                effectiveness: 'LOW',
                targetKeywords: [],
                insight: 'System-generated recommendation for tracking unlinked social media posts',
                title: '__SYSTEM_UNLINKED_POSTS__',
                description: 'Automatically tracks published posts that are not linked to a specific recommendation',
                isActive: false,
                trackable: true,
            },
        });
        return dummyRecommendation.id;
    }
    async addUrlToTrackedRecommendation(accountId, recommendationId, url) {
        let effectiveRecommendationId = recommendationId || MANUAL_TRACKED_RECOMMENDATIONS;
        const existing = await this.prisma.trackedRecommendation.findFirst({
            where: {
                accountId,
                recommendationId: effectiveRecommendationId,
            },
        });
        let updated;
        if (existing) {
            const updatedUrls = existing.urls.includes(url)
                ? existing.urls
                : [...existing.urls, url];
            updated = await this.prisma.trackedRecommendation.update({
                where: { id: existing.id },
                data: { urls: updatedUrls },
            });
        }
        else {
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
};
exports.TrackedRecommendationsService = TrackedRecommendationsService;
exports.TrackedRecommendationsService = TrackedRecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrackedRecommendationsService);
//# sourceMappingURL=tracked-insights.js.map