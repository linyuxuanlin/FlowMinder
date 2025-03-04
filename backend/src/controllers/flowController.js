const Flow = require('../models/Flow');
const Task = require('../models/Task');
const fs = require('fs-extra');
const path = require('path');

// 获取流程
exports.getFlow = async (req, res) => {
  try {
    // 查找流程，如果不存在则创建一个新的
    let flow = await Flow.findOne().populate('nodes');
    
    if (!flow) {
      flow = new Flow({
        nodes: [],
        edges: []
      });
      await flow.save();
    }
    
    res.status(200).json(flow);
  } catch (error) {
    res.status(500).json({ message: '获取流程失败', error: error.message });
  }
};

// 更新流程
exports.updateFlow = async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    
    // 查找流程，如果不存在则创建一个新的
    let flow = await Flow.findOne();
    
    if (!flow) {
      flow = new Flow({
        nodes: [],
        edges: []
      });
    }
    
    // 更新节点和边
    flow.nodes = nodes;
    flow.edges = edges;
    flow.lastSyncedAt = Date.now();
    
    await flow.save();
    
    // 更新配置文件
    await updateFlowConfigFile(req.workspacePath, flow);
    
    // 发送WebSocket通知
    const io = req.app.get('io');
    io.emit('flow:updated', flow);
    
    res.status(200).json(flow);
  } catch (error) {
    res.status(500).json({ message: '更新流程失败', error: error.message });
  }
};

// 从配置文件同步流程
exports.syncFlowFromConfig = async (req, res) => {
  try {
    const configPath = path.join(req.workspacePath, 'config', 'flow.json');
    
    // 检查配置文件是否存在
    if (!await fs.pathExists(configPath)) {
      return res.status(404).json({ message: '流程配置文件不存在' });
    }
    
    // 读取配置文件
    const configData = await fs.readJson(configPath);
    
    // 处理节点
    const taskIds = [];
    for (const nodeData of configData.nodes) {
      // 查找或创建任务
      let task = await Task.findOne({ id: nodeData.id });
      
      if (!task) {
        task = new Task({
          id: nodeData.id,
          title: nodeData.title || '未命名任务',
          type: nodeData.type,
          parent: nodeData.parent,
          status: nodeData.status,
          position: nodeData.position
        });
        await task.save();
      } else {
        // 更新任务
        task.title = nodeData.title || task.title;
        task.type = nodeData.type;
        task.parent = nodeData.parent;
        task.status = nodeData.status;
        task.position = nodeData.position;
        await task.save();
      }
      
      taskIds.push(task._id);
    }
    
    // 更新流程
    let flow = await Flow.findOne();
    
    if (!flow) {
      flow = new Flow();
    }
    
    flow.nodes = taskIds;
    flow.edges = configData.edges;
    flow.lastSyncedAt = Date.now();
    
    await flow.save();
    
    // 发送WebSocket通知
    const io = req.app.get('io');
    io.emit('flow:updated', flow);
    
    res.status(200).json(flow);
  } catch (error) {
    res.status(500).json({ message: '同步流程失败', error: error.message });
  }
};

// 更新流程配置文件
async function updateFlowConfigFile(workspacePath, flow) {
  try {
    const configPath = path.join(workspacePath, 'config', 'flow.json');
    
    // 获取完整的任务数据
    const tasks = await Task.find({ _id: { $in: flow.nodes } });
    
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
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, configData, { spaces: 2 });
    
    return true;
  } catch (error) {
    console.error('更新流程配置文件失败:', error);
    return false;
  }
} 