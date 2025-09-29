import { AccountsService } from '@/api/operations/accounts.service';
import { CompetitorsOperations } from '@/api/operations/competitors.service';
import { LlmService } from '@/api/operations/llm/llm.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { Account, Competitor } from '@prisma/client';
import { DBUserAuthGuard } from '@/auth/db.user.auth.guard';
import { AccountMemberGuard } from '@/auth/account.member.guard';
import { DescopeAuthGuard } from '@/auth/descope.auth.guard';
import { AccountFromRequest } from '@/auth/account.decorator';
import { AuthRequest, PopulatedAccount } from '@/types/api';
import { AccountActiveGuard } from '@/auth/account.active.guard';
import { AccountGuard } from '@/auth/account.guard';
import { AccountAdminGuard } from '@/auth/account.admin.guard';
import { any } from 'zod';
@Controller('accounts/:accountId/competitors')
@UseGuards(
  DescopeAuthGuard,
  DBUserAuthGuard,
  AccountGuard, // ensure account is loaded
  AccountMemberGuard,
  AccountActiveGuard,
)
@ApiBearerAuth()
export class CompetitorsController {
  constructor(private readonly competitorsService: CompetitorsOperations) {}

  // GET /accounts/:accountId/competitors - Get all competitors for an account
  @Get()
  async getAllCompetitors(@AccountFromRequest() account: PopulatedAccount) {
    return await this.competitorsService.getAllActiveCompetitors(account);
  }

  // POST /accounts/:accountId/competitors - Create a new competitor (Admin only)
  @Post()
  @UseGuards(AccountAdminGuard)
  async createNewCompetitor(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() competitor: Competitor,
  ) {
    return await this.competitorsService.createNewCompetitor(
      account,
      competitor,
    );
  }

  // PUT /accounts/:accountId/competitors/:competitorId - Update competitor details
  @Put(':competitorId')
  async updateCompetitorById(
    @AccountFromRequest() account: PopulatedAccount,
    @Param('competitorId') competitorId: string,
    @Body() competitor: Competitor,
  ) {
    return await this.competitorsService.updateCompetitorById(
      account,
      competitorId,
      competitor,
    );
  }

  // DELETE /accounts/:accountId/competitors/:competitorId - Delete a competitor
  @Delete(':competitorId')
  async deleteCompetitorById(
    @AccountFromRequest() account: PopulatedAccount,
    @Param('competitorId') competitorId: string,
  ) {
    return await this.competitorsService.deleteCompetitorById(
      account,
      competitorId,
    );
  }

  // POST /accounts/:accountId/competitors/nominees/delete - Delete a nominee
  @Post('nominees/delete')
  async deleteNomineeById(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() nominee: string,
  ) {
    return await this.competitorsService.deleteNomineeByName(account, nominee);
  }
}
