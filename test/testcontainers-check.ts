import { PostgreSqlContainer } from '@testcontainers/postgresql';

(async () => {
  const container = await new PostgreSqlContainer()
    .withDatabase('testdb')
    .withUsername('test')
    .withPassword('test')
    .start();

  console.log('✅ PostgreSQL container started at:');
  console.log('Host:', container.getHost());
  console.log('Port:', container.getPort());
  console.log('DB URL:', container.getConnectionUri());

  await container.stop();
  console.log('🧹 Container stopped and cleaned up.');
})();
