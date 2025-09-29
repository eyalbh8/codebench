import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { DescopeService } from '../auth/descope.service';
import { ConfigService } from '../config/config.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { CompetitorsController } from './controllers/outgoing/competitor';
import { RecommendationsController } from './controllers/outgoing/recommendations.control';
import { TrackedRecommendationsController } from './controllers/outgoing/tracked-recommendations.controller';
import { UsersController } from './controllers/outgoing/users.controller';
import { AccountLlmCallsController } from './controllers/outgoing/llm.calls';
import { AccountsService } from './operations/accounts.service';
import { CompetitorsOperations as CompetitorsService } from './operations/competitors.service';
import { LambdaOperations as LambdaService } from './operations/lambda.service';
import { LlmService } from './operations/llm/llm.service';
import { RecommendationsService } from './operations/recommendations.service';
import { UsersService } from './operations/users.service';
import { TrackedRecommendationsService } from './operations/tracked-insights';
import { DescopeAuthGuard } from '@/auth/descope.auth.guard';
import { AiModelsService } from './operations/ai.models.service';
import { CommonModule } from '@/common/common.module';
import { CoreModule } from '@/core/core.module';
import { ClsModule } from 'nestjs-cls';
import { AgentModule } from './controllers/outgoing/agents.moduls';
import { OpenaiProvider } from './operations/llm/openai.provider';
import { GeminiProvider } from './operations/llm/gemini.provider';
import { FinalValidationService as ContentValidatorService } from './operations/content-validator.service';
import { BlogPatternsService } from './operations/blog-patterns.service';
import { LlmCallsOperations } from './operations/llm-calls.operations';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    PrismaModule,
    HttpModule,
    CommonModule,
    CoreModule,
    ClsModule.forRoot({
      middleware: { mount: true }, // auto-attach to HTTP requests
    }),
    AgentModule,
  ],
  controllers: [
    RecommendationsController,
    CompetitorsController,
    TrackedRecommendationsController,
    UsersController,
    AccountLlmCallsController,
  ],
  providers: [
    DescopeService,
    DescopeAuthGuard,
    ConfigService,
    PrismaService,
    AccountsService,
    CompetitorsService,
    LlmService,
    OpenaiProvider,
    GeminiProvider,
    LambdaService,
    RecommendationsService,
    TrackedRecommendationsService,
    UsersService,
    AiModelsService,
    ContentValidatorService,
    BlogPatternsService,
    LlmCallsOperations,
  ],
  exports: [AccountsService, ConfigService],
})
export class ApiModule {}
