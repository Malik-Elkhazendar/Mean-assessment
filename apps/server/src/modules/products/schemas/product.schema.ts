import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, UpdateQuery } from 'mongoose';
import { Product as IProduct } from '@mean-assessment/data-models';

/**
 * Mongoose document interface extending the shared Product interface
 * Combines shared typing with Mongoose-specific document features
 */
export type ProductDocument = ProductEntity & Document & {
  _id: Types.ObjectId;
};

/**
 * Product entity schema for MongoDB using Mongoose
 * Implements the shared Product interface while adding database-specific features
 */
@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'products',
  versionKey: false, // Disable __v field
})
export class ProductEntity implements Omit<IProduct, 'id'> {
  /**
   * Product name for display and searching
   * Indexed for performance on search queries
   */
  @Prop({
    required: true,
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    index: true, // Index for search performance
  })
  name!: string;

  /**
   * Detailed product description
   * Used for product details and search content
   */
  @Prop({
    required: true,
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  })
  description!: string;

  /**
   * Product price in dollars
   * Stored as number with validation for business rules
   */
  @Prop({
    required: true,
    min: [0.01, 'Price must be greater than 0'],
    max: [999999.99, 'Price cannot exceed 999,999.99'],
    validate: {
      validator: function(value: number) {
        // Ensure price has at most 2 decimal places with floating point tolerance
        if (typeof value !== 'number' || Number.isNaN(value)) return false;
        const rounded = Math.round(value * 100) / 100;
        return Math.abs(value - rounded) < 1e-9;
      },
      message: 'Price must have at most 2 decimal places'
    },
  })
  price!: number;

  /**
   * Product category for filtering and organization
   * Indexed for efficient category-based queries
   */
  @Prop({
    required: true,
    trim: true,
    minlength: [2, 'Category must be at least 2 characters'],
    maxlength: [50, 'Category cannot exceed 50 characters'],
    index: true, // Index for category filtering
  })
  category!: string;

  /**
   * Stock availability status
   * Computed based on quantity, but can be manually overridden
   */
  @Prop({
    type: Boolean,
    default: true,
    index: true, // Index for filtering available products
  })
  inStock!: boolean;

  /**
   * Current stock quantity
   * Used for inventory management and stock calculations
   */
  @Prop({
    required: true,
    min: [0, 'Quantity cannot be negative'],
    max: [100000, 'Quantity cannot exceed 100,000'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    },
  })
  quantity!: number;

  /**
   * Optional product image URL
   * For product display and catalog features
   */
  @Prop({
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        // Basic URL validation
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid image URL format'
    },
    maxlength: [500, 'Image URL cannot exceed 500 characters'],
  })
  imageUrl?: string;

  /**
   * User ID who created this product
   * Used for ownership validation and user-scoped queries
   */
  @Prop({
    required: true,
    type: String, // Using string ID to match User interface
    index: true, // Index for user-scoped queries
  })
  createdBy!: string;

  // Timestamps are automatically added by Mongoose when timestamps: true
  createdAt!: Date;
  updatedAt!: Date;

  /**
   * Virtual getter for checking if product is available
   * Combines inStock status with quantity availability
   */
  get isAvailable(): boolean {
    return this.inStock && this.quantity > 0;
  }

  /**
   * Virtual getter for formatted price display
   * Returns price formatted as currency string
   */
  get formattedPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }
}

/**
 * Mongoose schema instance for the Product entity
 * Configured with indexes and virtuals for optimal performance
 */
export const ProductSchema = SchemaFactory.createForClass(ProductEntity);

// Add compound indexes for common queries
ProductSchema.index({ category: 1, inStock: 1 }); // Category filtering with stock status
ProductSchema.index({ createdBy: 1, createdAt: -1 }); // User products ordered by creation
ProductSchema.index({ name: 'text', description: 'text' }); // Text search index

// Add virtual for availability check
ProductSchema.virtual('isAvailable').get(function() {
  return this.inStock && this.quantity > 0;
});

// Add virtual for formatted price
ProductSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Add virtual for id to match shared interface
ProductSchema.virtual('id').get(function(this: ProductDocument) {
  return this._id?.toString();
});

// Ensure virtuals are included when converting to JSON
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove internal fields from JSON output
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Ensure virtuals are included when converting to Object
ProductSchema.set('toObject', {
  virtuals: true,
});

// Pre-save middleware for business logic
ProductSchema.pre('save', function(next) {
  // Auto-update inStock based on quantity
  if (this.quantity === 0) {
    this.inStock = false;
  }
  
  // Ensure price precision (round to 2 decimal places)
  this.price = Math.round(this.price * 100) / 100;
  
  next();
});

// Pre-update middleware for business logic
ProductSchema.pre('findOneAndUpdate', function(next) {
  const rawUpdate = this.getUpdate() as UpdateQuery<ProductEntity> | undefined;

  if (!rawUpdate) {
    return next();
  }

  // Support both direct update and $set style updates
  const updateObject = rawUpdate as Partial<ProductEntity> & {
    $set?: Partial<ProductEntity>;
  };

  // Normalize to $set so we don't accidentally conflict with operators
  if (!updateObject.$set) {
    updateObject.$set = {};
  }

  // Auto-update inStock if quantity is being updated to 0
  if (typeof updateObject.quantity === 'number' && updateObject.quantity === 0) {
    updateObject.$set.inStock = false;
  }

  // Ensure price precision if price is being updated
  if (typeof updateObject.price === 'number') {
    updateObject.$set.price = Math.round(updateObject.price * 100) / 100;
  }

  next();
});