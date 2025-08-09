import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, Max, IsUrl, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user authentication
 * Used by login endpoints to validate user credentials
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address for authentication',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'User password for authentication',
    example: 'securePassword123',
    minLength: 6,
    format: 'password'
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

/**
 * Data Transfer Object for user registration
 * Validates new user account creation with required profile information
 */
export class SignupDto {
  @ApiProperty({
    description: 'User email address for account registration',
    example: 'jane.smith@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'Strong password for account security',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 128,
    format: 'password'
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Jane',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Smith',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName!: string;
}

/**
 * Data Transfer Object for updating user information
 * All fields are optional for partial updates
 */
export class UpdateUserDto {
  @ApiProperty({
    description: 'Updated first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName?: string;

  @ApiProperty({
    description: 'Updated last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName?: string;
}

/**
 * Data Transfer Object for password reset operations
 * Handles both password reset requests and password updates
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'abc123def456ghi789',
    required: false
  })
  @IsString({ message: 'Reset token must be a string' })
  @IsOptional()
  resetToken?: string;

  @ApiProperty({
    description: 'New password to replace the old one',
    example: 'NewSecurePassword123!',
    minLength: 8,
    maxLength: 128,
    format: 'password',
    required: false
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password cannot exceed 128 characters' })
  @IsOptional()
  newPassword?: string;
}

/**
 * Data Transfer Object for creating new products
 * Validates product creation with comprehensive business rules
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Product name or title',
    example: 'Wireless Bluetooth Headphones',
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: 'Product name must be a string' })
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Product name cannot exceed 100 characters' })
  @IsNotEmpty({ message: 'Product name is required' })
  name!: string;

  @ApiProperty({
    description: 'Detailed product description',
    example: 'High-quality wireless headphones with noise cancellation, 20-hour battery life, and premium sound quality.',
    minLength: 10,
    maxLength: 1000
  })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @ApiProperty({
    description: 'Product price in dollars',
    example: 149.99,
    minimum: 0.01,
    maximum: 999999.99,
    type: 'number',
    format: 'float'
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with up to 2 decimal places' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  @Max(999999.99, { message: 'Price cannot exceed 999,999.99' })
  @Type(() => Number)
  price!: number;

  @ApiProperty({
    description: 'Product category or classification',
    example: 'Electronics',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'Category must be a string' })
  @MinLength(2, { message: 'Category must be at least 2 characters long' })
  @MaxLength(50, { message: 'Category cannot exceed 50 characters' })
  @IsNotEmpty({ message: 'Category is required' })
  category!: string;

  @ApiProperty({
    description: 'Available quantity in inventory',
    example: 25,
    minimum: 0,
    maximum: 100000,
    type: 'integer'
  })
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(0, { message: 'Quantity cannot be negative' })
  @Max(100000, { message: 'Quantity cannot exceed 100,000' })
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({
    description: 'Optional product image URL',
    example: 'https://example.com/images/headphones.jpg',
    required: false,
    maxLength: 500,
    format: 'url'
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @MaxLength(500, { message: 'Image URL cannot exceed 500 characters' })
  imageUrl?: string;
}

/**
 * Data Transfer Object for updating existing products
 * All fields are optional for partial updates
 */
export class UpdateProductDto {
  @ApiProperty({
    description: 'Product name or title',
    example: 'Updated Wireless Bluetooth Headphones',
    minLength: 2,
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Product name cannot exceed 100 characters' })
  name?: string;

  @ApiProperty({
    description: 'Updated product description',
    example: 'Enhanced wireless headphones with improved noise cancellation and 25-hour battery life.',
    minLength: 10,
    maxLength: 1000,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Updated product price in dollars',
    example: 169.99,
    minimum: 0.01,
    maximum: 999999.99,
    type: 'number',
    format: 'float',
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with up to 2 decimal places' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  @Max(999999.99, { message: 'Price cannot exceed 999,999.99' })
  @Type(() => Number)
  price?: number;

  @ApiProperty({
    description: 'Updated product category',
    example: 'Audio Equipment',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @MinLength(2, { message: 'Category must be at least 2 characters long' })
  @MaxLength(50, { message: 'Category cannot exceed 50 characters' })
  category?: string;

  @ApiProperty({
    description: 'Updated quantity in inventory',
    example: 30,
    minimum: 0,
    maximum: 100000,
    type: 'integer',
    required: false
  })
  @IsOptional()
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(0, { message: 'Quantity cannot be negative' })
  @Max(100000, { message: 'Quantity cannot exceed 100,000' })
  @Type(() => Number)
  quantity?: number;

  @ApiProperty({
    description: 'Updated product image URL',
    example: 'https://example.com/images/updated-headphones.jpg',
    required: false,
    maxLength: 500,
    format: 'url'
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @MaxLength(500, { message: 'Image URL cannot exceed 500 characters' })
  imageUrl?: string;
}

/**
 * Data Transfer Object for product queries with pagination and filtering
 * Supports search, category filtering, and pagination
 */
export class ProductQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
    type: 'integer',
    required: false
  })
  @IsOptional()
  @IsInt({ message: 'Page must be a whole number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    type: 'integer',
    required: false
  })
  @IsOptional()
  @IsInt({ message: 'Limit must be a whole number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term to filter products by name or description',
    example: 'headphones',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @MaxLength(100, { message: 'Search term cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiProperty({
    description: 'Filter products by category',
    example: 'Electronics',
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @MaxLength(50, { message: 'Category cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  category?: string;

  @ApiProperty({
    description: 'Filter products by stock availability',
    example: true,
    type: 'boolean',
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'In stock filter must be a boolean' })
  @Type(() => Boolean)
  inStock?: boolean;
}
