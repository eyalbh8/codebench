"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsService = void 0;
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const tracked_insights_1 = require("./tracked-insights");
const llm_service_1 = require("./llm/llm.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const model_enums_1 = require("../../model.enums");
const AWS = __importStar(require("aws-sdk"));
const errors_1 = require("../../constants/errors");
const app_error_exception_1 = require("../../exceptions/app-error.exception");
const lambda = new AWS.Lambda();
let RecommendationsService = class RecommendationsService {
    constructor(prisma, trackedRecommendationService, llmService, logger) {
        this.prisma = prisma;
        this.trackedRecommendationService = trackedRecommendationService;
        this.llmService = llmService;
        this.logger = logger;
    }
    async getRecommendations(accountId) {
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
    async getActive(accId) {
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
    async createRecommendation(accountId, recommendation) {
        const { promptId, id, createdAt, updatedAt, deletedAt, prompt, ...recommendationData } = recommendation;
        const createdRecommendation = await this.prisma.recommendation.create({
            data: {
                ...recommendationData,
                accountId,
                promptId: promptId || null,
            },
        });
        this.logger.log(`Recommendation ${createdRecommendation.id} created, triggering Victor ingestion for account ${accountId}`);
        return createdRecommendation;
    }
    async updateRecommendation(accountId, recommendationId, recommendation) {
        const { promptId, id, createdAt, updatedAt, deletedAt, prompt, isActive, ...recommendationData } = recommendation;
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
    async deleteRecommendation(accountId, recommendationId) {
        return this.prisma.recommendation.delete({
            where: { id: recommendationId, accountId },
        });
    }
    async updateRecommendationStatus(accountId, recommendationId, status, urls) {
        const current = await this.prisma.recommendation.findUnique({
            where: { id: recommendationId, accountId },
        });
        if (!current) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.RECOMMENDATION_NOT_FOUND);
        }
        if (status === model_enums_1.RecommendationStatus.DONE && (!urls || urls.length === 0)) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.URLS_REQUIRED_FOR_DONE_STATUS);
        }
        const updated = await this.prisma.recommendation.update({
            where: { id: recommendationId, accountId },
            data: { status },
        });
        if (status === model_enums_1.RecommendationStatus.DONE) {
            const existing = await this.prisma.trackedRecommendation.findFirst({
                where: { recommendationId, accountId },
            });
            if (existing) {
                await this.trackedRecommendationService.update({ urls }, existing.id);
            }
            else {
                await this.trackedRecommendationService.create({
                    recommendation: { connect: { id: recommendationId } },
                    urls: urls,
                    account: { connect: { id: accountId } },
                });
            }
        }
        if (current.status === model_enums_1.RecommendationStatus.DONE &&
            status === model_enums_1.RecommendationStatus.IN_PROGRESS) {
            const tracked = await this.prisma.trackedRecommendation.findFirst({
                where: { recommendationId, accountId },
            });
            if (tracked) {
                await this.trackedRecommendationService.delete(tracked.id);
            }
        }
        return updated;
    }
    async getTrackedIds(accountId) {
        return await this.trackedRecommendationService
            .get(accountId)
            .then((allTracked) => allTracked
            .map((entity) => entity.recommendationId)
            .filter((id) => id !== null));
    }
    async getRemainingInsights(accountId) {
        const accountSettings = await this.prisma.accountSettings.findUnique({
            where: { accountId },
        });
        if (!accountSettings) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND);
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
        const uniqueBatches = new Set(recommendations.map((r) => r.batchId || r.id));
        const batchesThisMonth = uniqueBatches.size;
        return {
            used: batchesThisMonth,
            limit: insightLimit,
            remaining: Math.max(0, insightLimit - batchesThisMonth),
        };
    }
    async generateRecommendationsJob(account, promptId, user) {
        const inProgressJobs = await this.prisma.asyncJob.findMany({
            where: {
                accountId: account.id,
                type: model_enums_1.AsyncJobType.GENERATE_PROMPT_RECOMMENDATIONS,
                status: {
                    in: [model_enums_1.AsyncJobStatus.PENDING, model_enums_1.AsyncJobStatus.IN_PROGRESS],
                },
            },
        });
        if (inProgressJobs.length > 0) {
            return {
                message: 'job already exists',
            };
        }
        const data = {
            jobId: '',
            userEmail: '',
            accountId: account.id,
        };
        const asyncJob = await this.prisma.asyncJob.create({
            data: {
                accountId: account.id,
                status: model_enums_1.AsyncJobStatus.PENDING,
                type: model_enums_1.AsyncJobType.GENERATE_PROMPT_RECOMMENDATIONS,
                submittedBy: user.email,
                data: data,
            },
        });
        const payload = {
            jobId: asyncJob.id,
            userEmail: user.email,
            accountId: account.id,
        };
        const params = {
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
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tracked_insights_1.TrackedRecommendationsService,
        llm_service_1.LlmService,
        app_logger_service_1.AppLogger])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map