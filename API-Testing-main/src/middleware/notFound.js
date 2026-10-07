/**
 * 404 Undefined Route Handler Middleware
 * Intercepts any request that does not match an existing endpoint and returns structured JSON.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Resource or route not found`
  });
};

module.exports = notFoundHandler;
