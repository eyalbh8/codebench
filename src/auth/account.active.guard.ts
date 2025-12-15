import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRequest } from '../types/api';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACTIVE_ACCOUNT_SUBSCRIPTION_STATE,
  ACTIVE_ACCOUNT_SUBSCRIPTION_STATES,
  TRIALING_ACCOUNT_SUBSCRIPTION_STATE,
} from '@/constants/app';
import { AppLogger } from '@/utils/app-logger.service';
import { AccountStatus, AccountSubscriptionStatus } from '@/model.enums';
import { Account, AccountSubscription } from '@prisma/client';

@Injectable()
export class AccountActiveGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return await this.validateRequest(request);
  }

  async validateRequest(request: AuthRequest): Promise<boolean> {
    if (request.user.isSystemAdmin) return true;

    const account = request.account;
    if (!account) {
      this.logger.error(`AccountActiveGuard - Account not found in request`);
      return false;
    }

    if (account.status != AccountStatus.ACTIVE.toString()) {
      return false;
    }
    if (account.isUnderAgency) return true;

    const subscriptions = await this.prismaService.accountSubscription.findMany(
      {
        where: {
          accountId: account.id,
          status: {
            in: ACTIVE_ACCOUNT_SUBSCRIPTION_STATES,
          },
        },
      },
    );
    if (subscriptions.length === 0) {
      this.logger.error(
        `AccountActiveGuard - Account has no active subscriptions`,
      );
      return false;
    }
    const activeSubscriptions = subscriptions.filter(
      (subscription) =>
        subscription.status === ACTIVE_ACCOUNT_SUBSCRIPTION_STATE,
    );
    if (activeSubscriptions.length > 0) {
      let hasActiveSubscription = false;
      for (const activeSubscription of activeSubscriptions) {
        if (
          activeSubscription.cancelAt &&
          activeSubscription.cancelAt < new Date()
        ) {
          this.logger.log(
            `Account ${account.id} has an active subscription but the cancel date is in the past`,
            {
              accountId: account.id,
              subscriptionId: activeSubscription.id,
            },
          );
          await this.prismaService.accountSubscription.update({
            where: { id: activeSubscription.id },
            data: {
              status: AccountSubscriptionStatus.CANCELLED.toString(),
              endDate: new Date(),
            },
          });
        } else {
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

  private async handleTrialSubscriptions(
    subscriptions: AccountSubscription[],
    account: Account,
  ) {
    const trialingSubscriptions = subscriptions.filter(
      (subscription) =>
        subscription.status === TRIALING_ACCOUNT_SUBSCRIPTION_STATE,
    );
    const trialSubscriptionsActive: boolean[] = [];
    if (trialingSubscriptions.length > 0) {
      for (const trialingSubscription of trialingSubscriptions) {
        if (
          trialingSubscription.cancelAt &&
          trialingSubscription.cancelAt < new Date()
        ) {
          this.logger.error(
            `Account ${account.id} has a trialing subscription but the trial end date is in the past. 
            updating status to cancelled. trialingSubscription.cancelAt: ${trialingSubscription.cancelAt.toISOString()}`,
            {
              accountId: account.id,
              subscriptionId: trialingSubscription.id,
            },
          );
          await this.prismaService.accountSubscription.update({
            where: { id: trialingSubscription.id },
            data: {
              status: AccountSubscriptionStatus.CANCELLED.toString(),
              endDate: new Date(),
            },
          });
          trialSubscriptionsActive.push(false);
          continue;
        } else {
          trialSubscriptionsActive.push(true);
          continue;
        }
      }
    }

    const someTrialSubscriptionsActive = trialSubscriptionsActive.some(
      (active) => active,
    );
    if (
      !someTrialSubscriptionsActive &&
      account.status === AccountStatus.ACTIVE.toString()
    ) {
      this.logger.error(
        `Account ${account.id} has no trial subscriptions active, updating status to cancelled`,
        {
          accountId: account.id,
        },
      );
      await this.prismaService.account.update({
        where: { id: account.id },
        data: { status: AccountStatus.CANCELLED },
      });
    }

    return someTrialSubscriptionsActive;
  }
}
