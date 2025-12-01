import { HttpException, HttpStatus } from '@nestjs/common';

export class AppError extends HttpException {
  constructor(
    message: string,
    code: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: string,
  ) {
    super(
      {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

export class AccountError extends AppError {
  constructor(message: string, details?: string) {
    super(message, 'ACCOUNT_ERROR', HttpStatus.BAD_REQUEST, details);
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: string) {
    super(message, 'AUTH_ERROR', HttpStatus.UNAUTHORIZED, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: string) {
    super(message, 'NOT_FOUND_ERROR', HttpStatus.NOT_FOUND, details);
  }
} 