import { Decimal } from '@prisma/client/runtime/library';
import _ from 'lodash';

export const convertPrismaNumberToNumber = (
  value?: bigint | number | null | Decimal,
): number | null => {
  if (value == null) {
    return null;
  }
  switch (typeof value) {
    case 'bigint':
      return Number(value);
    case 'number':
      return value;
    case 'object':
      if (value instanceof Decimal) {
        return Number(value);
      }
      return null;
    default:
      return null;
  }
};

export const convertToUrl = (url: string) => {
  if (url.startsWith('http')) {
    return new URL(url);
  }
  return new URL(`https://${url}`);
};

export const extractPageTitle = (url: URL) => {
  if (url.pathname === '/') {
    return 'Home Page';
  }
  return _.capitalize(url.pathname.split('/')[1] ?? '');
};

interface BaseAppearanceCount {
  appearances_count: number | bigint | null | Decimal;
  rundate: Date;
  [key: string]: any;
}

type WithAppearanceCount = BaseAppearanceCount;

export interface WithAppearanceCountChange extends BaseAppearanceCount {
  appearance_count_change: number | null;
  appearances_count: number | null;
}

/**
 * Calculates the percentage change in appearance counts for a sequence of records grouped by a given key
 * @param appearances Array of records containing appearances_count
 * @param comparedKeys The key to group the records by
 * @returns Array of records with added appearance_count_change field showing percentage change from previous record of the same key
 */
export function calculateAppearanceCountChangesByComparedKey<
  T extends WithAppearanceCount,
>(
  appearances: T[],
  comparedKeys: (keyof T)[],
): (T & WithAppearanceCountChange)[] {
  const getKey = (item: T) =>
    comparedKeys.map((k) => item[k] as unknown).join('|');

  const groupedByComparedKey: Record<string, T[]> = _.groupBy(
    appearances,
    getKey,
  );

  const processedAppearances = Object.values(groupedByComparedKey).flatMap(
    (comparedKeyAppearances) => {
      const sortedAppearances = _.sortBy(comparedKeyAppearances, 'rundate');

      return sortedAppearances.map(
        (current, index): T & WithAppearanceCountChange => {
          const currentCount =
            convertPrismaNumberToNumber(current.appearances_count) ?? 0;

          if (index === 0) {
            return {
              ...current,
              appearances_count: currentCount,
              appearance_count_change: null,
            };
          }

          const previousAppearance = sortedAppearances[index - 1];
          const previousCount =
            convertPrismaNumberToNumber(previousAppearance.appearances_count) ??
            0;

          const percentageChange =
            previousCount === 0
              ? 0
              : ((currentCount - previousCount) / previousCount) * 100;

          return {
            ...current,
            appearances_count: currentCount,
            appearance_count_change: percentageChange,
          };
        },
      );
    },
  );

  return _.sortBy(processedAppearances, 'rundate');
}

/**
 * Maps a mentions count to a number
 * @param mentionsCount The mentions count to map
 * @returns The mapped mentions count
 */
export function mapMentionsCount(mentionsCount?: number): number {
  if (mentionsCount === undefined) {
    return 0;
  }
  return Math.round(mentionsCount);
}

export function parseTextWithSources(item: string) {
  // extract [site](url)
  const matches = [...item.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
  const sources = matches.map((m) => ({ site: m[1], link: m[2] }));

  // remove full link references, including commas before them
  let text = item
    .replace(/,?\s*\[([^\]]+)\]\(([^)]+)\)/g, '') // remove ", [site](url)" or " [site](url)"
    .trim();

  // cleanup stray parentheses/brackets
  text = text
    .replace(/\s*[\(\)\[\]]\s*/g, ' ')
    .replace(/\s+[,;]\s*$/, '')
    .trim();

  // collapse multiple spaces
  text = text.replace(/\s{2,}/g, ' ');

  return { text, sources };
}
