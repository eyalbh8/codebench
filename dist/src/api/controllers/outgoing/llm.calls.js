"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountLlmCallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const descope_auth_guard_1 = require("../../../auth/descope.auth.guard");
const db_user_auth_guard_1 = require("../../../auth/db.user.auth.guard");
const account_decorator_1 = require("../../../auth/account.decorator");
const account_guard_1 = require("../../../auth/account.guard");
const system_admin_auth_guard_1 = require("../../../auth/system-admin-auth.guard");
const llm_calls_dto_1 = require("../../dtos-schemes/llm-calls.dto");
const llm_calls_operations_1 = require("../../operations/llm-calls.operations");
let AccountLlmCallsController = class AccountLlmCallsController {
    constructor(llmCallsService) {
        this.llmCallsService = llmCallsService;
    }
    async getLlmCalls(account, queryParams) {
        return await this.llmCallsService.getAccountLlmCalls(account.id, queryParams);
    }
};
exports.AccountLlmCallsController = AccountLlmCallsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, account_decorator_1.AccountFromRequest)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, llm_calls_dto_1.GetLlmCallsQueryDto]),
    __metadata("design:returntype", Promise)
], AccountLlmCallsController.prototype, "getLlmCalls", null);
exports.AccountLlmCallsController = AccountLlmCallsController = __decorate([
    (0, common_1.Controller)('accounts/:accountId/llm-calls'),
    (0, common_1.UseGuards)(descope_auth_guard_1.DescopeAuthGuard, db_user_auth_guard_1.DBUserAuthGuard, account_guard_1.AccountGuard, system_admin_auth_guard_1.SystemAdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [llm_calls_operations_1.LlmCallsOperations])
], AccountLlmCallsController);
//# sourceMappingURL=llm.calls.js.map