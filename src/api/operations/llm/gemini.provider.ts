import { ConfigService } from '@/config/config.service';
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppLogger } from '@/utils/app-logger.service';
import { LlmProvider, LlmResponse } from './llm.service';
import { Provider } from '@/model.enums';
import axios from 'axios';

@Injectable()
export class GeminiProvider implements LlmProvider {
  private readonly client: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private logger: AppLogger,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async makeChatRequest(
    inputMessage: string,
    model: string,
  ): Promise<LlmResponse> {
    try {
      const genAI = this.client.getGenerativeModel({ model });
      const result = await genAI.generateContent(inputMessage);
      const response = result.response;
      const text = response.text();
      const usageMetadata = result.response.usageMetadata;

      if (!text) {
        throw new Error('No content in Gemini response');
      }
      if (!usageMetadata) {
        throw new Error('No usage metadata in Gemini response');
      }
      return {
        provider: Provider.GEMINI,
        model,
        inputMessage,
        output: text,
        usage: {
          prompt_tokens: usageMetadata.promptTokenCount,
          completion_tokens: usageMetadata.candidatesTokenCount,
          total_tokens: usageMetadata.totalTokenCount,
        },
      };
    } catch (e) {
      this.logger.error('Error generating account suggested topics:', {
        error: e.message,
      });
      return {
        provider: Provider.GEMINI,
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

        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        const baseUrl = 'generativelanguage.googleapis.com';

        const response = await axios.post(
          `https://${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: inputMessage,
                  },
                ],
                role: 'user',
              },
            ],
            tools: [
              {
                googleSearch: {},
              },
            ],
            generationConfig: {},
          },
          {
            headers: {
              'nx-goog-api-key': apiKey,
              'Content-Type': 'application/json',
              'nx-goog-api-client': 'google-genai-sdk/1.2.0 gl-node/18.0.0',
              'User-Agent': 'google-genai-sdk/1.2.0 gl-node/18.0.0',
              'Accept-Encoding': 'gzip, deflate',
              Accept: '*/*',
              Connection: 'keep-alive',
            },
          },
        );

        const text = response.data.candidates[0].content.parts
          .map((part: { text: string }) => part.text)
          .join('\n');

        const usageMetadata = response.data.usageMetadata;

        if (!text) {
          throw new Error('No output text in Gemini response');
        }

        this.logger.debug('Web search request successful', {
          model,
          attempt: retryCount + 1,
        });

        return {
          provider: Provider.GEMINI,
          model,
          inputMessage,
          output: text,
          usage: {
            prompt_tokens: usageMetadata.promptTokenCount,
            completion_tokens: usageMetadata.candidatesTokenCount,
            total_tokens: usageMetadata.totalTokenCount,
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
          statusCode: e.response?.status,
          isRetryable: isRetryableError,
          isLastAttempt,
        });

        if (!isRetryableError || isLastAttempt) {
          this.logger.error('Web search request failed permanently', {
            model,
            totalAttempts: retryCount + 1,
            error: e.message,
            statusCode: e.response?.status,
          });

          return {
            provider: Provider.GEMINI,
            model,
            inputMessage,
            error: `${e.message} - Status: ${e.response?.status} - Data: ${JSON.stringify(e.response?.data)}`,
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
      provider: Provider.GEMINI,
      model,
      inputMessage,
      error: 'Maximum retries exceeded',
    };
  }

  private isRetryableError(error: any): boolean {
    const statusCode = error.response?.status;
    return statusCode === 429 || statusCode >= 500;
  }

  private calculateSleepTime(retryCount: number): number {
    // Base delay starts at 1 second (500ms)
    const baseDelay = 500;
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, retryCount - 1),
      10000,
    );
    // Add jitter (±20% of the delay)
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
    const finalDelay = Math.max(baseDelay, exponentialDelay + jitter);
    // Cap at 5 seconds
    return Math.min(finalDelay, 5000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
