import { Injectable } from '@nestjs/common';
import { UsedStep } from './ai.models.service';

export type PromptIntent =
  | 'COMMERCIAL'
  | 'INFORMATIONAL'
  | 'NAVIGATIONAL'
  | 'TRANSACTIONAL';

@Injectable()
export class BlogPatternsService {
  getUsedStepForIntent(intent: PromptIntent): UsedStep {
    switch (intent) {
      case 'INFORMATIONAL':
        return UsedStep.BLOG_CONTENT_POST_GENERATION;
      case 'COMMERCIAL':
        return UsedStep.BLOG_CONTENT_POST_GENERATION;
      case 'NAVIGATIONAL':
        return UsedStep.BLOG_CONTENT_POST_GENERATION;
      case 'TRANSACTIONAL':
        return UsedStep.BLOG_CONTENT_POST_GENERATION;
      default:
        // Default to informational if intent is unknown or not provided
        return UsedStep.BLOG_CONTENT_POST_GENERATION;
    }
  }
}
