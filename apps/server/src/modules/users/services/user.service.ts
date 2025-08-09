import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserEntity, UserDocument } from '../schemas/user.schema';
import { WinstonLoggerService } from '../../../core/logger/winston-logger.service';
import { EmailService } from '../../email/services/email.service';
import { User } from '@mean-assessment/data-models';
import { SignupDto, LoginDto, UpdateUserDto } from '@mean-assessment/dto';
import { isValidEmail, isStrongPassword, isValidObjectId } from '@mean-assessment/validation';
import { ERROR_MESSAGES } from '@mean-assessment/constants';

/**
 * User service providing comprehensive user management functionality
 * Handles CRUD operations, authentication support, and account security
 */
@Injectable()
export class UserService {
  private readonly saltRounds = 12; // bcrypt salt rounds for password hashing
  private readonly maxLoginAttempts = 5; // Maximum failed login attempts before lockout
  private readonly lockTime = 2 * 60 * 60 * 1000; // 2 hours account lockout duration

  constructor(
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserDocument>,
    private readonly logger: WinstonLoggerService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create a new user account
   * Validates input, hashes password, and stores user data
   */
  async create(signupDto: SignupDto, correlationId?: string): Promise<User> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'create', email: signupDto.email }
    };

    this.logger.log('Creating new user account', logContext);

    // Validate email format
    if (!isValidEmail(signupDto.email)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
    }

    // Validate password strength
    if (!isStrongPassword(signupDto.password)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.WEAK_PASSWORD);
    }

    // Check if user already exists
    const existingUser = await this.findByEmail(signupDto.email);
    if (existingUser) {
      this.logger.warn('Attempted to create user with existing email', logContext);
      throw new ConflictException(ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS);
    }

    try {
      // Hash password before storing
      const hashedPassword = await this.hashPassword(signupDto.password);
      
      // Generate email verification token
      const emailVerificationToken = this.generateToken();

      // Create user document
      const userData = {
        email: signupDto.email.toLowerCase().trim(),
        firstName: signupDto.firstName.trim(),
        lastName: signupDto.lastName.trim(),
        password: hashedPassword,
        emailVerificationToken,
        isEmailVerified: false, // Require email verification
      };

      const user = new this.userModel(userData);
      const savedUser = await user.save();

      this.logger.log('User account created successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: savedUser.id }
      });

      // Send email verification email
      try {
        await this.emailService.sendEmailVerificationEmail(
          savedUser.email,
          savedUser.firstName,
          emailVerificationToken,
          correlationId
        );
        this.logger.log('Email verification email sent successfully', {
          ...logContext,
          metadata: { ...logContext.metadata, userId: savedUser.id }
        });
      } catch (emailError) {
        // Log error but don't fail user creation
        this.logger.warn('Failed to send email verification email', {
          ...logContext,
          metadata: { 
            ...logContext.metadata, 
            userId: savedUser.id,
            emailError: emailError.message 
          }
        });
      }

      return this.transformToUser(savedUser);
    } catch (error) {
      this.logger.error('Failed to create user account', error, logContext);
      
      // Handle specific MongoDB errors
      if (error.code === 11000) {
        throw new ConflictException(ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS);
      }
      
      throw new BadRequestException(ERROR_MESSAGES.USER.CREATE_FAILED);
    }
  }

  /**
   * Find user by ID
   * Returns user data without sensitive fields
   */
  async findById(id: string, correlationId?: string): Promise<User | null> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'findById', userId: id }
    };

    if (!isValidObjectId(id)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_ID);
    }

    try {
      const user = await this.userModel.findById(id).exec();
      
      if (!user) {
        this.logger.debug('User not found by ID', logContext);
        return null;
      }

      this.logger.debug('User found by ID', logContext);
      return this.transformToUser(user);
    } catch (error) {
      this.logger.error('Error finding user by ID', error, logContext);
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SERVER_ERROR);
    }
  }

  /**
   * Find user by email address
   * Used for authentication and duplicate checking
   */
  async findByEmail(email: string, includePassword = false, correlationId?: string): Promise<UserDocument | null> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'findByEmail', email }
    };

    if (!isValidEmail(email)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
    }

    try {
      const query = this.userModel.findOne({ email: email.toLowerCase().trim() });
      
      // Include password field if needed for authentication
      if (includePassword) {
        query.select('+password');
      }

      const user = await query.exec();
      
      if (user) {
        this.logger.debug('User found by email', logContext);
      } else {
        this.logger.debug('User not found by email', logContext);
      }

      return user;
    } catch (error) {
      this.logger.error('Error finding user by email', error, logContext);
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SERVER_ERROR);
    }
  }

  /**
   * Update user information
   * Supports partial updates with validation
   */
  async update(id: string, updateData: UpdateUserDto | Partial<UserEntity>, correlationId?: string): Promise<User> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'update', userId: id }
    };

    if (!isValidObjectId(id)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_ID);
    }

    try {
      // Remove sensitive fields from update data
      const safeUpdateData = { ...updateData } as Record<string, unknown>;
      delete safeUpdateData.password;
      delete safeUpdateData.emailVerificationToken;
      delete safeUpdateData.passwordResetToken;

      // Validate email if being updated
      if (safeUpdateData.email && typeof safeUpdateData.email === 'string' && !isValidEmail(safeUpdateData.email)) {
        throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        { 
          ...safeUpdateData,
          ...(safeUpdateData.email && typeof safeUpdateData.email === 'string' && { 
            email: safeUpdateData.email.toLowerCase().trim() 
          })
        },
        { 
          new: true, 
          runValidators: true 
        }
      ).exec();

      if (!updatedUser) {
        throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      this.logger.log('User updated successfully', logContext);
      return this.transformToUser(updatedUser);
    } catch (error) {
      this.logger.error('Failed to update user', error, logContext);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        throw new ConflictException(ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS);
      }
      
      throw new BadRequestException(ERROR_MESSAGES.USER.UPDATE_FAILED);
    }
  }

  /**
   * Delete user account (soft delete by deactivating)
   * Preserves data integrity while disabling account access
   */
  async delete(id: string, correlationId?: string): Promise<void> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'delete', userId: id }
    };

    if (!isValidObjectId(id)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_ID);
    }

    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { 
          isActive: false,
          // Clear sensitive tokens when deactivating
          emailVerificationToken: null,
          passwordResetToken: null,
          passwordResetExpires: null
        },
        { new: true }
      ).exec();

      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      this.logger.log('User account deactivated', logContext);
    } catch (error) {
      this.logger.error('Failed to deactivate user account', error, logContext);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(ERROR_MESSAGES.USER.DELETE_FAILED);
    }
  }

  /**
   * Validate user credentials for authentication
   * Handles account lockout and failed attempt tracking
   */
  async validateCredentials(loginDto: LoginDto, correlationId?: string): Promise<User | null> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'validateCredentials', email: loginDto.email }
    };

    const user = await this.findByEmail(loginDto.email, true, correlationId);
    
    if (!user) {
      this.logger.warn('Login attempt with non-existent email', logContext);
      return null;
    }

    // Check if account is locked
    if (user.isLocked) {
      this.logger.warn('Login attempt on locked account', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: user.id }
      });
      throw new BadRequestException(ERROR_MESSAGES.AUTH.ACCOUNT_LOCKED);
    }

    // Check if account is active
    if (!user.isActive) {
      this.logger.warn('Login attempt on inactive account', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: user.id }
      });
      throw new BadRequestException(ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE);
    }

    // Validate password
    const isPasswordValid = await this.comparePassword(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, correlationId);
      this.logger.warn('Invalid password attempt', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: user.id }
      });
      return null;
    }

    // Reset failed attempts on successful login
    await this.handleSuccessfulLogin(user.id);
    
    this.logger.log('User credentials validated successfully', {
      ...logContext,
      metadata: { ...logContext.metadata, userId: user.id }
    });

    return this.transformToUser(user);
  }

  /**
   * Update user's last login timestamp
   * Called after successful authentication
   */
  async updateLastLogin(userId: string, correlationId?: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        { lastLoginAt: new Date() }
      ).exec();

      this.logger.debug('Updated last login timestamp', {
        correlationId,
        component: 'UserService',
        metadata: { action: 'updateLastLogin', userId }
      });
    } catch (error) {
      // Log error but don't throw - this is not critical for auth flow
      this.logger.error('Failed to update last login timestamp', error, {
        correlationId,
        component: 'UserService',
        metadata: { userId }
      });
    }
  }

  /**
   * Generate password reset token
   * Creates secure token for password recovery
   */
  async generatePasswordResetToken(email: string, correlationId?: string): Promise<string> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'generatePasswordResetToken', email }
    };

    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const resetToken = this.generateToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour expiration

    await this.userModel.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    }).exec();

    this.logger.log('Password reset token generated', logContext);
    return resetToken;
  }

  /**
   * Get user statistics for admin dashboard
   * Aggregates user data for analytics and monitoring
   */
  async getUserStatistics(correlationId?: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    timestamp: string;
  }> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'getUserStatistics' }
    };

    this.logger.log('Fetching user statistics', logContext);

    try {
      const [totalUsers, activeUsers, verifiedUsers] = await Promise.all([
        this.userModel.countDocuments().exec(),
        this.userModel.countDocuments({ isActive: true }).exec(),
        this.userModel.countDocuments({ isEmailVerified: true }).exec(),
      ]);

      const statistics = {
        totalUsers,
        activeUsers,
        verifiedUsers,
        timestamp: new Date().toISOString(),
      };

      this.logger.log('User statistics retrieved successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, ...statistics }
      });

      return statistics;
    } catch (error) {
      this.logger.error('Failed to retrieve user statistics', error, logContext);
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SERVER_ERROR);
    }
  }

  /**
   * Hash password using bcrypt
   * Provides secure password storage
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare plain text password with hashed password
   * Used for authentication validation
   */
  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate secure random token
   * Used for email verification and password reset
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Handle failed login attempt
   * Implements account lockout security feature
   */
  private async handleFailedLogin(userId: string, correlationId?: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return;

    const updates: UpdateQuery<UserDocument> = {
      $inc: { failedLoginAttempts: 1 }
    };

    // Lock account if max attempts reached
    if (user.failedLoginAttempts + 1 >= this.maxLoginAttempts) {
      updates.lockedUntil = new Date(Date.now() + this.lockTime);
      
      this.logger.warn('Account locked due to failed login attempts', {
        correlationId,
        component: 'UserService',
        metadata: { userId, failedAttempts: user.failedLoginAttempts + 1 }
      });
    }

    await this.userModel.findByIdAndUpdate(userId, updates).exec();
  }

  /**
   * Handle successful login
   * Resets failed login attempts and unlocks account
   */
  private async handleSuccessfulLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $unset: {
        failedLoginAttempts: 1,
        lockedUntil: 1,
      }
    }).exec();
  }

  /**
   * Validate password reset token and expiry
   * Returns true if token is valid and not expired
   */
  async validatePasswordResetToken(userId: string, token: string, correlationId?: string): Promise<boolean> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'validatePasswordResetToken', userId }
    };

    this.logger.debug('Validating password reset token', logContext);

    try {
      const user = await this.userModel.findById(userId)
        .select('+passwordResetToken +passwordResetExpires')
        .exec();

      if (!user) {
        this.logger.debug('User not found for token validation', logContext);
        return false;
      }

      // Check if token exists and matches
      if (!user.passwordResetToken || user.passwordResetToken !== token) {
        this.logger.debug('Invalid reset token', logContext);
        return false;
      }

      // Check if token has expired
      if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        this.logger.debug('Reset token has expired', logContext);
        return false;
      }

      this.logger.debug('Password reset token is valid', logContext);
      return true;
    } catch (error) {
      this.logger.error('Error validating password reset token', error, logContext);
      return false;
    }
  }

  /**
   * Reset user password using valid reset token
   * Updates password and clears reset token fields
   */
  async resetPasswordWithToken(userId: string, newPassword: string, correlationId?: string): Promise<void> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'resetPasswordWithToken', userId }
    };

    this.logger.log('Resetting password with token', logContext);

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.WEAK_PASSWORD);
    }

    try {
      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password and clear reset token fields
      await this.userModel.findByIdAndUpdate(userId, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0, // Reset failed attempts
        lockedUntil: null, // Clear any account locks
      }).exec();

      this.logger.log('Password reset completed successfully', logContext);
    } catch (error) {
      this.logger.error('Failed to reset password', error, logContext);
      throw new BadRequestException(ERROR_MESSAGES.USER.UPDATE_FAILED);
    }
  }

  /**
   * Verify user email using verification token
   * Activates the user account after successful email verification
   */
  async verifyEmail(email: string, verificationToken: string, correlationId?: string): Promise<User> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'verifyEmail', email }
    };

    this.logger.log('Processing email verification', logContext);

    if (!isValidEmail(email)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
    }

    try {
      const user = await this.userModel.findOne({ 
        email: email.toLowerCase().trim(),
        emailVerificationToken: verificationToken 
      }).exec();

      if (!user) {
        this.logger.warn('Invalid email verification token', logContext);
        throw new BadRequestException('Invalid or expired verification token');
      }

      if (user.isEmailVerified) {
        this.logger.warn('Email already verified', {
          ...logContext,
          metadata: { ...logContext.metadata, userId: user.id }
        });
        throw new BadRequestException('Email is already verified');
      }

      // Update user to mark email as verified and clear verification token
      const updatedUser = await this.userModel.findByIdAndUpdate(
        user._id,
        {
          isEmailVerified: true,
          emailVerificationToken: null,
        },
        { new: true }
      ).exec();

      if (!updatedUser) {
        throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      this.logger.log('Email verification completed successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: updatedUser.id }
      });

      return this.transformToUser(updatedUser);
    } catch (error) {
      this.logger.error('Email verification failed', error, logContext);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SERVER_ERROR);
    }
  }

  /**
   * Resend email verification email
   * Generates new verification token and sends email
   */
  async resendEmailVerification(email: string, correlationId?: string): Promise<void> {
    const logContext = { 
      correlationId, 
      component: 'UserService',
      metadata: { action: 'resendEmailVerification', email }
    };

    this.logger.log('Resending email verification', logContext);

    if (!isValidEmail(email)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
    }

    try {
      const user = await this.userModel.findOne({ 
        email: email.toLowerCase().trim() 
      }).exec();

      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      // Generate new verification token
      const newVerificationToken = this.generateToken();
      
      // Update user with new token
      await this.userModel.findByIdAndUpdate(user._id, {
        emailVerificationToken: newVerificationToken,
      }).exec();

      // Send new verification email
      await this.emailService.sendEmailVerificationEmail(
        user.email,
        user.firstName,
        newVerificationToken,
        correlationId
      );

      this.logger.log('Email verification resent successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, userId: user.id }
      });
    } catch (error) {
      this.logger.error('Failed to resend email verification', error, logContext);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SERVER_ERROR);
    }
  }

  /**
   * Transform UserDocument to shared User interface
   * Ensures consistent API response format
   */
  private transformToUser(userDoc: UserDocument): User {
    return {
      id: userDoc.id,
      email: userDoc.email,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      isActive: userDoc.isActive,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      lastLoginAt: userDoc.lastLoginAt,
    };
  }
}
