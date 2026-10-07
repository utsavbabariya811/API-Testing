/**
 * Custom Request Logging Middleware
 * Logs HTTP Method, Request URL, and ISO Timestamp for every incoming request.
 */
const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
  next();
};

module.exports = loggerMiddleware;
