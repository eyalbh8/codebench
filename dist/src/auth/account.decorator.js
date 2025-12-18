"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountFromRequest = void 0;
const common_1 = require("@nestjs/common");
exports.AccountFromRequest = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.account) {
        throw new common_1.UnauthorizedException('AccountFromRequest -Account not found in request');
    }
    return request.account;
});
//# sourceMappingURL=account.decorator.js.map