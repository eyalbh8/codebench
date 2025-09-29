"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitCheck = exports.LIMIT_CHECK_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.LIMIT_CHECK_KEY = 'limit-check';
const LimitCheck = (limits) => (0, common_1.SetMetadata)(exports.LIMIT_CHECK_KEY, limits);
exports.LimitCheck = LimitCheck;
//# sourceMappingURL=limit-check.decorator.js.map