const mongoose = require('mongoose');
const config = require('../config');

// Define trash record schema
const trashRecordSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['dry', 'wet'],
    required: true,
    description: 'Trash bin type'
  },
  operationType: {
    type: String,
    enum: ['add', 'reset', 'full'],
    required: true,
    default: 'add',
    description: 'Operation type: add=add trash, reset=empty, full=full'
  },
  weight: {
    type: Number,
    required: true,
    description: 'Weight of this operation'
  },
  currentWeight: {
    type: Number,
    default: 0,
    description: 'Total weight of the trash bin'
  },
  isFull: {
    type: Boolean,
    default: false,
    description: 'Whether the trash bin is full'
  },
  timestamp: {
    type: String,
    default: () => config.formatTime(new Date()),
    description: 'Record creation time (Perth, Australia time string)'
  },
  binId: {
    type: String,
    default: 'unknown',
    description: 'Trash bin ID'
  },
  message: {
    type: String,
    description: 'Operation description message'
  }
});

// Create indexes
trashRecordSchema.index({ timestamp: -1 });
trashRecordSchema.index({ type: 1 });
trashRecordSchema.index({ operationType: 1 });
trashRecordSchema.index({ isFull: 1 });

// Create model
const TrashRecord = mongoose.model('TrashRecord', trashRecordSchema);

module.exports = TrashRecord; 