
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Middleware
const loggerMiddleware = require('./src/middleware/logger');
const contentTypeMiddleware = require('./src/middleware/contentType');
const notFoundHandler = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

// Practical 10: Register event listeners
require('./src/events/listeners');

const app = express();

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// General Middleware
app.use(express.json());
app.use(loggerMiddleware);
app.use(contentTypeMiddleware);

// Serve static files (Interactive Dashboard)
app.use(express.static('public'));

// Routes
app.use('/auth', authRoutes);
app.use('/', authRoutes); // Direct support for /register, /login, /me
app.use('/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// 404 & Global Error Handler (must be LAST)
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to MongoDB and start server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const MONGO_URI =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb';

  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected successfully');

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Express Backend running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

// Export app for testing
module.exports = app;
