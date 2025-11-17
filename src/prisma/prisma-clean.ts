import { PrismaClient } from '@prisma/client';

async function clean() {
  const prisma = new PrismaClient();

  await prisma.account.deleteMany();
  await prisma.accountSettings.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.topic.deleteMany();
}

void clean();
