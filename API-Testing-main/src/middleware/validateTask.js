/**
 * Server-Side Task Input Validation Middleware for Practical 7
 * Validates and sanitizes incoming request body before hitting route controllers.
 */
const validateTask = (req, res, next) => {
  const errors = [];
  const { title, priority, status } = req.body;

  // Validate Title for POST and PUT requests
  if (req.method === 'POST' || (req.method === 'PUT' && title !== undefined)) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push({
        field: 'title',
        message: 'Task title is required and cannot be blank'
      });
    }
  }

  // Validate Priority Enum if provided
  if (priority !== undefined) {
    const allowedPriorities = ['low', 'medium', 'high'];
    if (!allowedPriorities.includes(priority)) {
      errors.push({
        field: 'priority',
        message: `'${priority}' is not a valid priority. Allowed values are: ${allowedPriorities.join(', ')}`
      });
    }
  }

  // Validate Status Enum if provided
  if (status !== undefined) {
    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    if (!allowedStatuses.includes(status)) {
      errors.push({
        field: 'status',
        message: `'${status}' is not a valid status. Allowed values are: ${allowedStatuses.join(', ')}`
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  next();
};

module.exports = validateTask;
