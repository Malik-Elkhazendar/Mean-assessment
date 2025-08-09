/**
 * Log level enumeration for structured logging
 * Defines severity levels from most verbose to least verbose
 */
export enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  LOG = 2,
  WARN = 3,
  ERROR = 4,
}

/**
 * Log level type for flexible usage
 * Can be used as union type or with LogLevel enum values
 */
export type LogLevelType = 'verbose' | 'debug' | 'log' | 'warn' | 'error';

/**
 * Log context interface for structured logging metadata
 * Provides additional information about the log entry
 */
export interface LogContext {
  /** Optional correlation ID for tracing requests across services */
  correlationId?: string;
  
  /** User ID associated with the log entry */
  userId?: string;
  
  /** Component or module that generated the log */
  component?: string;
  
  /** Additional metadata as key-value pairs */
  metadata?: Record<string, unknown>;
  
  /** Stack trace for error logging */
  stack?: string;
}

/**
 * Log entry interface for structured log data
 * Standardizes log format across different providers
 */
export interface LogEntry {
  /** Log level/severity */
  level: LogLevel | LogLevelType;
  
  /** Primary log message */
  message: string;
  
  /** Timestamp when log was created */
  timestamp: Date;
  
  /** Optional context information */
  context?: LogContext;
  
  /** Optional error object for error logs */
  error?: Error;
}

/**
 * Base logger interface defining standard logging methods
 * Provides contracts for implementing different logging providers
 * Can be extended for specific logging requirements (file, console, external services)
 */
export interface LoggerInterface {
  /**
   * Log verbose information for detailed debugging
   * Used for very detailed diagnostic information
   * @param message - The log message
   * @param context - Optional context information
   */
  verbose(message: string, context?: LogContext): void;
  
  /**
   * Log debug information for development and troubleshooting
   * Used for diagnostic information useful for debugging
   * @param message - The log message
   * @param context - Optional context information
   */
  debug(message: string, context?: LogContext): void;
  
  /**
   * Log general information about application flow
   * Used for general application flow and important events
   * @param message - The log message
   * @param context - Optional context information
   */
  log(message: string, context?: LogContext): void;
  
  /**
   * Log warning messages for potential issues
   * Used for warnings that don't halt execution but should be noted
   * @param message - The warning message
   * @param context - Optional context information
   */
  warn(message: string, context?: LogContext): void;
  
  /**
   * Log error messages for failures and exceptions
   * Used for error conditions that may or may not halt execution
   * @param message - The error message
   * @param error - Optional error object
   * @param context - Optional context information
   */
  error(message: string, error?: Error, context?: LogContext): void;
  
  /**
   * Set the minimum log level for filtering
   * Logs below this level will be ignored
   * @param level - The minimum log level to display
   */
  setLogLevel(level: LogLevel | LogLevelType): void;
  
  /**
   * Check if a specific log level is enabled
   * Useful for conditional logging to avoid expensive operations
   * @param level - The log level to check
   * @returns true if the level is enabled, false otherwise
   */
  isLevelEnabled(level: LogLevel | LogLevelType): boolean;
}

/**
 * Extended logger interface with additional utility methods
 * Provides more advanced logging capabilities for complex applications
 */
export interface ExtendedLoggerInterface extends LoggerInterface {
  /**
   * Create a child logger with predefined context
   * Useful for maintaining context across related operations
   * @param context - Default context for all logs from this child logger
   * @returns A new logger instance with the provided context
   */
  child(context: LogContext): LoggerInterface;
  
  /**
   * Log structured data with custom log level
   * Allows for flexible logging with complete control over log entry
   * @param entry - Complete log entry with all fields
   */
  logEntry(entry: LogEntry): void;
  
  /**
   * Flush any buffered log entries
   * Ensures all logs are written before application shutdown
   */
  flush(): Promise<void>;
  
  /**
   * Close the logger and clean up resources
   * Should be called during application shutdown
   */
  close(): Promise<void>;
}

/**
 * Logger configuration interface
 * Defines options for configuring logger implementations
 */
export interface LoggerConfig {
  /** Minimum log level to display */
  level: LogLevel | LogLevelType;
  
  /** Whether to include timestamps in logs */
  timestamp?: boolean;
  
  /** Whether to colorize console output */
  colorize?: boolean;
  
  /** Format for log output */
  format?: 'json' | 'text' | 'simple';
  
  /** Application name to include in logs */
  appName?: string;
  
  /** Environment name (development, staging, production) */
  environment?: string;
  
  /** Additional configuration specific to the logger implementation */
  options?: Record<string, unknown>;
}

/**
 * Logger factory interface for creating logger instances
 * Allows for dependency injection and testing with different implementations
 */
export interface LoggerFactory {
  /**
   * Create a logger instance with the provided configuration
   * @param config - Configuration for the logger
   * @returns A configured logger instance
   */
  createLogger(config: LoggerConfig): LoggerInterface;
  
  /**
   * Create a logger instance with a specific name/context
   * @param name - Name or context for the logger
   * @param config - Optional configuration overrides
   * @returns A named logger instance
   */
  createNamedLogger(name: string, config?: Partial<LoggerConfig>): LoggerInterface;
}
