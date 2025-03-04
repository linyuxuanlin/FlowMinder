const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 导入路由
const flowRoutes = require('./routes/flow');
const nodeRoutes = require('./routes/node');
const connectionRoutes = require('./routes/connection');

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 数据目录
const DATA_DIR = path.join(__dirname, '../../data');
fs.ensureDirSync(DATA_DIR);

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/flowminder')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

// 路由
app.use('/api/flow', flowRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/connections', connectionRoutes);

// WebSocket连接
io.on('connection', (socket) => {
  console.log('新的WebSocket连接:', socket.id);

  // 文件变更通知
  socket.on('file:change', (data) => {
    console.log('文件变更:', data);
    socket.broadcast.emit('file:change', data);
  });

  // 配置变更通知
  socket.on('config:change', (data) => {
    console.log('配置变更:', data);
    socket.broadcast.emit('config:change', data);
  });

  socket.on('disconnect', () => {
    console.log('WebSocket断开连接:', socket.id);
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 