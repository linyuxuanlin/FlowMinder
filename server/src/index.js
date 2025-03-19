const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');

// 路由引入
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const fileRoutes = require('./routes/files');

// 配置环境变量
dotenv.config();

const app = express();
const server = http.createServer(app);

// 创建Socket.io实例
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 路由
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);

// 确保项目目录存在
const projectsDir = process.env.PROJECTS_DIR || path.join(__dirname, '../../projects');
fs.ensureDirSync(projectsDir);

// 数据库连接
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/flowminder', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io连接处理
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // 文件变更监听
  socket.on('file:change', (data) => {
    socket.broadcast.emit('file:change', data);
  });
  
  // 任务状态变更
  socket.on('task:statusChange', (data) => {
    socket.broadcast.emit('task:statusChange', data);
  });
  
  // 任务流更新
  socket.on('flow:update', (data) => {
    socket.broadcast.emit('flow:update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 端口配置
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 