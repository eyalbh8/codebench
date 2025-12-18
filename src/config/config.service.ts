import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ERROR_CODES } from '@/constants/errors';
import { ApplicationErrorException } from '@/exceptions/app-error.exception';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<T = string>(key: string, defaultValue?: T): T {
    const value = this.configService.get<T>(key);
    if (!value && !defaultValue) {
      const error = new ApplicationErrorException(
        ERROR_CODES.CONFIGURATION_ERROR,
      );
      error.message = `Configuration error: ${key} is not set`;
      throw error;
    }
    return value ?? defaultValue!;
  }

  // Add additional configuration methods as needed
}
