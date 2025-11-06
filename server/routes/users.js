const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res, next) => {
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

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().matches(/^09\d{9}$/),
    body('firstName').optional().trim().isLength({ min: 2 }),
    body('lastName').optional().trim().isLength({ min: 2 })
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const updateData = { ...req.body };
      
      // Convert camelCase to snake_case for database
      const transformedData = {};
      for (const [key, value] of Object.entries(updateData)) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        transformedData[dbKey] = value;
      }

      const user = await User.update(req.userId, transformedData);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/users/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', async (req, res, next) => {
  try {
    await User.delete(req.userId);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/onboarding
// @desc    Mark onboarding as complete
// @access  Private
router.put('/onboarding', async (req, res, next) => {
  try {
    const user = await User.update(req.userId, { onboardingCompleted: true });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

