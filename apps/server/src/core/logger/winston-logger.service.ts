import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { 
  LoggerInterface, 
  LogLevel, 
  LogLevelType, 
  LogContext 
} from '@mean-assessment/logger';

/**
 * Winston-based logger service implementing the shared LoggerInterface
 * Provides advanced logging with timestamps, colorized output, and structured context
 * Integrates with NestJS ecosystem while maintaining flexibility
 */
@Injectable()
export class WinstonLoggerService implements LoggerInterface, LoggerService {
  private readonly winston: winston.Logger;
  private currentLogLevel: LogLevel = LogLevel.LOG;

  constructor(private readonly configService: ConfigService) {
    this.winston = this.createWinstonLogger();
    this.setLogLevel(this.configService.get<LogLevelType>('app.logLevel', 'log'));
  }

  /**
   * Create and configure Winston logger instance
   */
  private createWinstonLogger(): winston.Logger {
    const environment = this.configService.get<string>('app.nodeEnv', 'development');
    const appName = this.configService.get<string>('app.name', 'MEAN-Assessment');

    return winston.createLogger({
      level: 'verbose',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
        winston.format.metadata({
          fillExcept: ['message', 'level', 'timestamp'],
        }),
        environment === 'production'
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize({ all: true }),
              winston.format.printf(({ timestamp, level, message, metadata }) => {
                const metaData = metadata as Record<string, unknown> || {};
                const context = metaData.context ? `[${metaData.context}]` : '';
                const correlationId = metaData.correlationId ? `[${metaData.correlationId}]` : '';
                return `${timestamp} ${level}: ${context}${correlationId} ${message}`;
              })
            )
      ),
      defaultMeta: {
        service: appName,
        environment,
      },
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true,
        }),
        // Add file transport for production
        ...(environment === 'production' ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ] : []),
      ],
      exitOnError: false,
    });
  }

  /**
   * Convert LogLevel enum to winston level string
   */
  private mapLogLevel(level: LogLevel | LogLevelType): string {
    if (typeof level === 'string') {
      return level;
    }
    
    const levelMap = {
      [LogLevel.VERBOSE]: 'verbose',
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.LOG]: 'info',
      [LogLevel.WARN]: 'warn',
      [LogLevel.ERROR]: 'error',
    };
    
    return levelMap[level] || 'info';
  }

  /**
   * Build metadata object from context
   */
  private buildMetadata(context?: LogContext): Record<string, unknown> {
    if (!context) return {};
    
    return {
      correlationId: context.correlationId,
      userId: context.userId,
      context: context.component,
      metadata: context.metadata,
      stack: context.stack,
    };
  }

  // LoggerInterface implementation
  verbose(message: string, context?: LogContext): void {
    if (this.isLevelEnabled(LogLevel.VERBOSE)) {
      this.winston.verbose(message, this.buildMetadata(context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      this.winston.debug(message, this.buildMetadata(context));
    }
  }

  log(message: string, context?: LogContext): void {
    if (this.isLevelEnabled(LogLevel.LOG)) {
      this.winston.info(message, this.buildMetadata(context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isLevelEnabled(LogLevel.WARN)) {
      this.winston.warn(message, this.buildMetadata(context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.isLevelEnabled(LogLevel.ERROR)) {
      const metadata = this.buildMetadata(context);
      if (error) {
        metadata.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }
      this.winston.error(message, metadata);
    }
  }

  setLogLevel(level: LogLevel | LogLevelType): void {
    if (typeof level === 'string') {
      const levelMap: Record<LogLevelType, LogLevel> = {
        verbose: LogLevel.VERBOSE,
        debug: LogLevel.DEBUG,
        log: LogLevel.LOG,
        warn: LogLevel.WARN,
        error: LogLevel.ERROR,
      };
      this.currentLogLevel = levelMap[level];
    } else {
      this.currentLogLevel = level;
    }
    
    this.winston.level = this.mapLogLevel(level);
  }

  isLevelEnabled(level: LogLevel | LogLevelType): boolean {
    const numericLevel = typeof level === 'string' 
      ? { verbose: 0, debug: 1, log: 2, warn: 3, error: 4 }[level]
      : level;
    
    return numericLevel >= this.currentLogLevel;
  }

  // NestJS LoggerService compatibility methods
  logCompat(message: string | object, context?: string): void {
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
    if (context) {
      this.log(messageStr, { component: context });
    } else {
      this.log(messageStr);
    }
  }

  errorCompat(message: string | object, stack?: string, context?: string): void {
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
    if (stack && context) {
      const error = new Error(messageStr);
      error.stack = stack;
      this.error(messageStr, error, { component: context });
    } else {
      this.error(messageStr);
    }
  }

  warnCompat(message: string | object, context?: string): void {
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
    if (context) {
      this.warn(messageStr, { component: context });
    } else {
      this.warn(messageStr);
    }
  }

  debugCompat(message: string | object, context?: string): void {
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
    if (context) {
      this.debug(messageStr, { component: context });
    } else {
      this.debug(messageStr);
    }
  }

  verboseCompat(message: string | object, context?: string): void {
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
    if (context) {
      this.verbose(messageStr, { component: context });
    } else {
      this.verbose(messageStr);
    }
  }
}
