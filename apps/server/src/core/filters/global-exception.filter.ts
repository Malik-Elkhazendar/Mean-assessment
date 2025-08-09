import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../logger/winston-logger.service';
import { HTTP_STATUS, ERROR_MESSAGES } from '@mean-assessment/constants';

/**
 * Global exception filter for catching all unhandled exceptions
 * Provides fallback error handling and logging for unexpected errors
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = request['correlationId'];
    const status = this.getHttpStatus(exception);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      error: {
        name: exception.name || 'UnknownError',
        message: this.getErrorMessage(exception, status),
        details: this.getErrorDetails(exception),
      },
    };

    // Log the unhandled exception
    this.logger.error(
      `Unhandled Exception: ${exception.message || 'Unknown error occurred'}`,
      exception,
      {
        correlationId,
        component: 'GlobalExceptionFilter',
        metadata: {
          statusCode: status,
          path: request.url,
          method: request.method,
          exceptionType: exception.constructor?.name,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
          userId: request['user']?.id,
          stack: exception.stack,
        },
      }
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Determine HTTP status code from exception
   */
  private getHttpStatus(exception: Error & { getStatus?: () => number; status?: number; statusCode?: number }): number {
    // Check for NestJS HttpException
    if (exception.getStatus && typeof exception.getStatus === 'function') {
      return exception.getStatus();
    }

    // Check for status property
    if (exception.status && typeof exception.status === 'number') {
      return exception.status;
    }

    // Check for statusCode property
    if (exception.statusCode && typeof exception.statusCode === 'number') {
      return exception.statusCode;
    }

    // Default to internal server error
    return HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  /**
   * Extract error message from exception
   */
  private getErrorMessage(exception: Error, status: number): string {
    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && status >= 500) {
      return ERROR_MESSAGES.GENERAL.SERVER_ERROR;
    }

    // Extract message from various exception formats
    if (exception.message) {
      return exception.message;
    }

    if (typeof exception === 'string') {
      return exception;
    }

    // Fallback based on status code
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return 'Bad Request';
      case HTTP_STATUS.UNAUTHORIZED:
        return 'Unauthorized';
      case HTTP_STATUS.FORBIDDEN:
        return 'Forbidden';
      case HTTP_STATUS.NOT_FOUND:
        return 'Not Found';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      default:
        return ERROR_MESSAGES.GENERAL.SERVER_ERROR;
    }
  }

  /**
   * Extract additional error details from exception
   */
  private getErrorDetails(exception: Error & { code?: string; errors?: unknown[]; response?: Record<string, unknown> }): Record<string, unknown> | undefined {
    const isProduction = process.env.NODE_ENV === 'production';

    // Don't expose sensitive details in production
    if (isProduction) {
      return undefined;
    }

    const details: Record<string, unknown> = {};

    // Add exception type
    if (exception.constructor?.name) {
      details.type = exception.constructor.name;
    }

    // Add error code if available
    if (exception.code) {
      details.code = exception.code;
    }

    // Add validation errors if available
    if (exception.errors && Array.isArray(exception.errors)) {
      details.validationErrors = exception.errors;
    }

    // Add response data if available (from HTTP exceptions)
    if (exception.response && typeof exception.response === 'object') {
      details.response = exception.response;
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }
}
