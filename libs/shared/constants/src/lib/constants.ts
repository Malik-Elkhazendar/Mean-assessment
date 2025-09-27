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
    REFRESH: '/api/auth/refresh',
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
  
  /** Product constants */
  PRODUCT: {
    LIMITS: {
      NAME_MIN: 2,
      NAME_MAX: 100,
      DESCRIPTION_MIN: 10,
      DESCRIPTION_MAX: 1000,
      CATEGORY_MIN: 2,
      CATEGORY_MAX: 50,
      PRICE_MIN: 0.01,
      PRICE_MAX: 999999.99,
      QUANTITY_MIN: 0,
      QUANTITY_MAX: 100000,
      IMAGE_URL_MAX: 500,
    },
    DEFAULTS: {
      DRAFT_DESCRIPTION: 'Draft product - description pending',
      UNCATEGORIZED: 'Uncategorized',
      QUANTITY: 0,
      PRICE: 0,
    },
  },
} as const;

/**
 * Dashboard content constants for consistent text across the dashboard
 * All hardcoded strings extracted for maintainability and i18n readiness
 */
export const DASHBOARD_CONTENT = {
  /** Welcome section content */
  WELCOME: {
    TITLE: 'Welcome back',
    DEFAULT_USER_NAME: 'User',
    SUBTITLE: 'Here\'s your comprehensive overview of account activity and available features',
    MEMBER_SINCE: 'Member Since',
  },
  
  /** Main dashboard cards */
  CARDS: {
    PROFILE_STATUS: {
      TITLE: 'Profile Status',
      ACCOUNT_ACTIVE_SINCE: 'Account Active Since',
      EMAIL_LABEL: 'Email:',
      STATUS_BADGE: 'Active Account',
      STATUS_TOOLTIP: 'Your account is active and all features are available',
    },
    QUICK_ACTIONS: {
      TITLE: 'Quick Actions',
      MANAGE_PRODUCTS: 'Manage Products',
      EDIT_PROFILE: 'Edit Profile',
    },
    RECENT_ACTIVITY: {
      TITLE: 'Recent Activity',
      LAST_LOGIN: 'Last login',
      PROFILE_UPDATED: 'Profile updated',
      ACCOUNT_STATUS: 'Account status: Active',
      JUST_NOW: 'Just now',
    },
  },
  
  /** Features section */
  FEATURES: {
    SECTION_TITLE: 'Available Features',
    SECTION_SUBTITLE: 'Explore powerful tools designed to enhance your experience',
    PRODUCT_MANAGEMENT: {
      TITLE: 'Product Management',
      DESCRIPTION: 'Create, edit, and manage your product inventory with comprehensive CRUD operations and advanced filtering',
      ACTION: 'View Products',
    },
    
  },
  
  /** Loading states */
  LOADING: {
    MESSAGE: 'Loading your personalized dashboard...',
    FALLBACK: 'N/A',
  },
  
  /** Navigation labels for actions */
  ACTIONS: {
    EDIT_PROFILE: 'Edit Profile',
    VIEW_PRODUCTS: 'View Products',
    
  },
} as const;

/**
 * Dashboard layout and design constants
 * Centralized values for consistent spacing and responsive design
 */
export const DASHBOARD_LAYOUT = {
  /** Grid configuration */
  GRID: {
    STATS_MIN_WIDTH: '360px',
    FEATURES_MIN_WIDTH: '380px',
    GAP: 'var(--space-6)',
    MOBILE_GAP: 'var(--space-4)',
  },
  
  /** Spacing system */
  SPACING: {
    SECTION_MARGIN: 'var(--space-16)',
    CARD_PADDING: 'var(--space-8)',
    HEADER_MARGIN: 'var(--space-12)',
    MOBILE_SECTION_MARGIN: 'var(--space-10)',
    MOBILE_HEADER_MARGIN: 'var(--space-8)',
  },
  
  /** Animation durations */
  TRANSITIONS: {
    HOVER: 'var(--transition-normal)',
    FADE_IN: '400ms var(--transition-normal)',
    SKELETON_DURATION: '1.5s',
  },
  
  /** Responsive breakpoints */
  BREAKPOINTS: {
    TABLET: '1024px',
    MOBILE: '768px',
    SMALL: '480px',
  },
} as const;

