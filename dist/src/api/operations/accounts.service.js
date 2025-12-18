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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const errors_1 = require("../../constants/errors");
const model_enums_1 = require("../../model.enums");
const ms_1 = __importDefault(require("ms"));
const config_service_1 = require("../../config/config.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const llm_service_1 = require("./llm/llm.service");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const app_logger_service_1 = require("../../utils/app-logger.service");
const AWS = __importStar(require("aws-sdk"));
const mappers_1 = require("../../utils/mappers");
const app_error_exception_1 = require("../../exceptions/app-error.exception");
const lambda = new AWS.Lambda();
let AccountsService = class AccountsService {
    constructor(prisma, llmService, logger, configService, cacheManager) {
        this.prisma = prisma;
        this.llmService = llmService;
        this.logger = logger;
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.ADMIN_DEFAULT_LIMITS = {
            promptLimit: 25,
            regionLimit: 3,
            membersLimit: 5,
            insightLimit: 20,
            postCreationLimit: 20,
        };
        this.CACHE_KEYS = {
            GET_ACCOUNT: (id) => `${id}`,
        };
    }
    async getAllAccountsForUser(user) {
        return await this.prisma.account.findMany({
            where: user.isSystemAdmin
                ? undefined
                : {
                    id: { in: user.userAccounts.map((ua) => ua.accountId) || [] },
                },
            include: {
                accountSettings: true,
                UserAccount: true,
            },
        });
    }
    async getAccountCompetitorAlternativeNames(accountId) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            include: { accountSettings: true },
        });
        if (!account) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_NOT_FOUND);
        }
        return account.accountSettings
            ?.competitorsNames;
    }
    async updateAccountCompetitorAlternativeNames(accountId, competitorsAltNames) {
        await this.prisma.accountSettings.update({
            where: { accountId: accountId },
            data: { competitorsNames: competitorsAltNames },
        });
        for (const [key, competitors] of Object.entries(competitorsAltNames)) {
            await this.prisma.results.updateMany({
                where: {
                    accountId: accountId,
                    entity: { in: competitors },
                },
                data: {
                    entity: key,
                },
            });
        }
    }
    async markOnboardingVideoAsWatched(accountId) {
        await this.prisma.accountSettings.update({
            where: { accountId: accountId },
            data: { watchedOnboardVideo: new Date() },
        });
        return {
            message: 'Onboard video watched status updated',
        };
    }
    async processAccountOnboarding({ account, isAdminCreated = false, requestContext, }) {
        this.logger.log(`Starting account onboarding process isAdminCreated:${isAdminCreated}`, requestContext);
        try {
            if (account.status !== model_enums_1.AccountStatus.IN_PROGRESS.toString()) {
                this.logger.warn(`Account ${account.id} is not in IN_PROGRESS state, updating status to in progress`, requestContext);
                await this.prisma.account.update({
                    where: { id: account.id },
                    data: {
                        status: model_enums_1.AccountStatus.IN_PROGRESS,
                    },
                });
            }
            const dbRegion = await this.prisma.region.findUnique({
                where: {
                    name: account.accountSettings?.regions[0],
                },
            });
            if (!dbRegion) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.REGION_NOT_FOUND);
            }
            const accountData = {
                topic: '',
                prompt: '',
                about: account.about || null,
                industryCategory: account.industryCategory || null,
                subIndustryCategory: account.subIndustryCategory || null,
                keyFeatures: account.keyFeatures || null,
                toneOfVoice: account.toneOfVoice || null,
                values: account.values || null,
                personality: account.personality || null,
                language: account.language || 'english',
            };
            const accountInfo = (await this.llmService.generateSocialPostSharedBriefing(account, accountData));
            const newAccount = await this.updateAccountWithOnboardingData(account.id, accountInfo);
            newAccount.topics = await this.prisma.topic.createManyAndReturn({
                data: accountInfo.mustHighlight.map((topic) => ({
                    name: topic,
                    volume: 100,
                    priority: Math.floor(Math.random() * 10),
                    state: model_enums_1.TopicState.ACTIVE,
                    accountId: newAccount.id,
                })),
            });
            await this.createSuggestedPromptsForAccount({
                accountInfo: accountInfo.brandSummary,
                suggestedTopics: newAccount.topics,
                location: account.accountSettings?.regions[0],
                title: account.title,
                newAccount: newAccount,
            });
            return {
                createdAccount: true,
            };
        }
        catch (error) {
            await this.prisma.account.update({
                where: { id: account.id },
                data: {
                    status: model_enums_1.AccountStatus.FAILED_ONBOARDING,
                },
            });
            this.logger.error(`Error onboarding account ${account.id} ${error}`, {
                ...requestContext,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async getAccountSubscriptionsByStatus(accountId, statuses) {
        return await this.prisma.accountSubscription.findMany({
            where: {
                accountId: accountId,
                status: {
                    in: statuses,
                },
            },
        });
    }
    async fetchAccountFaviconOrLogo(siteUrl) {
        try {
            const { data: html } = await axios_1.default.get(siteUrl);
            const $ = cheerio.load(html);
            const faviconHref = $('link[rel="icon"]').attr('href');
            $('link[rel="shortcut icon"]').attr('href');
            $('link[rel="apple-touch-icon"]').attr('href');
            if (faviconHref) {
                const faviconUrl = new URL(faviconHref, siteUrl).href;
                return faviconUrl;
            }
            const logoSrc = $('img[alt="logo" i]').attr('src') ||
                $('img[class="logo" i]').attr('src') ||
                $('img[id*="logo" i]').attr('src');
            if (logoSrc) {
                const logoUrl = new URL(logoSrc, siteUrl).href;
                return logoUrl;
            }
            return new URL('/favicon.ico', siteUrl).href;
        }
        catch (error) {
            this.logger.error(`Error fetching logo: ${error.message}`);
        }
        return null;
    }
    async createSuggestedPromptsForAccount({ accountInfo, suggestedTopics, location, title, newAccount, }) {
        await this.prisma.prompt.createMany({
            data: accountInfo.prompts
                .map((prompt) => {
                const matchedTopic = suggestedTopics.find((topic) => topic.name === prompt.topic);
                if (!matchedTopic) {
                    this.logger.error(`Topic ${prompt.topic} not found in suggested topics ${suggestedTopics.map((topic) => topic.name).join(', ')}`);
                    return null;
                }
                return {
                    prompt: prompt.prompt,
                    ratingScore: 80 + Math.floor(Math.random() * 20),
                    regions: [location],
                    type: prompt.intent,
                    meInPrompt: prompt.prompt
                        .toLowerCase()
                        .includes(title.toLowerCase()),
                    topicId: matchedTopic.id,
                    volume: prompt.volume,
                    accountId: newAccount.id,
                };
            })
                .filter((entry) => entry !== null),
        });
    }
    async updateAccountWithOnboardingData(id, accountInfo) {
        const parsedKeyFeatures = accountInfo.keyFeatures.map((feature) => (0, mappers_1.parseTextWithSources)(feature).text);
        const parsedAbout = (0, mappers_1.parseTextWithSources)(accountInfo.about).text;
        return await this.prisma.account.update({
            where: { id },
            data: {
                id,
                about: parsedAbout,
                industryCategory: accountInfo.industryCategory,
                subIndustryCategory: accountInfo.subIndustryCategory,
                keyFeatures: parsedKeyFeatures,
                toneOfVoice: accountInfo.toneOfVoice,
                values: accountInfo.values,
                personality: accountInfo.personality,
                competitors: {
                    createMany: {
                        data: accountInfo.competitors.map((competitor) => ({
                            name: competitor.name,
                            site: competitor.siteUrl,
                            logo: null,
                            status: model_enums_1.CompetitorStatus.ONBOARDING,
                        })),
                    },
                },
            },
            include: {
                accountSettings: true,
                UserAccount: true,
                topics: true,
                competitors: true,
                prompts: true,
            },
        });
    }
    async createAndStartAccountOnboarding({ domain, title, location, language, user, isAdminCreated = false, referralCode, }) {
        this.logger.log('Starting account creation and onboarding process');
        domain = this.normalizeAccountDomain(domain);
        const newAccount = await this.prisma.account.create({
            data: {
                domains: [domain],
                title: title,
                status: model_enums_1.AccountStatus.IN_PROGRESS,
                language,
                isUnderAgency: user.isAgency,
                accountSettings: {
                    create: {
                        competitorsNames: {},
                        aiEngines: [
                            { name: 'OPENAI' },
                            { name: 'PERPLEXITY' },
                            { name: 'GEMINI' },
                        ],
                        regions: [location],
                        scanPeriod: 0,
                        referralCode,
                        ...(isAdminCreated ? this.ADMIN_DEFAULT_LIMITS : {}),
                    },
                },
                UserAccount: {
                    create: {
                        userId: user.id,
                        roles: [model_enums_1.UserRole.ADMIN],
                    },
                },
            },
        });
        if (isAdminCreated) {
            await this.prisma.accountSubscription.create({
                data: {
                    accountId: newAccount.id,
                    status: 'active',
                    cancelAtPeriodEnd: false,
                    quantity: 1,
                    createdBy: 'SYSTEM',
                    currentPeriodStart: new Date(),
                    stripeSubscriptionId: '',
                    stripePriceId: '',
                },
            });
        }
        this.logger.log('Account created successfully, starting onboarding lambda', {
            accountId: newAccount.id,
            accountName: newAccount.title,
        });
        const asyncJob = await this.triggerAccountOnboardingLambda(newAccount, user, isAdminCreated);
        this.logger.log('Account onboarding process completed successfully', {
            accountId: newAccount.id,
            accountName: newAccount.title,
        });
        return {
            message: 'onboarding account job created',
            jobId: asyncJob.id,
            accountId: newAccount.id,
            type: asyncJob.type,
            status: asyncJob.status,
            createdAt: asyncJob.createdAt,
        };
    }
    normalizeAccountDomain(domain) {
        return domain.replace('www.', '');
    }
    async triggerAccountOnboardingLambda(account, user, isAdminCreated) {
        this.logger.log('Creating async job for account onboarding', {
            accountId: account.id,
            accountName: account.title,
        });
        const data = {
            isAdminCreated,
        };
        const asyncJob = await this.prisma.asyncJob.create({
            data: {
                submittedBy: user.email,
                accountId: account.id,
                status: model_enums_1.AsyncJobStatus.PENDING,
                type: model_enums_1.AsyncJobType.GENERATE_ONBOARDING_INFO,
                data: data,
            },
        });
        try {
            this.logger.log('Invoking lambda function for account onboarding', {
                accountId: account.id,
                accountName: account.title,
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
            this.logger.log('Lambda function invoked successfully for onboarding', {
                accountId: account.id,
                accountName: account.title,
            });
        }
        catch (error) {
            this.logger.error('Error invoking lambda function for account onboarding', {
                accountId: account.id,
                accountName: account.title,
                error: error.message,
            });
        }
        return asyncJob;
    }
    async getAccountWithOnboardingData({ account, user, }) {
        if (!user.userAccounts || user.userAccounts.length === 0) {
            return {
                account: null,
            };
        }
        const dbAccount = await this.prisma.account.findUnique({
            where: {
                id: account.id,
                status: {
                    in: [
                        model_enums_1.AccountStatus.INITIAL,
                        model_enums_1.AccountStatus.ACTIVE,
                        model_enums_1.AccountStatus.IN_PROGRESS,
                    ],
                },
            },
            include: {
                accountSettings: true,
                competitors: true,
                topics: true,
                prompts: true,
            },
        });
        if (!dbAccount) {
            return {
                account: null,
            };
        }
        return {
            account: dbAccount,
        };
    }
    async createAccount(accountInput, user) {
        this.logger.log('Starting account creation transaction');
        return await this.prisma.$transaction(async (prismaClient) => {
            const defaultProviders = this.configService.get('DEFAULT_ACCOUNT_SETTINGS_PROVIDERS');
            const defaultRegions = this.configService.get('DEFAULT_ACCOUNT_SETTINGS_REGIONS');
            const newAccount = await prismaClient.account.create({
                data: {
                    status: model_enums_1.AccountStatus.INITIAL,
                    domains: [],
                    ...accountInput,
                    accountSettings: {
                        create: {
                            competitorsNames: {},
                            aiEngines: defaultProviders.split(',').map((provider) => ({
                                name: provider,
                            })),
                            regions: defaultRegions.split(','),
                            scanPeriod: 0,
                        },
                    },
                },
                include: {
                    accountSettings: true,
                },
            });
            await prismaClient.userAccount.create({
                data: {
                    userId: user.id,
                    accountId: newAccount.id,
                    roles: [model_enums_1.UserRole.ADMIN],
                },
            });
            this.logger.log('Account creation transaction completed successfully');
            return newAccount;
        });
    }
    async updateAccountSettingsFromSubscription(accountId, subscription, status) {
        this.logger.log('Updating account after subscription change');
        const result = await this.updateAccount({
            id: accountId,
            accountSettings: {
                update: {
                    promptLimit: subscription.promptLimit,
                    regionLimit: subscription.regionLimit,
                    scanIntervalLimit: subscription.scanIntervalLimit,
                    membersLimit: subscription.membersLimit,
                    ...(subscription.payingCustomer !== null
                        ? { payingCustomer: subscription.payingCustomer }
                        : {}),
                    insightLimit: subscription.insightLimit,
                    ...(status === model_enums_1.AccountStatus.SUSPENDED
                        ? { scanPeriod: 0 }
                        : status === model_enums_1.AccountStatus.ACTIVE
                            ? { scanPeriod: 24 }
                            : {}),
                },
            },
            status: status,
        });
        this.logger.log('Account subscription update completed successfully');
        return result;
    }
    async deleteAccount(accountId) {
        this.logger.log('Starting account removal process');
        await this.prisma.userAccount.deleteMany({
            where: { accountId: accountId },
        });
        await this.prisma.results.deleteMany({
            where: { accountId: accountId },
        });
        await this.prisma.account.delete({
            where: { id: accountId },
        });
        this.logger.log('Account removal completed successfully');
    }
    async updateAccount(accountInput) {
        try {
            this.logger.log('Starting account update process');
            if ('postGuidelines' in accountInput) {
                this.logger.log(`postGuidelines in request: ${JSON.stringify(accountInput.postGuidelines)}`);
            }
            else {
                this.logger.log('postGuidelines NOT in request');
            }
            const { accountSettings, title, ...rest } = accountInput;
            this.logger.log(`Updating account keys ${Object.keys(accountInput).join(', ')}`);
            this.logger.log(`rest object contains postGuidelines? ${'postGuidelines' in rest}`);
            if ('postGuidelines' in rest) {
                this.logger.log(`postGuidelines in rest: ${JSON.stringify(rest.postGuidelines)}`);
            }
            const currentAccount = await this.prisma.account.findUnique({
                where: { id: accountInput.id },
                include: {
                    accountSettings: true,
                },
            });
            if (!currentAccount) {
                throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_NOT_FOUND);
            }
            if (title && title !== currentAccount.title) {
                await this.migrateCompetitorNamesOnTitleChange(title, currentAccount);
            }
            const updatedAccount = await this.prisma.account.update({
                where: { id: accountInput.id },
                data: {
                    ...rest,
                    ...(title ? { title } : {}),
                    accountSettings: accountSettings
                        ? {
                            update: accountSettings.update,
                        }
                        : undefined,
                },
                include: {
                    accountSettings: true,
                },
            });
            this.logger.log(`postGuidelines after update: ${JSON.stringify(updatedAccount.postGuidelines)}`);
            await Promise.all([
                this.cacheManager.del(this.CACHE_KEYS.GET_ACCOUNT(accountInput.id)),
            ]);
            const brandbookFields = [
                'about',
                'industryCategory',
                'subIndustryCategory',
                'keyFeatures',
                'toneOfVoice',
                'values',
                'personality',
                'targetAudience',
                'knowledgeSources',
            ];
            const hasBrandbookChanges = brandbookFields.some((field) => field in rest);
            this.logger.log('Account update completed successfully');
            return updatedAccount;
        }
        catch (error) {
            this.logger.error('Error updating account', {
                error,
                stack: error.stack,
            });
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.UPDATE_FAILED);
        }
    }
    async migrateCompetitorNamesOnTitleChange(newTitle, currentAccount) {
        const jsonCompetitorsNames = currentAccount.accountSettings?.competitorsNames || {};
        if (jsonCompetitorsNames?.[currentAccount.title]) {
            jsonCompetitorsNames[newTitle] = Array.from(new Set([
                ...jsonCompetitorsNames[currentAccount.title],
                currentAccount.title,
            ]));
            delete jsonCompetitorsNames[currentAccount.title];
        }
        else {
            jsonCompetitorsNames[newTitle] = [currentAccount.title];
        }
        await Promise.all([
            await this.prisma.accountSettings.update({
                where: { accountId: currentAccount.id },
                data: {
                    competitorsNames: jsonCompetitorsNames,
                },
            }),
            await this.prisma.results.updateMany({
                where: {
                    accountId: currentAccount.id,
                    entity: currentAccount.title,
                },
                data: {
                    entity: newTitle,
                },
            }),
        ]);
    }
    async getAccountById(id, user) {
        const account = await this.prisma.account.findUnique({
            where: { id: id },
            include: {
                accountSettings: true,
            },
        });
        if (!account) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_NOT_FOUND);
        }
        return account;
    }
    async getAccountProviders(id) {
        const account = await this.prisma.account.findUnique({
            where: { id: id },
            select: {
                accountSettings: {
                    select: {
                        aiEngines: true,
                    },
                },
            },
        });
        if (!account) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_NOT_FOUND);
        }
        return account.accountSettings?.aiEngines.map((provider) => provider?.['name']);
    }
    async getAccountCompletedScans(accountId, limit, orderBy = 'desc') {
        const accountRuns = await this.prisma.scan.findMany({
            where: {
                accountId: accountId,
                OR: [
                    {
                        status: model_enums_1.RunStatus.COMPLETED,
                    },
                    {
                        tasks: {
                            every: {
                                status: model_enums_1.TaskStatus.COMPLETED,
                            },
                        },
                    },
                ],
                groupedCompetitors: true,
            },
            orderBy: {
                scheduledAt: orderBy,
            },
            take: limit,
        });
        return accountRuns;
    }
    filterScansByDateRange(runs, startDate, endDate) {
        const filtered = runs.filter((run) => {
            const runDate = new Date(run.scheduledAt);
            const isInRange = runDate >= startDate && runDate <= endDate;
            return isInRange;
        });
        return filtered;
    }
    async getAccountScansAboveThreshold(accountId, limit, orderBy = 'desc', threshold = 70) {
        const runs = await this.getAccountCompletedScans(accountId);
        const results = await this.prisma.$queryRaw `
    select count(distinct prompt) as number_of_run_prompts, run_id
    from results
    where run_id = any(array[${runs.map((run) => run.id)}]::uuid[])
    and account_id = ${accountId}::uuid
    group by run_id
    having (count(distinct prompt) / ${runs.length}::float8) * 100 >= ${threshold}
    `;
        return runs
            .filter((run) => results.find((result) => result.run_id === run.id))
            .sort((a, b) => orderBy === 'asc'
            ? a.scheduledAt.getTime() - b.scheduledAt.getTime()
            : b.scheduledAt.getTime() - a.scheduledAt.getTime())
            .slice(0, limit);
    }
    async getAllAccountScans(accountId) {
        const runs = await this.prisma.scan.findMany({
            where: { accountId: accountId },
            include: {
                tasks: true,
            },
            orderBy: {
                scheduledAt: 'desc',
            },
        });
        return runs.map((run) => ({
            ...run,
            status: run.status ??
                this.calculateScanStatusFromTasks(run.tasks),
        }));
    }
    calculateScanStatusFromTasks(tasks) {
        return (tasks.every((task) => task.status === 'COMPLETED')
            ? 'COMPLETED'
            : tasks.some((task) => task.status === 'FAILED')
                ? 'FAILED'
                : tasks.some((task) => task.status === 'IN_PROGRESS')
                    ? 'IN_PROGRESS'
                    : tasks.some((task) => task.status === 'TIMEOUT')
                        ? 'TIMEOUT'
                        : 'PENDING');
    }
    async getAccountFilterOptions(accountId) {
        const accountSettings = await this.prisma.accountSettings.findUnique({
            where: { accountId: accountId },
        });
        if (!accountSettings) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND);
        }
        let countries = [];
        if (accountSettings.regions) {
            countries = Array.from(new Set(accountSettings.regions.map((region) => region.toLowerCase())).values());
        }
        const aiEngines = accountSettings.aiEngines;
        const meInPrompt = [
            'AccountIncluded',
            'AccountNotIncluded',
        ];
        const promptTypes = Object.values(model_enums_1.PromptType);
        const topics = await this.prisma.topic.findMany({
            where: {
                accountId: accountId,
                state: model_enums_1.TopicState.ACTIVE,
            },
            select: {
                name: true,
            },
        });
        const tags = await this.prisma.tag.findMany({
            where: {
                accountId: accountId,
                deletedAt: null,
            },
            select: {
                name: true,
            },
        });
        const uniqueTagNames = Array.from(new Set(tags.map((tag) => tag.name)));
        return {
            countries: Array.from(countries),
            topics: topics.map((topic) => topic.name),
            meInPrompt,
            promptTypes,
            aiEngines: Array.isArray(aiEngines)
                ? aiEngines
                    .map((aiEngine) => aiEngine?.['name'])
                    .filter((name) => !!name)
                : [],
            tags: uniqueTagNames,
        };
    }
    async getAllAccountsWithScans() {
        const accounts = await this.prisma.account.findMany({
            include: {
                scans: {
                    include: {
                        tasks: true,
                    },
                },
                accountSettings: true,
            },
        });
        return accounts.map((account) => ({
            ...account,
            scanPeriod: account.accountSettings?.scanPeriod ?? undefined,
            scans: account.scans.map((run) => ({
                ...run,
                status: run.status ?? this.calculateScanStatusFromTasks(run.tasks),
            })),
        }));
    }
    async getAccountSettings(accountId) {
        const accountSettings = await this.prisma.accountSettings.findUnique({
            where: { accountId: accountId },
        });
        if (!accountSettings) {
            throw new app_error_exception_1.ApplicationErrorException(errors_1.ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND);
        }
        return accountSettings;
    }
    async getAllAccountsPaginated({ user, page, pageSize, }) {
        const skip = (page - 1) * pageSize;
        const [data, total] = await Promise.all([
            this.prisma.account.findMany({
                where: {
                    isUnderAgency: true,
                    UserAccount: {
                        some: {
                            userId: user.id,
                        },
                    },
                },
                skip,
                take: pageSize,
                include: {
                    accountSettings: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.account.count(),
        ]);
        return { data, total };
    }
};
exports.AccountsService = AccountsService;
__decorate([
    (0, cache_manager_1.CacheTTL)((0, ms_1.default)('5 minutes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountsService.prototype, "getAccountById", null);
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LlmService,
        app_logger_service_1.AppLogger,
        config_service_1.ConfigService,
        cache_manager_1.Cache])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map