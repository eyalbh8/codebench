import { UsedStep } from './ai.models.service';
export type PromptIntent = 'COMMERCIAL' | 'INFORMATIONAL' | 'NAVIGATIONAL' | 'TRANSACTIONAL';
export declare class BlogPatternsService {
    getUsedStepForIntent(intent: PromptIntent): UsedStep;
}
