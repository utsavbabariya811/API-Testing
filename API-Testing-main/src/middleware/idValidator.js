const mongoose = require('mongoose');

/**
 * Route-Specific Task ID Validation Middleware
 * Validates that the ':id' parameter is a valid 24-character hexadecimal MongoDB ObjectId.
 */
const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Task ID format. ID must be a valid 24-character hex MongoDB ObjectId.'
    });
  }

  next();
};

module.exports = validateTaskId;
