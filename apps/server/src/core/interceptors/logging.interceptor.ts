import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { WinstonLoggerService } from '../logger/winston-logger.service';

/**
 * HTTP logging interceptor for request/response logging with correlation ID support
 * Logs incoming requests and outgoing responses with execution timing
 * Supports correlation ID for distributed tracing
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    // Generate or extract correlation ID
    const correlationId = 
      request.headers['x-correlation-id'] as string || 
      request.headers['correlation-id'] as string ||
      randomUUID();
    
    // Add correlation ID to request for downstream use
    request['correlationId'] = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    // Extract user ID from request if available (from JWT token or session)
    const userId = request['user']?.id || request['user']?.sub;

    const logContext = {
      correlationId,
      userId,
      component: 'HTTP',
      metadata: {
        method,
        url,
        ip,
        userAgent,
        contentLength: headers['content-length'],
      },
    };

    // Log incoming request
    this.logger.log(
      `Incoming ${method} ${url}`,
      {
        ...logContext,
        metadata: {
          ...logContext.metadata,
          // Log request body for non-GET requests (be careful with sensitive data)
          ...(method !== 'GET' && this.shouldLogRequestBody(url) ? {
            body: this.sanitizeRequestBody(request.body),
          } : {}),
        },
      }
    );

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const executionTime = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.log(
            `Outgoing ${method} ${url} - ${statusCode} (${executionTime}ms)`,
            {
              ...logContext,
              metadata: {
                ...logContext.metadata,
                statusCode,
                executionTime,
                responseSize: JSON.stringify(responseData || {}).length,
              },
            }
          );
        },
        error: (error) => {
          const executionTime = Date.now() - startTime;
          const statusCode = error.status || error.statusCode || 500;

          this.logger.error(
            `Failed ${method} ${url} - ${statusCode} (${executionTime}ms)`,
            error,
            {
              ...logContext,
              metadata: {
                ...logContext.metadata,
                statusCode,
                executionTime,
                errorName: error.name,
                errorMessage: error.message,
              },
            }
          );
        },
      })
    );
  }

  /**
   * Determine if request body should be logged based on URL
   * Avoid logging sensitive endpoints like authentication
   */
  private shouldLogRequestBody(url: string): boolean {
    const sensitiveEndpoints = [
      '/auth/login',
      '/auth/signup',
      '/auth/reset-password',
      '/auth/change-password',
    ];

    return !sensitiveEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Sanitize request body to remove sensitive information
   * Remove passwords and other sensitive fields before logging
   */
  private sanitizeRequestBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'confirmPassword', 'token', 'secret', 'apiKey'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
