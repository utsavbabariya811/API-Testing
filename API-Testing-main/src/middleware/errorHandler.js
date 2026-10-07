/**
 * Global Centralized Error Handling Middleware
 * Must be defined AFTER all routes and other middleware in the app chain.
 * Formats Mongoose ValidationErrors and CastErrors into clean, structured JSON.
 */
const errorHandler = (err, req, res, next) => {
  // Log stack trace for internal debugging
  console.error('[Global Error Handler Caught Exception]:', err.message);

  // Handle Mongoose Schema Validation Errors
  if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errorMessages
    });
  }

  // Handle Mongoose Cast Errors (invalid ObjectIDs or types)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid Data Format',
      message: `Invalid format for field '${err.path}'`
    });
  }

  // Return clean 500 JSON response for all other unhandled errors
  res.status(500).json({
    success: false,
    error: 'Something went wrong',
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
