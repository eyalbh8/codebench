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
exports.CompetitorsOperations = void 0;
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const model_enums_1 = require("../../model.enums");
const AWS = __importStar(require("aws-sdk"));
const llm_service_1 = require("./llm/llm.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const lambda = new AWS.Lambda();
let CompetitorsOperations = class CompetitorsOperations {
    constructor(prisma, llmService, logger) {
        this.prisma = prisma;
        this.llmService = llmService;
        this.logger = logger;
        this.MIN_CANDIDATE_APPEARANCE_PERCENTAGE = 0.01;
    }
    async getAllActiveCompetitors(account) {
        return await this.prisma.competitor.findMany({
            where: {
                accountId: account.id,
                status: model_enums_1.CompetitorStatus.ACTIVE,
            },
        });
    }
    async createNewCompetitor(account, competitor) {
        this.logger.log('Creating new competitor');
        const competitorDb = await this.prisma.competitor.create({
            data: {
                ...competitor,
                accountId: account.id,
                status: model_enums_1.CompetitorStatus.ACTIVE,
            },
        });
        return competitorDb;
    }
    async updateCompetitorById(account, competitorId, data) {
        this.logger.log('Updating competitor by id');
        const result = await this.prisma.competitor.update({
            where: { id: competitorId },
            data: { ...data, accountId: account.id },
        });
        this.logger.log('Competitor update completed successfully');
        return result;
    }
    async deleteCompetitorById(account, competitorId) {
        this.logger.log('Deleting competitor');
        const result = await this.prisma.competitor.delete({
            where: { id: competitorId, accountId: account.id },
        });
        this.logger.log('Competitor deletion completed successfully');
        return result;
    }
    async deleteNomineeByName(account, nominee) {
        this.logger.log('Deleting nominee results');
        const result = await this.prisma.results.deleteMany({
            where: { accountId: account.id, entity: nominee },
        });
        this.logger.log('Nominee deletion completed successfully');
        return result;
    }
    async getAllNominees(account) {
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
            .filter((result) => result.companySiteUrl !== null);
        const maxAppearances = Math.max(...candidates.map((result) => result._count));
        return candidates
            .filter((candidate) => candidate._count >
            maxAppearances * this.MIN_CANDIDATE_APPEARANCE_PERCENTAGE)
            .map((candidate) => ({
            entity: candidate.entity,
            entitySiteUrl: candidate.companySiteUrl,
            count: candidate._count,
        }));
    }
    async createSuggestedMergeEntitiesJob(account, submittedBy) {
        this.logger.log('Starting merge entities job creation');
        const inProgressJobs = await this.prisma.asyncJob.findMany({
            where: {
                accountId: account.id,
                type: model_enums_1.AsyncJobType.MERGE_ENTITIES,
                status: {
                    in: [model_enums_1.AsyncJobStatus.PENDING, model_enums_1.AsyncJobStatus.IN_PROGRESS],
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
                status: model_enums_1.AsyncJobStatus.PENDING,
                type: model_enums_1.AsyncJobType.MERGE_ENTITIES,
                submittedBy,
                data: {},
            },
        });
        const params = {
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
    async mergeNomineeBySiteUrl(account, nominee, nomineeSiteUrl, entityName) {
        this.logger.log(`Merging nominee by site url ${nomineeSiteUrl} into ${entityName} updating results`);
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
        this.logger.log(`Merging nominee by site url ${nomineeSiteUrl} into ${entityName} updating results - Done`);
        if (entityName === account.title) {
            this.logger.log(`identify my account name in prompts and set meInPrompt to true`);
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
                await Promise.all(batch.map(async (prompt) => {
                    await this.prisma.results.updateMany({
                        where: { promptId: prompt.id },
                        data: { isCompanyInPrompt: prompt.meInPrompt },
                    });
                }));
            }
            this.logger.log(`Done updating results for ${accountPrompts.length} prompts`);
        }
        return rowsUpdated;
    }
};
exports.CompetitorsOperations = CompetitorsOperations;
exports.CompetitorsOperations = CompetitorsOperations = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LlmService,
        app_logger_service_1.AppLogger])
], CompetitorsOperations);
//# sourceMappingURL=competitors.service.js.map