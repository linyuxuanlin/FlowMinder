const mongoose = require('mongoose');

const FlowConfigSchema = new mongoose.Schema({
  configPath: {
    type: String,
    required: true,
    default: 'flow-config.json'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FlowConfig', FlowConfigSchema); 