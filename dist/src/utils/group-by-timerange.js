"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYS_SEPARATOR = void 0;
exports.groupByTimeRange = groupByTimeRange;
exports.getGroupsByComparedKey = getGroupsByComparedKey;
exports.extractValuesForMatchingTimeranges = extractValuesForMatchingTimeranges;
const lodash_1 = __importStar(require("lodash"));
function groupByTimeRange(items, timerange, getValues, getDate, scans) {
    const wrappedGetDate = (item) => new Date(getDate(item).toDateString());
    if (!Array.isArray(items) || items.length === 0 || timerange < 1)
        return [];
    const sorted = [...items].sort((a, b) => wrappedGetDate(a).getTime() - wrappedGetDate(b).getTime());
    const minDate = wrappedGetDate(sorted[0]);
    const rawMaxDate = lodash_1.default.maxBy(scans, 'scheduledAt').scheduledAt;
    const maxDate = new Date(rawMaxDate);
    maxDate.setHours(23, 59, 59, 999);
    const result = [];
    let currentEndDate = new Date(maxDate);
    while (currentEndDate.getTime() >= minDate.getTime()) {
        const currentStartDate = new Date(currentEndDate);
        currentStartDate.setDate(currentStartDate.getDate() - timerange + 1);
        currentStartDate.setHours(0, 0, 0, 0);
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
        }
        else {
            result.push({
                startDate: currentStartDate,
                endDate: currentEndDate,
                aggregatedValues: {},
                items: [],
            });
        }
        currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentEndDate.getDate() - 1);
        currentEndDate.setHours(23, 59, 59, 999);
    }
    return result.filter((group) => scans.some((run) => run.scheduledAt >= group.startDate && run.scheduledAt <= group.endDate));
}
exports.KEYS_SEPARATOR = '|';
function getGroupsByComparedKey(items, keys, timerange, getValues, getDate, scans) {
    const getKey = (item) => keys.map((k) => item[k]).join(exports.KEYS_SEPARATOR);
    const groupedByComparedKey = lodash_1.default.groupBy(items, getKey);
    const result = {};
    for (const key in groupedByComparedKey) {
        result[key] = groupByTimeRange(groupedByComparedKey[key], timerange, getValues, getDate, scans);
    }
    return result;
}
function extractValuesForMatchingTimeranges(groupedData, targetKey, targetGroup, valueSelector, filterByKeyIndex) {
    const targetKeyParts = targetKey.split(exports.KEYS_SEPARATOR);
    const filterByValue = filterByKeyIndex !== undefined
        ? targetKeyParts[filterByKeyIndex]
        : undefined;
    const result = [];
    for (const [compareKey, compareGroups] of Object.entries(groupedData)) {
        const compareKeyParts = compareKey.split(exports.KEYS_SEPARATOR);
        if (filterByKeyIndex === undefined ||
            compareKeyParts[filterByKeyIndex] === filterByValue) {
            const matchingGroup = compareGroups.find((g) => g.startDate.getTime() === targetGroup.startDate.getTime() &&
                g.endDate.getTime() === targetGroup.endDate.getTime());
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
function getAggregatedValues(values) {
    const keys = values[0] ? Object.keys(values[0]) : [];
    const aggregatedValues = {};
    for (const key of keys) {
        const vals = values.map((v) => v[key]).filter((v) => !(0, lodash_1.isNil)(v));
        aggregatedValues[key] = {
            min: Math.min(...vals),
            max: Math.max(...vals),
            sum: lodash_1.default.sum(vals),
            average: lodash_1.default.mean(vals),
        };
    }
    return aggregatedValues;
}
//# sourceMappingURL=group-by-timerange.js.map