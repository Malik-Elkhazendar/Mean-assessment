import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { ERROR_MESSAGES } from '@mean-assessment/constants';
import { WinstonLoggerService } from '../../../core/logger/winston-logger.service';

interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * JWT Authentication Guard
 * Protects routes by validating Bearer tokens from Authorization headers
 * Can be used as method decorator or registered globally
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly logger: WinstonLoggerService) {
    super();
  }

  /**
   * Main guard logic - determines if request can proceed
   * Handles both successful authentication and error cases
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers['x-correlation-id'] || request.headers['correlation-id'];
    
    const logContext = {
      correlationId,
      component: 'JwtAuthGuard',
      metadata: { 
        action: 'canActivate',
        path: request.url,
        method: request.method 
      }
    };

    this.logger.debug('Evaluating JWT authentication for request', logContext);

    return super.canActivate(context);
  }

  /**
   * Handle authentication errors
   * Provides structured error responses with appropriate HTTP status codes
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any, context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers['x-correlation-id'] || request.headers['correlation-id'];
    
    const logContext = {
      correlationId,
      component: 'JwtAuthGuard',
      metadata: { 
        action: 'handleRequest',
        path: request.url,
        method: request.method,
        hasUser: !!user,
        errorType: err?.constructor?.name || 'Unknown'
      }
    };

    // Handle various authentication failure scenarios
    if (err || !user) {
      let errorMessage: string;
      
      if (info?.name === 'TokenExpiredError') {
        errorMessage = ERROR_MESSAGES.AUTH.TOKEN_EXPIRED;
        this.logger.warn('JWT token has expired', logContext);
      } else if (info?.name === 'JsonWebTokenError') {
        errorMessage = ERROR_MESSAGES.AUTH.TOKEN_INVALID;
        this.logger.warn('Invalid JWT token format', logContext);
      } else if (info?.name === 'NotBeforeError') {
        errorMessage = ERROR_MESSAGES.AUTH.TOKEN_INVALID;
        this.logger.warn('JWT token not active yet', logContext);
      } else if (err) {
        errorMessage = ERROR_MESSAGES.AUTH.TOKEN_INVALID;
        this.logger.warn('Authentication error occurred', {
          ...logContext,
          metadata: { ...logContext.metadata, error: err.message }
        });
      } else {
        errorMessage = ERROR_MESSAGES.AUTH.TOKEN_INVALID;
        this.logger.warn('Authentication failed - no user found', logContext);
      }

      throw new UnauthorizedException({
        message: errorMessage,
        statusCode: 401,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Validate user object structure
    if (!user || typeof user !== 'object' || !user.id || !user.email) {
      this.logger.error('Invalid user object from JWT strategy', undefined, {
        correlationId: logContext.correlationId,
        component: logContext.component,
        metadata: { ...logContext.metadata, userObject: user }
      });
      
      throw new UnauthorizedException({
        message: ERROR_MESSAGES.AUTH.TOKEN_INVALID,
        statusCode: 401,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    const authenticatedUser = user as AuthenticatedUser;

    this.logger.debug('JWT authentication successful', {
      ...logContext,
      metadata: { ...logContext.metadata, userId: authenticatedUser.id, email: authenticatedUser.email }
    });

    return authenticatedUser;
  }
}