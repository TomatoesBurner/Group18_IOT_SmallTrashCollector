const express = require('express');
const router = express.Router();
const TrashRecord = require('../models/TrashRecord');
const config = require('../config');


// 保存垃圾投放记录
router.post('/record', async (req, res) => {
  try {
    const { type, weight, currentWeight, binId, isFull } = req.body;
    
    if (!type || !['dry', 'wet'].includes(type)) {
      return res.status(400).json({ error: '无效的垃圾类型，必须是 dry 或 wet' });
    }
    
    const formattedDate = config.formatTime(new Date());
    
    const record = new TrashRecord({
      type,
      operationType: 'add',
      weight,
      currentWeight: currentWeight, 
      binId: binId || 'unknown',
      timestamp: formattedDate,
      isFull: isFull,
      message: isFull ? `${type}垃圾桶已满，需要清空` : `添加${weight}kg${type}垃圾`
    });
    
    await record.save();
    
    // 通过WebSocket广播新记录
    req.app.get('io').emit('newTrashRecord', {
      id: record._id,
      type: record.type,
      operationType: record.operationType,
      weight: record.weight,
      currentWeight: record.currentWeight,
      binId: record.binId,
      isFull: record.isFull,
      message: record.message,
      timestamp: formattedDate
    });
    
    res.status(201).json({ 
      success: true, 
      message: '垃圾记录已保存',
      record: {
        id: record._id,
        type: record.type,
        operationType: record.operationType,
        weight: record.weight,
        currentWeight: record.currentWeight,
        isFull: record.isFull,
        message: record.message,
        timestamp: formattedDate
      }
    });
  } catch (error) {
    console.error('保存垃圾记录失败:', error);
    res.status(500).json({ error: '服务器错误，无法保存垃圾记录' });
  }
});



router.post('/reset', async (req, res) => {
  try {
    const { type, binId } = req.body;
    
    if (!type || !['dry', 'wet'].includes(type)) {
      return res.status(400).json({ error: '无效的垃圾类型，必须是 dry 或 wet' });
    }
    const formattedDate = config.formatTime(new Date());
    
    const resetRecord = new TrashRecord({
      type,
      operationType: 'reset',
      weight: 0,
      currentWeight: 0,
      binId: binId || 'unknown',
      timestamp: formattedDate,
      isFull: false,
      message: `${type}垃圾桶已被清空`
    });
    
    await resetRecord.save();

    req.app.get('io').emit('newTrashRecord', {
      id: resetRecord._id,
      type: resetRecord.type,
      operationType: resetRecord.operationType,
      weight: resetRecord.weight,
      currentWeight: resetRecord.currentWeight,
      binId: resetRecord.binId,
      isFull: resetRecord.isFull,
      message: resetRecord.message,
      timestamp: formattedDate
    });
    
    res.json({
      success: true,
      message: `${type}垃圾桶已重置`,
      timestamp: formattedDate
    });
    
  } catch (error) {
    console.error('重置垃圾桶失败:', error);
    res.status(500).json({ error: '服务器错误，无法重置垃圾桶' });
  }
});


// 查询垃圾记录
router.get('/records', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // 验证必填参数
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: '缺少必要参数',
        message: 'startDate和endDate是必填参数，格式为YYYY-MM-DD'
      });
    }

    // 构建查询条件
    const query = {
      timestamp: {
        $gte: `${startDate} 00:00:00`,
        $lte: `${endDate} 23:59:59`
      },
      operationType: 'add'  // 固定只查询添加垃圾的记录
    };

    // 如果指定了类型，添加到查询条件
    if (type && ['dry', 'wet'].includes(type)) {
      query.type = type;
    }

    // 查询记录
    const records = await TrashRecord.find(query)
      .sort({ timestamp: -1 }) // 按时间倒序排列
      .lean(); // 使用lean()获取普通JavaScript对象，提高性能

    // 返回结果
    res.json({
      success: true,
      data: records,
      total: records.length,
      query: {
        startDate,
        endDate,
        type: type || 'all'
      }
    });

  } catch (error) {
    console.error('查询垃圾记录失败:', error);
    res.status(500).json({ 
      error: '服务器错误，无法查询垃圾记录',
      message: error.message 
    });
  }
});

module.exports = {
  router
}; 