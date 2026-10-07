const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware for Practical 7
 * Verifies JWT token sent in the HTTP 'Authorization: Bearer <token>' header.
 * Attaches decoded payload (id, email) to req.user.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied: No authorization token provided in Authorization header (Format: Bearer <token>)'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied: Token string is empty'
      });
    }

    const secret = process.env.JWT_SECRET || 'adwf_jwt_secret_key_practical_7_2026';
    const decoded = jwt.verify(token, secret);

    // Attach decoded user info to request object
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Access token expired. Please login again to refresh your session.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or malformed token'
    });
  }
};

module.exports = authMiddleware;
