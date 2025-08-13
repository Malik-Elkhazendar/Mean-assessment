import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/services/user.service';
import { EmailService } from '../../email/services/email.service';
import { WinstonLoggerService } from '../../../core/logger/winston-logger.service';
import { SignupDto, LoginDto, ResetPasswordDto } from '@mean-assessment/dto';
import { User, AuthResponse } from '@mean-assessment/data-models';
import { AuthMessageResponse } from '../interfaces/auth-request.interface';
import { ERROR_MESSAGES, TOKEN_EXPIRY, SUCCESS_MESSAGES } from '@mean-assessment/constants';

/**
 * JWT token payload interface
 */
interface JwtTokenPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  iat: number;
  exp?: number;
}

/**
 * Authentication Service
 * Handles user authentication, token generation, and session management
 * Integrates with existing UserService for user operations
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**
   * Register a new user account
   * Creates user via UserService and generates authentication token
   */
  async signup(signupDto: SignupDto, correlationId?: string): Promise<AuthResponse> {
    const logContext = {
      correlationId,
      component: 'AuthService',
      metadata: { action: 'signup', email: signupDto.email }
    };

    this.logger.log('Processing user signup request', logContext);

    try {
      // Create new user account using existing UserService
      const user = await this.userService.create(signupDto, correlationId);

      // Generate JWT token for immediate login after signup
      const accessToken = await this.generateToken(user);

      // Update last login timestamp
      await this.userService.updateLastLogin(user.id, correlationId);

      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: new Date(),
        },
        accessToken,
        expiresIn: TOKEN_EXPIRY.DURATION,
        tokenType: 'Bearer',
      };

      this.logger.log('User signup completed successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: user.id }
      });

      return authResponse;
    } catch (error) {
      this.logger.error('User signup failed', error, logContext);
      
      // Re-throw known exceptions from UserService
      if (error instanceof BadRequestException || error.status) {
        throw error;
      }
      
      throw new BadRequestException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
  }

  /**
   * Authenticate user credentials and generate access token
   * Validates credentials via UserService and creates session
   */
  async signin(loginDto: LoginDto, correlationId?: string): Promise<AuthResponse> {
    const logContext = {
      correlationId,
      component: 'AuthService',
      metadata: { action: 'signin', email: loginDto.email }
    };

    this.logger.log('Processing user signin request', logContext);

    try {
      // Validate user credentials using existing UserService
      const user = await this.userService.validateCredentials(loginDto, correlationId);

      if (!user) {
        this.logger.warn('Invalid login credentials provided', logContext);
        throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      // Generate JWT access token
      const accessToken = await this.generateToken(user);

      // Update last login timestamp
      await this.userService.updateLastLogin(user.id, correlationId);

      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: new Date(),
        },
        accessToken,
        expiresIn: TOKEN_EXPIRY.DURATION,
        tokenType: 'Bearer',
      };

      this.logger.log('User signin completed successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: user.id }
      });

      return authResponse;
    } catch (error) {
      this.logger.error('User signin failed', error, logContext);
      
      // Re-throw known exceptions
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
  }

  /**
   * Sign out user (stateless JWT implementation)
   * For stateless JWT, signout is primarily handled on the client side
   * This endpoint provides audit logging and potential future token blacklisting
   */
  async signout(userId: string, correlationId?: string): Promise<AuthMessageResponse> {
    const logContext = {
      correlationId,
      component: 'AuthService',
      metadata: { action: 'signout', userId }
    };

    this.logger.log('Processing user signout request', logContext);

    try {
      // Verify user exists (optional validation)
      const user = await this.userService.findById(userId, correlationId);
      
      if (!user) {
        this.logger.warn('Signout attempted for non-existent user', logContext);
        throw new UnauthorizedException(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
      }

      // Log successful signout for audit purposes
      this.logger.log('User signed out successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, email: user.email }
      });

      return {
        message: SUCCESS_MESSAGES.AUTH.SIGNOUT_SUCCESS,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('User signout failed', error, logContext);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG);
    }
  }

  /**
   * Generate JWT access token for authenticated user
   * Uses configuration from authConfig for secret and expiry
   */
  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id, // Standard JWT subject claim
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    };

    const logContext = {
      component: 'AuthService',
      metadata: { action: 'generateToken', userId: user.id }
    };

    this.logger.debug('Generating JWT token for user', logContext);

    try {
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('auth.jwtExpiresIn'),
        secret: this.configService.get<string>('auth.jwtSecret'),
      });

      this.logger.debug('JWT token generated successfully', logContext);
      return token;
    } catch (error) {
      this.logger.error('JWT token generation failed', error, logContext);
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SERVER_ERROR);
    }
  }

  /**
   * Validate and decode JWT token (utility method)
   * Can be used for additional token validation if needed
   */
  async validateToken(token: string): Promise<JwtTokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.jwtSecret'),
      });
    } catch (error) {
      this.logger.debug('Token validation failed', {
        component: 'AuthService',
        metadata: { action: 'validateToken', error: error.message }
      });
      
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.TOKEN_INVALID);
    }
  }

  /**
   * Send password reset email to user
   * Generates reset token and sends secure reset email
   * Handles user not found gracefully for security
   */
  async forgotPassword(email: string, correlationId?: string): Promise<AuthMessageResponse> {
    const logContext = {
      correlationId,
      component: 'AuthService',
      metadata: { action: 'forgotPassword', email }
    };

    this.logger.log('Processing forgot password request', logContext);

    try {
      // Generate reset token using existing UserService method
      const resetToken = await this.userService.generatePasswordResetToken(email, correlationId);
      
      // Find user to get firstName for email personalization
      const user = await this.userService.findByEmail(email);
      
      if (user) {
        // Send password reset email
        await this.emailService.sendPasswordResetEmail(
          email, 
          user.firstName, 
          resetToken, 
          correlationId
        );

        this.logger.log('Password reset email sent successfully', {
          ...logContext,
          metadata: { ...logContext.metadata, userId: user.id }
        });
      } else {
        // For security, don't reveal if user doesn't exist
        // Just log the attempt and continue silently
        this.logger.warn('Password reset attempted for non-existent user', logContext);
      }

    } catch (error) {
      this.logger.error('Forgot password request failed', error, logContext);
      
      // For security, don't reveal specific errors to the user
      // Always return success even if user doesn't exist
      if (error instanceof NotFoundException) {
        this.logger.warn('Password reset attempted for non-existent user', logContext);
        return; // Silent success for security
      }
      
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG);
    }

    return {
      message: SUCCESS_MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS,
      timestamp: new Date().toISOString(),
    };
  }

  // Profile management is handled by UserService/UserController
  // This maintains clean separation of concerns

  /**
   * Reset user password using reset token
   * Validates token and expiry, then updates password securely
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto, correlationId?: string): Promise<AuthMessageResponse> {
    const logContext = {
      correlationId,
      component: 'AuthService',
      metadata: { action: 'resetPassword', email: resetPasswordDto.email }
    };

    this.logger.log('Processing password reset request', logContext);

    try {
      const { email, resetToken, newPassword } = resetPasswordDto;

      if (!resetToken || !newPassword) {
        throw new BadRequestException(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Reset token and new password'));
      }

      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
      }

      // Validate reset token using existing UserService method
      const isValidToken = await this.userService.validatePasswordResetToken(user.id, resetToken, correlationId);
      if (!isValidToken) {
        throw new BadRequestException(ERROR_MESSAGES.AUTH.TOKEN_INVALID);
      }

      // Update password using existing UserService method
      await this.userService.resetPasswordWithToken(user.id, newPassword, correlationId);

      this.logger.log('Password reset completed successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: user.id }
      });

      return {
        message: SUCCESS_MESSAGES.AUTH.RESET_PASSWORD_SUCCESS,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Password reset failed', error, logContext);
      
      // Re-throw known exceptions
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG);
    }
  }
}