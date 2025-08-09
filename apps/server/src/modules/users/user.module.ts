import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from './schemas/user.schema';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { EmailModule } from '../email/email.module';

/**
 * User module providing comprehensive user management functionality
 * Encapsulates user-related schemas, services, and controllers
 * 
 * Features:
 * - User account creation and management
 * - Authentication support with security features
 * - Profile management endpoints
 * - Account lockout and security mechanisms
 * - Integration with shared libraries for consistent typing
 */
@Module({
  imports: [
    // Register Mongoose schema for User entity
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
      },
    ]),
    // Import EmailModule for sending verification emails
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [
    UserService,
    // Export MongooseModule to allow other modules to inject the User model
    MongooseModule,
  ],
})
export class UserModule {}

/**
 * Export all user-related types and interfaces for use in other modules
 * This promotes code reuse and maintains consistent typing across the application
 */
export { UserEntity, UserDocument } from './schemas/user.schema';
export { UserService } from './services/user.service';
export { UserController } from './controllers/user.controller';
