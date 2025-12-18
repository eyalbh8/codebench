/**
 * Calculates the previous value based on the current value and percentage change.
 *
 * @param currentValue - The current value
 * @param percentageChange - The percentage change (can be null)
 * @returns The calculated previous value
 */
export function calculatePreviousValueFromPercentage(
  currentValue: number,
  percentageChange: number | null,
): number {
  // Case 1: No change (null or 0%) => Previous value equals current value
  if (percentageChange === null || percentageChange === 0) {
    return currentValue;
  }

  const pctDecimal = percentageChange / 100;

  // Case 2: -100% change
  if (pctDecimal === -1) {
    if (currentValue === 0) {
      return 0; // Cannot determine previous value > 0, return 0
    } else {
      return currentValue; // Fallback for impossible situation (current > 0 and -100% change)
    }
  }

  // Case 3: All other percentage changes: previous = current / (pctDecimal + 1)
  const previousValue = currentValue / (pctDecimal + 1);
  return previousValue;
}

/**
 * Calculates the percentage change between current and previous values.
 * Handles edge cases like division by zero and rounds the result.
 *
 * @param currentValue - The current value
 * @param previousValue - The previous value
 * @returns The formatted percentage change
 */
export function calculatePercentageChange(
  currentValue?: number,
  previousValue?: number,
): number | null {
  if (previousValue === undefined) {
    return null;
  }
  if (currentValue === undefined) {
    currentValue = 0;
  }
  // Handle division by zero / non-finite results for the percentage change
  if (previousValue === 0 || !Number.isFinite(previousValue)) {
    return currentValue > 0 ? Infinity : 0;
  }

  const absoluteChange = currentValue - previousValue;
  const percentageChange = (absoluteChange / previousValue) * 100;

  // Round the percentage change to 2 decimal places
  return Number.isFinite(percentageChange)
    ? Math.round(percentageChange * 100) / 100
    : percentageChange; // Keep Infinity as is
}

/**
 * Calculates the rank of a value in a list of values.
 *
 * @param rankedValue - The value to calculate the rank for
 * @param values - The list of values to calculate the rank for
 * @returns The rank of the value
 */
export function calculateRank(
  rankedValue?: number,
  values?: number[],
): number | null {
  if (!rankedValue || !values) {
    return null;
  }
  const sortedValues = [...values].sort((a, b) => b - a);

  // Count how many values are greater than the ranked value
  let rank = 1;
  for (const value of sortedValues) {
    if (value > rankedValue) {
      rank++;
    } else {
      break;
    }
  }

  return rank;
}

export function getFormattedDate(): string {
  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');

  const yy = now.getFullYear().toString().slice(-2);
  const mm = pad(now.getMonth() + 1); // months are 0-indexed
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());

  return `${yy}${mm}${dd}-${hh}${min}`;
}
