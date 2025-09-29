import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCOUNT_ID = '61c0b44e-c64c-4a4b-88b7-429e5f61fb53';
const REGION = 'us';

// Define the prompts data structure
const promptsData = {
  'gynecomastia nyc': {
    NAVIGATIONAL: [
      'Which type of doctor is best for gynecomastia?',
      'What kind of doctor should I go to for gynecomastia?',
      'Who treats male gynecomastia?',
      'Can a general surgeon do gynecomastia surgery?',
    ],
    TRANSACTIONAL: [
      'How much does gynecomastia surgery cost in NYC?',
      'How much does it cost to fix gynecomastia?',
      'How much does it cost to get rid of gynecomastia?',
      'How much does gyno surgery cost with insurance?',
      'Can I get gyno surgery for free?',
      'Can you get gyno surgery for free ?',
      'Will insurance pay for gyno?',
      'Will insurance pay for gyno surgery?',
      'Will insurance pay for gynecomastia?',
      'Will insurance pay for gyno removal?',
    ],
    COMMERCIAL: [
      'How expensive is surgery to remove gyno?',
      'Is gyno surgery worth the money?',
      'Is gyno surgery worth the cost?',
      'Why is gynecomastia so expensive?',
      'What makes gyno surgery medically necessary?',
      'What age is best for gyno surgery?',
    ],
    INFORMATIONAL: [
      'How to get gynecomastia covered by insurance?',
      'How painful is gyno surgery?',
      'Can amitriptyline cause gynecomastia?',
      'What are the red flags of gynecomastia?',
    ],
  },

  'breast reduction nyc': {
    NAVIGATIONAL: [
      'How much does a boob reduction cost in NYC?',
      'How much does a breast reduction cost in NYC?',
      'Who should not get a breast reduction?',
    ],
    TRANSACTIONAL: [
      'How much does a full breast reduction cost?',
      'Is it cheaper to get a breast lift or reduction?',
      'What qualifies a breast reduction as medically necessary?',
      'What size does insurance cover breast reduction?',
    ],
    COMMERCIAL: [
      'What happens if I lose 20 pounds after breast reduction?',
      'What is the ideal age for a boob lift?',
      'At what breast size should you get a reduction?',
      'What disqualifies you from a breast reduction?',
      'How much does a DD breast weigh?',
      'What qualifies a breast reduction as medically necessary?',
      'What is Ozempic Boob?',
      'What do I wish I knew before getting a breast reduction?',
      'Is getting a breast reduction worth it?',
      'Do you look skinnier after a breast reduction?',
    ],
    INFORMATIONAL: [
      'What is the 45 55 ratio for breast size?',
      'What is the rarest boob size?',
      'What is considered a large breast size for a woman?',
      'What is the most desired boob type?',
      'What is the 3 bra rule?',
      'What is the safest age for breast reduction?',
      'How much do DD breasts weigh?',
    ],
  },

  'breast implant removal nyc': {
    NAVIGATIONAL: [
      'Who is the best breast explant surgeon in NYC?',
      'Who is the best explant surgeon in NYC?',
      'How do I choose an explant surgeon?',
      'Will insurance pay for explant surgery?',
      'Is Dr. John Layke a real doctor?',
    ],
    TRANSACTIONAL: [
      'How much will it cost to remove breast implants?',
      'How much does it cost to remove breast implants?',
      'How much is breast implant removal and uplift?',
      'What is the average price to have breast implants removed?',
      'How much does it cost to get your breast implants taken out?',
      'Can I remove my implants without paying money?',
      'Will insurance pay to remove my breast implants?',
      'Will insurance cover the removal of breast implants?',
      'What is the total cost of breast implant removal?',
    ],
    COMMERCIAL: [
      'Does insurance cover breast implant removal?',
      'How painful is breast implant removal?',
      'How risky is breast explant surgery?',
      'Why is explant so expensive?',
      'What happens if I want to remove my breast implants?',
      'What makes a breast lift medically necessary?',
      'What is a medical necessity for breast implant removal?',
      'What is the average price to have breast implants removed?',
      'Will my breasts sag after explant?',
    ],
    INFORMATIONAL: [
      'What is a medical necessity for breast implant removal?',
      'What makes a breast lift medically necessary?',
      'How painful is breast implant removal and lift?',
      'Will I regret explant surgery?',
      'What happens if I want to remove my breast implants?',
    ],
  },
};

async function addPrompts() {
  console.log('🚀 Starting prompt addition process...\n');

  try {
    // Verify the account exists
    const account = await prisma.account.findUnique({
      where: { id: ACCOUNT_ID },
      select: { id: true, title: true },
    });

    if (!account) {
      throw new Error(`Account with ID ${ACCOUNT_ID} not found`);
    }

    console.log(`✅ Found account: ${account.title} (${account.id})\n`);

    let totalPromptsAdded = 0;
    let totalTopicsCreated = 0;

    // Process each topic
    for (const [topicName, intentGroups] of Object.entries(promptsData)) {
      console.log(`📋 Processing topic: "${topicName}"`);

      // Find or create the topic
      let topic = await prisma.topic.findFirst({
        where: {
          accountId: ACCOUNT_ID,
          name: topicName,
        },
      });

      if (!topic) {
        // Get the highest priority for this account to increment
        const highestPriorityTopic = await prisma.topic.findFirst({
          where: { accountId: ACCOUNT_ID },
          orderBy: { priority: 'desc' },
          select: { priority: true },
        });

        const nextPriority = highestPriorityTopic
          ? highestPriorityTopic.priority + 1
          : 1;

        topic = await prisma.topic.create({
          data: {
            accountId: ACCOUNT_ID,
            name: topicName,
            priority: nextPriority,
            state: 'ACTIVE',
          },
        });
        console.log(`  ✨ Created new topic with priority ${nextPriority}`);
        totalTopicsCreated++;
      } else {
        console.log(`  ℹ️  Topic already exists (ID: ${topic.id})`);
      }

      // Process each intent group
      for (const [intent, prompts] of Object.entries(intentGroups)) {
        console.log(`  📝 Adding ${prompts.length} ${intent} prompts...`);

        let addedCount = 0;
        let skippedCount = 0;

        for (const promptText of prompts) {
          // Check if prompt already exists
          const existingPrompt = await prisma.prompt.findFirst({
            where: {
              accountId: ACCOUNT_ID,
              topicId: topic.id,
              prompt: promptText,
            },
          });

          if (existingPrompt) {
            skippedCount++;
            continue;
          }

          // Create the prompt
          await prisma.prompt.create({
            data: {
              accountId: ACCOUNT_ID,
              topicId: topic.id,
              prompt: promptText,
              type: intent.toUpperCase(),
              ratingScore: 0,
              meInPrompt: false,
              regions: [REGION],
              language: 'en',
              isActive: true,
              state: 'ACTIVE',
            },
          });

          addedCount++;
          totalPromptsAdded++;
        }

        console.log(
          `    ✅ Added: ${addedCount}, Skipped (duplicates): ${skippedCount}`,
        );
      }

      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`  Topics created: ${totalTopicsCreated}`);
    console.log(`  Prompts added: ${totalPromptsAdded}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Prompt addition completed successfully!');
  } catch (error) {
    console.error('\n❌ Error adding prompts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await addPrompts();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { addPrompts };
