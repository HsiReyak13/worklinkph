// Logging utility - safe logging that doesn't expose sensitive data in production

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Safe logger that only logs in development
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Log message
 * @param {any} data - Optional data (will be sanitized)
 */
export const logger = {
  info: (message, data = null) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data ? sanitizeLogData(data) : '');
    }
  },
  
  warn: (message, data = null) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data ? sanitizeLogData(data) : '');
    }
  },
  
  error: (message, error = null) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    }
    // In production, send to error tracking service
    // Example: Sentry.captureException(error);
  },
};

/**
 * Sanitizes log data to remove sensitive information
 * @param {any} data - Data to sanitize
 * @returns {any} - Sanitized data
 */
const sanitizeLogData = (data) => {
  if (!data) return data;
  
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'auth', 'credentials'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

