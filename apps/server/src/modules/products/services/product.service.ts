import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { ProductEntity, ProductDocument } from '../schemas/product.schema';
import { WinstonLoggerService } from '../../../core/logger/winston-logger.service';
import { Product } from '@mean-assessment/data-models';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '@mean-assessment/dto';
import { isValidObjectId } from '@mean-assessment/validation';
import { ERROR_MESSAGES } from '@mean-assessment/constants';
import { ProductListResponse, ProductResponse, ProductOperationResponse } from '../interfaces/product-request.interface';

/**
 * Product service providing comprehensive product management functionality
 * Handles CRUD operations, search, filtering, and user-scoped access control
 */
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductEntity.name) private readonly productModel: Model<ProductDocument>,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**
   * Create a new product
   * Associates product with the creating user for ownership tracking
   */
  async create(createProductDto: CreateProductDto, userId: string, correlationId?: string): Promise<ProductOperationResponse> {
    const logContext = { 
      correlationId, 
      component: 'ProductService',
      metadata: { action: 'create', userId, productName: createProductDto.name }
    };

    this.logger.log('Creating new product', logContext);

    try {
      const productData = {
        ...createProductDto,
        createdBy: userId,
        inStock: createProductDto.quantity > 0, // Auto-set inStock based on quantity
      };

      const product = new this.productModel(productData);
      const savedProduct = await product.save();

      const result = this.transformToProduct(savedProduct);

      this.logger.log('Product created successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, productId: result.id }
      });

      return {
        product: result,
        message: 'Product created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to create product', error, logContext);
      
      if (error.name === 'ValidationError') {
        const firstError = Object.values(error.errors)[0] as { message?: string };
        throw new BadRequestException(firstError.message || ERROR_MESSAGES.PRODUCT.CREATE_FAILED);
      }
      
      throw new BadRequestException(ERROR_MESSAGES.PRODUCT.CREATE_FAILED);
    }
  }

  /**
   * Get paginated list of products with filtering and search
   * Returns user-scoped products (only products created by the authenticated user)
   */
  async findAll(queryDto: ProductQueryDto, userId: string, correlationId?: string): Promise<ProductListResponse> {
    const logContext = { 
      correlationId, 
      component: 'ProductService',
      metadata: { action: 'findAll', userId, query: queryDto }
    };

    this.logger.log('Fetching products list', logContext);

    try {
      const { page = 1, limit = 10, search, category, inStock } = queryDto;

      // Build filter query - always scope to user's products
      const filter: FilterQuery<ProductDocument> = {
        createdBy: userId, // User-scoped access
      };

      // Add category filter if provided
      if (category) {
        filter.category = { $regex: new RegExp(category, 'i') };
      }

      // Add stock filter if provided
      if (inStock !== undefined) {
        filter.inStock = inStock;
      }

      // Add text search if provided
      if (search) {
        filter.$or = [
          { name: { $regex: new RegExp(search, 'i') } },
          { description: { $regex: new RegExp(search, 'i') } },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute queries in parallel for performance
      const [products, total] = await Promise.all([
        this.productModel
          .find(filter)
          .sort({ createdAt: -1 }) // Most recent first
          .skip(skip)
          .limit(limit)
          .exec(),
        this.productModel.countDocuments(filter).exec(),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const result: ProductListResponse = {
        products: products.map(product => this.transformToProduct(product)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
        filters: search || category || inStock !== undefined ? {
          ...(search && { search }),
          ...(category && { category }),
          ...(inStock !== undefined && { inStock }),
        } : undefined,
        timestamp: new Date().toISOString(),
      };

      this.logger.log('Products list fetched successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, count: products.length, total }
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch products list', error, logContext);
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG);
    }
  }

  /**
   * Get a single product by ID
   * Validates user ownership before returning product details
   */
  async findById(id: string, userId: string, correlationId?: string): Promise<ProductResponse> {
    const logContext = { 
      correlationId, 
      component: 'ProductService',
      metadata: { action: 'findById', productId: id, userId }
    };

    this.logger.log('Fetching product by ID', logContext);

    if (!isValidObjectId(id)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_ID);
    }

    try {
      const product = await this.productModel.findOne({
        _id: id,
        createdBy: userId, // Ensure user can only access their own products
      }).exec();

      if (!product) {
        this.logger.debug('Product not found or access denied', logContext);
        throw new NotFoundException(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
      }

      const result = this.transformToProduct(product);

      this.logger.log('Product fetched successfully', logContext);
      return {
        product: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to fetch product by ID', error, logContext);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG);
    }
  }

  /**
   * Update an existing product
   * Validates user ownership before allowing updates
   */
  async update(id: string, updateProductDto: UpdateProductDto, userId: string, correlationId?: string): Promise<ProductOperationResponse> {
    const logContext = { 
      correlationId, 
      component: 'ProductService',
      metadata: { action: 'update', productId: id, userId }
    };

    this.logger.log('Updating product', logContext);

    if (!isValidObjectId(id)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_ID);
    }

    try {
      // First check if product exists and user owns it
      const existingProduct = await this.productModel.findOne({
        _id: id,
        createdBy: userId,
      }).exec();

      if (!existingProduct) {
        throw new NotFoundException(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
      }

      // Prepare update data
      const updateData: Partial<ProductEntity> = { ...updateProductDto };
      
      // Auto-update inStock if quantity is being changed
      if (updateData.quantity !== undefined) {
        updateData.inStock = updateData.quantity > 0;
      }

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, // Return updated document
          runValidators: true, // Run schema validation
        }
      ).exec();

      if (!updatedProduct) {
        throw new NotFoundException(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
      }

      const result = this.transformToProduct(updatedProduct);

      this.logger.log('Product updated successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, updatedFields: Object.keys(updateProductDto) }
      });

      return {
        product: result,
        message: 'Product updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to update product', error, logContext);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.name === 'ValidationError') {
        const firstError = Object.values(error.errors)[0] as { message?: string };
        throw new BadRequestException(firstError.message || ERROR_MESSAGES.PRODUCT.UPDATE_FAILED);
      }
      
      throw new BadRequestException(ERROR_MESSAGES.PRODUCT.UPDATE_FAILED);
    }
  }

  /**
   * Delete a product
   * Validates user ownership before allowing deletion
   */
  async delete(id: string, userId: string, correlationId?: string): Promise<ProductOperationResponse> {
    const logContext = { 
      correlationId, 
      component: 'ProductService',
      metadata: { action: 'delete', productId: id, userId }
    };

    this.logger.log('Deleting product', logContext);

    if (!isValidObjectId(id)) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.INVALID_ID);
    }

    try {
      const result = await this.productModel.findOneAndDelete({
        _id: id,
        createdBy: userId, // Ensure user can only delete their own products
      }).exec();

      if (!result) {
        throw new NotFoundException(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
      }

      this.logger.log('Product deleted successfully', logContext);
      
      return {
        message: 'Product deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to delete product', error, logContext);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(ERROR_MESSAGES.PRODUCT.DELETE_FAILED);
    }
  }

  /**
   * Get product statistics for user dashboard
   * Returns aggregated data for the authenticated user's products
   */
  async getProductStatistics(userId: string, correlationId?: string): Promise<{
    totalProducts: number;
    inStockProducts: number;
    totalValue: number;
    categories: string[];
    timestamp: string;
  }> {
    const logContext = { 
      correlationId, 
      component: 'ProductService',
      metadata: { action: 'getProductStatistics', userId }
    };

    this.logger.log('Fetching product statistics', logContext);

    try {
      const [totalProducts, inStockProducts, valueAggregation, categories] = await Promise.all([
        this.productModel.countDocuments({ createdBy: userId }).exec(),
        this.productModel.countDocuments({ createdBy: userId, inStock: true }).exec(),
        this.productModel.aggregate([
          { $match: { createdBy: userId } },
          { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$quantity'] } } } }
        ]),
        this.productModel.distinct('category', { createdBy: userId }).exec(),
      ]);

      const totalValue = valueAggregation[0]?.totalValue || 0;

      const statistics = {
        totalProducts,
        inStockProducts,
        totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
        categories: categories.sort(),
        timestamp: new Date().toISOString(),
      };

      this.logger.log('Product statistics fetched successfully', {
        ...logContext,
        metadata: { ...logContext.metadata, statistics }
      });

      return statistics;
    } catch (error) {
      this.logger.error('Failed to fetch product statistics', error, logContext);
      throw new BadRequestException(ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG);
    }
  }

  /**
   * Transform ProductDocument to shared Product interface
   * Ensures consistent API response format
   */
  private transformToProduct(productDoc: ProductDocument): Product {
    return {
      id: productDoc.id,
      name: productDoc.name,
      description: productDoc.description,
      price: productDoc.price,
      category: productDoc.category,
      inStock: productDoc.inStock,
      quantity: productDoc.quantity,
      imageUrl: productDoc.imageUrl,
      createdAt: productDoc.createdAt,
      updatedAt: productDoc.updatedAt,
      createdBy: productDoc.createdBy,
    };
  }
}