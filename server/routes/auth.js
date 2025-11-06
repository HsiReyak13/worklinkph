const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .matches(/^09\d{9}$/)
    .withMessage('Please provide a valid phone number (09XXXXXXXXX)'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const loginValidation = [
  body('emailOrPhone')
    .trim()
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, city, province, identity, skills, jobPreferences, accessibility, notifications } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.'
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      city,
      province,
      identity,
      skills,
      jobPreferences: jobPreferences || {},
      accessibility: accessibility || {},
      notifications: notifications || { email: true, sms: false, inApp: true }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Find user by email or phone
    const user = await User.findByEmailOrPhone(emailOrPhone);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists (security best practice)
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        });
      }

      // In production, send email with reset token
      // For now, just return success
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

