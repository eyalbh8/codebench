// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('🌱 Seeding users...');
  // Create test user
  await prisma.user.upsert({
    where: { email: 'shay@igeo.ai' },
    update: {},
    create: {
      email: 'shay@igeo.ai',
      name: 'Shay',
      isSystemAdmin: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'eyal@igeo.ai' },
    update: {},
    create: {
      email: 'eyal@igeo.ai',
      name: 'Eyal',
      isSystemAdmin: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'alexk@igeo.ai' },
    update: {},
    create: {
      email: 'alexk@igeo.ai',
      name: 'Alex',
      isSystemAdmin: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'orel@igeo.ai' },
    update: {},
    create: {
      email: 'orel@igeo.ai',
      name: 'Orel',
      isSystemAdmin: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'test-e2e@igeo.ai' },
    update: {},
    create: {
      email: 'test-e2e@igeo.ai',
      name: 'E2E User',
      isSystemAdmin: false,
    },
  });
  console.log('✅ Users seeded successfully');
}

async function main() {
  try {
    await seedUsers();
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
