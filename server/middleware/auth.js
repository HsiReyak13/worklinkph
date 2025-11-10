const { supabase } = require('../config/database');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }

    const user = await User.findByAuthUserId(authUser.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User profile not found. Please complete your profile.'
      });
    }

    req.user = user;
    req.userId = user.id;
    req.authUser = authUser;
    req.authUserId = authUser.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.'
    });
  }
};

module.exports = {
  authenticate
};
