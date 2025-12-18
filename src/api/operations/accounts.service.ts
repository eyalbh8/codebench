import { CACHE_MANAGER, Cache, CacheTTL } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@/constants/errors';
import { v4 as uuidv4 } from 'uuid';

import {
  type Prisma,
  Account,
  AccountSettings,
  Scan,
  Task,
  User,
  AsyncJob,
  Topic,
  AccountSubscription,
} from '@prisma/client';
import {
  AccountStatus,
  UserRole,
  PromptType,
  Provider,
  RunStatus,
  TaskStatus,
  TopicState,
  CompetitorStatus,
  AsyncJobType,
  AsyncJobStatus,
} from '@/model.enums';
import ms from 'ms';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  OnboardedAccount,
  PopulatedAccount,
  RunWithStatus,
  UserWithAccounts,
} from '../../types/api';
import { Filters } from '../dtos-schemes/filter.dto';
import { LlmService } from './llm/llm.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AppLogger } from '@/utils/app-logger.service';
import * as AWS from 'aws-sdk';
import { parseTextWithSources } from '@/utils/mappers';
import {
  CreateOnboardAccountEvent,
  GenerateAccountDataEvent,
  GenerateAccountDataRequestContext,
} from '@/lambdas/generate-account-data-types';
import {
  EntityConfigurationMapping,
  LlmGeneratedAccountOnboardingDataType,
} from '../dtos-schemes/account.scheme';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { AccountData } from '../dtos-schemes/agent.scheme';
import { SocialPostSharedBriefing } from '@/types/social-media';

const lambda = new AWS.Lambda();

/**
 * Service responsible for managing account operations including creation, onboarding,
 * updates, and retrieval. Handles account lifecycle from initial setup through
 * active usage, including competitor management, settings, and subscription integration.
 */
@Injectable()
export class AccountsService {
  /**
   * Default limits applied to accounts created by system administrators
   * Provides higher quotas for admin-created accounts
   */
  private readonly ADMIN_DEFAULT_LIMITS = {
    promptLimit: 25,
    regionLimit: 3,
    membersLimit: 5,
    insightLimit: 20,
    postCreationLimit: 20,
  };

