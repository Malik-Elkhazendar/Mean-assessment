import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpCode, 
  UseGuards,
  Request,
  ValidationPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiParam,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '@mean-assessment/dto';
import { HTTP_STATUS } from '@mean-assessment/constants';
import { 
  AuthenticatedProductRequest, 
  ProductListResponse, 
  ProductResponse,
  ProductOperationResponse 
} from '../interfaces/product-request.interface';

import { 
  ProductListResponseDto,
  ProductResponseDto,
  ProductOperationResponseDto,
  ProductStatsResponseDto,
  ErrorResponseDto
} from '../../../common/dto/swagger/response.dto';


@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard) 
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * GET /products - List products with pagination and filtering
   */
  @ApiOperation({
    summary: 'List user products',
    description: 'Retrieves paginated list of products created by the authenticated user with optional filtering and search capabilities.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for product name or description',
    example: 'headphones'
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by product category',
    example: 'Electronics'
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'Filter by stock availability',
    example: true
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ProductListResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired JWT token',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
    type: ErrorResponseDto
  })

  @Get()
  @HttpCode(HTTP_STATUS.OK)
  async findAll(
    @Query(ValidationPipe) queryDto: ProductQueryDto,
    @Request() request: AuthenticatedProductRequest,
  ): Promise<ProductListResponse> {
    return await this.productService.findAll(queryDto, request.user.id, request.correlationId);
  }

  /**
   * POST /products - Create new product
   */
  @ApiOperation({
    summary: 'Create new product',
    description: 'Creates a new product in the authenticated user\'s catalog. The product will be associated with the current user.'
  })
  @ApiBody({
    type: CreateProductDto,
    description: 'Product information for creation'
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductOperationResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid input',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired JWT token',
    type: ErrorResponseDto
  })

  @Post()
  @HttpCode(HTTP_STATUS.CREATED)
  async create(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
    @Request() request: AuthenticatedProductRequest,
  ): Promise<ProductOperationResponse> {
    return await this.productService.create(createProductDto, request.user.id, request.correlationId);
  }

  /**
   * GET /products/stats - Get user's product statistics
   */
  @ApiOperation({
    summary: 'Get product statistics',
    description: 'Retrieves comprehensive statistics for the authenticated user\'s product catalog including totals, stock status, and categories.'
  })
  @ApiResponse({
    status: 200,
    description: 'Product statistics retrieved successfully',
    type: ProductStatsResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired JWT token',
    type: ErrorResponseDto
  })

  @Get('stats')
  @HttpCode(HTTP_STATUS.OK)
  async getStatistics(
    @Request() request: AuthenticatedProductRequest,
  ): Promise<{
    totalProducts: number;
    inStockProducts: number;
    totalValue: number;
    categories: string[];
    timestamp: string;
  }> {
    return await this.productService.getProductStatistics(request.user.id, request.correlationId);
  }

  /**
   * GET /products/:id - Get single product by ID
   */
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieves a specific product by its ID. User can only access products they created.'
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439012'
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired JWT token',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'Product belongs to different user',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    type: ErrorResponseDto
  })

  @Get(':id')
  @HttpCode(HTTP_STATUS.OK)
  async findById(
    @Param('id') id: string,
    @Request() request: AuthenticatedProductRequest,
  ): Promise<ProductResponse> {
    return await this.productService.findById(id, request.user.id, request.correlationId);
  }

  /**
   * PUT /products/:id - Update product
   */
  @ApiOperation({
    summary: 'Update product',
    description: 'Updates an existing product. Only the product owner can perform this operation. Supports partial updates.'
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439012'
  })
  @ApiBody({
    type: UpdateProductDto,
    description: 'Product fields to update (all fields are optional)'
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductOperationResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid input',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired JWT token',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'Product belongs to different user',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    type: ErrorResponseDto
  })

  @Put(':id')
  @HttpCode(HTTP_STATUS.OK)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
    @Request() request: AuthenticatedProductRequest,
  ): Promise<ProductOperationResponse> {
    return await this.productService.update(id, updateProductDto, request.user.id, request.correlationId);
  }

  /**
   * DELETE /products/:id - Delete product
   */
  @ApiOperation({
    summary: 'Delete product',
    description: 'Permanently deletes a product from the catalog. Only the product owner can perform this operation.'
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439012'
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: ProductOperationResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired JWT token',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'Product belongs to different user',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    type: ErrorResponseDto
  })

  @Delete(':id')
  @HttpCode(HTTP_STATUS.OK)
  async delete(
    @Param('id') id: string,
    @Request() request: AuthenticatedProductRequest,
  ): Promise<ProductOperationResponse> {
    return await this.productService.delete(id, request.user.id, request.correlationId);
  }
}