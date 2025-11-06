// Validation utility functions

import { EMAIL_REGEX, PHONE_REGEX, VALIDATION } from './constants';

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates Philippines phone number format (09XXXXXXXXX)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone is valid
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/\D/g, '');
  return PHONE_REGEX.test(cleanPhone) && cleanPhone.length === VALIDATION.PHONE_MIN_LENGTH;
};

/**
 * Validates email or phone number
 * @param {string} input - Email or phone to validate
 * @returns {boolean} - True if input is valid email or phone
 */
export const isValidEmailOrPhone = (input) => {
  if (!input || typeof input !== 'string') return false;
  return isValidEmail(input) || isValidPhone(input);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - Strength object with strength, label, and color
 */
export const getPasswordStrength = (password) => {
  if (!password || password.length === 0) {
    return { strength: 0, label: '', color: '' };
  }
  
  const length = password.length;
  
  if (length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { strength: 1, label: 'Weak', color: '#ef4444' };
  }
  
  if (length < VALIDATION.PASSWORD_RECOMMENDED_LENGTH) {
    return { strength: 2, label: 'Fair', color: '#f59e0b' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const requirementsMet = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  if (length >= VALIDATION.PASSWORD_RECOMMENDED_LENGTH && requirementsMet >= 3) {
    return { strength: 4, label: 'Strong', color: '#10b981' };
  }
  
  return { strength: 3, label: 'Good', color: '#3b82f6' };
};

/**
 * Validates that passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} - True if passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) return false;
  return password === confirmPassword;
};

/**
 * Validates full name (basic validation)
 * @param {string} name - Full name to validate
 * @returns {boolean} - True if name is valid
 */
export const isValidFullName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.split(' ').length >= 2;
};

