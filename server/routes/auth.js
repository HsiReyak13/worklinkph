const express = require('express');
const { body } = require('express-validator');
const { supabase } = require('../config/database');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

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

router.post('/register', registerValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, city, province, identity, skills, jobPreferences, accessibility, notifications } = req.body;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please login.'
        });
      }
      return res.status(400).json({
        success: false,
        message: authError.message || 'Failed to create account'
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create account'
      });
    }

    try {
      const user = await User.create({
        authUserId: authData.user.id,
        firstName,
        lastName,
        email,
        phone,
        city,
        province,
        identity,
        skills,
        jobPreferences: jobPreferences || {},
        accessibility: accessibility || {},
        notifications: notifications || { email: true, sms: false, inApp: true }
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user,
          session: authData.session
        }
      });
    } catch (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    const isEmail = emailOrPhone.includes('@');
    let email = emailOrPhone;

    if (!isEmail) {
      const user = await User.findByEmailOrPhone(emailOrPhone);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/phone or password'
        });
      }
      email = user.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }

    const user = await User.findByAuthUserId(authData.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User profile not found. Please contact support.'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        session: authData.session
      }
    });
  } catch (error) {
    next(error);
  }
});

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

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
      });

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/reset-password',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { password } = req.body;
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Reset token is required'
        });
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || 'Failed to reset password'
        });
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/google/callback', async (req, res, next) => {
  try {
    const { session } = req.body;
    
    if (!session || !session.user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const authUser = session.user;
    const email = authUser.email;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for Google authentication'
      });
    }

    let user = await User.findByAuthUserId(authUser.id);
    
    if (!user) {
      const fullName = authUser.user_metadata?.full_name || 
                       authUser.user_metadata?.name || 
                       email.split('@')[0];
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || fullName;
      
      const phone = authUser.user_metadata?.phone || '';
      
      const oauthMetadata = {
        provider: 'google',
        avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
        email_verified: authUser.email_confirmed_at ? true : false,
        full_name: authUser.user_metadata?.full_name || null,
        given_name: authUser.user_metadata?.given_name || firstName,
        family_name: authUser.user_metadata?.family_name || lastName,
        locale: authUser.user_metadata?.locale || null
      };
      
      try {
        user = await User.create({
          authUserId: authUser.id,
          authProvider: 'google',
          firstName,
          lastName,
          email,
          phone: phone || null,
          city: null,
          province: null,
          identity: null,
          skills: null,
          jobPreferences: {},
          accessibility: {},
          notifications: { email: true, sms: false, inApp: true },
          oauthMetadata: oauthMetadata
        });
      } catch (createError) {
        user = await User.findByEmail(email);
        if (!user) {
          throw createError;
        }
      }
    }

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user,
        session
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
