"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPageTitle = exports.convertToUrl = exports.convertPrismaNumberToNumber = void 0;
exports.calculateAppearanceCountChangesByComparedKey = calculateAppearanceCountChangesByComparedKey;
exports.mapMentionsCount = mapMentionsCount;
exports.parseTextWithSources = parseTextWithSources;
const library_1 = require("@prisma/client/runtime/library");
const lodash_1 = __importDefault(require("lodash"));
const convertPrismaNumberToNumber = (value) => {
    if (value == null) {
        return null;
    }
    switch (typeof value) {
        case 'bigint':
            return Number(value);
        case 'number':
            return value;
        case 'object':
            if (value instanceof library_1.Decimal) {
                return Number(value);
            }
            return null;
        default:
            return null;
    }
};
exports.convertPrismaNumberToNumber = convertPrismaNumberToNumber;
const convertToUrl = (url) => {
    if (url.startsWith('http')) {
        return new URL(url);
    }
    return new URL(`https://${url}`);
};
exports.convertToUrl = convertToUrl;
const extractPageTitle = (url) => {
    if (url.pathname === '/') {
        return 'Home Page';
    }
    return lodash_1.default.capitalize(url.pathname.split('/')[1] ?? '');
};
exports.extractPageTitle = extractPageTitle;
function calculateAppearanceCountChangesByComparedKey(appearances, comparedKeys) {
    const getKey = (item) => comparedKeys.map((k) => item[k]).join('|');
    const groupedByComparedKey = lodash_1.default.groupBy(appearances, getKey);
    const processedAppearances = Object.values(groupedByComparedKey).flatMap((comparedKeyAppearances) => {
        const sortedAppearances = lodash_1.default.sortBy(comparedKeyAppearances, 'rundate');
        return sortedAppearances.map((current, index) => {
            const currentCount = (0, exports.convertPrismaNumberToNumber)(current.appearances_count) ?? 0;
            if (index === 0) {
                return {
                    ...current,
                    appearances_count: currentCount,
                    appearance_count_change: null,
                };
            }
            const previousAppearance = sortedAppearances[index - 1];
            const previousCount = (0, exports.convertPrismaNumberToNumber)(previousAppearance.appearances_count) ??
                0;
            const percentageChange = previousCount === 0
                ? 0
                : ((currentCount - previousCount) / previousCount) * 100;
            return {
                ...current,
                appearances_count: currentCount,
                appearance_count_change: percentageChange,
            };
        });
    });
    return lodash_1.default.sortBy(processedAppearances, 'rundate');
}
function mapMentionsCount(mentionsCount) {
    if (mentionsCount === undefined) {
        return 0;
    }
    return Math.round(mentionsCount);
}
function parseTextWithSources(item) {
    const matches = [...item.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    const sources = matches.map((m) => ({ site: m[1], link: m[2] }));
    let text = item
        .replace(/,?\s*\[([^\]]+)\]\(([^)]+)\)/g, '')
        .trim();
    text = text
        .replace(/\s*[\(\)\[\]]\s*/g, ' ')
        .replace(/\s+[,;]\s*$/, '')
        .trim();
    text = text.replace(/\s{2,}/g, ' ');
    return { text, sources };
}
//# sourceMappingURL=mappers.js.map