import { Scan } from '@prisma/client';
export declare function groupByTimeRange<T, V extends Record<string, number | undefined | null>>(items: T[], timerange: number, getValues: (item: T) => V, getDate: (item: T) => Date, scans: Scan[]): Array<{
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
}>;
export declare const KEYS_SEPARATOR = "|";
export declare function getGroupsByComparedKey<T, V extends Record<string, number | undefined | null>>(items: T[], keys: (keyof T)[], timerange: number, getValues: (item: T) => V, getDate: (item: T) => Date, scans: Scan[]): {
    [key: string]: ReturnType<typeof groupByTimeRange<T, V>>;
};
export declare function extractValuesForMatchingTimeranges<T, V extends Record<string, number | undefined | null>, R = number>(groupedData: {
    [key: string]: ReturnType<typeof groupByTimeRange<T, V>>;
}, targetKey: string, targetGroup: ReturnType<typeof groupByTimeRange<T, V>>[number], valueSelector: (group: ReturnType<typeof groupByTimeRange<T, V>>[number]) => R | undefined | null, filterByKeyIndex?: number): R[];
