import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DescopeAuthGuard } from '@/auth/descope.auth.guard';
import { DBUserAuthGuard } from '@/auth/db.user.auth.guard';

import { AccountFromRequest } from '@/auth/account.decorator';
import { PopulatedAccount } from '@/types/api';
import { AccountGuard } from '@/auth/account.guard';
import { SystemAdminAuthGuard } from '@/auth/system-admin-auth.guard';
import { GetLlmCallsQueryDto } from '@/api/dtos-schemes/llm-calls.dto';
import { LlmCallsOperations } from '@/api/operations/llm-calls.operations';
@Controller('accounts/:accountId/llm-calls')
@UseGuards(
  DescopeAuthGuard,
  DBUserAuthGuard,
  AccountGuard,
  SystemAdminAuthGuard,
)
@ApiBearerAuth()
export class AccountLlmCallsController {
  constructor(private readonly llmCallsService: LlmCallsOperations) {}

  @Get()
  async getLlmCalls(
    @AccountFromRequest() account: PopulatedAccount,
    @Query() queryParams: GetLlmCallsQueryDto,
  ) {
    return await this.llmCallsService.getAccountLlmCalls(
      account.id,
      queryParams,
    );
  }
}
