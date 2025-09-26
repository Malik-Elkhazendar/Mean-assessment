/**
 * MEAN Stack Assessment - NestJS Application Bootstrap
 * 
 * This is the main entry point for the NestJS backend server. It configures:
 * - Global validation pipes with comprehensive error handling
 * - CORS for Angular frontend integration (http://localhost:4200)
 * - Swagger API documentation with JWT authentication support
 * - Winston structured logging with correlation IDs
 * - Graceful shutdown handling for production deployments
 * 
 * The server runs on port 3000 by default and provides RESTful APIs for:
 * - Authentication (signup, signin, password reset)
 * - User management (profile operations)
 * - Product management (CRUD operations)
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { WinstonLoggerService } from './core/logger/winston-logger.service';
import cookieParser from 'cookie-parser';

/**
 * Bootstrap function that initializes and configures the NestJS application
 * with all necessary middleware, security, and documentation features.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until Winston logger is ready
  });
  
  const configService = app.get(ConfigService);
  const logger = app.get(WinstonLoggerService);
  
  app.useLogger(logger);
  
  // Parse cookies for HttpOnly refresh token handling
  app.use(cookieParser());
  
  const globalPrefix = configService.get<string>('app.globalPrefix');
  const port = configService.get<number>('app.port');
  const nodeEnv = configService.get<string>('app.nodeEnv');
  const appName = configService.get<string>('app.name');
  
  app.setGlobalPrefix(globalPrefix);
  
  /**
   * Global validation pipe that:
   * - Strips unknown properties (whitelist: true)
   * - Rejects requests with unexpected properties (forbidNonWhitelisted: true)
   * - Transforms incoming data to match DTO types (transform: true)
   * - Provides detailed validation error messages for debugging
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          const constraints = error.constraints;
          if (constraints) {
            return `property ${error.property} has failed the following constraints: ${Object.keys(constraints).join(', ')}`;
          }
          return `property ${error.property} has validation errors`;
        });
        
        return new Error(messages.join('; '));
      },
    })
  );
  
  /**
   * CORS configuration for Angular frontend (development: localhost:4200)
   * Production origins should be configured via environment variables
   */
  const corsConfig = configService.get('cors');
  app.enableCors(corsConfig);
  
  /**
   * Swagger API documentation setup
   * Provides interactive API documentation with JWT authentication testing
   * Available at: http://localhost:3000/api/docs (development)
   */
  const swaggerConfig = configService.get('swagger');
  if (swaggerConfig.enabled) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .setContact(
        swaggerConfig.contact.name,
        '',
        swaggerConfig.contact.email
      )
      .setLicense(
        swaggerConfig.license.name,
        swaggerConfig.license.url
      )
      .addBearerAuth(
        {
          description: 'JWT Authorization header using the Bearer scheme',
          name: 'Authorization',
          bearerFormat: 'JWT',
          scheme: 'bearer',
          type: 'http',
          in: 'Header'
        },
        'JWT-auth'
      )
      .addTag('Authentication', 'User authentication and authorization endpoints')
      .addTag('Users', 'User management and profile operations')
      .addTag('Products', 'Product catalog and inventory management')
      .addTag('Health', 'Application health and monitoring endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: swaggerConfig.title,
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
      `,
    });
    
    logger.log(`📚 Swagger UI available at: http://localhost:${port}/${swaggerConfig.path}`, {
      component: 'Swagger',
    });
  }
  
  /**
   * Global exception handlers for production stability
   * Logs errors with context and performs graceful shutdown when necessary
   */
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', reason as Error, {
      component: 'Process',
      metadata: { promise: promise.toString() },
    });
  });
  
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error, {
      component: 'Process',
      metadata: { fatal: true },
    });
    
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  });
  
  /**
   * Graceful shutdown handlers for production deployments
   * Ensures proper cleanup of database connections and active requests
   */
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down gracefully', {
      component: 'Process',
    });
    
    await app.close();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down gracefully', {
      component: 'Process',
    });
    
    await app.close();
    process.exit(0);
  });
  
  await app.listen(port);
  
  const startupContext = { component: 'Bootstrap' };
  
  logger.log(`🚀 ${appName} is running on: http://localhost:${port}/${globalPrefix}`, startupContext);
  logger.log(`📊 Environment: ${nodeEnv}`, startupContext);
  logger.log(`💾 Database: ${configService.get<string>('database.uri').split('@')[1]?.split('?')[0] || 'Local'}`, startupContext);
  logger.log(`📝 Log Level: ${configService.get<string>('app.logLevel')}`, startupContext);
  logger.log(`🎯 Ready for requests`, startupContext);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
