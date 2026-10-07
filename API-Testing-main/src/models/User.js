const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition for Practical 7 Authentication
 * - name: String (Optional user display name)
 * - email: String (Unique, required, lowercase, trimmed, validated)
 * - password: String (Hashed with bcrypt before storage)
 * - timestamps: createdAt and updatedAt
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save Hook: Hash password using bcrypt before persisting to MongoDB
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Method to compare entered plain text password with hashed password
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Clean JSON output - never expose hashed password in API responses
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
