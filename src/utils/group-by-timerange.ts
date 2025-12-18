import { Scan } from '@prisma/client';
import _, { isNil } from 'lodash';

/**
 * Groups items into actual time ranges (e.g., 3-day periods), sorted by date, and averages multiple value fields for each range.
 * @param items - The array of items to group.
 * @param timerange - The number of days for each time range.
 * @param getValues - Function to extract an object of numeric values to average from each item.
 * @param getDate - Function to extract the date from each item.
 * @param scans - The array of runs to group by.
 * @returns Array of grouped results with aggregated values and range info.
 */
export function groupByTimeRange<
  T,
  V extends Record<string, number | undefined | null>,
>(
  items: T[],
  timerange: number,
  getValues: (item: T) => V,
  getDate: (item: T) => Date,
  scans: Scan[],
): Array<{
  startDate: Date;
  endDate: Date;
  aggregatedValues: {
    [K in keyof V]: {
      min: number;
      max: number;
      sum: number;
      average: number;
    };
  };
  items: T[];
}> {
  const wrappedGetDate = (item: T) => new Date(getDate(item).toDateString());

  if (!Array.isArray(items) || items.length === 0 || timerange < 1) return [];

  // Sort items by date ascending
  const sorted = [...items].sort(
    (a, b) => wrappedGetDate(a).getTime() - wrappedGetDate(b).getTime(),
  );

  // Find the min and max dates from the items
  const minDate = wrappedGetDate(sorted[0]);
  const rawMaxDate = _.maxBy(scans, 'scheduledAt')!.scheduledAt;

  // Set max date to end of day
  const maxDate = new Date(rawMaxDate);
  maxDate.setHours(23, 59, 59, 999);

  const result: Array<{
    startDate: Date;
    endDate: Date;
    aggregatedValues: {
      [K in keyof V]: {
        min: number;
        max: number;
        sum: number;
        average: number;
      };
    };
    items: T[];
  }> = [];

  // Start from the most recent date and work backwards in timerange chunks
  let currentEndDate = new Date(maxDate);

  while (currentEndDate.getTime() >= minDate.getTime()) {
    // Calculate start date for this range (timerange days before end date)
    const currentStartDate = new Date(currentEndDate);
    currentStartDate.setDate(currentStartDate.getDate() - timerange + 1);
    // Set to start of day
    currentStartDate.setHours(0, 0, 0, 0);

    // Find items that fall within this date range
    const group = sorted.filter((item) => {
      const itemDate = wrappedGetDate(item);
      return itemDate >= currentStartDate && itemDate <= currentEndDate;
    });

    if (group.length > 0) {
      const valuesArr = group.map(getValues);
      const aggregatedValues = getAggregatedValues(valuesArr);
      result.push({
        startDate: currentStartDate,
        endDate: currentEndDate,
        aggregatedValues,
        items: group,
      });
    } else {
      result.push({
        startDate: currentStartDate,
        endDate: currentEndDate,
        aggregatedValues: {} as {
          [K in keyof V]: {
            min: number;
            max: number;
            sum: number;
            average: number;
          };
        },
        items: [],
      });
    }

    // Move to the previous time range
    currentEndDate = new Date(currentStartDate);
    currentEndDate.setDate(currentEndDate.getDate() - 1);
    currentEndDate.setHours(23, 59, 59, 999); // End of the previous day
  }

  return result.filter((group) =>
    scans.some(
      (run) =>
        run.scheduledAt >= group.startDate && run.scheduledAt <= group.endDate,
    ),
  );
}

export const KEYS_SEPARATOR = '|';

/**
 * Groups items by a key and returns the last groups for each key.
 * @param items - The array of items to group.
 * @param keys - The keys to group by.
 * @param timerange - The number of days for each time range.
 * @param getValues - Function to extract an object of numeric values to average from each item.
 * @param getDate - Function to extract the date from each item.
 * @param scans - The array of runs to group by.
 * @returns An object with the groups for each key.
 */
export function getGroupsByComparedKey<
  T,
  V extends Record<string, number | undefined | null>,
>(
  items: T[],
  keys: (keyof T)[],
  timerange: number,
  getValues: (item: T) => V,
  getDate: (item: T) => Date,
  scans: Scan[],
): { [key: string]: ReturnType<typeof groupByTimeRange<T, V>> } {
  const getKey = (item: T) =>
    keys.map((k) => item[k] as unknown).join(KEYS_SEPARATOR);

  const groupedByComparedKey: Record<string, T[]> = _.groupBy(items, getKey);

  const result = {} as {
    [key: string]: ReturnType<typeof groupByTimeRange<T, V>>;
  };
  for (const key in groupedByComparedKey) {
    result[key] = groupByTimeRange(
      groupedByComparedKey[key],
      timerange,
      getValues,
      getDate,
      scans,
    );
  }
  return result;
}

/**
 * Extracts values for matching timeranges from grouped data
 * @param groupedData - Object with groups by compared keys from getGroupsByComparedKey
 * @param targetKey - The key to extract matching groups for
 * @param filterByKeyIndex - Index of the key part to filter by (e.g., 0 for first part of the composite key)
 * @param valueSelector - Function to extract the value from each group
 * @returns Array of values from groups with matching timeranges
 */
export function extractValuesForMatchingTimeranges<
  T,
  V extends Record<string, number | undefined | null>,
  R = number,
>(
  groupedData: { [key: string]: ReturnType<typeof groupByTimeRange<T, V>> },
  targetKey: string,
  targetGroup: ReturnType<typeof groupByTimeRange<T, V>>[number],
  valueSelector: (
    group: ReturnType<typeof groupByTimeRange<T, V>>[number],
  ) => R | undefined | null,
  filterByKeyIndex?: number,
): R[] {
  const targetKeyParts = targetKey.split(KEYS_SEPARATOR);
  const filterByValue =
    filterByKeyIndex !== undefined
      ? targetKeyParts[filterByKeyIndex]
      : undefined;

  const result: R[] = [];

  for (const [compareKey, compareGroups] of Object.entries(groupedData)) {
    const compareKeyParts = compareKey.split(KEYS_SEPARATOR);
    // Only compare groups with matching filterByValue (e.g., same topic)
    if (
      filterByKeyIndex === undefined ||
      compareKeyParts[filterByKeyIndex] === filterByValue
    ) {
      const matchingGroup = compareGroups.find(
        (g) =>
          g.startDate.getTime() === targetGroup.startDate.getTime() &&
          g.endDate.getTime() === targetGroup.endDate.getTime(),
      );

      if (matchingGroup) {
        const value = valueSelector(matchingGroup);
        if (value !== undefined && value !== null) {
          result.push(value);
        }
      }
    }
  }

  return result;
}

/**
 * Gets the aggregated values for a given array of values
 * @param values - The array of values to get the aggregated values for
 * @returns The aggregated values
 */
function getAggregatedValues<
  V extends Record<string, number | undefined | null>,
>(values: V[]) {
  const keys = values[0] ? (Object.keys(values[0]) as (keyof V)[]) : [];

  const aggregatedValues = {} as {
    [K in keyof V]: {
      min: number;
      max: number;
      sum: number;
      average: number;
    };
  };

  for (const key of keys) {
    const vals = values.map((v) => v[key]).filter((v) => !isNil(v)) as number[];
    aggregatedValues[key] = {
      min: Math.min(...vals),
      max: Math.max(...vals),
      sum: _.sum(vals),
      average: _.mean(vals),
    };
  }

  return aggregatedValues;
}
