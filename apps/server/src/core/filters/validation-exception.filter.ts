import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../logger/winston-logger.service';

/**
 * Global validation exception filter for handling class-validator errors
 * Transforms validation errors into user-friendly response format
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as { message?: string[] | string; error?: string };
    const correlationId = request['correlationId'];

    // Check if this is a validation error
    const isValidationError = 
      exceptionResponse?.message &&
      Array.isArray(exceptionResponse.message) &&
      exceptionResponse.message.length > 0 &&
      typeof exceptionResponse.message[0] === 'string';

    let errorResponse;

    if (isValidationError) {
      // Transform validation errors into structured format
      const messages = Array.isArray(exceptionResponse.message) 
        ? exceptionResponse.message 
        : exceptionResponse.message 
          ? [exceptionResponse.message]
          : ['Validation failed'];
      const validationErrors = this.transformValidationErrors(messages);
      
      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        correlationId,
        error: {
          name: 'ValidationError',
          message: 'Validation failed',
          details: {
            fields: validationErrors,
            summary: `${Object.keys(validationErrors).length} field(s) failed validation`,
          },
        },
      };

      this.logger.warn(
        `Validation Error: ${Object.keys(validationErrors).length} field(s) failed validation`,
        {
          correlationId,
          component: 'ValidationExceptionFilter',
          metadata: {
            statusCode: status,
            path: request.url,
            method: request.method,
            validationErrors,
            fieldsCount: Object.keys(validationErrors).length,
          },
        }
      );
    } else {
      // Handle as regular BadRequestException
      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        correlationId,
        error: {
          name: 'BadRequestError',
          message: exceptionResponse.message || 'Bad Request',
          details: exceptionResponse.error ? { error: exceptionResponse.error } : undefined,
        },
      };

      this.logger.warn(
        `Bad Request: ${exceptionResponse.message || 'Bad Request'}`,
        {
          correlationId,
          component: 'ValidationExceptionFilter',
          metadata: {
            statusCode: status,
            path: request.url,
            method: request.method,
          },
        }
      );
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Transform class-validator error messages into structured field errors
   */
  private transformValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    messages.forEach(message => {
      // Extract field name from validation error message
      // Format: "property field_name has failed the following constraints: constraint_name"
      const fieldMatch = message.match(/property (\w+) has failed/);
      const constraintMatch = message.match(/constraints: (.+)$/);

      if (fieldMatch && constraintMatch) {
        const fieldName = fieldMatch[1];
        const constraint = constraintMatch[1];
        
        if (!errors[fieldName]) {
          errors[fieldName] = [];
        }
        errors[fieldName].push(this.humanizeConstraint(fieldName, constraint));
      } else {
        // Fallback for unexpected message format
        if (!errors.general) {
          errors.general = [];
        }
        errors.general.push(message);
      }
    });

    return errors;
  }

  /**
   * Convert constraint names to human-readable messages
   */
  private humanizeConstraint(fieldName: string, constraint: string): string {
    const constraintMap: Record<string, (field: string) => string> = {
      isNotEmpty: (field) => `${field} is required`,
      isEmail: (field) => `${field} must be a valid email address`,
      minLength: (field) => `${field} is too short`,
      maxLength: (field) => `${field} is too long`,
      isString: (field) => `${field} must be a string`,
      isNumber: (field) => `${field} must be a number`,
      isBoolean: (field) => `${field} must be a boolean`,
      matches: (field) => `${field} format is invalid`,
    };

    const humanizer = constraintMap[constraint];
    return humanizer ? humanizer(fieldName) : `${fieldName} validation failed: ${constraint}`;
  }
}
