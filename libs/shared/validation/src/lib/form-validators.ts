import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Centralized form validators for consistent validation across the application
 */
export class FormValidators {
  
  /**
   * Password strength validator
   * Requires uppercase, lowercase, number, and special character
   */
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[#?!@$%^&*-]/.test(value);

      const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      
      if (!isValid) {
        return { 
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSpecialChar
          }
        };
      }

      return null;
    };
  }

  /**
   * Password confirmation validator
   * Checks if password and confirm password fields match
   */
  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordField)?.value;
      const confirmPassword = group.get(confirmPasswordField)?.value;
      
      if (!password || !confirmPassword) return null;
      
      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }
      
      return null;
    };
  }

  /**
   * Email validation with improved regex
   */
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(value);

      return isValid ? null : { email: true };
    };
  }

  /**
   * Price validation for products
   * Must be a positive number with at most 2 decimal places
   */
  static price(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;

      const numValue = Number(value);
      
      // Check if it's a valid number
      if (isNaN(numValue)) {
        return { invalidPrice: true };
      }

      // Check if positive
      if (numValue <= 0) {
        return { minPrice: true };
      }

      // Check decimal places
      if (!Number.isInteger(numValue * 100)) {
        return { maxDecimalPlaces: true };
      }

      return null;
    };
  }

  /**
   * URL validation for image URLs
   */
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      try {
        new URL(value);
        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }
}

/**
 * Common validation error messages
 */
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
  passwordStrength: 'Password must contain uppercase, lowercase, number, and special character',
  passwordMismatch: 'Passwords do not match',
  invalidPrice: 'Please enter a valid price',
  minPrice: 'Price must be greater than 0',
  maxDecimalPlaces: 'Price can have at most 2 decimal places',
  invalidUrl: 'Please enter a valid URL',
} as const;