import { Cache } from '@nestjs/cache-manager';
import { type Prisma, Account, AccountSettings, Scan, User, AsyncJob, AccountSubscription } from '@prisma/client';
import { AccountStatus, Provider, AsyncJobType, AsyncJobStatus } from '@/model.enums';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { OnboardedAccount, PopulatedAccount, RunWithStatus, UserWithAccounts } from '../../types/api';
import { Filters } from '../dtos-schemes/filter.dto';
import { LlmService } from './llm/llm.service';
import { AppLogger } from '@/utils/app-logger.service';
import { GenerateAccountDataRequestContext } from '@/lambdas/generate-account-data-types';
import { EntityConfigurationMapping } from '../dtos-schemes/account.scheme';
export declare class AccountsService {
    private prisma;
    private llmService;
    private readonly logger;
    private readonly configService;
    private cacheManager;
    private readonly ADMIN_DEFAULT_LIMITS;
    private CACHE_KEYS;
    constructor(prisma: PrismaService, llmService: LlmService, logger: AppLogger, configService: ConfigService, cacheManager: Cache);
    getAllAccountsForUser(user: UserWithAccounts): Promise<Account[]>;
    getAccountCompetitorAlternativeNames(accountId: string): Promise<EntityConfigurationMapping>;
    updateAccountCompetitorAlternativeNames(accountId: string, competitorsAltNames: EntityConfigurationMapping): Promise<void>;
    markOnboardingVideoAsWatched(accountId: string): Promise<{
        message: string;
    }>;
    processAccountOnboarding({ account, isAdminCreated, requestContext, }: {
        account: PopulatedAccount;
        isAdminCreated: boolean;
        requestContext: GenerateAccountDataRequestContext;
    }): Promise<{
        createdAccount: boolean;
    }>;
    getAccountSubscriptionsByStatus(accountId: string, statuses: string[]): Promise<AccountSubscription[]>;
    fetchAccountFaviconOrLogo(siteUrl: string): Promise<string | null>;
    private createSuggestedPromptsForAccount;
    private updateAccountWithOnboardingData;
    createAndStartAccountOnboarding({ domain, title, location, language, user, isAdminCreated, referralCode, }: {
        domain: string;
        title: string;
        location: string;
        language: string;
        user: UserWithAccounts;
        isAdminCreated?: boolean;
        referralCode?: string;
    }): Promise<{
        message: string;
        jobId: string;
        accountId: string;
        type: AsyncJobType;
        status: AsyncJobStatus;
        createdAt: Date;
    }>;
    private normalizeAccountDomain;
    triggerAccountOnboardingLambda(account: Account, user: UserWithAccounts, isAdminCreated: boolean): Promise<AsyncJob>;
    getAccountWithOnboardingData({ account, user, }: {
        account: Account;
        user: UserWithAccounts;
    }): Promise<{
        account: OnboardedAccount | null;
    }>;
    createAccount(accountInput: Prisma.AccountCreateInput, user: User): Promise<PopulatedAccount>;
    updateAccountSettingsFromSubscription(accountId: string, subscription: {
        customerId: string;
        promptLimit: number;
        regionLimit: number;
        scanIntervalLimit: number;
        membersLimit: number;
        payingCustomer: string | null;
        insightLimit: number;
    }, status: AccountStatus): Promise<PopulatedAccount>;
    deleteAccount(accountId: string): Promise<void>;
    updateAccount(accountInput: Prisma.AccountUpdateInput & {
        id: string;
    }): Promise<PopulatedAccount>;
    private migrateCompetitorNamesOnTitleChange;
    getAccountById(id: string, user?: UserWithAccounts): Promise<PopulatedAccount>;
    getAccountProviders(id: string): Promise<Provider[]>;
    getAccountCompletedScans(accountId: string, limit?: number, orderBy?: 'asc' | 'desc'): Promise<Scan[]>;
    filterScansByDateRange(runs: Scan[], startDate: Date, endDate: Date): Scan[];
    getAccountScansAboveThreshold(accountId: string, limit?: number, orderBy?: 'asc' | 'desc', threshold?: number): Promise<Scan[]>;
    getAllAccountScans(accountId: string): Promise<RunWithStatus[]>;
    private calculateScanStatusFromTasks;
    getAccountFilterOptions(accountId: string): Promise<Filters>;
    getAllAccountsWithScans(): Promise<Account[]>;
    getAccountSettings(accountId: string): Promise<AccountSettings>;
    getAllAccountsPaginated({ user, page, pageSize, }: {
        user: UserWithAccounts;
        page: number;
        pageSize: number;
    }): Promise<{
        data: Account[];
        total: number;
    }>;
}
