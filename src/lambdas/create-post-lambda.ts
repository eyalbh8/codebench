import { NestFactory } from '@nestjs/core';
import { Handler, Context } from 'aws-lambda';
import { AppModule } from '../app.module';
import { AgentService } from '../api/operations/agent.service';
import { AppLogger } from '../utils/app-logger.service';
import { SocialMediaProvider } from '@/model.enums';
import {
  PostContentGenerationData,
  PostContentGenerationDto,
} from '@/api/dtos-schemes/agent.scheme';
import { AccountsService } from '@/api/operations/accounts.service';
import { PopulatedAccount } from '@/types/api';
let cachedApp: any;

interface CreatePostEvent {
  accountId: string;
  generationId: string;
  generationData: {
    topic: string;
    prompt: string;
    style?:
      | 'professional'
      | 'casual'
      | 'educational'
      | 'inspirational'
      | 'news'
      | 'story';
    socialMediaProvider: SocialMediaProvider;
    generateImage?: boolean;
    generationId?: string;
  };
}

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: false,
    });
    await app.init();
    app.useLogger(app.get(AppLogger));

    cachedApp = app;
    return app;
  } catch (error) {
    console.error(`Error bootstrapping application: ${error.message}`);
    throw error;
  }
}

function validateEvent(event: any): event is CreatePostEvent {
  if (!event.accountId || typeof event.accountId !== 'string') {
    throw new Error('accountId is required and must be a string');
  }
  if (!event.generationData) {
    throw new Error('generationData is required');
  }

  const { generationData } = event;

  if (
    !generationData.generationId ||
    typeof generationData.generationId !== 'string'
  ) {
    throw new Error('generationId is required and must be a string');
  }
  if (!generationData.topic || typeof generationData.topic !== 'string') {
    throw new Error('generationData.topic is required and must be a string');
  }

  if (!generationData.prompt || typeof generationData.prompt !== 'string') {
    throw new Error('generationData.prompt is required and must be a string');
  }

  if (
    !generationData.socialMediaProvider ||
    !Object.values(SocialMediaProvider).includes(
      generationData.socialMediaProvider,
    )
  ) {
    throw new Error(
      'generationData.socialMediaProvider is required and must be a valid SocialMediaProvider',
    );
  }

  if (
    generationData.style &&
    ![
      'professional',
      'casual',
      'educational',
      'inspirational',
      'news',
      'story',
    ].includes(generationData.style)
  ) {
    throw new Error(
      'generationData.style must be one of: professional, casual, educational, inspirational, news, story',
    );
  }

  if (
    generationData.generateImage !== undefined &&
    typeof generationData.generateImage !== 'boolean'
  ) {
    throw new Error('generationData.generateImage must be a boolean');
  }

  return true;
}

export const handler: Handler = async (
  event: CreatePostEvent,
  context: Context,
): Promise<any> => {
  // Bootstrap the application
  const app = await bootstrap();
  const logger = app.get(AppLogger);
  logger.log('CreatePost Lambda started', {
    requestId: context.awsRequestId,
    event: JSON.stringify(event),
  });
  try {
    validateEvent(event);

    const agentService: AgentService = app.get(AgentService);
    const account: PopulatedAccount = await app
      .get(AccountsService)
      .getAccount(event.accountId);
    logger.log('Calling AgentService.createPost', {
      accountId: event.accountId,
      generationId: event.generationId,
      generationData: event.generationData,
    });

    // Call the AgentService.createPost method
    const result = await agentService.generatePost(
      account,
      event.generationData as PostContentGenerationData,
    );

    logger.log('CreatePost Lambda completed successfully', {
      accountId: event.accountId,
      resultCount: Array.isArray(result) ? result.length : 1,
    });

    return {
      success: true,
      message: 'Posts created successfully',
      data: result,
      accountId: event.accountId,
    };
  } catch (error) {
    logger.error('CreatePost Lambda failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId: context.awsRequestId,
    });

    // Update post state to FAILED if we have the necessary info
    if (event.generationData?.generationId) {
      try {
        const agentService: AgentService = app.get(AgentService);
        await agentService.markGeneratedPostsAsFailed(
          event.generationData.generationId,
          error instanceof Error ? error.message : String(error),
        );
        logger.log('Marked posts as FAILED for generationId', {
          generationId: event.generationData.generationId,
        });
      } catch (updateError) {
        logger.error('Failed to update post state to FAILED', {
          error:
            updateError instanceof Error
              ? updateError.message
              : String(updateError),
          generationId: event.generationData.generationId,
        });
      }
    }

    throw error;
  }
};
