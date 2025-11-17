import { AccountsService } from '@/api/operations/accounts.service';
import { PipeTransform, Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';

@Injectable()
export class ParseAccountPipe
  implements PipeTransform<string, Promise<Account>>
{
  constructor(private readonly accountService: AccountsService) {}

  async transform(id: string): Promise<Account> {
    return await this.accountService.getAccountById(id);
  }
}
