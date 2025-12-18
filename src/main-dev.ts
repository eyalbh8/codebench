import { bootstrapApp } from './bootstrap';

async function bootstrap() {
  // Use the shared bootstrap function
  const { app } = await bootstrapApp();

  // Start the server
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI available at: http://localhost:${port}/swagger-json`);
}

void bootstrap();
