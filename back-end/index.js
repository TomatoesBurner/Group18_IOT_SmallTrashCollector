// 设置应用程序时区为澳洲珀斯
process.env.TZ = 'Australia/Perth';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const config = require('./config');
const connectDB = require('./models/db');
const { router: trashBinsRouter } = require('./routes/trashBins');
const TrashRecord = require('./models/TrashRecord');

// 加载环境变量
dotenv.config();

// 连接到MongoDB
connectDB();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || config.server.port;

// 创建HTTP服务器
const server = http.createServer(app);

// 创建Socket.IO实例
const io = socketIo(server, {
  cors: {
    origin: '*', // 允许所有来源访问，生产环境应限制为特定域名
    methods: ['GET', 'POST']
  }
});

// 注入io对象到app，方便在路由中使用
app.set('io', io);

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// WebSocket连接
io.on('connection', (socket) => {
  console.log('前端已连接，Socket ID:', socket.id);
  
  // 立即发送当前重量数据
  (async () => {
    try {
      const [latestDry, latestWet, resetRecords] = await Promise.all([
        TrashRecord.findOne({ type: 'dry' }).sort({ timestamp: -1 }),
        TrashRecord.findOne({ type: 'wet' }).sort({ timestamp: -1 }),
        TrashRecord.find({ operationType: 'reset' })
          .sort({ timestamp: -1 }) 
          .lean()
      ]);

      socket.emit('initialWeight', {
        dry: {
          currentWeight: latestDry?.currentWeight || 0,
          timestamp: latestDry?.timestamp || null,
          isFull: latestDry?.isFull || false,
        },
        wet: {
          currentWeight: latestWet?.currentWeight || 0,
          timestamp: latestWet?.timestamp || null,
          isFull: latestWet?.isFull || false,
        },
        resetHistory: resetRecords.map(record => ({
          type: record.type,
          timestamp: record.timestamp
        }))
      });
    } catch (error) {
      console.error('发送初始重量数据失败:', error);
    }
  })();
  
  // 当客户端断开连接时
  socket.on('disconnect', () => {
    console.log('前端已断开连接，Socket ID:', socket.id);
  });
});

// 注册路由
app.use(`${config.apiPrefix}/smart-bins`, trashBinsRouter);

// 处理404错误
app.use((req, res) => {
  res.status(404).json({ error: '未找到请求的资源' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动HTTP服务器
server.listen(PORT, config.server.host, () => {
  console.log(`服务器运行在 http://${config.server.host}:${PORT}`);
  console.log(`API路径前缀: ${config.apiPrefix}`);
  console.log('WebSocket服务已启动');
});

// 处理应用程序关闭
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  io.close();
  console.log('WebSocket服务已关闭');
  process.exit();
}); 