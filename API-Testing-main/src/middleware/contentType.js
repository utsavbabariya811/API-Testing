/**
 * Content-Type Header Validation Middleware
 * Rejects POST and PUT requests if the 'Content-Type' header is missing or not 'application/json'.
 */
const contentTypeMiddleware = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request: Content-Type header must be application/json'
      });
    }
  }
  next();
};

module.exports = contentTypeMiddleware;
