/**
 * 智能垃圾桶模拟器
 * 用于测试MQTT通信功能
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
  binId: process.argv[2] || 'bin001',
  updateInterval: 5000, // 状态更新间隔（毫秒）
  fillRatePerHour: 5    // 每小时填充速率（百分比）
};

// 垃圾桶状态
const binState = {
  fillLevel: Math.floor(Math.random() * 30), // 初始填充度随机值 0-30%
  batteryLevel: 100,                        // 初始电池电量 100%
  isLidOpen: false,                         // 盖子是否打开
  errorCode: 0                              // 错误代码 (0=正常)
};

// 连接MQTT
const mqttOptions = {
  clientId: `trash-bin-sim-${config.binId}`,
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
  console.log(`已连接到MQTT Broker，垃圾桶ID: ${config.binId}`);
  
  // 发布初始状态
  publishStatus();
  
  // 订阅命令主题
  const commandTopic = `trash/${config.binId}/command`;
  client.subscribe(commandTopic, (err) => {
    if (!err) {
      console.log(`已订阅命令主题: ${commandTopic}`);
    } else {
      console.error('订阅命令主题失败:', err);
    }
  });
  
  // 定期更新状态
  setInterval(updateBinState, config.updateInterval);
});

// 处理命令消息
client.on('message', (topic, message) => {
  if (topic === `trash/${config.binId}/command`) {
    try {
      const command = JSON.parse(message.toString());
      console.log(`收到命令:`, command);
      
      // 处理各种命令
      switch (command.command) {
        case 'open':
          binState.isLidOpen = true;
          console.log('垃圾桶盖已打开');
          break;
          
        case 'close':
          binState.isLidOpen = false;
          console.log('垃圾桶盖已关闭');
          break;
          
        case 'reset':
          binState.errorCode = 0;
          console.log('系统已重置');
          break;
          
        case 'empty':
          binState.fillLevel = 0;
          console.log('垃圾桶已清空');
          break;
          
        default:
          console.log(`未知命令: ${command.command}`);
      }
      
      // 发布更新后的状态
      publishStatus();
      
    } catch (error) {
      console.error('处理命令时出错:', error);
    }
  }
});

// 错误处理
client.on('error', (err) => {
  console.error('MQTT连接错误:', err);
});

// 更新垃圾桶状态
function updateBinState() {
  // 缓慢增加填充度（模拟垃圾积累）
  const fillIncrement = config.fillRatePerHour * (config.updateInterval / 3600000);
  binState.fillLevel = Math.min(100, binState.fillLevel + fillIncrement);
  
  // 缓慢减少电池电量
  binState.batteryLevel = Math.max(0, binState.batteryLevel - 0.01);
  
  // 如果垃圾桶盖打开，随着时间自动关闭
  if (binState.isLidOpen) {
    binState.isLidOpen = Math.random() > 0.7; // 30%几率自动关闭
  }
  
  // 发布更新的状态
  publishStatus();
}

// 发布状态到MQTT
function publishStatus() {
  const statusTopic = `trash/${config.binId}/status`;
  const statusMessage = JSON.stringify({
    ...binState,
    timestamp: new Date().toISOString()
  });
  
  client.publish(statusTopic, statusMessage);
  console.log(`已发布状态更新 - 填充度: ${binState.fillLevel.toFixed(1)}%, 电池: ${binState.batteryLevel.toFixed(1)}%`);
}

// 处理程序退出
process.on('SIGINT', () => {
  console.log('关闭垃圾桶模拟器...');
  client.end();
  process.exit();
}); 