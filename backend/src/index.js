const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// 导入路由
const taskRoutes = require('./routes/tasks');
const flowRoutes = require('./routes/flows');
const fileRoutes = require('./routes/files');

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
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置工作区路径
const workspacePath = process.env.WORKSPACE_PATH || path.join(__dirname, '../../workspace');

// 确保工作区目录存在
fs.ensureDirSync(workspacePath);
fs.ensureDirSync(path.join(workspacePath, 'flows/main'));
fs.ensureDirSync(path.join(workspacePath, 'flows/branches'));
fs.ensureDirSync(path.join(workspacePath, 'config'));

// 将工作区路径添加到请求对象中
app.use((req, res, next) => {
  req.workspacePath = workspacePath;
  next();
});

// 路由
app.use('/api/tasks', taskRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/files', fileRoutes);

// 基本路由
app.get('/', (req, res) => {
  res.json({ message: 'FlowMinder API 服务运行中' });
});

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id);

  // 监听任务更新事件
  socket.on('task:update', (data) => {
    // 广播给所有客户端
    io.emit('task:updated', data);
  });

  // 监听流程更新事件
  socket.on('flow:update', (data) => {
    io.emit('flow:updated', data);
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('客户端已断开连接:', socket.id);
  });
});

// 将io对象添加到app中，以便在路由中使用
app.set('io', io);

// 连接MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowminder';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB连接成功');
    
    // 启动服务器
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB连接失败:', err.message);
  });

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误', error: err.message });
});

module.exports = { app, server, io }; 