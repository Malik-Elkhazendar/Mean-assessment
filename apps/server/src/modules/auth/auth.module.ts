import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../users/user.module';
import { EmailModule } from '../email/email.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenEntity, RefreshTokenSchema } from './schemas/refresh-token.schema';

/**
 * Authentication Module
 * Provides complete authentication functionality including:
 * - JWT token generation and validation
 * - User registration and login
 * - Protected route guards
 * - Integration with existing UserModule and configuration
 */
@Module({
  imports: [
    // Configuration module for auth settings
    ConfigModule,
    
    // Mongoose model registration for refresh tokens
    MongooseModule.forFeature([
      { name: RefreshTokenEntity.name, schema: RefreshTokenSchema },
    ]),
    
    // User module for user management operations
    UserModule,
    
    // Email module for sending password reset emails
    EmailModule,
    
    // Passport module with JWT strategy
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    
    // JWT module with async configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          // Use explicit access token TTL (fallback handled in config)
          expiresIn: configService.get<string>('auth.jwtAccessExpiresIn'),
          issuer: 'mean-assessment-api',
          audience: 'mean-assessment-client',
        },
      }),
    }),
  ],
  providers: [
    // Authentication service
    AuthService,
    
    // JWT strategy for Passport
    JwtStrategy,
    
    // JWT guard for protecting routes
    JwtAuthGuard,
  ],
  controllers: [
    // Authentication endpoints
    AuthController,
  ],
  exports: [
    // Export for use in other modules
    AuthService,
    JwtAuthGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
