import { User, Product } from '@mean-assessment/data-models';
import { BaseRequest } from '../../users/interfaces/request.interface';

/**
 * Base request interface for product endpoints
 * Extends BaseRequest to ensure correlation ID is available
 */
export type ProductRequest = BaseRequest

/**
 * Authenticated request interface with guaranteed user data
 * Used for all product endpoints (all require authentication)
 */
export interface AuthenticatedProductRequest extends BaseRequest {
  /** Authenticated user from JWT token */
  user: User;
}

/**
 * Product list response interface with pagination metadata
 * Provides consistent structure for paginated product lists
 */
export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    search?: string;
    category?: string;
    inStock?: boolean;
  };
  timestamp: string;
}

/**
 * Single product response interface
 * Type-safe individual product response
 */
export interface ProductResponse {
  product: Product;
  timestamp: string;
}

/**
 * Product operation response interface
 * For create, update, delete operations with success messages
 */
export interface ProductOperationResponse {
  product?: Product;
  message: string;
  timestamp: string;
}