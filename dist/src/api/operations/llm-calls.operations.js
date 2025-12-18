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
exports.LlmCallsOperations = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LlmCallsOperations = class LlmCallsOperations {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAccountLlmCalls(accountId, queryParams) {
        const where = {
            accountId,
        };
        if (queryParams.startDate || queryParams.endDate) {
            where.timestamp = {};
            if (queryParams.startDate) {
                where.timestamp.gte = queryParams.startDate;
            }
            if (queryParams.endDate) {
                where.timestamp.lte = queryParams.endDate;
            }
        }
        if (queryParams.provider && queryParams.provider.length > 0) {
            where.provider = {
                in: queryParams.provider,
            };
        }
        if (queryParams.promptId && queryParams.promptId.length > 0) {
            where.promptId = {
                in: queryParams.promptId,
            };
        }
        if (queryParams.topicId && queryParams.topicId.length > 0) {
            where.topicId = {
                in: queryParams.topicId,
            };
        }
        if (queryParams.model && queryParams.model.length > 0) {
            where.model = {
                in: queryParams.model,
            };
        }
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
};
exports.LlmCallsOperations = LlmCallsOperations;
exports.LlmCallsOperations = LlmCallsOperations = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LlmCallsOperations);
//# sourceMappingURL=llm-calls.operations.js.map