import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Request,
  ValidationPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { User } from '@mean-assessment/data-models';
import { UpdateUserDto } from '@mean-assessment/dto';
import { AppRequest, AuthenticatedRequest } from '../interfaces/request.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { 
  UserStatsResponseDto,
  HealthCheckResponseDto,
  ErrorResponseDto
} from '../../../common/dto/swagger/response.dto';

@ApiTags('Users')
// Use relative path; global prefix 'api' is applied in main.ts
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // User registration is handled by AuthController (/auth/signup)
  // This avoids duplication and maintains clean separation of concerns

  /**
   * GET /users/:id - Get user by ID (Admin only)
   */
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves user information by ID. Requires authentication.'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/UserDto' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ user: User }> {
    const user = await this.userService.findById(id, req.correlationId);
    if (!user) {
      // Return 404 when user not found
      throw new NotFoundException('User not found');
    }
    return { user };
  }

  /**
   * GET /users/profile/me - Get current user profile
   */
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the authenticated user\'s profile information.'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/UserDto' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
    type: ErrorResponseDto
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  async getProfile(@Request() req: AuthenticatedRequest): Promise<{ user: User }> {
    const user = await this.userService.findById(req.user.id, req.correlationId);
    return { user };
  }

  /**
   * PUT /users/:id - Update user by ID (Admin only)
   */
  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Updates user information by ID. Requires authentication.'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update information'
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateData: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ user: User; message: string }> {
    const user = await this.userService.update(id, updateData as UpdateUserDto, req.correlationId);
    return {
      user,
      message: 'User profile updated successfully.',
    };
  }

  /**
   * PUT /users/profile/me - Update current user profile
   */
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the authenticated user\'s profile information. Only firstName and lastName can be updated.'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User profile update information'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
    type: ErrorResponseDto
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Put('profile/me')
  async updateProfile(
    @Body(ValidationPipe) updateData: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ user: User; message: string }> {
    const user = await this.userService.update(req.user.id, updateData as UpdateUserDto, req.correlationId);
    return {
      user,
      message: 'Your profile has been updated successfully.',
    };
  }

  /**
   * DELETE /users/:id - Deactivate user account
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Request() req: AppRequest,
  ): Promise<void> {
    await this.userService.delete(id, req.correlationId);
  }

  /**
   * DELETE /users/profile/me - Deactivate current user account
   */
  @ApiOperation({
    summary: 'Deactivate current user account',
    description: 'Deactivates the authenticated user\'s account. This is a soft delete operation.'
  })
  @ApiResponse({
    status: 204,
    description: 'User account deactivated successfully'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
    type: ErrorResponseDto
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('profile/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Request() req: AuthenticatedRequest): Promise<void> {
    await this.userService.delete(req.user.id, req.correlationId);
  }

  /**
   * GET /users/health/status - Service health check
   */
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the user service for monitoring and load balancer purposes.'
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    type: HealthCheckResponseDto
  })
  @Get('health/status')
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * POST /users/verify-email - Verify user email
   */
  @ApiOperation({
    summary: 'Verify user email',
    description: 'Verifies user email using the verification token sent to their email address.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: 'User email address'
        },
        verificationToken: {
          type: 'string',
          example: 'abc123def456ghi789',
          description: 'Email verification token'
        }
      },
      required: ['email', 'verificationToken']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token',
    type: ErrorResponseDto
  })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body('email') email: string,
    @Body('verificationToken') verificationToken: string,
    @Request() req: AppRequest,
  ): Promise<{ user: User; message: string }> {
    const user = await this.userService.verifyEmail(email, verificationToken, req.correlationId);
    return {
      user,
      message: 'Email verified successfully. Your account is now active.',
    };
  }

  /**
   * POST /users/resend-verification - Resend email verification
   */
  @ApiOperation({
    summary: 'Resend email verification',
    description: 'Resends the email verification email to the user.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: 'User email address'
        }
      },
      required: ['email']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified or user not found',
    type: ErrorResponseDto
  })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendEmailVerification(
    @Body('email') email: string,
    @Request() req: AppRequest,
  ): Promise<{ message: string; timestamp: string }> {
    await this.userService.resendEmailVerification(email, req.correlationId);
    return {
      message: 'Verification email sent successfully.',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /users/admin/stats - Get user statistics (admin endpoint)
   */
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Retrieves comprehensive user statistics for administrative purposes including totals and status breakdown.'
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: UserStatsResponseDto
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  async getUserStats(@Request() req: AppRequest): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    timestamp: string;
  }> {
    return await this.userService.getUserStatistics(req.correlationId);
  }
}
