import { HttpException, HttpStatus } from '@nestjs/common';
import { AppError as AppErrorType } from '@/constants/errors';

/**
 * Custom application error exception class extending NestJS HttpException
 * Provides structured error handling with error codes, HTTP status mapping,
 * and standardized error response formatting
 */
export class ApplicationErrorException extends HttpException {
  /**
   * The application-defined error code object containing error metadata
   */
  public readonly applicationErrorCode: AppErrorType;

  /**
   * The HTTP status code associated with this error
   */
  public readonly httpStatusCode: HttpStatus;

  /**
   * Optional custom error message override
   */
  public readonly customErrorMessage?: string;

  /**
   * Constructs a new application error exception
   * @param applicationErrorCode - The error code definition from constants
   * @param httpStatusCode - Optional HTTP status code, defaults based on error code range
   * @param customErrorMessage - Optional custom message to override default description
   */
  constructor(
    applicationErrorCode: AppErrorType,
    httpStatusCode?: HttpStatus,
    customErrorMessage?: string,
  ) {
    // Determine HTTP status code from error code range if not provided
    const resolvedHttpStatus =
      httpStatusCode ||
      ApplicationErrorException.resolveHttpStatusFromErrorCode(
        applicationErrorCode.code,
      );

    // Use custom message if provided, otherwise fall back to error code description
    const resolvedErrorMessage =
      customErrorMessage || applicationErrorCode.description;

    // Initialize parent HttpException with structured error response
    super(
      {
        error: applicationErrorCode.error,
        code: applicationErrorCode.code,
        description: resolvedErrorMessage,
        title: resolvedErrorMessage,
      },
      resolvedHttpStatus,
    );

    this.applicationErrorCode = applicationErrorCode;
    this.httpStatusCode = resolvedHttpStatus;
    this.customErrorMessage = customErrorMessage;
  }

  /**
   * Maps error code ranges to appropriate HTTP status codes
   * Error codes are grouped by category for systematic status code assignment
   * @param errorCode - The numeric error code to map
   * @returns The corresponding HTTP status code
   */
  private static resolveHttpStatusFromErrorCode(errorCode: number): HttpStatus {
    // Authentication and authorization errors (1000-1999)
    if (errorCode >= 1000 && errorCode < 2000) {
      // Special case: 1001 maps to UNAUTHORIZED, others to FORBIDDEN
      return errorCode === 1001
        ? HttpStatus.UNAUTHORIZED
        : HttpStatus.FORBIDDEN;
    }
    // Validation and input errors (2000-2999)
    else if (errorCode >= 2000 && errorCode < 3000) {
      return HttpStatus.BAD_REQUEST;
    }
    // Resource not found errors (3000-3999)
    else if (errorCode >= 3000 && errorCode < 4000) {
      return HttpStatus.NOT_FOUND;
    }
    // Business logic and constraint errors (4000-4999)
    else if (errorCode >= 4000 && errorCode < 5000) {
      return HttpStatus.BAD_REQUEST;
    }
    // External service integration errors (5000-5999)
    else if (errorCode >= 5000 && errorCode < 6000) {
      return HttpStatus.BAD_GATEWAY;
    }
    // System and infrastructure errors (6000-6999)
    else if (errorCode >= 6000 && errorCode < 7000) {
      // Special case: 6002 indicates service unavailable
      return errorCode === 6002
        ? HttpStatus.SERVICE_UNAVAILABLE
        : HttpStatus.INTERNAL_SERVER_ERROR;
    }
    // Schema and data format errors (7000-7999)
    else if (errorCode >= 7000 && errorCode < 8000) {
      return HttpStatus.BAD_REQUEST;
    }

    // Default fallback for unrecognized error codes
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Retrieves the application error code object
   * @returns The error code definition object
   */
  getApplicationErrorCode(): AppErrorType {
    return this.applicationErrorCode;
  }

  /**
   * Builds a standardized error response object
   * Combines error code metadata with custom message if provided
   * @returns Formatted error response for API consumers
   */
  buildErrorResponsePayload() {
    return {
      error: this.applicationErrorCode.error,
      code: this.applicationErrorCode.code,
      description:
        this.customErrorMessage || this.applicationErrorCode.description,
      title: this.customErrorMessage || this.applicationErrorCode.title,
      message: this.customErrorMessage || this.applicationErrorCode.description,
    };
  }
}
