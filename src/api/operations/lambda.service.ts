import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@/prisma/prisma.service';
import { AppLogger } from '@/utils/app-logger.service';
import { ConfigService } from '@/config/config.service';
import { RunStatus } from '@/model.enums';

@Injectable()
export class LambdaOperations {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly configurationService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async checkScanRunStatus(accountId: string): Promise<boolean> {
    const lastAccountRun = await this.prisma.scan.findFirst({
      where: { accountId: accountId },
      orderBy: { createdAt: 'desc' },
    });
    let doScan = true;
    if (lastAccountRun && lastAccountRun.status === RunStatus.COMPLETED) {
      const MAX_INTERVAL_BETWEEN_SCANS = 24; // 24 hours
      const maxIntervalBetweenScans = parseInt(
        this.configurationService.get<string>(
          'MAX_INTERVAL_BETWEEN_SCANS',
          MAX_INTERVAL_BETWEEN_SCANS.toString(),
        ),
        10,
      );

      const maxIntervalBetweenScansInMilliseconds =
        maxIntervalBetweenScans * 60 * 60 * 1000;
      this.logger.log(
        `Max interval between scans: ${maxIntervalBetweenScans} hours`,
      );
      doScan =
        lastAccountRun.createdAt.getTime() +
          maxIntervalBetweenScansInMilliseconds <
        Date.now();
    }
    if (doScan) {
      return true;
    }
    return false;
  }
}
