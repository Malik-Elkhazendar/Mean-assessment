import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../users/services/user.service';
import { User } from '@mean-assessment/data-models';
import { ERROR_MESSAGES } from '@mean-assessment/constants';
import { WinstonLoggerService } from '../../../core/logger/winston-logger.service';

/**
 * JWT Token Payload Interface
 * Defines the structure of JWT token claims
 */
interface JwtPayload {
  /** User ID from token subject claim */
  sub: string;
  /** User email */
  email: string;
  /** Token issued at timestamp */
  iat?: number;
  /** Token expiration timestamp */
  exp?: number;
}

/**
 * JWT Strategy for validating Bearer tokens
 * Extracts and validates JWT tokens from Authorization headers
 * Attaches validated user data to request object
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<Record<string, unknown>>,
    private readonly userService: UserService,
    private readonly logger: WinstonLoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtSecret'),
    });
  }

  /**
   * Validate JWT payload and return user data
   * Called automatically by Passport when token is valid
   */
  async validate(payload: JwtPayload): Promise<User> {
    const logContext = {
      component: 'JwtStrategy',
      metadata: { 
        action: 'validate', 
        userId: payload.sub,
        tokenExp: payload.exp 
      }
    };

    this.logger.debug('Validating JWT token payload', logContext);

    try {
      // Extract user ID from JWT subject claim
      const userId = payload.sub;
      if (!userId) {
        this.logger.warn('JWT token missing user ID in subject claim', logContext);
        throw new UnauthorizedException(ERROR_MESSAGES.AUTH.TOKEN_INVALID);
      }

      // Fetch current user data from database
      const user = await this.userService.findById(userId);
      
      if (!user) {
        this.logger.warn('JWT token references non-existent user', {
          ...logContext,
          metadata: { ...logContext.metadata, userId }
        });
        throw new UnauthorizedException(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
      }

      // Check if user account is still active
      if (!user.isActive) {
        this.logger.warn('JWT token used by inactive user account', {
          ...logContext,
          metadata: { ...logContext.metadata, userId: user.id }
        });
        throw new UnauthorizedException(ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE);
      }

      this.logger.debug('JWT token validation successful', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: user.id, email: user.email }
      });

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('JWT token validation failed', error, logContext);
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.TOKEN_INVALID);
    }
  }
}