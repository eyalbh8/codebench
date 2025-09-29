import { Injectable, LoggerService } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AppLogger implements LoggerService {
  constructor(private readonly cls: ClsService) {}

  private log_levels = ['error', 'warn', 'info', 'exception'];
  private readonly contextKeys = [
    'error',
    'errorCode',
    'errorType',
    'userId',
    'accountId',
    'accountName',
    'requestId',
    'runId',
    'userEmail',
    'path',
    'method',
    'version',
    'asyncJobId',
  ];

  private getColorCode(level: string): string {
    const colors = {
      error: '\x1b[31m', // Red
      exception: '\x1b[31m', // Red
      warn: '\x1b[33m', // Yellow
      info: '\x1b[36m', // Cyan
      debug: '\x1b[90m', // Gray
    };
    return colors[level] || '\x1b[0m'; // Default: no color
  }

  private formatLog(
    level: string,
    message: string,
    meta: Record<string, any> = {},
  ) {
    let context = {};
    if (this.cls) {
      context = Object.fromEntries(
        this.contextKeys.map((key) => [key, this.cls.get(key)]),
      );
    }

    if (process.env.NODE_ENV === 'development') {
      const colorCode = this.getColorCode(level);
      const resetCode = '\x1b[0m';
      const logMessage = `${colorCode}${new Date().toISOString()} - ${level.toUpperCase()}${resetCode} - ${message} - ${JSON.stringify(meta)}`;
      const newLineMessage = logMessage.replace(/\\n/g, '\n');
      console.log(newLineMessage);
    } else {
      const logEntry = {
        level,
        timestamp: new Date().toISOString(),
        message,
        ...context,
        ...meta,
      };

      process.stdout.write(JSON.stringify(logEntry) + '\n');
    }
  }

  log(message: string, meta?: Record<string, any>) {
    if (this.log_levels.includes('info')) {
      this.formatLog('info', message, meta);
    }
  }

  error(message: string, meta?: Record<string, any>) {
    if (this.log_levels.includes('error')) {
      this.formatLog('error', message, meta);
    }
  }

  warn(message: string, meta?: Record<string, any>) {
    if (this.log_levels.includes('warn')) {
      this.formatLog('warn', message, meta);
    }
  }

  debug(message: string, meta?: Record<string, any>) {
    if (this.log_levels.includes('debug')) {
      this.formatLog('debug', message, meta);
    }
  }

  exception(message: string, meta?: Record<string, any>) {
    if (this.log_levels.includes('exception')) {
      this.formatLog('exception', message, meta);
    }
  }
}
