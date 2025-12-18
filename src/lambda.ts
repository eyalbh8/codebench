import { NestFactory } from '@nestjs/core';
import {
  NestExpressApplication,
  ExpressAdapter,
} from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configure } from '@vendia/serverless-express';
import { Context, APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { AppModule } from './app.module';
import { AppLogger } from './utils/app-logger.service';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { patchNestJsSwagger } from 'nestjs-zod';
import { Server, IncomingMessage, ServerResponse } from 'http';

let cachedServer: any;

async function bootstrap(): Promise<any> {
  if (cachedServer) return cachedServer;

  // 1️⃣ Create Express instance manually
  const expressApp = express();

  // Add JSON body parser middleware
  expressApp.use(bodyParser.json({ limit: '10mb' }));

  // 3️⃣ Wrap Express in an ExpressAdapter (this fixes your TS error)
  const adapter = new ExpressAdapter(expressApp);

  // 4️⃣ Create Nest using this adapter
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    adapter,
    {
      logger: ['error', 'warn'],
    },
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });

  if (process.env.NODE_ENV === 'dev') {
    addSwggerDocs(app);
  }

  await app.init();

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  // 5️⃣ Pass configured Express app to @vendia/serverless-express
  cachedServer = configure({ app: expressApp });

  return cachedServer;
}

export const handler: APIGatewayProxyHandlerV2 = async (
  event,
  context: Context,
) => {
  const server = await bootstrap();
  return server(event, context);
};

function addSwggerDocs(
  app: NestExpressApplication<
    Server<typeof IncomingMessage, typeof ServerResponse>
  >,
) {
  patchNestJsSwagger();

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Igeo API')
    .setDescription('The Igeo API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

}
