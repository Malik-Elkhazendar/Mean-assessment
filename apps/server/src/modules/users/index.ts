/**
 * User module exports
 * Provides clean import paths for user-related functionality
 */

// Module exports
export { UserModule } from './user.module';

// Service exports
export { UserService } from './services/user.service';

// Controller exports
export { UserController } from './controllers/user.controller';

// Schema and type exports
export { UserEntity, UserDocument } from './schemas/user.schema';

// Interface exports
export { AppRequest, AuthenticatedRequest } from './interfaces/request.interface';

// Re-export shared types for convenience
export type { User } from '@mean-assessment/data-models';
export { SignupDto, LoginDto } from '@mean-assessment/dto';
