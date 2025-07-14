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
exports.AccountActiveGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const app_1 = require("../constants/app");
const app_logger_service_1 = require("../utils/app-logger.service");
const model_enums_1 = require("../model.enums");
let AccountActiveGuard = class AccountActiveGuard {
    constructor(prismaService, logger) {
        this.prismaService = prismaService;
        this.logger = logger;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        return await this.validateRequest(request);
    }
    async validateRequest(request) {
        if (request.user.isSystemAdmin)
            return true;
        const account = request.account;
        if (!account) {
            this.logger.error(`AccountActiveGuard - Account not found in request`);
            return false;
        }
        if (account.status != model_enums_1.AccountStatus.ACTIVE.toString()) {
            return false;
        }
        if (account.isUnderAgency)
            return true;
        const subscriptions = await this.prismaService.accountSubscription.findMany({
            where: {
                accountId: account.id,
                status: {
                    in: app_1.ACTIVE_ACCOUNT_SUBSCRIPTION_STATES,
                },
            },
        });
        if (subscriptions.length === 0) {
            this.logger.error(`AccountActiveGuard - Account has no active subscriptions`);
            return false;
        }
        const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === app_1.ACTIVE_ACCOUNT_SUBSCRIPTION_STATE);
        if (activeSubscriptions.length > 0) {
            let hasActiveSubscription = false;
            for (const activeSubscription of activeSubscriptions) {
                if (activeSubscription.cancelAt &&
                    activeSubscription.cancelAt < new Date()) {
                    this.logger.log(`Account ${account.id} has an active subscription but the cancel date is in the past`, {
                        accountId: account.id,
                        subscriptionId: activeSubscription.id,
                    });
                    await this.prismaService.accountSubscription.update({
                        where: { id: activeSubscription.id },
                        data: {
                            status: model_enums_1.AccountSubscriptionStatus.CANCELLED.toString(),
                            endDate: new Date(),
                        },
                    });
                }
                else {
                    hasActiveSubscription = true;
                }
            }
            if (hasActiveSubscription) {
                return true;
            }
        }
        await this.handleTrialSubscriptions(subscriptions, account);
        return true;
    }
    async handleTrialSubscriptions(subscriptions, account) {
        const trialingSubscriptions = subscriptions.filter((subscription) => subscription.status === app_1.TRIALING_ACCOUNT_SUBSCRIPTION_STATE);
        const trialSubscriptionsActive = [];
        if (trialingSubscriptions.length > 0) {
            for (const trialingSubscription of trialingSubscriptions) {
                if (trialingSubscription.cancelAt &&
                    trialingSubscription.cancelAt < new Date()) {
                    this.logger.error(`Account ${account.id} has a trialing subscription but the trial end date is in the past. 
            updating status to cancelled. trialingSubscription.cancelAt: ${trialingSubscription.cancelAt.toISOString()}`, {
                        accountId: account.id,
                        subscriptionId: trialingSubscription.id,
                    });
                    await this.prismaService.accountSubscription.update({
                        where: { id: trialingSubscription.id },
                        data: {
                            status: model_enums_1.AccountSubscriptionStatus.CANCELLED.toString(),
                            endDate: new Date(),
                        },
                    });
                    trialSubscriptionsActive.push(false);
                    continue;
                }
                else {
                    trialSubscriptionsActive.push(true);
                    continue;
                }
            }
        }
        const someTrialSubscriptionsActive = trialSubscriptionsActive.some((active) => active);
        if (!someTrialSubscriptionsActive &&
            account.status === model_enums_1.AccountStatus.ACTIVE.toString()) {
            this.logger.error(`Account ${account.id} has no trial subscriptions active, updating status to cancelled`, {
                accountId: account.id,
            });
            await this.prismaService.account.update({
                where: { id: account.id },
                data: { status: model_enums_1.AccountStatus.CANCELLED },
            });
        }
        return someTrialSubscriptionsActive;
    }
};
exports.AccountActiveGuard = AccountActiveGuard;
exports.AccountActiveGuard = AccountActiveGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger])
], AccountActiveGuard);
//# sourceMappingURL=account.active.guard.js.map