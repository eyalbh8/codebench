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
exports.LambdaOperations = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_logger_service_1 = require("../../utils/app-logger.service");
const config_service_1 = require("../../config/config.service");
const model_enums_1 = require("../../model.enums");
let LambdaOperations = class LambdaOperations {
    constructor(httpService, prisma, configurationService, logger) {
        this.httpService = httpService;
        this.prisma = prisma;
        this.configurationService = configurationService;
        this.logger = logger;
    }
    async checkScanRunStatus(accountId) {
        const lastAccountRun = await this.prisma.scan.findFirst({
            where: { accountId: accountId },
            orderBy: { createdAt: 'desc' },
        });
        let doScan = true;
        if (lastAccountRun && lastAccountRun.status === model_enums_1.RunStatus.COMPLETED) {
            const MAX_INTERVAL_BETWEEN_SCANS = 24;
            const maxIntervalBetweenScans = parseInt(this.configurationService.get('MAX_INTERVAL_BETWEEN_SCANS', MAX_INTERVAL_BETWEEN_SCANS.toString()), 10);
            const maxIntervalBetweenScansInMilliseconds = maxIntervalBetweenScans * 60 * 60 * 1000;
            this.logger.log(`Max interval between scans: ${maxIntervalBetweenScans} hours`);
            doScan =
                lastAccountRun.createdAt.getTime() +
                    maxIntervalBetweenScansInMilliseconds <
                    Date.now();
        }
        if (doScan) {
            return true;
        }
        return false;
    }
};
exports.LambdaOperations = LambdaOperations;
exports.LambdaOperations = LambdaOperations = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        prisma_service_1.PrismaService,
        config_service_1.ConfigService,
        app_logger_service_1.AppLogger])
], LambdaOperations);
//# sourceMappingURL=lambda.service.js.map