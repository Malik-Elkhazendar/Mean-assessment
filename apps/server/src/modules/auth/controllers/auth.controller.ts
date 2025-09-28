import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  UseGuards,
  Request,
  ValidationPipe,
  Res
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SignupDto, LoginDto, ResetPasswordDto } from '@mean-assessment/dto';
import { AuthResponse } from '@mean-assessment/data-models';
import { HTTP_STATUS } from '@mean-assessment/constants';
import { 
  AuthRequest,
  AuthenticatedAuthRequest, 
  AuthMessageResponse
} from '../interfaces/auth-request.interface';
import type { Response } from 'express';

import { 
  AuthResponseDto,
  AuthMessageResponseDto,
  ErrorResponseDto,
  ForgotPasswordDto
} from '../../../common/dto/swagger/response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup - User registration
   */
  @ApiOperation({
    summary: 'Register new user account',
    description: 'Creates a new user account with email and password. Returns JWT token upon successful registration.'
  })
  @ApiBody({
    type: SignupDto,
    description: 'User registration information'
  })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully',
    type: AuthResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid input',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 429,
    description: 'Too many signup attempts. Limited to 3 attempts per 15 minutes.',
    type: ErrorResponseDto
  })

  @Post('signup')
  @HttpCode(HTTP_STATUS.CREATED)
  @Throttle({ default: { ttl: 900000, limit: 3 } }) // 3 signups per 15 minutes
  async signup(
    @Body(ValidationPipe) signupDto: SignupDto,
    @Request() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const authResponse = await this.authService.signup(signupDto, request.correlationId);
    const session = await this.authService.createSession(
      { id: authResponse.user.id },
      this.buildSessionMetadata(request),
      request.correlationId,
    );
    this.authService.setRefreshCookie(response, session.cookieValue);
    return authResponse;
  }

  /**
   * POST /auth/signin - User authentication
   */
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Authenticate user with email and password. Returns JWT token valid for 8 hours.'
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials'
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: AuthResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid input',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 429,
    description: 'Too many signin attempts. Limited to 5 attempts per 15 minutes.',
    type: ErrorResponseDto
  })

  @Post('signin')
  @HttpCode(HTTP_STATUS.OK)
  @Throttle({ default: { ttl: 900000, limit: 5 } }) // 5 signin attempts per 15 minutes
  async signin(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Request() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const authResponse = await this.authService.signin(loginDto, request.correlationId);
    const session = await this.authService.createSession(
      { id: authResponse.user.id },
      this.buildSessionMetadata(request),
      request.correlationId,
    );
    this.authService.setRefreshCookie(response, session.cookieValue);
    return authResponse;
  }

  /**
   * POST /auth/refresh - Rotate refresh token and issue new access token
   */
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Rotates the refresh token and returns a new access token. Requires valid refresh cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    type: ErrorResponseDto,
  })

  @Post('refresh')
  @HttpCode(HTTP_STATUS.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async refresh(
    @Request() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const refreshCookie = this.getRefreshCookie(request);
    try {
      const { authResponse, newCookieValue } = await this.authService.refreshSession(
        refreshCookie,
        this.buildSessionMetadata(request),
        request.correlationId,
      );
      this.authService.setRefreshCookie(response, newCookieValue);
      return authResponse;
    } catch (error) {
      // On refresh failure, proactively clear the refresh cookie to avoid stale tokens
      this.authService.clearRefreshCookie(response);
      throw error;
    }
  }

  /**
   * POST /auth/signout - User logout
   */
  @ApiOperation({
    summary: 'User logout',
    description: 'Logs out the authenticated user and records the logout event for audit purposes.'
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    type: AuthMessageResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired JWT token',
    type: ErrorResponseDto
  })

  @ApiBearerAuth('JWT-auth')
  @Post('signout')
  @HttpCode(HTTP_STATUS.OK)
  @UseGuards(JwtAuthGuard)
  async signout(
    @Request() request: AuthenticatedAuthRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthMessageResponse> {
    const refreshCookie = this.getRefreshCookie(request);
    const result = await this.authService.signout(
      request.user.id,
      request.correlationId,
      refreshCookie,
    );

    this.authService.clearRefreshCookie(response);
    return result;
  }

  // User profile management is handled by UserController (/users/profile/me)
  // This maintains clean separation between authentication and user management

  /**
   * POST /auth/forgot-password - Request password reset
   */
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email with a secure token. Token expires in 1 hour.'
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Email address for password reset'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully (or email not found - silent for security)',
    type: AuthMessageResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 429,
    description: 'Too many password reset requests. Limited to 3 attempts per hour.',
    type: ErrorResponseDto
  })

  @Post('forgot-password')
  @HttpCode(HTTP_STATUS.OK)
  @Throttle({ default: { ttl: 3600000, limit: 3 } }) // 3 password reset requests per hour
  async forgotPassword(
    @Body('email') email: string,
    @Request() request: AuthRequest,
  ): Promise<AuthMessageResponse> {
    return await this.authService.forgotPassword(email, request.correlationId);
  }

  /**
   * POST /auth/reset-password - Reset password with token
   */
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets user password using the token received via email. Token must be valid and not expired.'
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Password reset information including token and new password'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: AuthMessageResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token, expired token, or validation error',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 429,
    description: 'Too many password reset attempts. Limited to 5 attempts per hour.',
    type: ErrorResponseDto
  })

  @Post('reset-password')
  @HttpCode(HTTP_STATUS.OK)
  @Throttle({ default: { ttl: 3600000, limit: 5 } }) // 5 password reset attempts per hour
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
    @Request() request: AuthRequest,
  ): Promise<AuthMessageResponse> {
    return await this.authService.resetPassword(resetPasswordDto, request.correlationId);
  }

  /**
   * Build session metadata from request headers for auditing
   */
  private buildSessionMetadata(request: AuthRequest): { ip?: string | null; userAgent?: string | null; device?: string | null } {
    return {
      ip: request.ip ?? null,
      userAgent: request.get('user-agent') ?? null,
      device: request.get('x-device-id') ?? null,
    };
  }

  private getRefreshCookie(request: AuthRequest): string | undefined {
    const cookies = (request as AuthRequest & { cookies?: Record<string, string> }).cookies;
    return cookies?.rt;
  }
}
