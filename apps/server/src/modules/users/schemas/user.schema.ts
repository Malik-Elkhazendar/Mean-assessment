import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User as IUser } from '@mean-assessment/data-models';

/**
 * Mongoose document interface extending the shared User interface
 * Combines shared typing with Mongoose-specific document features
 */
export type UserDocument = UserEntity & Document & {
  _id: Types.ObjectId;
};

/**
 * User entity schema for MongoDB using Mongoose
 * Implements the shared User interface while adding database-specific features
 */
@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users',
  versionKey: false, // Disable __v field
})
export class UserEntity implements Omit<IUser, 'id'> {
  /**
   * User's email address - used as unique identifier for authentication
   * Indexed for performance and uniqueness constraint
   */
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  })
  email!: string;

  /**
   * User's first name
   * Required for personalization and display purposes
   */
  @Prop({
    required: true,
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
  })
  firstName!: string;

  /**
   * User's last name
   * Required for personalization and display purposes
   */
  @Prop({
    required: true,
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  })
  lastName!: string;

  /**
   * Hashed password for authentication
   * Never included in API responses for security
   */
  @Prop({
    required: true,
    select: false, // Exclude from queries by default
    minlength: [8, 'Password must be at least 8 characters'],
  })
  password!: string;

  /**
   * Account activation status
   * Controls user access to protected resources
   */
  @Prop({
    type: Boolean,
    default: true,
    index: true, // Index for filtering active users
  })
  isActive!: boolean;

  /**
   * Timestamp of user's last successful login
   * Used for analytics and security monitoring
   */
  @Prop({
    type: Date,
    default: null,
  })
  lastLoginAt?: Date;

  /**
   * User's role for authorization
   * Extensible for role-based access control
   */
  @Prop({
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
    index: true,
  })
  role!: string;

  /**
   * Email verification status
   * Required for security and account validation
   */
  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  isEmailVerified!: boolean;

  /**
   * Token for email verification
   * Temporary token for account activation
   */
  @Prop({
    type: String,
    default: null,
    select: false, // Exclude from queries by default
  })
  emailVerificationToken?: string;

  /**
   * Token for password reset functionality
   * Temporary token for secure password recovery
   */
  @Prop({
    type: String,
    default: null,
    select: false, // Exclude from queries by default
  })
  passwordResetToken?: string;

  /**
   * Expiration date for password reset token
   * Ensures tokens have limited lifespan for security
   */
  @Prop({
    type: Date,
    default: null,
  })
  passwordResetExpires?: Date;

  /**
   * Number of failed login attempts
   * Used for account lockout security feature
   */
  @Prop({
    type: Number,
    default: 0,
  })
  failedLoginAttempts!: number;

  /**
   * Account lockout timestamp
   * Temporary security measure for suspicious activity
   */
  @Prop({
    type: Date,
    default: null,
  })
  lockedUntil?: Date;

  // Timestamps are automatically added by Mongoose when timestamps: true
  createdAt!: Date;
  updatedAt!: Date;

  /**
   * Virtual getter for the user's full name
   * Combines first and last name for display purposes
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Virtual getter for checking if account is locked
   * Convenience method for authentication logic
   */
  get isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
  }


}

/**
 * Mongoose schema instance for the User entity
 * Configured with indexes and virtuals for optimal performance
 */
export const UserSchema = SchemaFactory.createForClass(UserEntity);

// Add compound indexes for common queries
UserSchema.index({ email: 1, isActive: 1 }); // Login queries
UserSchema.index({ isActive: 1, role: 1 }); // Admin queries
UserSchema.index({ createdAt: -1 }); // Recent users

// Add virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Add virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockedUntil && this.lockedUntil > new Date());
});

// Add virtual for id to match shared interface
UserSchema.virtual('id').get(function(this: UserDocument) {
  return this._id?.toString();
});

// Ensure virtuals are included when converting to JSON
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive fields from JSON output
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.failedLoginAttempts;
    delete ret.lockedUntil;
    return ret;
  },
});

// Ensure virtuals are included when converting to Object
UserSchema.set('toObject', {
  virtuals: true,
});

// Pre-save middleware for additional validation or processing
UserSchema.pre('save', function(next) {
  // Reset failed login attempts when password is changed
  if (this.isModified('password')) {
    this.failedLoginAttempts = 0;
    this.lockedUntil = undefined;
  }
  next();
});
