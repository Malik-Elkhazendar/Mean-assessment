/**
 * Core user entity representing application users
 * Used for authentication, user management, and profile operations
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * Product entity for catalog and inventory management
 * Represents items that can be viewed, managed, or processed by logged-in users
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  quantity: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID who created the product
}

/**
 * Authentication response for login and token refresh operations
 * Contains user data and JWT token for maintaining authenticated sessions
 */
export interface AuthResponse {
  user: Omit<User, 'updatedAt'>;
  accessToken: string;
  expiresIn: string; // e.g., "8h"
  tokenType: 'Bearer';
}
