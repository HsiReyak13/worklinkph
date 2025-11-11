// Application constants to replace magic numbers

export const TIMEOUTS = {
  SPLASH_SCREEN: 2500,
  API_TIMEOUT: 1000,
  FORGOT_PASSWORD_SUCCESS_DELAY: 2000,
  MODAL_CLOSE_DELAY: 2000,
};

export const VALIDATION = {
  PHONE_MIN_LENGTH: 11,
  PHONE_PATTERN: /^09[0-9]{9}$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_RECOMMENDED_LENGTH: 8,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const PHONE_REGEX = /^09\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_STRENGTH = {
  WEAK: { threshold: 0, label: 'Weak', color: '#ef4444' },
  FAIR: { threshold: 6, label: 'Fair', color: '#f59e0b' },
  GOOD: { threshold: 8, label: 'Good', color: '#3b82f6' },
  STRONG: { threshold: 8, label: 'Strong', color: '#10b981' },
};

