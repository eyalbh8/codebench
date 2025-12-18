// test/test-setup.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;

beforeAll(async () => {
  container = await new PostgreSqlContainer()
    .withDatabase('testdb')
    .withUsername('test')
    .withPassword('test')
    .start();

  const dbUrl = container.getConnectionUri();
  process.env.DATABASE_URL = dbUrl;

  console.log('🌱 DATABASE_URL set to:', dbUrl);

  // Run migrations into the new container DB
  execSync('npx prisma migrate deploy', {
    env: { ...process.env },
    stdio: 'inherit',
  });

  console.log('DB SEED to:', dbUrl);
  // Optionally run seed
  execSync('npx prisma db seed', {
    env: { ...process.env },
    stdio: 'inherit',
  });

  prisma = new PrismaClient();
});

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});
