// Input sanitization utilities to prevent XSS attacks

/**
 * Sanitizes a string by escaping HTML characters
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitizes user input for form fields
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  if (typeof input !== 'string') return String(input);
  
  // Remove potential script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
};

/**
 * Sanitizes phone number input (keeps only digits)
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone (digits only)
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '').slice(0, 11);
};

/**
 * Sanitizes text content to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return sanitizeInput(text).replace(/\s+/g, ' ').trim();
};

