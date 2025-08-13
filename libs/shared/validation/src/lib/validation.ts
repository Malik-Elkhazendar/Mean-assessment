/**
 * Validates email format using RFC 5322 compliant regex
 * Used for user registration, login, and profile updates across frontend and backend
 * @param email - The email string to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email.trim()) && email.length <= 254; // RFC limit
}

/**
 * Validates password strength according to security best practices
 * Used for user registration and password reset functionality
 * Requires: minimum 8 chars, uppercase, lowercase, number, and special character
 * @param password - The password string to validate
 * @returns true if password meets strength requirements, false otherwise
 */
export function isStrongPassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // Check minimum length
  if (password.length < 8) {
    return false;
  }

  // Check maximum length (prevent DoS attacks)
  if (password.length > 128) {
    return false;
  }

  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Must contain at least one number
  if (!/\d/.test(password)) {
    return false;
  }

  // Must contain at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return false;
  }

  return true;
}

/**
 * Validates MongoDB ObjectId format (24-character hexadecimal string)
 * Used for validating database document IDs in API endpoints and database operations
 * @param id - The ID string to validate
 * @returns true if ID is a valid ObjectId format, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // MongoDB ObjectId is exactly 24 characters of hexadecimal
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  
  return objectIdRegex.test(id);
}

/**
 * Validates that a string contains only letters and spaces
 * Used for validating names (first name, last name) in user profiles
 * @param name - The name string to validate
 * @param minLength - Minimum length required (default: 2)
 * @param maxLength - Maximum length allowed (default: 50)
 * @returns true if name format is valid, false otherwise
 */
export function isValidName(name: string, minLength = 2, maxLength = 50): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();
  
  // Check length constraints
  if (trimmedName.length < minLength || trimmedName.length > maxLength) {
    return false;
  }

  // Only letters, spaces, hyphens, and apostrophes (for names like O'Connor, Mary-Jane)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  
  return nameRegex.test(trimmedName);
}

/**
 * Validates that a number is within specified range
 * Used for validating product prices, quantities, and other numeric inputs
 * @param value - The number to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns true if number is within range, false otherwise
 */
export function isValidNumberRange(value: number, min: number, max: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  return value >= min && value <= max;
}

/**
 * Validates URL format for basic HTTP/HTTPS URLs
 * Used for validating image URLs, website links, and other URL inputs
 * @param url - The URL string to validate
 * @returns true if URL format is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    return false;
  }
}

// Export form validators
export * from './form-validators';
