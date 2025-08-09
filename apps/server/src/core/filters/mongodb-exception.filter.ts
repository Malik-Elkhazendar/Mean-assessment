import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { WinstonLoggerService } from '../logger/winston-logger.service';
import { HTTP_STATUS } from '@mean-assessment/constants';

/**
 * Interface for parsed MongoDB error information
 */
interface ParsedMongoError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
  code?: number | string;
  collection?: string;
  operation?: string;
}

/**
 * Global MongoDB exception filter for handling MongoDB and Mongoose errors
 * Transforms database errors into user-friendly responses
 */
@Catch(MongoError, MongooseError)
export class MongoDBExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: MongoError | MongooseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request['correlationId'];

    const errorInfo = this.parseMongoError(exception);

    const errorResponse = {
      statusCode: errorInfo.status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      error: {
        name: errorInfo.name,
        message: errorInfo.message,
        details: errorInfo.details,
      },
    };

    // Log the database error
    this.logger.error(
      `Database Error: ${errorInfo.message}`,
      exception,
      {
        correlationId,
        component: 'MongoDBExceptionFilter',
        metadata: {
          statusCode: errorInfo.status,
          path: request.url,
          method: request.method,
          errorCode: errorInfo.code,
          collection: errorInfo.collection,
          operation: errorInfo.operation,
        },
      }
    );

    response.status(errorInfo.status).json(errorResponse);
  }

  /**
   * Parse MongoDB/Mongoose errors and extract relevant information
   */
  private parseMongoError(exception: MongoError | MongooseError): ParsedMongoError {
    // Handle MongoError (native MongoDB driver errors)
    if (exception instanceof MongoError) {
      return this.parseNativeMongoError(exception);
    }

    // Handle Mongoose errors
    if (exception instanceof MongooseError.ValidationError) {
      return this.parseValidationError(exception);
    }

    if (exception instanceof MongooseError.CastError) {
      return this.parseCastError(exception);
    }

    if (exception instanceof MongooseError.DocumentNotFoundError) {
      return {
        status: HTTP_STATUS.NOT_FOUND,
        name: 'DocumentNotFoundError',
        message: 'The requested document was not found',
        details: { message: 'Document not found' },
      };
    }

    // Generic Mongoose error
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      name: exception.name,
      message: 'Database operation failed',
      details: { originalMessage: exception.message },
    };
  }

  /**
   * Parse native MongoDB driver errors
   */
  private parseNativeMongoError(error: MongoError): ParsedMongoError {
    switch (error.code) {
      case 11000: // Duplicate key error
        return this.parseDuplicateKeyError(error);
      
      case 121: // Document validation failed
        return {
          status: HTTP_STATUS.BAD_REQUEST,
          name: 'ValidationError',
          message: 'Document validation failed',
          code: error.code,
          details: { validationErrors: error.message },
        };

      case 50: // Execution timeout
        return {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          name: 'TimeoutError',
          message: 'Database operation timed out',
          code: error.code,
        };

      default:
        return {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          name: 'DatabaseError',
          message: 'Database operation failed',
          code: error.code,
          details: { originalMessage: error.message },
        };
    }
  }

  /**
   * Parse duplicate key errors (MongoDB error code 11000)
   */
  private parseDuplicateKeyError(error: MongoError): ParsedMongoError {
    const message = error.message;
    
    // Extract field name from error message
    const fieldMatch = message.match(/index: (\w+)_/) || message.match(/key: { (\w+):/);
    const fieldName = fieldMatch ? fieldMatch[1] : 'field';
    
    // Extract collection name
    const collectionMatch = message.match(/collection: \w+\.(\w+)/);
    const collection = collectionMatch ? collectionMatch[1] : 'unknown';

    return {
      status: HTTP_STATUS.CONFLICT,
      name: 'DuplicateKeyError',
      message: `A record with this ${fieldName} already exists`,
      code: 11000,
      collection,
      details: {
        field: fieldName,
        constraint: 'unique',
      },
    };
  }

  /**
   * Parse Mongoose validation errors
   */
  private parseValidationError(error: MongooseError.ValidationError): ParsedMongoError {
    const validationErrors: Record<string, string> = {};
    
    Object.keys(error.errors).forEach(key => {
      const err = error.errors[key];
      validationErrors[key] = err.message;
    });

    return {
      status: HTTP_STATUS.BAD_REQUEST,
      name: 'ValidationError',
      message: 'Document validation failed',
      details: {
        fields: validationErrors,
        summary: `${Object.keys(validationErrors).length} field(s) failed validation`,
      },
    };
  }

  /**
   * Parse Mongoose cast errors (invalid data type)
   */
  private parseCastError(error: MongooseError.CastError): ParsedMongoError {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      name: 'CastError',
      message: `Invalid ${error.kind} format for field '${error.path}'`,
      details: {
        field: error.path,
        expectedType: error.kind,
        receivedValue: error.value,
      },
    };
  }
}
