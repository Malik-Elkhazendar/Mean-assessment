import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { WinstonLoggerService } from './logger/winston-logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { MongoDBExceptionFilter } from './filters/mongodb-exception.filter';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

/**
 * Core module providing essential services for logging, error handling, and request/response processing
 * Registers global interceptors and filters for consistent application behavior
 * 
 * This module is marked as Global to make its providers available throughout the application
 */
@Global()
@Module({
  providers: [
    // Logger service
    WinstonLoggerService,
    
    // Global HTTP interceptor for logging
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    
    // Exception filters in order of specificity (most specific first)
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: MongoDBExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [
    WinstonLoggerService,
  ],
})
export class CoreModule {}
