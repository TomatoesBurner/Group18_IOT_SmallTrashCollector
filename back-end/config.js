// 系统配置文件
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// 配置dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Australia/Perth'); // 设置默认时区为澳洲珀斯

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3008,
    host: process.env.HOST || '0.0.0.0'
  },
  
  // API路径前缀
  apiPrefix: '/api',
  
  // 垃圾桶相关配置
  trashBin: {
    // 垃圾桶类型
    types: {
      DRY: 'dry',
      WET: 'wet'
    },
    // 垃圾桶重量阈值（千克）
    weightThreshold: {
      dry: 10,  // 干垃圾重量阈值
      wet: 15   // 湿垃圾重量阈值
    }
  },
  
  // 获取当前本地时间（澳洲珀斯时间）
  getPerthTime: () => {
    return dayjs().tz('Australia/Perth').toDate();
  },
  
  // 格式化时间为字符串
  formatTime: (date) => {
    return dayjs(date).tz('Australia/Perth').format('YYYY-MM-DD HH:mm:ss');
  }
}; 