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

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(loggerMiddleware);
app.use(contentTypeMiddleware);

// Serve static files (Interactive Dashboard)
app.use(express.static('public'));

// ── Connect to MongoDB ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB connected successfully to ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/', authRoutes); // Direct support for /register, /login, /me
app.use('/tasks', taskRoutes);

// ── 404 & Global Error Handler (must be LAST) ────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start server (Only when executed directly, not when required in tests) ──
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Express Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;