import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { WinstonLoggerService } from './core/logger/winston-logger.service';

async function bootstrap() {
  // Create application with buffer logs until logger is ready
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Get services
  const configService = app.get(ConfigService);
  const logger = app.get(WinstonLoggerService);
  
  // Use our Winston logger
  app.useLogger(logger);
  
  // Global configuration
  const globalPrefix = configService.get<string>('app.globalPrefix');
  const port = configService.get<number>('app.port');
  const nodeEnv = configService.get<string>('app.nodeEnv');
  const appName = configService.get<string>('app.name');
  
  app.setGlobalPrefix(globalPrefix);
  
  // Global validation pipe with detailed error messages
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
  
  // Dynamic CORS configuration
  const corsConfig = configService.get('cors');
  app.enableCors(corsConfig);
  
  // Swagger documentation setup
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
  
  // Global exception handling for unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', reason as Error, {
      component: 'Process',
      metadata: { promise: promise.toString() },
    });
  });
  
  // Global exception handling for uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error, {
      component: 'Process',
      metadata: { fatal: true },
    });
    
    // Graceful shutdown on uncaught exception
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  });
  
  // Graceful shutdown handling
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
  
  // Startup logs with correlation
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
