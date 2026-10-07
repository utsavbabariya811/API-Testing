const mongoose = require('mongoose');

/**
 * Task Schema Definition
 * - title: Required string with automatic whitespace trimming via pre-save hook
 * - description: String
 * - status: Enum restricted to ['pending', 'in-progress', 'completed'] with default 'pending'
 * - completed: Boolean status synchronized with status field
 * - priority: Enum restricted to ['low', 'medium', 'high'] with default 'medium'
 * - dueDate: Optional Date
 * - timestamps: createdAt and updatedAt
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: '{VALUE} is not a valid status. Allowed values are: pending, in-progress, completed'
      },
      default: 'pending'
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority. Allowed values are: low, medium, high'
      },
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save hook: Sync status and completed fields, trim title.
 */
taskSchema.pre('save', function () {
  if (this.title && typeof this.title === 'string') {
    this.title = this.title.trim();
  }

  // Synchronize status and completed properties
  if (this.isModified('status')) {
    this.completed = (this.status === 'completed');
  } else if (this.isModified('completed')) {
    this.status = this.completed ? 'completed' : 'pending';
  }
});

// ── High-Performance MongoDB Database Indexes ─────────────────────────────────
taskSchema.index({ createdAt: -1 });
taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ priority: 1, createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);

