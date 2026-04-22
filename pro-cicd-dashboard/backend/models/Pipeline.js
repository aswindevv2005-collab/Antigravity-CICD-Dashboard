const mongoose = require('mongoose');

const pipelineSchema = new mongoose.Schema({
  repoUrl: { type: String, required: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  status: { type: String, enum: ['queued', 'running', 'success', 'failed'], default: 'queued' },
  githubRunId: { type: String },
  logs: [{ type: String }],
  stages: {
    build: { type: String, enum: ['idle', 'running', 'success', 'error'], default: 'idle' },
    test: { type: String, enum: ['idle', 'running', 'success', 'error'], default: 'idle' },
    deploy: { type: String, enum: ['idle', 'running', 'success', 'error'], default: 'idle' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pipeline', pipelineSchema);
