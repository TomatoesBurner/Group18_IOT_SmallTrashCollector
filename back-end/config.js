// System configuration file
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Configure dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Australia/Perth'); // Set default timezone to Perth, Australia

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3008,
    host: process.env.HOST || '0.0.0.0'
  },
  
  // API path prefix
  apiPrefix: '/api',
  
  // Trash bin related configuration
  trashBin: {
    // Trash bin types
    types: {
      DRY: 'dry',
      WET: 'wet'
    },
    // Trash bin weight thresholds (kg)
    weightThreshold: {
      dry: 10,  // Dry trash weight threshold
      wet: 15   // Wet trash weight threshold
    }
  },
  
  // Get current local time (Perth, Australia)
  getPerthTime: () => {
    return dayjs().tz('Australia/Perth').toDate();
  },
  
  // Format time as string
  formatTime: (date) => {
    return dayjs(date).tz('Australia/Perth').format('YYYY-MM-DD HH:mm:ss');
  }
}; 