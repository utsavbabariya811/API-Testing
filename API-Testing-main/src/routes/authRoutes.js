const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * Helper to generate signed JWT Token
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'adwf_jwt_secret_key_practical_7_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(
    { id: user._id, email: user.email },
    secret,
    { expiresIn }
  );
};

/**
 * @route   POST /auth/register (or /register)
 * @desc    Register a new user, hash password, and issue JWT
 * @status  201 Created, 400 Bad Request
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [
          ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
          ...(!password ? [{ field: 'password', message: 'Password is required' }] : [])
        ]
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'password', message: 'Password must be at least 6 characters long' }]
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email address'
      });
    }

    // Create user (password is automatically hashed via Mongoose pre-save hook)
    const newUser = new User({
      name: name ? name.trim() : '',
      email: email.toLowerCase().trim(),
      password
    });

    const savedUser = await newUser.save();
    const token = generateToken(savedUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: savedUser
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /auth/login (or /login)
 * @desc    Authenticate user credentials, compare hash, and return JWT
 * @status  200 OK, 400 Bad Request, 401 Unauthorized
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password'
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Compare plain password with stored bcrypt hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /auth/me (or /me)
 * @desc    Get currently logged in user profile using decoded JWT
 * @status  200 OK, 401 Unauthorized
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
