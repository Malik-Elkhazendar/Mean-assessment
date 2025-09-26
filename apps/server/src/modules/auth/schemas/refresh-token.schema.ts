import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Refresh Token Document Type
 * Extends Mongoose Document and exposes `_id` as ObjectId
 */
export type RefreshTokenDocument = RefreshTokenEntity & Document & {
  _id: Types.ObjectId;
};

/**
 * Refresh Token Entity
 * Stores hashed refresh tokens with rotation and revocation metadata.
 * Lives under the Auth module as it is an authentication concern.
 */
@Schema({
  timestamps: true,
  collection: 'refresh_tokens',
  versionKey: false,
})
export class RefreshTokenEntity {
  /**
   * User ID owning this refresh token
   * Stored as string to align with other schemas using string user IDs
   */
  @Prop({
    required: true,
    type: String,
    index: true,
    trim: true,
  })
  userId!: string;

  /**
   * BCrypt/Scrypt hash of the opaque refresh token
   * Never exposed in API responses
   */
  @Prop({
    required: true,
    type: String,
    unique: true,
    select: false,
  })
  tokenHash!: string;

  /**
   * Sliding refresh expiry for this particular token instance
   * TTL index defined below to auto-remove expired documents
   */
  @Prop({
    required: true,
    type: Date,
  })
  expiresAt!: Date;

  /**
   * Absolute session expiry (hard cap, e.g., 8 hours from initial login)
   */
  @Prop({
    required: true,
    type: Date,
  })
  sessionExpiresAt!: Date;

  /**
   * Revocation timestamp (set when rotated, reused, or signed out)
   */
  @Prop({
    type: Date,
    default: null,
    index: true,
  })
  revokedAt?: Date | null;

  /**
   * Identifier of the replacing token (string id representation)
   * Useful for rotation chains and reuse detection
   */
  @Prop({
    type: String,
    default: null,
    index: true,
  })
  replacedById?: string | null;

  /**
   * Request metadata for auditing/security analytics
   */
  @Prop({ type: String, default: null })
  ip?: string | null;

  @Prop({ type: String, default: null })
  userAgent?: string | null;

  @Prop({ type: String, default: null })
  device?: string | null;

  // createdAt and updatedAt are added by timestamps: true
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * Schema instance and indexes
 */
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshTokenEntity);

// TTL index to automatically remove expired tokens
// Using expireAfterSeconds: 0 makes MongoDB expire at the time specified by the Date value
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helpful compound indexes
RefreshTokenSchema.index({ userId: 1, revokedAt: 1 });
RefreshTokenSchema.index({ sessionExpiresAt: 1 });

// Virtual id mapping to string
RefreshTokenSchema.virtual('id').get(function (this: RefreshTokenDocument) {
  return this._id?.toString();
});

// Ensure virtuals and hide sensitive fields in JSON
RefreshTokenSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.tokenHash; // never expose hash
    return ret;
  },
});

RefreshTokenSchema.set('toObject', { virtuals: true });
