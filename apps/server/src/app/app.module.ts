import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { CoreModule } from '../core/core.module';
import { UserModule } from '../modules/users/user.module';
import { AuthModule } from '../modules/auth/auth.module';
import { ProductModule } from '../modules/products/product.module';
import { appConfig, databaseConfig, authConfig, emailConfig, throttlerConfig, corsConfig, swaggerConfig } from '../config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, emailConfig, throttlerConfig, corsConfig, swaggerConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    // Global throttling/rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.get<number>('throttler.global.ttl'),
          limit: configService.get<number>('throttler.global.limit'),
        }],
      }),
    }),
    CoreModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global throttling guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
