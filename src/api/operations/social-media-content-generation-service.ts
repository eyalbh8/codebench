import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
import { SocialMediaProvider } from '@/model.enums';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@/config/config.service';
import { LlmService } from '@/api/operations/llm/llm.service';
import { S3Service } from '@/common/services/s3.service';
import { UsedStep } from '@/api/operations/ai.models.service';
import { AppLogger } from '@/utils/app-logger.service';
import { AccountData } from '../dtos-schemes/agent.scheme';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';
import { EXTERNAL_SERVICE_ERRORS } from '@/constants/errors';

@Injectable()
export class SocialContentGenerationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly llmService: LlmService,
    private readonly s3Service: S3Service,
    private readonly logger: AppLogger,
  ) {}

  private sanitizeDuplicateFaqHeadings(content: string): string {
    const faqHeadingPattern = /<h2>\s*Frequently Asked Questions\s*<\/h2>/gi;
    const matches = content.match(faqHeadingPattern);

    if (!matches || matches.length <= 1) {
      return content;
    }

    const firstMatch = content.search(faqHeadingPattern);
    if (firstMatch === -1) return content;

    const beforeFirst = content.substring(0, firstMatch);
    const afterFirst = content.substring(firstMatch);

    const sanitizedAfter = afterFirst.replace(
      faqHeadingPattern,
      (match, offset) => {
        return offset === 0 ? match : '';
      },
    );

    return beforeFirst + sanitizedAfter;
  }

  parseSocialMediaContent(response: string): any {
    // FIRST: Remove markdown code blocks with multiple strategies
    let initialCleaned = response.trim();

    // Strategy 1: Remove markdown fences (most common)
    if (initialCleaned.startsWith('```')) {
      // Remove opening fence
      initialCleaned = initialCleaned.replace(/^```(?:json)?\s*\n?/i, '');
      // Remove closing fence
      initialCleaned = initialCleaned.replace(/\n?```\s*$/, '');
      initialCleaned = initialCleaned.trim();
    }

    // Strategy 2: Additional cleanup for any remaining backticks
    initialCleaned = initialCleaned
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    initialCleaned = initialCleaned.replace(
      /<a href=\\"(?![^"]*https?:\/\/)[^"]*"/g,
      '<a href=\\"#\\"',
    );

    let repairedResponse = this.repairFaqSchema(initialCleaned);

    const cleanedResponse = this.repairFaqSchema(repairedResponse);

    try {
      const jsonData =
        this.parseSocialMediaContentWithSanitization<any>(cleanedResponse);

      // FIFTH: Fix slug field if it's URL-encoded
      if (jsonData.slug && typeof jsonData.slug === 'string') {
        try {
          // Check if slug looks URL-encoded (contains %xx patterns)
          if (jsonData.slug.includes('%')) {
            const decodedSlug = decodeURIComponent(jsonData.slug);
            if (decodedSlug !== jsonData.slug) {
              this.logger.log(
                `[parseGeneratedPost] Decoded URL-encoded slug from "${jsonData.slug}" to "${decodedSlug}"`,
              );
              jsonData.slug = decodedSlug;
            }
          }
        } catch (slugError) {
          this.logger.warn(
            `[parseGeneratedPost] Failed to decode slug: ${slugError}`,
          );
          // Keep original slug if decoding fails
        }
      }

      // Remove any LLM-generated schema tags (SchemaGeneratorService will add proper @graph later)
      if (jsonData.content) {
        // Multi-pass removal to catch all variants
        let contentWithoutSchemas = jsonData.content;

        // Pass 1: Remove unescaped schema blocks
        contentWithoutSchemas = contentWithoutSchemas.replace(
          /<script type="application\/ld\+json"[\s\S]*?<\/script>/gi,
          '',
        );

        // Pass 2: Remove escaped schema blocks (in JSON strings)
        contentWithoutSchemas = contentWithoutSchemas.replace(
          /<script type=\\"application\/ld\+json\\"[\s\S]*?<\/script>/gi,
          '',
        );

        // Pass 3: Clean up any remaining schema fragments
        contentWithoutSchemas = contentWithoutSchemas.replace(
          /<script[^>]*ld\+json[^>]*>[\s\S]*?<\/script>/gi,
          '',
        );

        // Count how many were removed
        const removedCount = (
          jsonData.content.match(/<script[^>]*ld\+json/gi) || []
        ).length;
        if (removedCount > 0) {
          this.logger.warn(
            `Removed ${removedCount} LLM-generated schema block(s) - LLM violated prompt instructions`,
          );
        }

        jsonData.content = contentWithoutSchemas.trim();
      }

      // CRITICAL: Remove bold/emphasis tags from focus keyphrase (LLM keeps violating this rule)
      if (jsonData.content && jsonData.focusKeyphrase) {
        const originalContent = jsonData.content;
        const keyphrase = jsonData.focusKeyphrase;
        const escapedKeyphrase = keyphrase.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&',
        );

        // Remove <b> tags around keyphrase
        jsonData.content = jsonData.content.replace(
          new RegExp(`<b[^>]*>(${escapedKeyphrase})</b>`, 'gi'),
          '$1',
        );

        // Remove <strong> tags around keyphrase
        jsonData.content = jsonData.content.replace(
          new RegExp(`<strong[^>]*>(${escapedKeyphrase})</strong>`, 'gi'),
          '$1',
        );

        // Remove <mark> tags around keyphrase
        jsonData.content = jsonData.content.replace(
          new RegExp(`<mark[^>]*>(${escapedKeyphrase})</mark>`, 'gi'),
          '$1',
        );

        // Remove <em> tags around keyphrase
        jsonData.content = jsonData.content.replace(
          new RegExp(`<em[^>]*>(${escapedKeyphrase})</em>`, 'gi'),
          '$1',
        );

        if (originalContent !== jsonData.content) {
          this.logger.warn(
            'Auto-removed bold/emphasis from focus keyphrase - LLM violated formatting rules',
          );
        }
      }

      // CRITICAL: Remove fabricated/placeholder links (LLM keeps generating fake links)
      if (jsonData.content) {
        const originalContent = jsonData.content;
        const fabricatedDomains = [
          'example.com',
          'example.org',
          'placeholder.com',
          'test.com',
          'authority-site.com',
          'fake-url.com',
          'your-site.com',
          'website.com',
        ];

        for (const domain of fabricatedDomains) {
          // Remove links with fabricated domains, keep the anchor text
          const linkPattern = new RegExp(
            `<a\\s+[^>]*href=["']https?://[^"']*${domain}[^"']*["'][^>]*>([^<]*)</a>`,
            'gi',
          );
          jsonData.content = jsonData.content.replace(linkPattern, '$1');
        }

        if (originalContent !== jsonData.content) {
          this.logger.warn(
            'Auto-removed fabricated placeholder links - LLM violated link generation rules',
          );
        }
      }

      // CRITICAL: Remove links where anchor text matches focus keyphrase (keyword stuffing)
      if (jsonData.content && jsonData.focusKeyphrase) {
        const originalContent = jsonData.content;
        const keyphrase = jsonData.focusKeyphrase;
        const escapedKeyphrase = keyphrase.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&',
        );

        // Remove links where anchor text exactly matches keyphrase (case-insensitive)
        const keyphraseLinksPattern = new RegExp(
          `<a\\s+[^>]*href=["'][^"']*["'][^>]*>(${escapedKeyphrase})</a>`,
          'gi',
        );
        jsonData.content = jsonData.content.replace(
          keyphraseLinksPattern,
          '$1',
        );

        if (originalContent !== jsonData.content) {
          this.logger.warn(
            'Auto-removed links on focus keyphrase - linking keywords is forbidden',
          );
        }
      }

      if (jsonData.content) {
        jsonData.content = this.stripAllLinksAndFormatting(jsonData.content);
      }

      if (jsonData.content && jsonData.metaDescription) {
        let content = jsonData.content.replace(/\\n/g, '\n');
        content = this.sanitizeDuplicateFaqHeadings(content);
        return {
          text: `${jsonData.title}\n\n${content}`,
          hashtags: jsonData.tags || [],
          visibility: 'PUBLIC',
          estimatedEngagement: jsonData.seoScore || 5,
          characterCount: content.length,
          suggestedPostingTime: undefined,
          metaDescription: jsonData.metaDescription,
          excerpt: jsonData.excerpt,
          readingTime: jsonData.readingTime,
          seoScore: jsonData.seoScore,
          focusKeyphrase: jsonData.focusKeyphrase,
          slug: jsonData.slug,
        };
      }

      if (jsonData.title && jsonData.content && !jsonData.metaDescription) {
        let content = jsonData.content.replace(/\\n/g, '\n');
        content = this.sanitizeDuplicateFaqHeadings(content);

        if (jsonData.excerpt && jsonData.slug) {
          return {
            text: `${jsonData.title}\n\n${content}`,
            hashtags: jsonData.tags || jsonData.hashtags || [],
            visibility: jsonData.visibility || 'PUBLIC',
            estimatedEngagement: jsonData.seoScore || jsonData.engagement || 5,
            characterCount: content.length,
            suggestedPostingTime:
              jsonData.posting_time === 'none'
                ? undefined
                : jsonData.posting_time,
            metaDescription: jsonData.metaDescription || jsonData.excerpt,
            excerpt: jsonData.excerpt,
            readingTime: jsonData.readingTime,
            seoScore: jsonData.seoScore,
            focusKeyphrase: jsonData.focusKeyphrase,
            slug: jsonData.slug,
          };
        }

        return {
          text: `${jsonData.title}\n\n${content}`,
          hashtags: jsonData.hashtags,
          visibility: jsonData.visibility,
          estimatedEngagement: jsonData.engagement,
          characterCount: content.length,
          suggestedPostingTime:
            jsonData.posting_time === 'none'
              ? undefined
              : jsonData.posting_time,
        };
      }

      if (jsonData.title && jsonData.description) {
        return {
          text: `${jsonData.title}\n\n${jsonData.description}`,
          hashtags: jsonData.hashtags,
          visibility: jsonData.visibility,
          estimatedEngagement: jsonData.engagement,
          characterCount: jsonData.description.length,
          suggestedPostingTime:
            jsonData.posting_time === 'none'
              ? undefined
              : jsonData.posting_time,
        };
      }
    } catch (e) {
      this.logger.error('JSON parsing failed', {
        response,
        error: e instanceof Error ? e.message : String(e),
      });
    }

    this.logger.error('All parsing methods failed', { response });
    throw new Error('Structured parsing failed');
  }

  private parseSocialMediaContentWithSanitization<T>(content: string): T {
    const attempts: { strategy: string; content: string }[] = [];

    const directTrimmed = content.trim();
    if (directTrimmed) {
      attempts.push({ strategy: 'direct', content: directTrimmed });
    }

    // Strategy: Fix double-escaped quotes (common Gemini issue)
    const fixedEscaping = directTrimmed.replace(/\\\\\"/g, '\\"');
    if (fixedEscaping !== directTrimmed) {
      attempts.push({ strategy: 'escape-fix', content: fixedEscaping });
    }

    const firstBrace = directTrimmed.indexOf('{');
    const lastBrace = directTrimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = directTrimmed.slice(firstBrace, lastBrace + 1);
      attempts.push({ strategy: 'brace-extraction', content: extracted });

      // Also try escape-fix on extracted version
      const extractedFixed = extracted.replace(/\\\\\"/g, '\\"');
      if (extractedFixed !== extracted) {
        attempts.push({
          strategy: 'brace-extraction-escaped',
          content: extractedFixed,
        });
      }
    }

    const sanitized = this.sanitizeJsonString(directTrimmed);
    if (sanitized && !attempts.some((a) => a.content === sanitized)) {
      attempts.push({ strategy: 'sanitized', content: sanitized });
    }

    for (const attempt of attempts) {
      try {
        const parsed = JSON.parse(attempt.content) as T;
        return parsed;
      } catch (error) {
        if (attempt === attempts[attempts.length - 1]) {
          this.logger.error('JSON parsing failed with all strategies', {
            strategies: attempts.map((a) => a.strategy),
            firstError: error instanceof Error ? error.message : String(error),
          });
          throw error instanceof Error ? error : new Error(String(error));
        }
      }
    }

    throw new Error('Unable to parse JSON response');
  }

  private sanitizeJsonString(content: string): string {
    // Pre-process: Fix double-escaped quotes and other common escape issues
    let preprocessed = content;

    // Fix double-escaped quotes: \\" -> \"
    preprocessed = preprocessed.replace(/\\\\\"/g, '\\"');

    // Fix triple-escaped quotes (extreme case): \\\" -> \"
    preprocessed = preprocessed.replace(/\\\\\\\\\"/g, '\\"');

    let result = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < preprocessed.length; i += 1) {
      const char = preprocessed[i];

      if (inString) {
        if (escapeNext) {
          result += char;
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          result += char;
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          result += char;
          inString = false;
          continue;
        }

        if (char === '\n') {
          result += '\\n';
          continue;
        }

        if (char === '\r') {
          result += '\\r';
          continue;
        }

        if (char === '\t') {
          result += '\\t';
          continue;
        }
      } else if (char === '"') {
        inString = true;
      }

      result += char;
    }

    return result;
  }

  private buildFaqSchemaFromHtml(htmlContent: string): string | null {
    try {
      const faqSectionMatch = htmlContent.match(
        /<section class="faq-section">(.*?)<\/section>/s,
      );
      if (!faqSectionMatch) {
        return null;
      }

      const faqHtml = faqSectionMatch[1];
      const questions: Array<{ question: string; answer: string }> = [];

      const faqItemRegex =
        /<div class="faq-item">.*?<h3>(.*?)<\/h3>.*?<p>(.*?)<\/p>.*?<\/div>/gs;
      let match;
      while ((match = faqItemRegex.exec(faqHtml)) !== null) {
        questions.push({
          question: match[1].trim(),
          answer: match[2].trim().replace(/<[^>]*>/g, ''),
        });
      }

      if (questions.length === 0) {
        return null;
      }

      const mainEntity = questions.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      }));

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: mainEntity,
      };

      const schemaStr = JSON.stringify(schema, null, 2);
      return `\n<script type="application/ld+json">\n${schemaStr}\n</script>`;
    } catch (error) {
      this.logger.error('Failed to build FAQ schema from HTML', error);
      return null;
    }
  }

  private repairFaqSchema(content: string): string {
    if (
      !content.includes('<script type="application/ld+json">') &&
      !content.includes('"faqSchema"')
    ) {
      return content;
    }

    let repaired = content;
    let fixesApplied = 0;

    if (
      repaired.includes('"@context":') ||
      repaired.includes('\\"@context\\"')
    ) {
      const spacePattern = /"@context":\s*"\s*"\s*"@type"/g;
      if (spacePattern.test(repaired)) {
        repaired = repaired.replace(
          /"@context":\s*"\s*"\s*"@type"/g,
          '"@context": "https://schema.org",\n "@type"',
        );
        fixesApplied++;
        this.logger.warn('Fixed CRITICAL @context with space then @type');
      }

      const escapedSpacePattern = /\\"@context\\":\s*\\"\s*\\"\s*\\"@type\\"/g;
      if (escapedSpacePattern.test(repaired)) {
        repaired = repaired.replace(
          /\\"@context\\":\s*\\"\s*\\"\s*\\"@type\\"/g,
          '\\"@context\\": \\"https://schema.org\\",\\n \\"@type\\"',
        );
        fixesApplied++;
        this.logger.warn(
          'Fixed CRITICAL @context (escaped) with space then @type',
        );
      }

      const newlinePattern = /"@context":\s*"(?:\s*[\r\n]|\\n)/g;
      if (newlinePattern.test(repaired)) {
        repaired = repaired.replace(
          /"@context":\s*"(?:\s*[\r\n]|\\n)/g,
          '"@context": "https://schema.org",\n',
        );
        fixesApplied++;
        this.logger.warn('Fixed CRITICAL @context with newline');
      }
    }

    const severelyMalformedPattern =
      /\{"@context"\s*:\s*"(?!https:\/\/schema\.org)[^"]*"/g;
    if (severelyMalformedPattern.test(repaired)) {
      this.logger.warn(
        'Detected severely malformed FAQ schema - attempting full repair',
      );

      const scriptMatch = repaired.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/s,
      );
      if (scriptMatch) {
        try {
          const faqSectionMatch = repaired.match(
            /<section class="faq-section">(.*?)<\/section>/s,
          );
          if (faqSectionMatch) {
            const faqHtml = faqSectionMatch[1];
            const questions: Array<{ question: string; answer: string }> = [];

            const faqItemRegex =
              /<div class="faq-item">.*?<h3>(.*?)<\/h3>.*?<p>(.*?)<\/p>.*?<\/div>/gs;
            let match;
            while ((match = faqItemRegex.exec(faqHtml)) !== null) {
              questions.push({
                question: match[1].trim(),
                answer: match[2].trim().replace(/<[^>]*>/g, ''),
              });
            }

            if (questions.length > 0) {
              const mainEntity = questions.map((q) => ({
                '@type': 'Question',
                name: q.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: q.answer,
                },
              }));

              const properSchema = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: mainEntity,
              };

              const properSchemaStr = JSON.stringify(properSchema, null, 2);
              repaired = repaired.replace(
                /<script type="application\/ld\+json">.*?<\/script>/s,
                `<script type="application/ld+json">\n${properSchemaStr}\n</script>`,
              );
              fixesApplied++;
              this.logger.log(
                'Successfully reconstructed FAQ schema from HTML',
                { questionsFound: questions.length },
              );
            }
          }
        } catch (error) {
          this.logger.error('Failed to reconstruct FAQ schema', error);
        }
      }
    }

    // Pattern 2: Fix incomplete @context URLs
    // Catches: "@context": "https://", or "@context": "https:" or similar truncations
    const incompleteUrlPattern =
      /"@context":\s*"https?:\/?\/?(?!schema\.org)[^"]*",?/g;
    if (incompleteUrlPattern.test(repaired)) {
      const before = repaired;
      repaired = repaired.replace(
        /"@context":\s*"https?:\/?\/?(?!schema\.org)[^"]*"/g,
        '"@context": "https://schema.org"',
      );
      if (before !== repaired) {
        fixesApplied++;
        this.logger.warn(
          'Fixed incomplete @context URL (e.g., "https://" → "https://schema.org")',
        );
      }
    }

    // Pattern 3: Fix truncated or empty @context field
    const contextPatterns = [
      /"@context":\s*"\s*\\n/g,
      /"@context":\s*"\s*\n/g,
      /"@context":\s*""\s*,?\s*\n/g,
      /"@context":\s*"\s+"/g,
      /"@context":\\s*"\\s*\\n/g,
    ];

    for (const pattern of contextPatterns) {
      const before = repaired;
      repaired = repaired.replace(
        pattern,
        '"@context": "https://schema.org",\n',
      );
      if (before !== repaired) {
        fixesApplied++;
        this.logger.warn('Fixed truncated @context pattern', {
          pattern: pattern.toString(),
        });
      }
    }

    if (fixesApplied > 0) {
      this.logger.warn('Repaired FAQ schema', {
        fixesApplied,
        method: 'pattern-matching and reconstruction',
      });
    }

    return repaired;
  }

  async generateSinglePost<
    TGenerationData extends { topic: string; prompt: string; style?: string },
    TGeneratedPost,
  >(
    generationData: TGenerationData,
    parseGeneratedPost: (response: string) => TGeneratedPost,
    socialMediaProvider: SocialMediaProvider,
    account: Account,
    generationId: string,
    generateImage: boolean = false,
  ): Promise<TGeneratedPost & { id?: string; imageUrl?: string }> {
    try {
      this.logger.log(
        `[generateSinglePost] Starting generation for provider: ${socialMediaProvider}, topic: ${generationData.topic}`,
      );

      const content = await this.llmService.generateSocialMediaContent(
        account,
        socialMediaProvider,
        generationData,
      );

      this.logger.log(
        `[generateSinglePost] LLM content generated successfully, length: ${JSON.stringify(content).length}`,
      );

      const uniqueId = uuidv4();

      try {
        await this.s3Service.putObject(
          JSON.stringify(content, null, 2),
          `${socialMediaProvider}/content-generation/${account.id}/${generationId}_${uniqueId}.json`,
        );
      } catch (error) {
        this.logger.warn(`Error uploading content to S3: ${error}`);
      }

      this.logger.log(`[generateSinglePost] Parsing generated post...`);
      const parsedPost = parseGeneratedPost(content);
      this.logger.log(`[generateSinglePost] Post parsed successfully`);

      let imageUrl: string | undefined;
      let unsplashData:
        | {
            photoId: string;
            photographerName: string;
            photographerUsername: string;
            downloadLocation: string;
          }
        | undefined;

      const result = {
        ...parsedPost,
        imageUrl,
      } as TGeneratedPost & {
        imageUrl?: string;
        unsplashPhotoId?: string;
      };

      const unsplashUrl =
        'https://unsplash.com?utm_source=igeo_app&utm_medium=referral';
      let creditLine: string | undefined;
      if (unsplashData?.photographerName && imageUrl) {
        const photographerLabel = unsplashData.photographerUsername
          ? `${unsplashData.photographerName} (@${unsplashData.photographerUsername})`
          : unsplashData.photographerName;
        const photographerUrl = unsplashData.photographerUsername
          ? `https://unsplash.com/@${unsplashData.photographerUsername}?utm_source=igeo_app&utm_medium=referral`
          : unsplashUrl;

        creditLine = `\n\nPhoto by [${photographerLabel}](${photographerUrl}) via [Unsplash](${unsplashUrl})`;
      }

      if (
        socialMediaProvider !== SocialMediaProvider.BLOG &&
        socialMediaProvider !== SocialMediaProvider.LISTICLE
      ) {
        creditLine = '';
      }

      const resultWithText = result as { text?: string };
      if (creditLine) {
        if (typeof resultWithText.text === 'string' && resultWithText.text) {
          resultWithText.text = `${resultWithText.text}${creditLine}`;
        } else {
          resultWithText.text = creditLine.trimStart();
        }
      }

      if (typeof resultWithText.text === 'string') {
        const shouldKeepLinks =
          socialMediaProvider === SocialMediaProvider.BLOG ||
          socialMediaProvider === SocialMediaProvider.LISTICLE;

        this.logger.log(
          `[generateSinglePost] Processing text links, shouldKeepLinks: ${shouldKeepLinks}`,
        );

        if (!shouldKeepLinks) {
          resultWithText.text = this.removeLinks(
            resultWithText.text,
            !!imageUrl,
          );
        } else {
          resultWithText.text = this.processLinksForBlog(
            resultWithText.text,
            !!imageUrl,
          );
        }

        this.logger.log(`[generateSinglePost] Text processing completed`);
      }

      this.logger.log(
        `[generateSinglePost] Successfully completed generation for provider: ${socialMediaProvider}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`[generateSinglePost] Error generating post:`, error);
      this.logger.log(
        `[generateSinglePost] Error stack: ${error instanceof Error ? error.stack : 'N/A'}`,
      );
      throw new ApplicationErrorException(
        EXTERNAL_SERVICE_ERRORS.LLM_SERVICE_ERROR,
        undefined,
        `Error generating post: ${error}`,
      );
    }
  }

  private getUsedStepForProvider(provider: SocialMediaProvider): UsedStep {
    const stepMap: Record<
      | SocialMediaProvider.X
      | SocialMediaProvider.LINKEDIN
      | SocialMediaProvider.FACEBOOK
      | SocialMediaProvider.INSTAGRAM
      | SocialMediaProvider.PINTEREST
      | SocialMediaProvider.REDDIT
      | SocialMediaProvider.BLOG
      | SocialMediaProvider.LISTICLE,
      UsedStep
    > = {
      [SocialMediaProvider.X]: UsedStep.X_CONTENT_POST_GENERATION,
      [SocialMediaProvider.LINKEDIN]: UsedStep.LINKEDIN_CONTENT_POST_GENERATION,
      [SocialMediaProvider.FACEBOOK]: UsedStep.FACEBOOK_CONTENT_POST_GENERATION,
      [SocialMediaProvider.INSTAGRAM]:
        UsedStep.INSTAGRAM_CONTENT_POST_GENERATION,
      [SocialMediaProvider.PINTEREST]:
        UsedStep.PINTEREST_CONTENT_POST_GENERATION,
      [SocialMediaProvider.REDDIT]: UsedStep.REDDIT_CONTENT_POST_GENERATION,
      [SocialMediaProvider.BLOG]: UsedStep.BLOG_CONTENT_POST_GENERATION,
      [SocialMediaProvider.LISTICLE]: UsedStep.LISTICLE_CONTENT_POST_GENERATION,
    };
    return stepMap[provider];
  }

  private processLinksForBlog(
    content: string,
    keepImageCredit: boolean = false,
  ): string {
    const creditRegex =
      /\n*\s*Photo by \[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s+via\s+\[Unsplash\]\((https?:\/\/[^\s)]+)\)/i;
    const creditMatch = content.match(creditRegex);
    const creditLine = creditMatch ? creditMatch[0].trim() : '';

    let processed = creditMatch
      ? content.replace(creditRegex, '').trimEnd()
      : content;

    const protectedUrls = new Map<string, string>();
    let counter = 0;

    // More flexible regex that allows spaces around = and different attribute orders
    processed = processed.replace(
      /<a\s+([^>]*?)href\s*=\s*(["'])([^"']+)\2([^>]*?)>/gi,
      (match, beforeHref, quote, url, afterHref) => {
        const placeholder = `__HREF_PROTECTED_${counter}__`;
        protectedUrls.set(placeholder, url);
        counter++;
        return `<a ${beforeHref}href=${quote}${placeholder}${quote}${afterHref}>`;
      },
    );

    processed = processed
      .replace(/\[([^\]]+)\]\(https?:\/\/[^\s)]+\)/g, '$1')
      .replace(/(?<!["'=])https?:\/\/[^\s<>"']+/g, '')
      .replace(
        /(?<!["'=])\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,})(?:\/[^\s<>"']*)?/gi,
        '',
      )
      .replace(/\(\s*\)/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    protectedUrls.forEach((url, placeholder) => {
      processed = processed.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        url,
      );
    });

    // Verify all placeholders were restored
    const remainingPlaceholders = (
      processed.match(/__HREF_PROTECTED_\d+__/g) || []
    ).length;
    if (remainingPlaceholders > 0) {
      this.logger.error(
        `Failed to restore ${remainingPlaceholders} link placeholders!`,
      );
    }

    if (creditLine && keepImageCredit) {
      const htmlCredit = creditLine.replace(
        /Photo by \[([^\]]+)\]\(([^)]+)\)\s+via\s+\[Unsplash\]\(([^)]+)\)/i,
        '<p>Photo by <a href="$2" target="_blank" rel="noopener noreferrer">$1</a> via <a href="$3" target="_blank" rel="noopener noreferrer">Unsplash</a></p>',
      );
      processed = processed ? `${processed}\n\n${htmlCredit}` : htmlCredit;
    }

    return processed;
  }

  private removeLinks(
    content: string,
    keepImageCredit: boolean = false,
  ): string {
    const creditRegex =
      /\n*\s*Photo by \[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s+via\s+\[Unsplash\]\((https?:\/\/[^\s)]+)\)/i;
    const creditMatch = content.match(creditRegex);
    const creditLine = creditMatch ? creditMatch[0].trim() : '';

    let sanitized = creditMatch
      ? content.replace(creditRegex, '').trimEnd()
      : content;

    sanitized = sanitized
      .replace(/<a\s+[^>]*>([^<]*)<\/a>/gi, '$1')
      .replace(/\[([^\]]+)\]\(https?:\/\/[^\s)]+\)/g, '$1')
      .replace(/https?:\/\/[^\s<>"']+/g, '')
      .replace(
        /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,})(?:\/[^\s]*)?/gi,
        '',
      )
      .replace(/\(\s*\)/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    return sanitized;
  }

  private stripAllLinksAndFormatting(content: string): string {
    let sanitized = content;

    sanitized = sanitized.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
    sanitized = sanitized.replace(/<a[^>]*?\s+([^<]+)<\/a>/gi, '$1');
    sanitized = sanitized.replace(/<\/?a[^>]*>/gi, '');

    sanitized = sanitized.replace(/<\/?(strong|b|em|i)[^>]*>/gi, '');
    sanitized = sanitized.replace(
      /\[(.*?)\]\s*\((https?:\/\/[^\s)]+)\)/g,
      '$1',
    );

    sanitized = sanitized.replace(/https?:\/\/\S+/g, '');
    sanitized = sanitized.replace(
      /\b(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,})(?:\/[^\s]*)?/gi,
      '',
    );

    sanitized = sanitized
      .replace(/\(\s*\)/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    return sanitized;
  }

  async generatePosts<TGenerationData extends AccountData, TGeneratedPost>(
    generationData: TGenerationData,
    parseGeneratedPost: (response: string) => TGeneratedPost,
    socialMediaProvider: SocialMediaProvider,
    account: Account,
    generateImage: boolean = false,
  ): Promise<{
    generatedPosts: (TGeneratedPost & { id?: string; imageUrl?: string })[];
  }> {
    const configKey = `${socialMediaProvider.toUpperCase()}_POSTS_GENERATION_COUNT`;
    const postsCount = this.configService.get<number>(configKey);
    if (!postsCount) {
      this.logger.error(`${configKey} environment variable is required`);
      throw new Error(`${configKey} environment variable is required`);
    }

    const generationId = uuidv4();

    const postPromises = Array.from({ length: postsCount }, async () => {
      return await this.generateSinglePost(
        generationData,
        parseGeneratedPost,
        socialMediaProvider,
        account,
        generationId,
        generateImage,
      );
    });
    const results = await Promise.all(postPromises);
    return { generatedPosts: results };
  }
}
