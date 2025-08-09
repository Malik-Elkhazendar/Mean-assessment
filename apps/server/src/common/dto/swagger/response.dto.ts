import { ApiProperty } from '@nestjs/swagger';
import { User, Product } from '@mean-assessment/data-models';

export class UserDto implements Omit<User, 'updatedAt'> {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '507f1f77bcf86cd799439011',
    format: 'ObjectId'
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email'
  })
  email!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  lastName!: string;

  @ApiProperty({
    description: 'Account active status',
    example: true
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-01-20T14:25:00.000Z',
    format: 'date-time',
    required: false
  })
  lastLoginAt?: Date;
}

export class ProductDto implements Product {
  @ApiProperty({
    description: 'Unique product identifier',
    example: '507f1f77bcf86cd799439012',
    format: 'ObjectId'
  })
  id!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Bluetooth Headphones'
  })
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation and 20-hour battery life.'
  })
  description!: string;

  @ApiProperty({
    description: 'Product price in dollars',
    example: 149.99,
    type: 'number',
    format: 'float'
  })
  price!: number;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics'
  })
  category!: string;

  @ApiProperty({
    description: 'Product availability status',
    example: true
  })
  inStock!: boolean;

  @ApiProperty({
    description: 'Available quantity',
    example: 25,
    type: 'integer'
  })
  quantity!: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/headphones.jpg',
    required: false,
    format: 'url'
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Product last update timestamp',
    example: '2024-01-16T11:45:00.000Z',
    format: 'date-time'
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'ID of user who created the product',
    example: '507f1f77bcf86cd799439011',
    format: 'ObjectId'
  })
  createdBy!: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Authenticated user information',
    type: UserDto
  })
  user!: UserDto;

  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    format: 'jwt'
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Token expiration duration',
    example: '8h'
  })
  expiresIn!: string;

  @ApiProperty({
    description: 'Token type for authorization header',
    example: 'Bearer',
    enum: ['Bearer']
  })
  tokenType!: 'Bearer';
}

export class AuthMessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Password reset email sent successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;
}

export class ProfileResponseDto {
  @ApiProperty({
    description: 'User profile information',
    type: UserDto
  })
  user!: UserDto;

  @ApiProperty({
    description: 'Token validity status',
    example: true
  })
  tokenValid!: boolean;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;
}

export class PaginationMetadataDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
    type: 'integer'
  })
  page!: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    type: 'integer'
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 125,
    type: 'integer'
  })
  total!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 13,
    type: 'integer'
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true
  })
  hasNext!: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false
  })
  hasPrev!: boolean;
}

export class ProductFiltersDto {
  @ApiProperty({
    description: 'Search term used',
    example: 'headphones',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Category filter applied',
    example: 'Electronics',
    required: false
  })
  category?: string;

  @ApiProperty({
    description: 'In stock filter applied',
    example: true,
    required: false
  })
  inStock?: boolean;
}

export class ProductListResponseDto {
  @ApiProperty({
    description: 'Array of products',
    type: [ProductDto]
  })
  products!: ProductDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetadataDto
  })
  pagination!: PaginationMetadataDto;

  @ApiProperty({
    description: 'Applied filters',
    type: ProductFiltersDto,
    required: false
  })
  filters?: ProductFiltersDto;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product information',
    type: ProductDto
  })
  product!: ProductDto;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;
}

export class ProductOperationResponseDto {
  @ApiProperty({
    description: 'Product information (for create/update operations)',
    type: ProductDto,
    required: false
  })
  product?: ProductDto;

  @ApiProperty({
    description: 'Operation result message',
    example: 'Product created successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;
}

export class ProductStatsResponseDto {
  @ApiProperty({
    description: 'Total number of products',
    example: 45,
    type: 'integer'
  })
  totalProducts!: number;

  @ApiProperty({
    description: 'Number of products in stock',
    example: 38,
    type: 'integer'
  })
  inStockProducts!: number;

  @ApiProperty({
    description: 'Total inventory value in dollars',
    example: 12450.75,
    type: 'number',
    format: 'float'
  })
  totalValue!: number;

  @ApiProperty({
    description: 'Available product categories',
    example: ['Electronics', 'Clothing', 'Books'],
    type: 'array',
    items: { type: 'string' }
  })
  categories!: string[];

  @ApiProperty({
    description: 'Statistics timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;
}

export class UserStatsResponseDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 150,
    type: 'integer'
  })
  totalUsers!: number;

  @ApiProperty({
    description: 'Number of active users',
    example: 142,
    type: 'integer'
  })
  activeUsers!: number;

  @ApiProperty({
    description: 'Number of verified users',
    example: 128,
    type: 'integer'
  })
  verifiedUsers!: number;

  @ApiProperty({
    description: 'Statistics timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Service health status',
    example: 'healthy',
    enum: ['healthy', 'unhealthy']
  })
  status!: string;

  @ApiProperty({
    description: 'Health check timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid credentials provided'
  })
  message!: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
    type: 'integer'
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request path where error occurred',
    example: '/api/auth/signin'
  })
  path!: string;

  @ApiProperty({
    description: 'Detailed validation errors',
    required: false,
    type: 'array',
    items: { type: 'string' },
    example: ['Email is required', 'Password must be at least 6 characters']
  })
  details?: string[];
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address for password reset',
    example: 'user@example.com',
    format: 'email'
  })
  email!: string;
}