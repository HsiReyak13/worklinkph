// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || 'Validation error';
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  // Handle Supabase/PostgreSQL errors
  if (err.message && err.message.includes('row-level security')) {
    statusCode = 403;
    message = 'Permission denied. Please check your authentication.';
    console.error('RLS Policy Error - This suggests RLS is blocking the operation');
  }

  if (err.message && err.message.includes('violates')) {
    statusCode = 400;
    message = err.message;
  }

  // In development, show more details
  const response = {
    success: false,
    message
  };

  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
    if (err.code) {
      response.code = err.code;
    }
  } else if (statusCode === 500) {
    // Don't expose internal errors in production
    response.message = 'Internal server error';
  }

  res.status(statusCode).json(response);
};

// 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFound
};

