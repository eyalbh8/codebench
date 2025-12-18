"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const model_enums_1 = require("../../model.enums");
const seed_ai_settings_1 = require("./seed-ai-settings");
const seed_users_1 = require("./seed-users");
const prisma = new client_1.PrismaClient();
async function main() {
    await (0, seed_ai_settings_1.seedAiSettings)();
    await (0, seed_users_1.seedUsers)();
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
    let account;
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
    }
    else {
        account = textAccount[0];
    }
    const topic = await prisma.topic.create({
        data: {
            name: 'test-topic',
            priority: 1,
            accountId: account.id,
            state: model_enums_1.TopicState.ACTIVE,
        },
    });
    await prisma.prompt.create({
        data: {
            prompt: 'best car ranking company',
            accountId: account.id,
            topicId: topic.id,
            type: model_enums_1.PromptType.COMMERCIAL,
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
            roles: [model_enums_1.UserRole.ADMIN],
        },
    });
    await prisma.featureRequest.createMany({
        data: [
            {
                accountId: account.id,
                featureName: 'Dark Mode Theme',
                description: 'Add a dark mode theme option to improve user experience in low-light environments and reduce eye strain.',
                urgency: model_enums_1.UrgencyLevel.HIGH,
                status: model_enums_1.FeatureRequestStatus.PENDING,
            },
            {
                accountId: account.id,
                featureName: 'Advanced Analytics Dashboard',
                description: 'Create a comprehensive analytics dashboard with real-time metrics, trend analysis, and customizable reports.',
                urgency: model_enums_1.UrgencyLevel.CRITICAL,
                status: model_enums_1.FeatureRequestStatus.IN_PROGRESS,
            },
            {
                accountId: account.id,
                featureName: 'Mobile App Integration',
                description: 'Develop a mobile application that syncs with the web platform for on-the-go access to key features.',
                urgency: model_enums_1.UrgencyLevel.MID,
                status: model_enums_1.FeatureRequestStatus.PENDING,
            },
            {
                accountId: account.id,
                featureName: 'Multi-language Support',
                description: 'Implement internationalization (i18n) to support multiple languages including Spanish, French, and German.',
                urgency: model_enums_1.UrgencyLevel.LOW,
                status: model_enums_1.FeatureRequestStatus.COMPLETED,
            },
            {
                accountId: account.id,
                featureName: 'API Rate Limiting',
                description: 'Implement intelligent rate limiting for API endpoints to prevent abuse and ensure fair usage.',
                urgency: model_enums_1.UrgencyLevel.HIGH,
                status: model_enums_1.FeatureRequestStatus.FAILED,
            },
            {
                accountId: account.id,
                featureName: 'Real-time Notifications',
                description: 'Add push notifications and real-time alerts for important events and system updates.',
                urgency: model_enums_1.UrgencyLevel.MID,
                status: model_enums_1.FeatureRequestStatus.PENDING,
            },
            {
                accountId: account.id,
                featureName: 'Data Export Functionality',
                description: 'Allow users to export their data in various formats (CSV, JSON, PDF) for backup and analysis purposes.',
                urgency: model_enums_1.UrgencyLevel.LOW,
                status: model_enums_1.FeatureRequestStatus.IN_PROGRESS,
            },
            {
                accountId: account.id,
                featureName: 'Advanced Search Filters',
                description: 'Enhance search functionality with advanced filters, saved searches, and search history.',
                urgency: model_enums_1.UrgencyLevel.MID,
                status: model_enums_1.FeatureRequestStatus.PENDING,
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
//# sourceMappingURL=seed.js.map