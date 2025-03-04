const mongoose = require('mongoose');

const EdgeSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['main', 'branch'],
    default: 'main'
  }
});

const FlowSchema = new mongoose.Schema({
  nodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  edges: [EdgeSchema],
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flow', FlowSchema);