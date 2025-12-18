import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global HTTP exception filter
 * Catches all HTTP exceptions and formats the response consistently
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // If the exception response is already formatted (from ApplicationErrorException),
    // use it directly. Otherwise, format it.
    const errorResponse =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? exceptionResponse
        : {
            statusCode: status,
            message: exception.message || 'An error occurred',
            error: HttpStatus[status] || 'Error',
          };

    response.status(status).json(errorResponse);
  }
}
