import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../logger/winston-logger.service';

/**
 * Global HTTP exception filter for handling standard HttpException instances
 * Provides consistent error response format and logging
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const correlationId = request['correlationId'];

    // Extract error details
    const errorDetails = typeof exceptionResponse === 'object' 
      ? exceptionResponse as Record<string, unknown>
      : { message: exceptionResponse };

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      error: {
        name: exception.name,
        message: errorDetails.message || exception.message,
        details: errorDetails.message !== errorDetails ? errorDetails : undefined,
      },
    };

    // Log the exception
    this.logger.error(
      `HTTP Exception: ${exception.message}`,
      exception,
      {
        correlationId,
        component: 'HttpExceptionFilter',
        metadata: {
          statusCode: status,
          path: request.url,
          method: request.method,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
          userId: request['user']?.id,
        },
      }
    );

    response.status(status).json(errorResponse);
  }
}
