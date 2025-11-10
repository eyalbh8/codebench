import { Decimal } from '@prisma/client/runtime/library';
export declare const convertPrismaNumberToNumber: (value?: bigint | number | null | Decimal) => number | null;
export declare const convertToUrl: (url: string) => URL;
export declare const extractPageTitle: (url: URL) => string;
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
export declare function calculateAppearanceCountChangesByComparedKey<T extends WithAppearanceCount>(appearances: T[], comparedKeys: (keyof T)[]): (T & WithAppearanceCountChange)[];
export declare function mapMentionsCount(mentionsCount?: number): number;
export declare function parseTextWithSources(item: string): {
    text: string;
    sources: {
        site: string;
        link: string;
    }[];
};
export {};
