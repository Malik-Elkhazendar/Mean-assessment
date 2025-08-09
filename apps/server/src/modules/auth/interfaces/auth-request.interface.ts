import { User } from '@mean-assessment/data-models';
import { BaseRequest } from '../../users/interfaces/request.interface';

/**
 * Base request interface for authentication endpoints
 * Extends BaseRequest to ensure correlation ID is available
 */
export type AuthRequest = BaseRequest

/**
 * Authenticated request interface with guaranteed user data
 * Used for protected authentication endpoints
 */
export interface AuthenticatedAuthRequest extends AuthRequest {
  /** Authenticated user from JWT token */
  user: User;
}

/**
 * Standard response interface for authentication endpoints
 * Provides consistent response structure
 */
export interface AuthMessageResponse {
  message: string;
  timestamp: string;
}

// Profile response interfaces moved to users module to avoid duplication
