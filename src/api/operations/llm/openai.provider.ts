import { ConfigService } from '@/config/config.service';
import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { AppLogger } from '@/utils/app-logger.service';
import { LlmProvider, LlmResponse } from './llm.service';
import { Provider } from '@/model.enums';

@Injectable()
export class OpenaiProvider implements LlmProvider {
  private readonly client: OpenAI;

  constructor(
    private configService: ConfigService,
    private logger: AppLogger,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  async makeChatRequest(
    inputMessage: string,
    model: string,
  ): Promise<LlmResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: inputMessage,
          },
        ],
      });
      if (!response.choices[0]?.message?.content) {
        throw new Error('No content in OpenAI response');
      }
      if (!response.usage) {
        throw new Error('No usage in OpenAI response');
      }
      return {
        provider: Provider.OPENAI,
        model,
        inputMessage,
        output: response.choices[0].message.content,
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        },
      };
    } catch (e) {
      this.logger.error('Error generating account suggested topics:', {
        error: e.message,
      });
      return {
        provider: Provider.OPENAI,
        model,
        inputMessage,
        error: e.message,
      };
    }
  }

  async makeWebSearchRequest({
    model,
    inputMessage,
  }: {
    model: string;
    inputMessage: string;
  }): Promise<LlmResponse> {
    const maxRetries = 10;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        this.logger.debug('Making web search request', {
          model,
          attempt: retryCount + 1,
          maxRetries: maxRetries + 1,
        });

        const response = await this.client.responses.create({
          model,
          input: inputMessage,
          tools: [
            {
              type: 'web_search_preview',
            },
          ],
        });

        if (!response.output_text) {
          throw new Error('No output text in OpenAI response');
        }
        if (!response.usage) {
          throw new Error('No usage in OpenAI response');
        }

        this.logger.debug('Web search request successful', {
          model,
          attempt: retryCount + 1,
        });

        return {
          provider: Provider.OPENAI,
          model,
          inputMessage,
          output: response.output_text,
          usage: {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.total_tokens,
          },
        };
      } catch (e) {
        const isRetryableError = this.isRetryableError(e);
        const isLastAttempt = retryCount === maxRetries;

        this.logger.warn('Web search request failed', {
          model,
          attempt: retryCount + 1,
          maxRetries: maxRetries + 1,
          error: e.message,
          statusCode: e.status || e.statusCode,
          isRetryable: isRetryableError,
          isLastAttempt,
        });

        if (!isRetryableError || isLastAttempt) {
          this.logger.error('Web search request failed permanently', {
            model,
            totalAttempts: retryCount + 1,
            error: e.message,
            statusCode: e.status || e.statusCode,
          });

          return {
            provider: Provider.OPENAI,
            model,
            inputMessage,
            error: e.message,
          };
        }

        retryCount++;
        const sleepTime = this.calculateSleepTime(retryCount);

        this.logger.log('Retrying web search request', {
          model,
          nextAttempt: retryCount + 1,
          sleepTimeMs: sleepTime,
        });

        await this.sleep(sleepTime);
      }
    }

    // This should never be reached due to the loop logic, but TypeScript requires it
    return {
      provider: Provider.OPENAI,
      model,
      inputMessage,
      error: 'Maximum retries exceeded',
    };
  }

  private isRetryableError(error: any): boolean {
    const statusCode = error.status || error.statusCode;
    return statusCode === 429 || statusCode >= 500;
  }

  private calculateSleepTime(retryCount: number): number {
    // Base delay starts at 1 second (1000ms)
    const baseDelay = 1000;
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, retryCount - 1),
      10000,
    );
    // Add jitter (±20% of the delay)
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
    const finalDelay = Math.max(baseDelay, exponentialDelay + jitter);
    // Cap at 10 seconds
    return Math.min(finalDelay, 10000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async makeImageRequest(prompt: string, model: string): Promise<string> {
    try {
      const response = await this.client.images.generate({
        model,
        prompt,
        n: 1,
        size: '1024x1024',
      });

      if (!response.data || !response.data[0] || !response.data[0].url) {
        throw new Error('No image data returned from DALL-E');
      }

      return response.data[0].url;
    } catch (e) {
      this.logger.error('Error generating image:', {
        error: e.message,
      });
      throw new Error(`Image generation failed: ${e.message}`);
    }
  }
}
