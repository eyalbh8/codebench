import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { AuthRequest, PopulatedAccount } from '@/types/api';

import {
  NewUserCreationRequestDto,
  UserAccountDetachmentRequestDto,
  UserAccountAttachmentRequestDto,
} from '@/api/dtos-schemes/user.dto';
import { UsersService } from '@/api/operations/users.service';
import { SystemAdminAuthGuard } from '@/auth/system-admin-auth.guard';
import { boolean } from 'zod';
import { AccountAdminGuard } from '@/auth/account.admin.guard';
import { DescopeAuthGuard } from '@/auth/descope.auth.guard';
import { DBUserAuthGuard } from '@/auth/db.user.auth.guard';
import { AccountMemberGuard } from '@/auth/account.member.guard';
import { Account } from '@prisma/client';
import { AccountFromRequest } from '@/auth/account.decorator';
import { AccountActiveGuard } from '@/auth/account.active.guard';
import { AccountGuard } from '@/auth/account.guard';

@Controller('users')
@UseGuards(DescopeAuthGuard, DBUserAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users - Create a new user (System Admin only)
  @UseGuards(SystemAdminAuthGuard)
  @Post()
  async createNewUser(
    @Req() req: AuthRequest,
    @Body() body: NewUserCreationRequestDto,
  ) {
    return await this.usersService.createUser(body);
  }

  // DELETE /users - Remove a user (System Admin only)
  @UseGuards(SystemAdminAuthGuard)
  @Post('remove')
  async removeUserById(
    @Req() req: AuthRequest,
    @Body() body: UserAccountDetachmentRequestDto,
  ) {
    return await this.usersService.removeUser(body.userId);
  }

  // POST /users/accounts/:accountId/members - Add a team member to an account (Admin only)
  @UseGuards(AccountGuard, AccountActiveGuard, AccountAdminGuard)
  @Post('accounts/:accountId/members')
  @ZodSerializerDto(boolean())
  @ApiOkResponse({ type: Boolean, description: 'Attach a user to an account' })
  async addTeamMemberToAccount(
    @AccountFromRequest() account: PopulatedAccount,
    @Body() body: UserAccountAttachmentRequestDto,
  ) {
    return await this.usersService.addTeamMemberToAccount({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      account,
      roles: body.roles,
    });
  }
}
