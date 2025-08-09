/**
 * API route constants for consistent endpoint management across frontend and backend
 * Follows REST naming conventions and maintains a scalable structure
 */
export const API_ROUTES = {
  /** Authentication routes for user login, registration, and session management */
  AUTH: {
    BASE: '/api/auth',
    SIGNIN: '/api/auth/signin',
    SIGNUP: '/api/auth/signup',
    SIGNOUT: '/api/auth/signout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    // Note: Profile management is in USERS routes to avoid duplication
  },
  
  /** User management routes for CRUD operations on user entities */
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
    PROFILE: (id: string) => `/api/users/${id}/profile`,
    AVATAR: (id: string) => `/api/users/${id}/avatar`,
    VERIFY_EMAIL: '/api/users/verify-email',
    RESEND_VERIFICATION: '/api/users/resend-verification',
    PROFILE_ME: '/api/users/profile/me',
    HEALTH: '/api/users/health/status',
    ADMIN_STATS: '/api/users/admin/stats',
  },
  
  /** Product management routes for catalog and inventory operations */
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: (id: string) => `/api/products/${id}`,
    BY_CATEGORY: (category: string) => `/api/products/category/${category}`,
    SEARCH: '/api/products/search',
    FEATURED: '/api/products/featured',
  },
} as const;

/**
 * JWT token expiration time constant
 * Set to 8 hours as per technical assessment requirements
 * Used for token generation in backend and session management in frontend
 */
export const TOKEN_EXPIRY = {
  /** Token validity duration in human-readable format */
  DURATION: '8h',
  
  /** Token validity duration in milliseconds for frontend timers */
  MILLISECONDS: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  
  /** Token validity duration in seconds for JWT libraries */
  SECONDS: 8 * 60 * 60, // 8 hours in seconds
} as const;

/**
 * HTTP status codes used throughout the application
 * Ensures consistent status code usage across all endpoints
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Application-wide error messages for consistent user feedback
 * Used in both API responses and frontend error handling
 */
export const ERROR_MESSAGES = {
  /** Authentication related errors */
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again',
    TOKEN_INVALID: 'Invalid authentication token',
    ACCESS_DENIED: 'Access denied. Insufficient permissions',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
    USER_NOT_FOUND: 'User not found',
    PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
    ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed login attempts',
    ACCOUNT_INACTIVE: 'Account is inactive. Please contact support',
  },
  
  /** User management errors */
  USER: {
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
    NOT_FOUND: 'User not found',
    CREATE_FAILED: 'Failed to create user account',
    UPDATE_FAILED: 'Failed to update user profile',
    DELETE_FAILED: 'Failed to deactivate user account',
  },
  
  /** Product management errors */
  PRODUCT: {
    NOT_FOUND: 'Product not found',
    CREATE_FAILED: 'Failed to create product',
    UPDATE_FAILED: 'Failed to update product',
    DELETE_FAILED: 'Failed to delete product',
    INVALID_OWNER: 'You can only modify products you created',
    OUT_OF_STOCK: 'Product is out of stock',
    INSUFFICIENT_STOCK: 'Insufficient stock available',
  },
  
  /** Validation related errors */
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_FORMAT: (field: string) => `${field} format is invalid`,
    MIN_LENGTH: (field: string, length: number) => `${field} must be at least ${length} characters`,
    MAX_LENGTH: (field: string, length: number) => `${field} cannot exceed ${length} characters`,
    INVALID_ID: 'Invalid ID format',
    WEAK_PASSWORD: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
  },
  
  /** General application errors */
  GENERAL: {
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
    NOT_FOUND: 'The requested resource was not found',
  },
} as const;

/**
 * Application configuration constants
 * Centralized configuration values used across the application
 */
export const APP_CONFIG = {
  /** Application name and version */
  APP_NAME: 'MEAN Assessment',
  VERSION: '1.0.0',
  
  /** Pagination defaults */
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  
  /** File upload constraints */
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  /** UI configuration */
  UI: {
    TOAST_DURATION: 3000, // 3 seconds
    DEBOUNCE_DELAY: 300, // 300ms
  },
} as const;
