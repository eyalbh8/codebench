import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '../../constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';

export enum UsedStep {
  LINKEDIN_CONTENT_POST_GENERATION = 'linkedin_content_post_generation',
  X_CONTENT_POST_GENERATION = 'x_content_post_generation',
  FACEBOOK_CONTENT_POST_GENERATION = 'facebook_content_post_generation',
  INSTAGRAM_CONTENT_POST_GENERATION = 'instagram_content_post_generation',
  PINTEREST_CONTENT_POST_GENERATION = 'pinterest_content_post_generation',
  REDDIT_CONTENT_POST_GENERATION = 'reddit_content_post_generation',
  LISTICLE_CONTENT_POST_GENERATION = 'listicle_content_post_generation',
  BLOG_CONTENT_POST_GENERATION = 'blog_content_post_generation',
}

@Injectable()
export class AiModelsService {
  constructor(private prisma: PrismaService) {}

  async getAiStepSettings(usedStep: UsedStep) {
    if (!usedStep) {
      throw new ApplicationErrorException(ERROR_CODES.USED_STEP_NOT_FOUND);
    }

    const model = await this.prisma.aiSetting.findUnique({
      where: {
        usedStep,
      },
    });
    if (!model) {
      throw new ApplicationErrorException(ERROR_CODES.USED_STEP_NOT_FOUND);
    }
    return model;
  }

  static renderTemplate(
    template: string,
    context: Record<string, string>,
  ): string {
    return template
      .replace(/\$\{(\w+)\}/g, (_, key) => {
        if (key in context) {
          return context[key];
        }
        return `\${${key}}`;
      })
      .replace(/\{(\w+)\}/g, (_, key) => {
        if (key in context) {
          return context[key];
        }
        return `{${key}}`;
      });
  }
}
