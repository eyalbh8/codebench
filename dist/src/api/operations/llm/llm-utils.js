"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractJsonFromOutput = extractJsonFromOutput;
function extractJsonFromOutput(content) {
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '');
        cleanContent = cleanContent.replace(/\n?```\s*$/, '');
    }
    else {
        const match = cleanContent.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
        if (match) {
            cleanContent = match[1].trim();
        }
    }
    return cleanContent;
}
//# sourceMappingURL=llm-utils.js.map