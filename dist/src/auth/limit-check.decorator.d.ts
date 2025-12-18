export declare const LIMIT_CHECK_KEY = "limit-check";
export type LimitOptions = {
    promptsLimit?: boolean;
    regionsLimit?: boolean;
    topicsLimit?: boolean;
};
export declare const LimitCheck: (limits: LimitOptions) => import("@nestjs/common").CustomDecorator<string>;
