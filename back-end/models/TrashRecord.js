const mongoose = require('mongoose');
const config = require('../config');

// 定义垃圾记录模式
const trashRecordSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['dry', 'wet'],
    required: true,
    description: '垃圾桶类型'
  },
  operationType: {
    type: String,
    enum: ['add', 'reset', 'full'],
    required: true,
    default: 'add',
    description: '操作类型: add=添加垃圾, reset=清空, full=已满'
  },
  weight: {
    type: Number,
    required: true,
    description: '本次操作的重量'
  },
  currentWeight: {
    type: Number,
    default: 0,
    description: '当前垃圾桶的总重量'
  },
  isFull: {
    type: Boolean,
    default: false,
    description: '垃圾桶是否已满'
  },
  timestamp: {
    type: String,
    default: () => config.formatTime(new Date()),
    description: '记录创建时间（澳洲珀斯时间字符串）'
  },
  binId: {
    type: String,
    default: 'unknown',
    description: '垃圾桶ID'
  },
  message: {
    type: String,
    description: '操作描述信息'
  }
});

// 创建索引
trashRecordSchema.index({ timestamp: -1 });
trashRecordSchema.index({ type: 1 });
trashRecordSchema.index({ operationType: 1 });
trashRecordSchema.index({ isFull: 1 });

// 创建模型
const TrashRecord = mongoose.model('TrashRecord', trashRecordSchema);

module.exports = TrashRecord; 