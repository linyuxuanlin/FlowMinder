const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['main', 'branch'],
    default: 'main'
  },
  parent: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'blocked'],
    default: 'not-started'
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  content: {
    type: String,
    default: ''
  },
  metadata: {
    priority: {
      type: String,
      enum: ['低', '中', '高'],
      default: '中'
    },
    dueDate: {
      type: Date,
      default: null
    },
    assignee: {
      type: String,
      default: ''
    },
    subtasks: [{
      description: String,
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
TaskSchema.index({ id: 1 });
TaskSchema.index({ type: 1 });
TaskSchema.index({ parent: 1 });
TaskSchema.index({ status: 1 });

module.exports = mongoose.model('Task', TaskSchema); 