// prisma/seed.ts
import { Account, PrismaClient } from '@prisma/client';
import {
  UserRole,
  UrgencyLevel,
  FeatureRequestStatus,
  TopicState,
  PromptType,
} from '../../model.enums';
import { seedAiSettings } from './seed-ai-settings';
import { seedUsers } from './seed-users';

const prisma = new PrismaClient();

async function main() {
  await seedAiSettings();
  await seedUsers();
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test-e2e@igeo.ai' },
    update: {},
    create: {
      email: 'test-e2e@igeo.ai',
      name: 'E2E User',
      isSystemAdmin: false,
    },
  });

  const testAccountTitle = 'account-e2e';
  const textAccount = await prisma.account.findFirst({
    where: { title: testAccountTitle },
  });

  let account: Account;

  if (!textAccount) {
    account = await prisma.account.create({
      data: {
        title: 'account-e2e',
        status: 'ACTIVE',
        domains: ['test.igeo.ai'],
        accountSettings: {
          create: {
            aiEngines: [{ name: 'BD_GOOGLE_AI_MODE' }],
            competitorsNames: ['igeo.ai'],
            scanPeriod: 0,
            regions: ['us', 'il'],
          },
        },
      },
    });
  } else {
    account = textAccount[0];
  }
  // Create test account

  const topic = await prisma.topic.create({
    data: {
      name: 'test-topic',
      priority: 1,
      accountId: account.id,
      state: TopicState.ACTIVE,
    },
  });

  await prisma.prompt.create({
    data: {
      prompt: 'best car ranking company',
      accountId: account.id,
      topicId: topic.id,
      type: PromptType.COMMERCIAL,
      ratingScore: 1,
      meInPrompt: true,
    },
  });

  await prisma.userAccount.upsert({
    where: { userId_accountId: { userId: user.id, accountId: account.id } },
    update: {},
    create: {
      userId: user.id,
      accountId: account.id,
      roles: [UserRole.ADMIN],
    },
  });

  // Create sample feature requests
  await prisma.featureRequest.createMany({
    data: [
      {
        accountId: account.id,
        featureName: 'Dark Mode Theme',
        description:
          'Add a dark mode theme option to improve user experience in low-light environments and reduce eye strain.',
        urgency: UrgencyLevel.HIGH,
        status: FeatureRequestStatus.PENDING,
      },
      {
        accountId: account.id,
        featureName: 'Advanced Analytics Dashboard',
        description:
          'Create a comprehensive analytics dashboard with real-time metrics, trend analysis, and customizable reports.',
        urgency: UrgencyLevel.CRITICAL,
        status: FeatureRequestStatus.IN_PROGRESS,
      },
      {
        accountId: account.id,
        featureName: 'Mobile App Integration',
        description:
          'Develop a mobile application that syncs with the web platform for on-the-go access to key features.',
        urgency: UrgencyLevel.MID,
        status: FeatureRequestStatus.PENDING,
      },
      {
        accountId: account.id,
        featureName: 'Multi-language Support',
        description:
          'Implement internationalization (i18n) to support multiple languages including Spanish, French, and German.',
        urgency: UrgencyLevel.LOW,
        status: FeatureRequestStatus.COMPLETED,
      },
      {
        accountId: account.id,
        featureName: 'API Rate Limiting',
        description:
          'Implement intelligent rate limiting for API endpoints to prevent abuse and ensure fair usage.',
        urgency: UrgencyLevel.HIGH,
        status: FeatureRequestStatus.FAILED,
      },
      {
        accountId: account.id,
        featureName: 'Real-time Notifications',
        description:
          'Add push notifications and real-time alerts for important events and system updates.',
        urgency: UrgencyLevel.MID,
        status: FeatureRequestStatus.PENDING,
      },
      {
        accountId: account.id,
        featureName: 'Data Export Functionality',
        description:
          'Allow users to export their data in various formats (CSV, JSON, PDF) for backup and analysis purposes.',
        urgency: UrgencyLevel.LOW,
        status: FeatureRequestStatus.IN_PROGRESS,
      },
      {
        accountId: account.id,
        featureName: 'Advanced Search Filters',
        description:
          'Enhance search functionality with advanced filters, saved searches, and search history.',
        urgency: UrgencyLevel.MID,
        status: FeatureRequestStatus.PENDING,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
