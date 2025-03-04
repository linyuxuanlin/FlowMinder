const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const io = require('socket.io-client');
require('dotenv').config();

// 配置
const WORKSPACE_PATH = process.env.WORKSPACE_PATH || path.join(__dirname, '../../workspace');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.SOCKET_URL || BACKEND_URL;

// 连接WebSocket
const socket = io(SOCKET_URL);

// 初始化
async function init() {
  console.log('文件同步服务启动中...');
  
  // 确保工作区目录存在
  await fs.ensureDir(WORKSPACE_PATH);
  await fs.ensureDir(path.join(WORKSPACE_PATH, 'flows/main'));
  await fs.ensureDir(path.join(WORKSPACE_PATH, 'flows/branches'));
  await fs.ensureDir(path.join(WORKSPACE_PATH, 'config'));
  
  console.log(`监控工作区: ${WORKSPACE_PATH}`);
  
  // 监控Markdown文件变化
  const mdWatcher = chokidar.watch(path.join(WORKSPACE_PATH, 'flows/**/*.md'), {
    persistent: true,
    ignoreInitial: true
  });
  
  // 监控配置文件变化
  const configWatcher = chokidar.watch(path.join(WORKSPACE_PATH, 'config/flow.json'), {
    persistent: true,
    ignoreInitial: true
  });
  
  // 处理Markdown文件变化
  mdWatcher.on('change', async (filePath) => {
    try {
      console.log(`检测到Markdown文件变化: ${filePath}`);
      
      // 获取相对路径
      const relativePath = path.relative(WORKSPACE_PATH, filePath);
      
      // 获取任务ID
      const taskId = relativePath.replace(/^flows\//, '').replace(/\.md$/, '');
      
      // 读取文件内容
      const content = await fs.readFile(filePath, 'utf8');
      
      // 发送到后端API
      await axios.post(`${BACKEND_URL}/api/tasks/${taskId}/sync-from-file`, {
        content
      });
      
      console.log(`已同步任务: ${taskId}`);
    } catch (error) {
      console.error('同步Markdown文件失败:', error.message);
    }
  });
  
  // 处理配置文件变化
  configWatcher.on('change', async (filePath) => {
    try {
      console.log(`检测到配置文件变化: ${filePath}`);
      
      // 发送到后端API
      await axios.post(`${BACKEND_URL}/api/flows/sync-from-config`);
      
      console.log('已同步流程配置');
    } catch (error) {
      console.error('同步配置文件失败:', error.message);
    }
  });
  
  // 监听WebSocket事件
  socket.on('connect', () => {
    console.log('已连接到WebSocket服务器');
  });
  
  socket.on('disconnect', () => {
    console.log('与WebSocket服务器断开连接');
  });
  
  // 监听任务更新事件
  socket.on('task:updated', async (data) => {
    try {
      if (!data.id) return;
      
      console.log(`收到任务更新事件: ${data.id}`);
      
      // 获取任务详情
      const response = await axios.get(`${BACKEND_URL}/api/tasks/${data.id}`);
      const task = response.data;
      
      // 更新Markdown文件
      const filePath = path.join(WORKSPACE_PATH, 'flows', task.id + '.md');
      
      // 确保目录存在
      await fs.ensureDir(path.dirname(filePath));
      
      // 写入文件
      if (task.content) {
        await fs.writeFile(filePath, task.content);
        console.log(`已更新Markdown文件: ${filePath}`);
      }
    } catch (error) {
      console.error('处理任务更新事件失败:', error.message);
    }
  });
  
  // 监听流程更新事件
  socket.on('flow:updated', async (data) => {
    try {
      console.log('收到流程更新事件');
      
      // 获取流程详情
      const response = await axios.get(`${BACKEND_URL}/api/flows`);
      const flow = response.data;
      
      // 更新配置文件
      const configPath = path.join(WORKSPACE_PATH, 'config', 'flow.json');
      
      // 获取任务详情
      const tasksResponse = await axios.get(`${BACKEND_URL}/api/tasks`);
      const tasks = tasksResponse.data;
      
      // 构建配置数据
      const configData = {
        nodes: tasks.map(task => ({
          id: task.id,
          type: task.type,
          title: task.title,
          parent: task.parent,
          status: task.status,
          position: task.position
        })),
        edges: flow.edges
      };
      
      // 写入配置文件
      await fs.writeJson(configPath, configData, { spaces: 2 });
      console.log('已更新流程配置文件');
    } catch (error) {
      console.error('处理流程更新事件失败:', error.message);
    }
  });
  
  console.log('文件同步服务已启动');
}

// 启动服务
init().catch(error => {
  console.error('启动文件同步服务失败:', error);
  process.exit(1);
}); 