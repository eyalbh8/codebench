import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '../../../config/config.service';
import { LlmService } from '../../operations/llm/llm.service';
import { AiModelsService } from '../../operations/ai.models.service';
import { AgentsController } from './agents.control';
import { AgentService } from '../../operations/agent.service';
import { ClsModule } from 'nestjs-cls';
import { AuthModule } from '../../../auth/auth.module';
import { DescopeService } from '@/auth/descope.service';
import { SocialContentGenerationService } from '../../operations/social-media-content-generation-service';
import { CoreModule } from '@/core/core.module';
import { SocialMediaConnectionService } from '../../operations/x.service';
import { SocialMediaConnectionRouterService } from '../../operations/social-media-connection-router.service';
import { FacebookConnectionService } from '../../operations/facebook.service';
import { PinterestConnectionService } from '../../operations/pinterest.service';
import { RedditConnectionService } from '../../operations/reddit.service';
import { BlogConnectionService } from '../../operations/blog.service';
import { InstagramConnectionServices } from '../../operations/instagram.service';
import { LinkedInConnectionServices } from '../../operations/linkedin.service';
import { OpenaiProvider } from '@/api/operations/llm/openai.provider';
import { GeminiProvider } from '@/api/operations/llm/gemini.provider';
import { RecommendationsService } from '../../operations/recommendations.service';
import { TrackedRecommendationsService } from '../../operations/tracked-insights';
import { FinalValidationService } from '../../operations/content-validator.service';
import { BlogPatternsService } from '../../operations/blog-patterns.service';
import { CompetitorsOperations } from '../../operations/competitors.service';
@Module({
  imports: [HttpModule, ClsModule, AuthModule, CoreModule],
  controllers: [AgentsController],
  providers: [
    ConfigService,
    LlmService,
    AiModelsService,
    AgentService,
    DescopeService,
    SocialContentGenerationService,
    SocialMediaConnectionService,
    SocialMediaConnectionRouterService,
    FacebookConnectionService,
    LinkedInConnectionServices,
    RedditConnectionService,
    PinterestConnectionService,
    InstagramConnectionServices,
    BlogConnectionService,
    OpenaiProvider,
    GeminiProvider,
    RecommendationsService,
    TrackedRecommendationsService,
    FinalValidationService,
    BlogPatternsService,
    CompetitorsOperations,
  ],
  exports: [AgentService],
})
export class AgentModule {}