  /**
   * Cache keys used for account data caching
   */
  private CACHE_KEYS = {
    GET_ACCOUNT: (id: string) => `${id}`,
  };

  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Retrieves all accounts accessible to the user
   * System admins can see all accounts, regular users only see accounts they're associated with
   * @param user - The user requesting accounts, includes account associations and admin status
   * @returns Array of accounts with their settings and user associations
   */
  async getAllAccountsForUser(user: UserWithAccounts): Promise<Account[]> {
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

  /**
   * Retrieves alternative competitor names mapping for an account
   * Returns the entity configuration mapping that maps competitor names to their alternative names
   * @param accountId - The unique identifier of the account
   * @returns Entity configuration mapping object with competitor name alternatives
   * @throws AppError if account is not found
   */
  async getAccountCompetitorAlternativeNames(
    accountId: string,
  ): Promise<EntityConfigurationMapping> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { accountSettings: true },
    });
    if (!account) {
      throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }
    return account.accountSettings
      ?.competitorsNames as EntityConfigurationMapping;
  }

  /**
   * Updates alternative competitor names mapping and migrates existing results
   * Updates the competitor names configuration and ensures all existing results
   * are updated to use the new competitor name mappings
   * @param accountId - The unique identifier of the account
   * @param competitorsAltNames - The new competitor alternative names mapping
   */
  async updateAccountCompetitorAlternativeNames(
    accountId: string,
    competitorsAltNames: EntityConfigurationMapping,
  ): Promise<void> {
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

  /**
   * Marks the onboarding video as watched for an account
   * Updates the account settings to record that the user has watched the onboarding video
   * @param accountId - The unique identifier of the account
   * @returns Success message confirming the video watch status was updated
   */
  async markOnboardingVideoAsWatched(accountId: string): Promise<{
    message: string;
  }> {
    await this.prisma.accountSettings.update({
      where: { accountId: accountId },
      data: { watchedOnboardVideo: new Date() },
    });
    return {
      message: 'Onboard video watched status updated',
    };
  }

  /**
   * Main onboarding function called by the Lambda function
   * Processes account onboarding by generating account information via LLM,
   * creating topics, prompts, and competitors. Handles both admin-created
   * and regular account onboarding flows.
   * @param account - The populated account to onboard
   * @param isAdminCreated - Whether the account was created by an admin
   * @param requestContext - Context information for the onboarding request
   * @returns Object indicating whether the account was successfully created
   * @throws Error if onboarding fails, account status is updated to FAILED_ONBOARDING
   */
  async processAccountOnboarding({
    account,
    isAdminCreated = false,
    requestContext,
  }: {
    account: PopulatedAccount;
    isAdminCreated: boolean;
    requestContext: GenerateAccountDataRequestContext;
  }): Promise<{
    createdAccount: boolean;
  }> {
    this.logger.log(
      `Starting account onboarding process isAdminCreated:${isAdminCreated}`,
      requestContext,
    );

    try {
      if (account.status !== AccountStatus.IN_PROGRESS.toString()) {
        this.logger.warn(
          `Account ${account.id} is not in IN_PROGRESS state, updating status to in progress`,
          requestContext,
        );
        await this.prisma.account.update({
          where: { id: account.id },
          data: {
            status: AccountStatus.IN_PROGRESS,
          },
        });
      }
      const dbRegion = await this.prisma.region.findUnique({
        where: {
          name: account.accountSettings?.regions[0] as string,
        },
      });
      if (!dbRegion) {
        throw new ApplicationErrorException(ERROR_CODES.REGION_NOT_FOUND);
      }
      // Build AccountData from account properties
      const accountData: AccountData = {
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

      const accountInfo =
        (await this.llmService.generateSocialPostSharedBriefing(
          account,
          accountData,
        )) as SocialPostSharedBriefing;

      const newAccount = await this.updateAccountWithOnboardingData(
        account.id,
        accountInfo as unknown as LlmGeneratedAccountOnboardingDataType,
      );

      newAccount.topics = await this.prisma.topic.createManyAndReturn({
        data: accountInfo.mustHighlight.map((topic: string) => ({
          name: topic,
          volume: 100,
          priority: Math.floor(Math.random() * 10),
          state: TopicState.ACTIVE,
          accountId: newAccount.id,
        })),
      });

      await this.createSuggestedPromptsForAccount({
        accountInfo:
          accountInfo.brandSummary as unknown as LlmGeneratedAccountOnboardingDataType,
        suggestedTopics: newAccount.topics,
        location: account.accountSettings?.regions[0] as string,
        title: account.title,
        newAccount: newAccount,
      });

      return {
        createdAccount: true,
      };
    } catch (error) {
      await this.prisma.account.update({
        where: { id: account.id },
        data: {
          status: AccountStatus.FAILED_ONBOARDING,
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

  /**
   * Retrieves account subscriptions filtered by status
   * Fetches all subscriptions for an account that match the provided status values
   * @param accountId - The unique identifier of the account
   * @param statuses - Array of subscription statuses to filter by
   * @returns Array of account subscriptions matching the status filter
   */
  async getAccountSubscriptionsByStatus(
    accountId: string,
    statuses: string[],
  ): Promise<AccountSubscription[]> {
    return await this.prisma.accountSubscription.findMany({
      where: {
        accountId: accountId,
        status: {
          in: statuses,
        },
      },
    });
  }

  /**
   * Fetches favicon or logo URL from a website
   * Attempts to extract favicon or logo from a website's HTML.
   * Tries multiple strategies: favicon links, logo images, and default favicon.ico
   * @param siteUrl - The URL of the website to extract favicon/logo from
   * @returns The URL of the favicon or logo, or null if extraction fails
   */
  async fetchAccountFaviconOrLogo(siteUrl: string): Promise<string | null> {
    try {
      const { data: html } = await axios.get(siteUrl);
      const $ = cheerio.load(html);

      // Try favicon first
      const faviconHref = $('link[rel="icon"]').attr('href');
      $('link[rel="shortcut icon"]').attr('href');
      $('link[rel="apple-touch-icon"]').attr('href');

      if (faviconHref) {
        const faviconUrl = new URL(faviconHref, siteUrl).href;
        return faviconUrl;
      }

      // Fallback: Try to find a logo image
      const logoSrc =
        $('img[alt="logo" i]').attr('src') ||
        $('img[class="logo" i]').attr('src') ||
        $('img[id*="logo" i]').attr('src');

      if (logoSrc) {
        const logoUrl = new URL(logoSrc, siteUrl).href;
        return logoUrl;
      }

      // Final fallback to default path
      return new URL('/favicon.ico', siteUrl).href;
    } catch (error) {
      this.logger.error(`Error fetching logo: ${error.message}`);
    }
    return null;
  }

  /**
   * Creates suggested prompts for a newly onboarded account
   * Generates initial prompts based on LLM-generated account information and topics.
   * Matches prompts to topics and sets default ratings and regions.
   * @param accountInfo - LLM-generated account onboarding data
   * @param suggestedTopics - Topics created during onboarding
   * @param location - Primary location/region for the account
   * @param title - Account title/name
   * @param newAccount - The newly created account entity
   */
  private async createSuggestedPromptsForAccount({
    accountInfo,
    suggestedTopics,
    location,
    title,
    newAccount,
  }: {
    accountInfo: LlmGeneratedAccountOnboardingDataType;
    suggestedTopics: Topic[];
    location: string;
    title: string;
    newAccount: Account;
  }) {
    await this.prisma.prompt.createMany({
      data: accountInfo.prompts
        .map((prompt) => {
          const matchedTopic = suggestedTopics.find(
            (topic) => topic.name === prompt.topic,
          );
          if (!matchedTopic) {
            this.logger.error(
              `Topic ${prompt.topic} not found in suggested topics ${suggestedTopics.map((topic) => topic.name).join(', ')}`,
            );
            return null;
          }

          return {
            prompt: prompt.prompt,
            ratingScore: 80 + Math.floor(Math.random() * 20),
            regions: [location],
            type: prompt.intent as PromptType,
            meInPrompt: prompt.prompt
              .toLowerCase()
              .includes(title.toLowerCase()),
            topicId: matchedTopic.id,
            volume: prompt.volume,
            accountId: newAccount.id,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    });
  }

  /**
   * Updates account with onboarding information from LLM
   * Processes and saves LLM-generated account data including about section,
   * industry categories, key features, tone of voice, values, personality, and competitors.
   * Parses text with sources to extract clean content.
   * @param id - The unique identifier of the account to update
   * @param accountInfo - LLM-generated account onboarding data
   * @returns The updated account with all related entities (settings, topics, competitors, prompts)
   */
  private async updateAccountWithOnboardingData(
    id: string,
    accountInfo: LlmGeneratedAccountOnboardingDataType,
  ): Promise<OnboardedAccount> {
    const parsedKeyFeatures = accountInfo.keyFeatures.map(
      (feature) => parseTextWithSources(feature).text,
    );
    const parsedAbout = parseTextWithSources(accountInfo.about).text;
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
              status: CompetitorStatus.ONBOARDING,
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

  /**
   * Initiates account creation and onboarding process
   * Creates a new account with initial settings, triggers Lambda function for async onboarding,
   * and sends notifications. Handles both regular and admin-created accounts.
   * @param domain - The primary domain for the account (www. prefix is removed)
   * @param title - The account/company title
   * @param location - Primary location/region
   * @param language - Account language preference
   * @param user - The user creating the account
   * @param isAdminCreated - Whether this account is created by a system admin
   * @param referralCode - Optional referral code for tracking
   * @returns Async job information including job ID, account ID, type, status, and creation timestamp
   */
  async createAndStartAccountOnboarding({
    domain,
    title,
    location,
    language,
    user,
    isAdminCreated = false,
    referralCode,
  }: {
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
  }> {
    this.logger.log('Starting account creation and onboarding process');

    domain = this.normalizeAccountDomain(domain);
    const newAccount = await this.prisma.account.create({
      data: {
        domains: [domain],
        title: title,
        status: AccountStatus.IN_PROGRESS,
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
            roles: [UserRole.ADMIN],
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

    this.logger.log(
      'Account created successfully, starting onboarding lambda',
      {
        accountId: newAccount.id,
        accountName: newAccount.title,
      },
    );

    const asyncJob: AsyncJob = await this.triggerAccountOnboardingLambda(
      newAccount,
      user,
      isAdminCreated,
    );

    this.logger.log('Account onboarding process completed successfully', {
      accountId: newAccount.id,
      accountName: newAccount.title,
    });

    return {
      message: 'onboarding account job created',
      jobId: asyncJob.id,
      accountId: newAccount.id,
      type: asyncJob.type as AsyncJobType,
      status: asyncJob.status as AsyncJobStatus,
      createdAt: asyncJob.createdAt,
    };
  }

  /**
   * Normalizes account domain by removing 'www.' prefix
   * Ensures consistent domain format across the system
   * @param domain - The domain string to normalize
   * @returns Domain string without 'www.' prefix
   */
  private normalizeAccountDomain(domain: string): string {
    return domain.replace('www.', '');
  }

  /**
   * Creates an async job and invokes Lambda function to onboard an account
   * Sets up an asynchronous job record and triggers the Lambda function for account onboarding.
   * The Lambda function will process the onboarding asynchronously.
   * @param account - The account entity to onboard
   * @param user - The user initiating the onboarding
   * @param isAdminCreated - Whether the account was created by an admin
   * @returns The created async job record
   */
  async triggerAccountOnboardingLambda(
    account: Account,
    user: UserWithAccounts,
    isAdminCreated: boolean,
  ): Promise<AsyncJob> {
    this.logger.log('Creating async job for account onboarding', {
      accountId: account.id,
      accountName: account.title,
    });

    const data: CreateOnboardAccountEvent = {
      isAdminCreated,
    };
    const asyncJob = await this.prisma.asyncJob.create({
      data: {
        submittedBy: user.email,
        accountId: account.id,
        status: AsyncJobStatus.PENDING,
        type: AsyncJobType.GENERATE_ONBOARDING_INFO,
        data: data as any,
      },
    });

    try {
      this.logger.log('Invoking lambda function for account onboarding', {
        accountId: account.id,
        accountName: account.title,
      });
      const payload: GenerateAccountDataEvent = {
        jobId: asyncJob.id,
        userEmail: user.email,
        accountId: account.id,
      };
      const params: AWS.Lambda.InvocationRequest = {
        FunctionName: `${process.env.NODE_ENV}-generate-account-data`,
        InvocationType: 'Event',
        Payload: JSON.stringify(payload),
      };

      await lambda.invoke(params).promise();
      this.logger.log('Lambda function invoked successfully for onboarding', {
        accountId: account.id,
        accountName: account.title,
      });
    } catch (error) {
      this.logger.error(
        'Error invoking lambda function for account onboarding',
        {
          accountId: account.id,
          accountName: account.title,
          error: error.message,
        },
      );
    }

    return asyncJob;
  }

  /**
   * Retrieves an onboarded account with all related data
   * Fetches account with settings, competitors, topics, and prompts.
   * Only returns accounts in INITIAL, ACTIVE, or IN_PROGRESS status.
   * @param account - The account entity to retrieve
   * @param user - The user requesting the account data
   * @returns Object containing the onboarded account or null if not found/accessible
   */
  async getAccountWithOnboardingData({
    account,
    user,
  }: {
    account: Account;
    user: UserWithAccounts;
  }): Promise<{
    account: OnboardedAccount | null;
  }> {
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
            AccountStatus.INITIAL,
            AccountStatus.ACTIVE,
            AccountStatus.IN_PROGRESS,
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
  /**
   * Creates an account and updates the user's tenants in Descope
   * @param accountInput - The account to create
   * @param user - The user creating the account
   * @returns The created account
   */
  /**
   * Creates a new account with default settings
   * Creates an account with default provider and region settings from configuration.
   * Also creates the user-account association with ADMIN role.
   * Note: Should be restricted to system admins only
   * @param accountInput - Prisma account creation input data
   * @param user - The user creating the account (will be assigned as admin)
   * @returns The created account with account settings included
   */
  async createAccount(
    accountInput: Prisma.AccountCreateInput,
    user: User,
  ): Promise<PopulatedAccount> {
    this.logger.log('Starting account creation transaction');

    return await this.prisma.$transaction(async (prismaClient) => {
      const defaultProviders = this.configService.get<string>(
        'DEFAULT_ACCOUNT_SETTINGS_PROVIDERS',
      );
      const defaultRegions = this.configService.get<string>(
        'DEFAULT_ACCOUNT_SETTINGS_REGIONS',
      );
      const newAccount = await prismaClient.account.create({
        data: {
          status: AccountStatus.INITIAL,
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
          roles: [UserRole.ADMIN],
        },
      });
      this.logger.log('Account creation transaction completed successfully');

      return newAccount;
    });
  }

  /**
   * Updates account settings and status after subscription changes
   * Applies subscription limits to account settings and updates account status.
   * Adjusts scan period based on account status (suspended = 0, active = 24 hours).
   * @param accountId - The unique identifier of the account
   * @param subscription - Subscription data containing limits and customer information
   * @param status - The new account status to apply
   * @returns The updated account with settings
   */
  async updateAccountSettingsFromSubscription(
    accountId: string,
    subscription: {
      customerId: string;
      promptLimit: number;
      regionLimit: number;
      scanIntervalLimit: number;
      membersLimit: number;
      payingCustomer: string | null;
      insightLimit: number;
    },
    status: AccountStatus,
  ): Promise<PopulatedAccount> {
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
          ...(status === AccountStatus.SUSPENDED
            ? { scanPeriod: 0 }
            : status === AccountStatus.ACTIVE
              ? { scanPeriod: 24 }
              : {}),
        },
      },
      status: status,
    });

    this.logger.log('Account subscription update completed successfully');

    return result;
  }

  /**
   * Deletes an account and all related data
   * Removes user-account associations, results, and the account itself.
   * This is a destructive operation that permanently removes all account data.
   * @param accountId - The unique identifier of the account to delete
   */
  async deleteAccount(accountId: string): Promise<void> {
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

  /**
   * Updates account information and triggers brandbook ingestion if needed
   * Updates account data and settings. If brandbook-related fields are updated,
   * triggers asynchronous Victor ingestion service to update embeddings.
   * Also handles competitor name migration when account title changes.
   * @param accountInput - Prisma account update input with account ID
   * @returns The updated account with settings
   * @throws AppError if account not found or update fails
   */
  async updateAccount(
    accountInput: Prisma.AccountUpdateInput & { id: string },
  ): Promise<PopulatedAccount> {
    try {
      this.logger.log('Starting account update process');

      // Log postGuidelines specifically
      if ('postGuidelines' in accountInput) {
        this.logger.log(
          `postGuidelines in request: ${JSON.stringify(accountInput.postGuidelines)}`,
        );
      } else {
        this.logger.log('postGuidelines NOT in request');
      }

      const { accountSettings, title, ...rest } = accountInput;
      this.logger.log(
        `Updating account keys ${Object.keys(accountInput).join(', ')}`,
      );
      this.logger.log(
        `rest object contains postGuidelines? ${'postGuidelines' in rest}`,
      );
      if ('postGuidelines' in rest) {
        this.logger.log(
          `postGuidelines in rest: ${JSON.stringify(rest.postGuidelines)}`,
        );
      }

      const currentAccount = await this.prisma.account.findUnique({
        where: { id: accountInput.id },
        include: {
          accountSettings: true,
        },
      });
      if (!currentAccount) {
        throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_NOT_FOUND);
      }

      if (title && title !== currentAccount.title) {
        await this.migrateCompetitorNamesOnTitleChange(
          title as string,
          currentAccount,
        );
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

      // Log what was actually saved
      this.logger.log(
        `postGuidelines after update: ${JSON.stringify(updatedAccount.postGuidelines)}`,
      );

      await Promise.all([
        this.cacheManager.del(this.CACHE_KEYS.GET_ACCOUNT(accountInput.id)),
      ]);

      // Check if brandbook-related fields were updated
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
      const hasBrandbookChanges = brandbookFields.some(
        (field) => field in rest,
      );

      this.logger.log('Account update completed successfully');

      return updatedAccount;
    } catch (error) {
      this.logger.error('Error updating account', {
        error,
        stack: error.stack,
      });
      throw new ApplicationErrorException(ERROR_CODES.UPDATE_FAILED);
    }
  }

  /**
   * Migrates competitor name mappings when account title changes
   * Updates the competitorsNames mapping to use the new account title as the key.
   * Also updates all existing results to use the new entity name.
   * @param newTitle - The new account title
   * @param currentAccount - The current account with existing settings
   */
  private async migrateCompetitorNamesOnTitleChange(
    newTitle: string,
    currentAccount: PopulatedAccount,
  ): Promise<void> {
    const jsonCompetitorsNames =
      currentAccount.accountSettings?.competitorsNames || {};

    if (jsonCompetitorsNames?.[currentAccount.title] as string[]) {
      jsonCompetitorsNames[newTitle] = Array.from(
        new Set([
          ...jsonCompetitorsNames[currentAccount.title],
          currentAccount.title,
        ]),
      );
      delete jsonCompetitorsNames[currentAccount.title];
    } else {
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

  /**
   * Retrieves a single account by ID with caching
   * Fetches account with settings. Results are cached for 5 minutes.
   * @param id - The unique identifier of the account
   * @param user - Optional user for access control (currently not used)
   * @returns The account with settings included
   * @throws AppError if account is not found
   */
  @CacheTTL(ms('5 minutes'))
  async getAccountById(
    id: string,
    user?: UserWithAccounts,
  ): Promise<PopulatedAccount> {
    const account = await this.prisma.account.findUnique({
      where: { id: id },
      include: {
        accountSettings: true,
      },
    });

    if (!account) {
      throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    return account;
  }

  /**
   * Gets the AI providers configured for an account
   * Retrieves the list of AI engines/providers enabled for the account
   * @param id - The unique identifier of the account
   * @returns Array of provider names configured for the account
   * @throws AppError if account is not found
   */
  async getAccountProviders(id: string): Promise<Provider[]> {
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
      throw new ApplicationErrorException(ERROR_CODES.ACCOUNT_NOT_FOUND);
    }

    return account.accountSettings?.aiEngines.map(
      (provider) => provider?.['name'] as Provider,
    ) as Provider[];
  }

  /**
   * Gets the last completed scans/runs for an account
   * Retrieves scans that are either marked as completed or have all tasks completed.
   * Only includes scans with grouped competitors.
   * @param accountId - The unique identifier of the account
   * @param limit - Optional limit on number of runs to return
   * @param orderBy - Sort order: 'asc' for oldest first, 'desc' for newest first (default)
   * @returns Array of completed scans ordered by scheduled date
   */
  async getAccountCompletedScans(
    accountId: string,
    limit?: number,
    orderBy: 'asc' | 'desc' = 'desc',
  ): Promise<Scan[]> {
    const accountRuns = await this.prisma.scan.findMany({
      where: {
        accountId: accountId,
        OR: [
          {
            status: RunStatus.COMPLETED,
          },
          {
            tasks: {
              every: {
                status: TaskStatus.COMPLETED,
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

  /**
   * Filters scans/runs by custom date range
   * Filters an array of scans to only include those scheduled within the specified date range
   * @param runs - The array of scans to filter
   * @param startDate - The start date of the range (inclusive)
   * @param endDate - The end date of the range (inclusive)
   * @returns Array of scans that fall within the specified date range
   */
  filterScansByDateRange(runs: Scan[], startDate: Date, endDate: Date): Scan[] {
    const filtered = runs.filter((run) => {
      const runDate = new Date(run.scheduledAt);
      const isInRange = runDate >= startDate && runDate <= endDate;
      return isInRange;
    });
    return filtered;
  }

  /**
   * Gets scans/runs that have passed the completion threshold
   * Calculates which scans have completed a certain percentage of prompts.
   * A scan passes the threshold if it has results for at least the threshold percentage of prompts.
   * @param accountId - The unique identifier of the account
   * @param limit - Optional limit on number of runs to return
   * @param orderBy - Sort order: 'asc' for oldest first, 'desc' for newest first (default)
   * @param threshold - Completion percentage threshold (0-100), default is 70
   * @returns Array of scans that have passed the completion threshold
   * @deprecated Currently not used, may need refactoring
   */
  async getAccountScansAboveThreshold(
    accountId: string,
    limit?: number,
    orderBy: 'asc' | 'desc' = 'desc',
    threshold: number = 70,
  ): Promise<Scan[]> {
    const runs = await this.getAccountCompletedScans(accountId);
    const results = await this.prisma.$queryRaw<
      {
        run_id: string;
        number_of_run_prompts: number;
      }[]
    >`
    select count(distinct prompt) as number_of_run_prompts, run_id
    from results
    where run_id = any(array[${runs.map((run) => run.id)}]::uuid[])
    and account_id = ${accountId}::uuid
    group by run_id
    having (count(distinct prompt) / ${runs.length}::float8) * 100 >= ${threshold}
    `;
    return runs
      .filter((run) => results.find((result) => result.run_id === run.id))
      .sort((a, b) =>
        orderBy === 'asc'
          ? a.scheduledAt.getTime() - b.scheduledAt.getTime()
          : b.scheduledAt.getTime() - a.scheduledAt.getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Gets all scans/runs for an account with computed status
   * Retrieves all scans for an account and computes their status based on task statuses
   * if the scan status is not explicitly set.
   * @param accountId - The unique identifier of the account
   * @returns Array of scans with computed status (includes tasks)
   */
  async getAllAccountScans(accountId: string): Promise<RunWithStatus[]> {
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
      status:
        (run.status as RunStatus) ??
        this.calculateScanStatusFromTasks(run.tasks),
    }));
  }

  /**
   * Determines scan/run status based on task statuses
   * Computes the overall status of a scan by analyzing its tasks:
   * - COMPLETED if all tasks are completed
   * - FAILED if any task failed
   * - IN_PROGRESS if any task is in progress
   * - TIMEOUT if any task timed out
   * - PENDING otherwise
   * @param tasks - Array of tasks associated with the scan
   * @returns The computed run status
   */
  private calculateScanStatusFromTasks(tasks: Task[]): RunStatus {
    return (
      tasks.every((task) => task.status === 'COMPLETED')
        ? 'COMPLETED'
        : tasks.some((task) => task.status === 'FAILED')
          ? 'FAILED'
          : tasks.some((task) => task.status === 'IN_PROGRESS')
            ? 'IN_PROGRESS'
            : tasks.some((task) => task.status === 'TIMEOUT')
              ? 'TIMEOUT'
              : 'PENDING'
    ) as RunStatus;
  }

  /**
   * Gets filter options available for an account
   * Retrieves all available filter values including countries, topics, prompt types,
   * AI engines, tags, and account inclusion options. Used to populate filter dropdowns.
   * @param accountId - The unique identifier of the account
   * @returns Filter options object with all available filter values
   * @throws AppError if account settings are not found
   */
  async getAccountFilterOptions(accountId: string): Promise<Filters> {
    const accountSettings = await this.prisma.accountSettings.findUnique({
      where: { accountId: accountId },
    });

    if (!accountSettings) {
      throw new ApplicationErrorException(
        ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND,
      );
    }
    let countries: string[] = [];
    if (accountSettings.regions) {
      countries = Array.from(
        new Set(
          accountSettings.regions.map((region) => region.toLowerCase()),
        ).values(),
      );
    }
    const aiEngines = accountSettings.aiEngines;

    const meInPrompt: ('AccountIncluded' | 'AccountNotIncluded')[] = [
      'AccountIncluded',
      'AccountNotIncluded',
    ];
    const promptTypes = Object.values(PromptType);

    const topics = await this.prisma.topic.findMany({
      where: {
        accountId: accountId,
        state: TopicState.ACTIVE,
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
            .filter((name): name is Provider => !!name)
        : [],
      tags: uniqueTagNames,
    };
  }

  /**
   * Gets all accounts with their associated scans/runs
   * Retrieves all accounts with their scan history and computed scan statuses.
   * Used for internal operations and reporting.
   * @returns Array of accounts with their scans and scan periods
   */
  async getAllAccountsWithScans(): Promise<Account[]> {
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

  /**
   * Gets account settings for a specific account
   * Retrieves the account settings configuration including limits, regions, providers, etc.
   * @param accountId - The unique identifier of the account
   * @returns The account settings entity
   * @throws AppError if account settings are not found
   */
  async getAccountSettings(accountId: string): Promise<AccountSettings> {
    const accountSettings = await this.prisma.accountSettings.findUnique({
      where: { accountId: accountId },
    });
    if (!accountSettings) {
      throw new ApplicationErrorException(
        ERROR_CODES.ACCOUNT_SETTINGS_NOT_FOUND,
      );
    }
    return accountSettings;
  }

  /**
   * Gets all accounts with pagination (for agency API)
   * Retrieves accounts that are under agency management and associated with the user.
   * Supports pagination for large result sets.
   * @param user - The user requesting accounts (must have agency account associations)
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of accounts per page
   * @returns Object containing paginated account data and total count
   */
  async getAllAccountsPaginated({
    user,
    page,
    pageSize,
  }: {
    user: UserWithAccounts;
    page: number;
    pageSize: number;
  }): Promise<{ data: Account[]; total: number }> {
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
}
