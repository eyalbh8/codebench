import { AccountsService } from '@/api/operations/accounts.service';
import { PipeTransform } from '@nestjs/common';
import { Account } from '@prisma/client';
export declare class ParseAccountPipe implements PipeTransform<string, Promise<Account>> {
    private readonly accountService;
    constructor(accountService: AccountsService);
    transform(id: string): Promise<Account>;
}
