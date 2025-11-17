import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('Connected to database');
    console.log('Database bootstrap complete');
  } catch (error) {
    console.error('Error bootstrapping database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

void bootstrap();
