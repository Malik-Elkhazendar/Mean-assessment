import { registerAs } from '@nestjs/config';

/**
 * CORS configuration for different environments
 * Provides dynamic origin validation and environment-specific settings
 */
export default registerAs('cors', () => {
  // Parse comma-separated origins from environment
  const originsEnv = process.env.CORS_ORIGINS || 'http://localhost:4200';
  const allowedOrigins = originsEnv.split(',').map(origin => origin.trim());
  
  return {
    // Dynamic origin validation function
    origin: (origin: string | undefined, callback: (error: Error | null, success?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        // Allow localhost with any port
        if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
          return callback(null, true);
        }
        
        // Allow local IP addresses for mobile testing
        if (origin.match(/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)[\d.]+:\d+$/)) {
          return callback(null, true);
        }
      }

      // Reject origin
      const error = new Error(`Origin ${origin} not allowed by CORS policy`);
      callback(error, false);
    },

    // Credential handling
    credentials: process.env.CORS_CREDENTIALS === 'true',

    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-correlation-id',
      'correlation-id',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],

    // Headers exposed to client
    exposedHeaders: [
      'x-correlation-id',
      'correlation-id',
      'X-Total-Count',
      'X-Total-Pages',
    ],

    // Preflight response caching
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10), // 24 hours

    // Additional settings
    preflightContinue: false,
    optionsSuccessStatus: 204, // For legacy browser support
  };
});