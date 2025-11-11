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
    
    // Create auth user
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

    // CRITICAL: Verify the auth user exists in auth.users table
    // This ensures the foreign key constraint will be satisfied
    // Try up to 3 times with delays in case of timing issues
    let verifiedAuthUser = null;
    let verifyError = null;
    const maxRetries = 3;
    const retryDelay = 500; // milliseconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const { data: { user: verifiedUser }, error: error } = await supabase.auth.admin.getUserById(authData.user.id);
      
      if (!error && verifiedUser) {
        verifiedAuthUser = verifiedUser;
        verifyError = null;
        break;
      } else {
        verifyError = error;
        if (attempt < maxRetries) {
          // Wait before retrying (in case Supabase is still creating the user)
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    if (verifyError || !verifiedAuthUser) {
      console.error('Auth user verification failed:', {
        authUserId: authData.user.id,
        email: email,
        error: verifyError?.message,
        attempts: maxRetries
      });
      
      // Clean up: try to delete the auth user if it was created
      if (authData.user.id) {
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Failed to delete auth user:', deleteError);
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'Authentication user not found. Please try again or check if email confirmation is required.'
      });
    }

    // Use the verified auth user ID (guaranteed to exist in auth.users)
    const verifiedAuthUserId = verifiedAuthUser.id;

    try {
      const user = await User.create({
        authUserId: verifiedAuthUserId, // Use verified ID
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

      console.log('User profile created successfully:', {
        userId: user.id,
        email: user.email,
        authUserId: verifiedAuthUserId
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
      console.error('Profile creation error:', {
        error: profileError.message,
        authUserId: verifiedAuthUserId,
        email: email
      });
      
      // Clean up: delete the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(verifiedAuthUserId);
      } catch (deleteError) {
        console.error('Failed to delete auth user after profile error:', deleteError);
      }
      throw profileError;
    }
  } catch (error) {
    console.error('Registration error:', {
      error: error.message,
      stack: error.stack
    });
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

    // CRITICAL: Verify the auth user exists in auth.users table
    // This ensures the foreign key constraint will be satisfied
    // Try up to 3 times with delays in case of timing issues
    let verifiedAuthUser = null;
    let verifyError = null;
    const maxRetries = 3;
    const retryDelay = 500; // milliseconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const { data: { user: verifiedUser }, error: error } = await supabase.auth.admin.getUserById(authUser.id);
      
      if (!error && verifiedUser) {
        verifiedAuthUser = verifiedUser;
        verifyError = null;
        break;
      } else {
        verifyError = error;
        if (attempt < maxRetries) {
          // Wait before retrying (in case Supabase is still creating the user)
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    if (verifyError || !verifiedAuthUser) {
      console.error('Auth user verification failed:', {
        authUserId: authUser.id,
        email: email,
        error: verifyError?.message,
        attempts: maxRetries
      });
      
      return res.status(400).json({
        success: false,
        message: 'Authentication user not found. The user may not be fully created yet. Please try signing in again.'
      });
    }

    // Use the verified auth user ID (guaranteed to exist in auth.users)
    const verifiedAuthUserId = verifiedAuthUser.id;

    // Check if profile already exists
    let user = await User.findByAuthUserId(verifiedAuthUserId);
    
    if (!user) {
      const fullName = authUser.user_metadata?.full_name || 
                       authUser.user_metadata?.name || 
                       verifiedAuthUser.user_metadata?.full_name ||
                       email.split('@')[0];
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || fullName;
      
      const phone = authUser.user_metadata?.phone || verifiedAuthUser.user_metadata?.phone || '';
      
      const oauthMetadata = {
        provider: 'google',
        avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || verifiedAuthUser.user_metadata?.avatar_url || null,
        email_verified: verifiedAuthUser.email_confirmed_at ? true : false,
        full_name: authUser.user_metadata?.full_name || verifiedAuthUser.user_metadata?.full_name || null,
        given_name: authUser.user_metadata?.given_name || verifiedAuthUser.user_metadata?.given_name || firstName,
        family_name: authUser.user_metadata?.family_name || verifiedAuthUser.user_metadata?.family_name || lastName,
        locale: authUser.user_metadata?.locale || verifiedAuthUser.user_metadata?.locale || null
      };
      
      try {
        // Use verified auth user ID to ensure foreign key constraint is satisfied
        user = await User.create({
          authUserId: verifiedAuthUserId, // Use verified ID that we know exists
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
        
        console.log('User profile created successfully:', {
          userId: user.id,
          email: user.email,
          authUserId: verifiedAuthUserId
        });
      } catch (createError) {
        console.error('Profile creation error:', {
          error: createError.message,
          authUserId: verifiedAuthUserId,
          email: email
        });
        
        // If creation fails, try to find existing user by email (might have been created by another process)
        user = await User.findByEmail(email);
        if (!user) {
          // Re-throw with more context
          throw new Error(`Failed to create user profile: ${createError.message}. Auth user exists but profile creation failed.`);
        } else {
          console.log('Found existing user profile by email:', user.id);
        }
      }
    } else {
      console.log('User profile already exists:', user.id);
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
    console.error('Google callback error:', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
});

module.exports = router;
