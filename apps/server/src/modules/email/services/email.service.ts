import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { WinstonLoggerService } from '../../../core/logger/winston-logger.service';
import { ERROR_MESSAGES } from '@mean-assessment/constants';

/**
 * Email Service for sending transactional emails
 * Handles password reset emails and other notifications using MailerService
 */
@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**
   * Send password reset email to user
   * Uses Handlebars template with reset token and user information
   */
  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
    correlationId?: string,
  ): Promise<void> {
    const logContext = {
      correlationId,
      component: 'EmailService',
      metadata: { 
        action: 'sendPasswordResetEmail', 
        email, 
        template: 'forgot-password' 
      }
    };

    this.logger.log('Sending password reset email', logContext);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password - MEAN Assessment',
        template: 'forgot-password', // References forgot-password.hbs
        context: {
          firstName,
          resetToken,
          email,
        },
      });

      this.logger.log('Password reset email sent successfully', logContext);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error, {
        ...logContext,
        metadata: {
          ...logContext.metadata,
          errorType: error.constructor.name,
          errorMessage: error.message,
        }
      });

      throw new InternalServerErrorException(ERROR_MESSAGES.GENERAL.SERVER_ERROR);
    }
  }

  /**
   * Send welcome email to new users (future enhancement)
   * Template can be created when needed
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string,
    correlationId?: string,
  ): Promise<void> {
    const logContext = {
      correlationId,
      component: 'EmailService',
      metadata: { 
        action: 'sendWelcomeEmail', 
        email, 
        template: 'welcome' 
      }
    };

    this.logger.log('Sending welcome email', logContext);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to MEAN Assessment Platform!',
        template: 'welcome',
        context: {
          firstName,
          email,
        },
      });

      this.logger.log('Welcome email sent successfully', logContext);
    } catch (error) {
      this.logger.error('Failed to send welcome email', error, {
        ...logContext,
        metadata: {
          ...logContext.metadata,
          errorType: error.constructor.name,
          errorMessage: error.message,
        }
      });

      // Don't throw error for welcome email failure - it's not critical
      this.logger.warn('Welcome email delivery failed but continuing', logContext);
    }
  }

  /**
   * Send email verification email (future enhancement)
   * For account activation functionality
   */
  async sendEmailVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string,
    correlationId?: string,
  ): Promise<void> {
    const logContext = {
      correlationId,
      component: 'EmailService',
      metadata: { 
        action: 'sendEmailVerificationEmail', 
        email, 
        template: 'email-verification' 
      }
    };

    this.logger.log('Sending email verification email', logContext);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email - MEAN Assessment',
        template: 'email-verification',
        context: {
          firstName,
          verificationToken,
          email,
        },
      });

      this.logger.log('Email verification email sent successfully', logContext);
    } catch (error) {
      this.logger.error('Failed to send email verification email', error, {
        ...logContext,
        metadata: {
          ...logContext.metadata,
          errorType: error.constructor.name,
          errorMessage: error.message,
        }
      });

      throw new InternalServerErrorException(ERROR_MESSAGES.GENERAL.SERVER_ERROR);
    }
  }
}