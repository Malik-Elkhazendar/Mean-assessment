import { Request } from 'express';

/**
 * Base request interface with correlation ID
 * Provides type safety for correlation ID added by LoggingInterceptor
 */
export interface BaseRequest extends Request {
  /** Correlation ID for request tracing, automatically added by LoggingInterceptor */
  correlationId: string;
}

/**
 * Extended request interface with correlation ID and user information
 * Provides type safety for custom request properties added by middleware/interceptors
 */
export interface AppRequest extends BaseRequest {
  
  /** Authenticated user information, added by AuthGuard */
  user?: {
    /** User ID from JWT token */
    id: string;
    /** User email from JWT token */
    email: string;
    /** User role for authorization */
    role: string;
    /** Token issued at timestamp */
    iat?: number;
    /** Token expiration timestamp */
    exp?: number;
  };
}

/**
 * Request interface for authenticated endpoints
 * Ensures user property is always present
 */
export interface AuthenticatedRequest extends BaseRequest {
  /** Guaranteed user information for protected routes */
  user: {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
  };
}
