import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { ProductEntity, ProductSchema } from './schemas/product.schema';
import { AuthModule } from '../auth/auth.module'; // For JwtAuthGuard

/**
 * Product Module
 * Provides complete product management functionality including:
 * - CRUD operations for products
 * - User-scoped product access control
 * - Search and filtering capabilities
 * - Product statistics and analytics
 * - Protected endpoints requiring authentication
 */
@Module({
  imports: [
    // Configuration module for app settings
    ConfigModule,
    
    // Mongoose schema registration
    MongooseModule.forFeature([
      {
        name: ProductEntity.name,
        schema: ProductSchema,
      },
    ]),
    
    // Auth module for JWT authentication guards
    AuthModule,
  ],
  providers: [
    // Product business logic service
    ProductService,
  ],
  controllers: [
    // Product REST API endpoints
    ProductController,
  ],
  exports: [
    // Export ProductService for potential use in other modules
    ProductService,
    // Export MongooseModule for potential use in testing
    MongooseModule,
  ],
})
export class ProductModule {}