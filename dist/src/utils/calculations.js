"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePreviousValueFromPercentage = calculatePreviousValueFromPercentage;
exports.calculatePercentageChange = calculatePercentageChange;
exports.calculateRank = calculateRank;
exports.getFormattedDate = getFormattedDate;
function calculatePreviousValueFromPercentage(currentValue, percentageChange) {
    if (percentageChange === null || percentageChange === 0) {
        return currentValue;
    }
    const pctDecimal = percentageChange / 100;
    if (pctDecimal === -1) {
        if (currentValue === 0) {
            return 0;
        }
        else {
            return currentValue;
        }
    }
    const previousValue = currentValue / (pctDecimal + 1);
    return previousValue;
}
function calculatePercentageChange(currentValue, previousValue) {
    if (previousValue === undefined) {
        return null;
    }
    if (currentValue === undefined) {
        currentValue = 0;
    }
    if (previousValue === 0 || !Number.isFinite(previousValue)) {
        return currentValue > 0 ? Infinity : 0;
    }
    const absoluteChange = currentValue - previousValue;
    const percentageChange = (absoluteChange / previousValue) * 100;
    return Number.isFinite(percentageChange)
        ? Math.round(percentageChange * 100) / 100
        : percentageChange;
}
function calculateRank(rankedValue, values) {
    if (!rankedValue || !values) {
        return null;
    }
    const sortedValues = [...values].sort((a, b) => b - a);
    let rank = 1;
    for (const value of sortedValues) {
        if (value > rankedValue) {
            rank++;
        }
        else {
            break;
        }
    }
    return rank;
}
function getFormattedDate() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const yy = now.getFullYear().toString().slice(-2);
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    return `${yy}${mm}${dd}-${hh}${min}`;
}
//# sourceMappingURL=calculations.js.map