/**
 * Modern color palette replacing blue primary colors
 * Professional green/teal scheme suitable for business applications
 */
export const DASHBOARD_COLORS = {
  /** Primary color scheme - Modern teal/green */
  PRIMARY: {
    50: '#f0fdfa',
    100: '#ccfbf1', 
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main primary color
    600: '#0d9488',
    700: '#0f766e', 
    800: '#115e59',
    900: '#134e4a',
  },
  
  /** Secondary color scheme - Warm gray */
  SECONDARY: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4', 
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  
  /** Accent colors for actions */
  ACCENT: {
    SUCCESS: '#10b981',  // Green for success actions
    WARNING: '#f59e0b',  // Amber for warning actions  
    ERROR: '#ef4444',    // Red for error/delete actions
    INFO: '#06b6d4',     // Cyan for info actions
  }
} as const;

/**
 * Minimal Dashboard Content Constants
 * Clean, minimal dashboard design with essential information only
 */
export const MINIMAL_DASHBOARD_CONTENT = {
  /** Page header */
  HEADER: {
    WELCOME_TITLE: 'Welcome back',
    SUBTITLE: 'Here\'s your account overview',
  },
  
  /** Account Status Card */
  ACCOUNT_STATUS: {
    TITLE: 'Account Overview',
    ACCOUNT_TYPE: 'Standard Account',
    STATUS_ACTIVE: 'Active',
    STATUS_INACTIVE: 'Inactive',
    DEFAULT_NAME: 'John Doe',
    DEFAULT_EMAIL: 'user@example.com',
  },
  
  /** Recent Activity List */
  RECENT_ACTIVITY: {
    TITLE: 'Recent Activity',
    EMPTY_MESSAGE: 'No recent activity',
    DEFAULT_ACTIVITIES: [
      {
        title: 'Account Login',
        description: 'Successfully signed in to your account',
        icon: 'login',
        timestamp: new Date()
      },
      {
        title: 'Profile Updated',
        description: 'Your profile information was updated',
        icon: 'person',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        title: 'Security Check',
        description: 'Account security verification completed',
        icon: 'security',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]
  },
  
  /** Feature Highlights */
  FEATURES: {
    TITLE: 'Key Features',
    HIGHLIGHTS: [
      {
        title: 'Product Management',
        description: 'Create and manage your product inventory with ease',
        icon: 'inventory_2',
        actionText: 'Manage Products',
        actionLink: '/products',
        actionColor: 'teal'
      },
      {
        title: 'User Profile',
        description: 'Update your personal information and preferences',
        icon: 'person',
        actionText: 'Edit Profile',
        actionLink: '/profile/edit',
        actionColor: 'success'
      }
    ]
  },
  
  /** Loading states */
  LOADING: {
    ACCOUNT_STATUS: 'Loading account information...',
    ACTIVITIES: 'Loading recent activities...',
    FEATURES: 'Loading features...',
    FALLBACK: 'Not available'
  }
} as const;

/**
 * UI Text Constants for Authentication Components
 * Centralized text content for consistent user experience
 */
export const AUTH_UI_TEXT = {
  /** Sign In Component */
  SIGNIN: {
    TITLE: 'Welcome Back',
    SUBTITLE: 'Sign in to access your dashboard and continue your journey',
    EMAIL_LABEL: 'Email Address',
    PASSWORD_LABEL: 'Password',
    SUBMIT_BUTTON: 'Sign In to Dashboard',
    LOADING_TEXT: 'Signing you in securely...',
    FORGOT_PASSWORD_LINK: 'Forgot your password?',
    SIGNUP_LINK: 'Create a new account',
    SIGNUP_PROMPT: "Don't have an account?",
  },
  
  /** Sign Up Component */
  SIGNUP: {
    TITLE: 'Create Your Account',
    SUBTITLE: 'Join us today and start your journey',
    EMAIL_LABEL: 'Email Address',
    FIRST_NAME_LABEL: 'First Name',
    LAST_NAME_LABEL: 'Last Name',
    PASSWORD_LABEL: 'Password',
    PASSWORD_PLACEHOLDER: 'Create a secure password',
    SUBMIT_BUTTON: 'Create Account',
    LOADING_TEXT: 'Creating your account...',
    SIGNIN_LINK: 'Sign in to your account',
    SIGNIN_PROMPT: 'Already have an account?',
    PASSWORD_MISMATCH: 'Passwords do not match',
  },
  
  /** Forgot Password Component */
  FORGOT_PASSWORD: {
    TITLE: 'Reset Your Password',
    SUBTITLE: 'Enter your email address and we\'ll send you password reset instructions',
    EMAIL_LABEL: 'Email Address',
    SUBMIT_BUTTON: 'Send Reset Link',
    LOADING_TEXT: 'Sending reset instructions...',
    SUCCESS_MESSAGE: 'Password reset link has been sent to your email.',
    BACK_TO_SIGNIN: 'Back to Sign In',
  },
  
  /** Reset Password Component */
  RESET_PASSWORD: {
    TITLE: 'Set New Password',
    SUBTITLE: 'Enter your new password below',
    PASSWORD_LABEL: 'New Password',
    CONFIRM_PASSWORD_LABEL: 'Confirm Password',
    SUBMIT_BUTTON: 'Update Password',
    LOADING_TEXT: 'Updating your password...',
    SUCCESS_MESSAGE: 'Password updated successfully. You can now sign in.',
  },
} as const;

/**
 * UI Text Constants for Product Components
 * Centralized text content for product management features
 */
export const PRODUCT_UI_TEXT = {
  /** Product List Component */
  LIST: {
    TITLE: 'Product Management',
    SUBTITLE: 'Manage your product inventory with full CRUD operations',
    SEARCH_PLACEHOLDER: 'Search by name or description...',
    SEARCH_LABEL: 'Search products',
    ADD_PRODUCT_BUTTON: 'Add New Product',
    LOADING_TEXT: 'Loading your personalized product catalog...',
    EMPTY_STATE: 'No products found',
    EMPTY_STATE_DESCRIPTION: 'You haven\'t created any products yet. Get started by adding your first product.',
    EMPTY_STATE_SEARCH: 'No products match your search criteria. Try adjusting your search terms.',
    ACTIONS: {
      VIEW: 'View',
      EDIT: 'Edit',
      DELETE: 'Delete',
    },
    FILTERS: {
      STOCK_STATUS_LABEL: 'Stock Status:',
      ALL: 'All',
      IN_STOCK: 'In Stock',
      OUT_OF_STOCK: 'Out of Stock',
      VIEW_LABEL: 'View:',
      CLEAR_FILTERS: 'Clear Filters',
      SORT_LABEL: 'Sort by:',
      SORT_NAME: 'Name',
      SORT_PRICE: 'Price',
      SORT_DATE: 'Date',
    },
    STATS: {
      TOTAL_PRODUCTS: 'Total Products',
      TOTAL_PRODUCTS_DESC: 'Products in your catalog',
      IN_STOCK_COUNT: 'In Stock',
      IN_STOCK_DESC: 'Available products',
      OUT_OF_STOCK_COUNT: 'Out of Stock',
      OUT_OF_STOCK_DESC: 'Products needing restock',
      INVENTORY_VALUE: 'Inventory Value',
      INVENTORY_VALUE_DESC: 'Total inventory worth',
    },
    PAGINATION: {
      SHOWING: 'Showing',
      OF: 'of',
      PRODUCTS: 'products',
      PAGE: 'Page',
      PREVIOUS: 'Previous',
      NEXT: 'Next',
    },
  },
  
  /** Product Create Component */
  CREATE: {
    TITLE: 'Create New Product',
    SUBTITLE: 'Add a new product to your catalog',
    NAME_LABEL: 'Product Name',
    DESCRIPTION_LABEL: 'Description',
    PRICE_LABEL: 'Price',
    CATEGORY_LABEL: 'Category',
    QUANTITY_LABEL: 'Quantity',
    IMAGE_URL_LABEL: 'Image URL',
    IMAGE_URL_PLACEHOLDER: 'https://example.com/product-image.jpg',
    SUBMIT_BUTTON: 'Create Product',
    CANCEL_BUTTON: 'Cancel',
    LOADING_TEXT: 'Creating product...',
  },
  
  /** Product Edit Component */
  EDIT: {
    TITLE: 'Edit Product',
    SUBTITLE: 'Update product information',
    SUBMIT_BUTTON: 'Update Product',
    CANCEL_BUTTON: 'Cancel',
    LOADING_TEXT: 'Updating product...',
  },
  
  /** Product Detail Component */
  DETAIL: {
    BACK_BUTTON: 'Back to Products',
    EDIT_BUTTON: 'Edit Product',
    DELETE_BUTTON: 'Delete Product',
    IN_STOCK_BADGE: 'In Stock',
    OUT_OF_STOCK_BADGE: 'Out of Stock',
  },
} as const;

/**
 * UI Text Constants for Profile Components
 * Centralized text content for user profile management
 */
export const PROFILE_UI_TEXT = {
  /** Profile Component */
  PROFILE: {
    TITLE: 'Profile',
    SUBTITLE: 'Manage your profile settings',
  },
  
  /** Profile Edit Component */
  EDIT: {
    TITLE: 'Edit Profile',
    SUBTITLE: 'Update your personal information',
    FIRST_NAME_LABEL: 'First Name',
    LAST_NAME_LABEL: 'Last Name',
    EMAIL_LABEL: 'Email Address',
    SUBMIT_BUTTON: 'Update Profile',
    CANCEL_BUTTON: 'Cancel',
    LOADING_TEXT: 'Updating profile...',
  },
} as const;

/**
 * Success Messages for Backend Services
 * Centralized success messages for API responses
 */
export const SUCCESS_MESSAGES = {
  /** Authentication Success Messages */
  AUTH: {
    SIGNIN_SUCCESS: 'Successfully signed in. Welcome back!',
    SIGNUP_SUCCESS: 'Account created successfully. Welcome aboard!',
    SIGNOUT_SUCCESS: 'Successfully signed out. Please remove the token from your client.',
    FORGOT_PASSWORD_SUCCESS: 'If an account with this email exists, you will receive password reset instructions.',
    RESET_PASSWORD_SUCCESS: 'Password reset successful. You can now sign in with your new password.',
  },
  
  /** Product Success Messages */
  PRODUCT: {
    CREATE_SUCCESS: 'Product created successfully',
    UPDATE_SUCCESS: 'Product updated successfully',
    DELETE_SUCCESS: 'Product deleted successfully',
  },
  
  /** User Success Messages */
  USER: {
    PROFILE_UPDATED: 'Profile updated successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
  },
} as const;

/**
 * Footer Configuration Constants
 * Simple, professional footer content without hardcoded values
 */
export const FOOTER_CONFIG = {
  COPYRIGHT_YEAR: new Date().getFullYear(),
  COMPANY_NAME: 'MEAN Assessment',
  TAGLINE: 'Built with Modern Technology',
  TECH_STACK: ['Angular', 'NestJS', 'MongoDB', 'TypeScript'],
} as const;

/**
 * Page Title Constants
 * Centralized page titles for consistent browser tab titles
 */
export const PAGE_TITLES = {
  HOME: `Home - ${APP_CONFIG.APP_NAME}`,
  SIGNIN: `Sign In - ${APP_CONFIG.APP_NAME}`,
  SIGNUP: `Sign Up - ${APP_CONFIG.APP_NAME}`,
  FORGOT_PASSWORD: `Forgot Password - ${APP_CONFIG.APP_NAME}`,
  RESET_PASSWORD: `Reset Password - ${APP_CONFIG.APP_NAME}`,
  DASHBOARD: `Dashboard - ${APP_CONFIG.APP_NAME}`,
  PRODUCTS: `Products - ${APP_CONFIG.APP_NAME}`,
  PRODUCT_CREATE: `Create Product - ${APP_CONFIG.APP_NAME}`,
  PRODUCT_EDIT: `Edit Product - ${APP_CONFIG.APP_NAME}`,
  PROFILE: `Profile - ${APP_CONFIG.APP_NAME}`,
  PROFILE_EDIT: `Edit Profile - ${APP_CONFIG.APP_NAME}`,
} as const;
