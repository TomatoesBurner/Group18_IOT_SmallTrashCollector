/**
 * 垃圾桶重量模拟器
 * 用于测试MQTT通信和重量监测功能
 */
const mqtt = require('mqtt');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 模拟器配置
const config = {
  mqtt: {
    broker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  },
  updateInterval: 5000, // 状态更新间隔（毫秒）
  topics: {
    dryBinWeight: 'trash/dry/weight',
    wetBinWeight: 'trash/wet/weight'
  }
};

// 初始重量值
const weights = {
  dry: Math.random() * 5, // 0-5kg 初始值
  wet: Math.random() * 7  // 0-7kg 初始值
};

// 每小时增长率（每小时增加的千克数）
const growthRates = {
  dry: 0.5,  // 干垃圾每小时增加0.5kg
  wet: 0.8   // 湿垃圾每小时增加0.8kg
};

// 连接MQTT
const mqttOptions = {
  clientId: `trash-weight-simulator-${Math.random().toString(16).slice(2, 8)}`,
  clean: true
};

if (config.mqtt.username && config.mqtt.password) {
  mqttOptions.username = config.mqtt.username;
  mqttOptions.password = config.mqtt.password;
}

console.log(`正在连接到MQTT Broker: ${config.mqtt.broker}`);
const client = mqtt.connect(config.mqtt.broker, mqttOptions);

// 处理连接事件
client.on('connect', () => {
  console.log('已连接到MQTT broker');
  
  // 发布初始重量
  publishWeights();
  
  // 定期更新重量
  setInterval(updateWeights, config.updateInterval);
});

// 错误处理
client.on('error', (err) => {
  console.error('MQTT连接错误:', err);
});

// 更新垃圾桶重量
function updateWeights() {
  // 计算增量（基于时间间隔）
  const dryIncrement = growthRates.dry * (config.updateInterval / 3600000);
  const wetIncrement = growthRates.wet * (config.updateInterval / 3600000);
  
  // 随机变化因子（模拟真实情况下的波动）
  const dryFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2
  const wetFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2
  
  // 更新重量
  weights.dry += dryIncrement * dryFactor;
  weights.wet += wetIncrement * wetFactor;
  
  // 模拟垃圾清空（当重量超过一定阈值时）
  if (weights.dry > 15) {
    console.log('干垃圾桶已满，模拟清空操作');
    weights.dry = Math.random() * 0.5; // 清空后可能有少量剩余
  }
  
  if (weights.wet > 20) {
    console.log('湿垃圾桶已满，模拟清空操作');
    weights.wet = Math.random() * 0.8; // 清空后可能有少量剩余
  }
  
  // 发布更新的重量
  publishWeights();
}

// 发布重量到MQTT
function publishWeights() {
  // 发布干垃圾重量
  const dryMessage = JSON.stringify({
    weight: parseFloat(weights.dry.toFixed(2)),
    timestamp: new Date().toISOString()
  });
  client.publish(config.topics.dryBinWeight, dryMessage);
  
  // 发布湿垃圾重量
  const wetMessage = JSON.stringify({
    weight: parseFloat(weights.wet.toFixed(2)),
    timestamp: new Date().toISOString()
  });
  client.publish(config.topics.wetBinWeight, wetMessage);
  
  console.log(`已发布重量更新 - 干垃圾: ${weights.dry.toFixed(2)}kg, 湿垃圾: ${weights.wet.toFixed(2)}kg`);
}

// 处理程序退出
process.on('SIGINT', () => {
  console.log('关闭重量模拟器...');
  client.end();
  process.exit();
}); 