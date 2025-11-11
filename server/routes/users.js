const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(authenticate);

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
      console.error('Profile update error:', error);
      console.error('Update data received:', req.body);
      console.error('User ID:', req.userId);
      next(error);
    }
  }
);

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

router.put('/onboarding', async (req, res, next) => {
  try {
    const { completed, progress } = req.body;
    
    const updateData = {};
    if (completed !== undefined) {
      updateData.onboardingCompleted = completed;
    }
    if (progress !== undefined) {
      updateData.onboardingProgress = progress;
    }
    
    if (Object.keys(updateData).length === 0) {
      updateData.onboardingCompleted = true;
    }
    
    const user = await User.update(req.userId, updateData);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Onboarding progress saved successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/upload-avatar', async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }
    
    const user = await User.update(req.userId, { avatarUrl });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

