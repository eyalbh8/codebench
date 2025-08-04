import { ConfigService } from '@/config/config.service';
import { AppLogger } from '@/utils/app-logger.service';
import { LlmProvider, LlmResponse } from './llm.service';
export declare class OpenaiProvider implements LlmProvider {
    private configService;
    private logger;
    private readonly client;
    constructor(configService: ConfigService, logger: AppLogger);
    makeChatRequest(inputMessage: string, model: string): Promise<LlmResponse>;
    makeWebSearchRequest({ model, inputMessage, }: {
        model: string;
        inputMessage: string;
    }): Promise<LlmResponse>;
    private isRetryableError;
    private calculateSleepTime;
    private sleep;
    makeImageRequest(prompt: string, model: string): Promise<string>;
}
