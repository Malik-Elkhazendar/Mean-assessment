import { registerAs } from '@nestjs/config';

/**
 * Rate limiting configuration for API endpoints
 * Provides different rate limits for different types of operations
 */
export default registerAs('throttler', () => ({
  // Global rate limiting settings
  global: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // 60 seconds
    limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per minute
  },
  
  // Authentication endpoints (more restrictive)
  auth: {
    ttl: parseInt(process.env.RATE_LIMIT_AUTH_TTL || '900000', 10), // 15 minutes  
    limit: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '5', 10), // 5 attempts per 15 minutes
  },
  
  // Password reset endpoints (very restrictive)
  passwordReset: {
    ttl: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_TTL || '3600000', 10), // 1 hour
    limit: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_MAX_REQUESTS || '3', 10), // 3 attempts per hour
  },
  
  // API endpoints (moderate)
  api: {
    ttl: parseInt(process.env.RATE_LIMIT_API_TTL || '60000', 10), // 1 minute
    limit: parseInt(process.env.RATE_LIMIT_API_MAX_REQUESTS || '60', 10), // 60 requests per minute
  },
}));