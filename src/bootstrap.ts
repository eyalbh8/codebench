import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app.module';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
export async function bootstrapApp(expressInstance?: express.Express) {
  // Create or use Express instance
  const expressApp = expressInstance || express();

  // Configure Express middleware BEFORE creating NestJS app
  // This is important to avoid the 'app.router' deprecation error

  // Use JSON parser for all routes
  expressApp.use(bodyParser.json({ limit: '10mb' }));

  expressApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Create NestJS app with Express adapter
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      bodyParser: false,
    },
  );

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });

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


  await app.init();

  return { app, expressApp };
}
