const express = require('express');
const router = express.Router();
const TrashRecord = require('../models/TrashRecord');
const config = require('../config');


// Save trash disposal record
router.post('/record', async (req, res) => {
  try {
    const { type, weight, currentWeight, binId, isFull } = req.body;
    
    if (!type || !['dry', 'wet'].includes(type)) {
      return res.status(400).json({ error: 'Invalid trash type, must be dry or wet' });
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
      message: isFull ? `${type} bin is full, needs emptying` : `Added ${weight}kg of ${type} trash`
    });
    
    await record.save();
    
    // Broadcast new record via WebSocket
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
      message: 'Trash record saved',
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
    console.error('Failed to save trash record:', error);
    res.status(500).json({ error: 'Server error, unable to save trash record' });
  }
});



router.post('/reset', async (req, res) => {
  try {
    const { type, binId } = req.body;
    
    if (!type || !['dry', 'wet'].includes(type)) {
      return res.status(400).json({ error: 'Invalid trash type, must be dry or wet' });
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
      message: `${type} bin has been emptied`
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
      message: `${type} bin has been reset`,
      timestamp: formattedDate
    });
    
  } catch (error) {
    console.error('Failed to reset trash bin:', error);
    res.status(500).json({ error: 'Server error, unable to reset trash bin' });
  }
});


// Query trash records
router.get('/records', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'startDate and endDate are required, format: YYYY-MM-DD'
      });
    }

    // Build query conditions
    const query = {
      timestamp: {
        $gte: `${startDate} 00:00:00`,
        $lte: `${endDate} 23:59:59`
      },
      operationType: 'add'  // Fixed to query only add trash records
    };

    // If type is specified, add to query conditions
    if (type && ['dry', 'wet'].includes(type)) {
      query.type = type;
    }

    // Query records
    const records = await TrashRecord.find(query)
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .lean(); // Use lean() to get plain JavaScript objects for better performance

    // Return result
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
    console.error('Failed to query trash records:', error);
    res.status(500).json({ 
      error: 'Server error, unable to query trash records',
      message: error.message 
    });
  }
});

module.exports = {
  router
}; 