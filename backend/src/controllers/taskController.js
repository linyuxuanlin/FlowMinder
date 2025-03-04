const Task = require('../models/Task');
const fs = require('fs-extra');
const path = require('path');
const { parseMarkdown, generateMarkdown } = require('../utils/markdownUtils');

// 获取所有任务
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: '获取任务失败', error: error.message });
  }
};

// 获取单个任务
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: '获取任务失败', error: error.message });
  }
};

// 创建任务
exports.createTask = async (req, res) => {
  try {
    const { id, title, type, parent, status, position, content } = req.body;
    
    // 检查任务ID是否已存在
    const existingTask = await Task.findOne({ id });
    if (existingTask) {
      return res.status(400).json({ message: '任务ID已存在' });
    }
    
    // 创建任务
    const task = new Task({
      id,
      title,
      type,
      parent,
      status,
      position,
      content
    });
    
    // 保存到数据库
    await task.save();
    
    // 创建Markdown文件
    const filePath = path.join(req.workspacePath, 'flows', id + '.md');
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, generateMarkdown(task));
    
    // 发送WebSocket通知
    const io = req.app.get('io');
    io.emit('task:created', task);
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: '创建任务失败', error: error.message });
  }
};

// 更新任务
exports.updateTask = async (req, res) => {
  try {
    const { title, status, position, content, metadata } = req.body;
    
    // 查找并更新任务
    const task = await Task.findOneAndUpdate(
      { id: req.params.id },
      { 
        title, 
        status, 
        position, 
        content,
        metadata,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    
    // 更新Markdown文件
    const filePath = path.join(req.workspacePath, 'flows', task.id + '.md');
    await fs.writeFile(filePath, generateMarkdown(task));
    
    // 发送WebSocket通知
    const io = req.app.get('io');
    io.emit('task:updated', task);
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: '更新任务失败', error: error.message });
  }
};

// 删除任务
exports.deleteTask = async (req, res) => {
  try {
    // 查找并删除任务
    const task = await Task.findOneAndDelete({ id: req.params.id });
    
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    
    // 删除Markdown文件
    const filePath = path.join(req.workspacePath, 'flows', task.id + '.md');
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
    
    // 发送WebSocket通知
    const io = req.app.get('io');
    io.emit('task:deleted', { id: req.params.id });
    
    res.status(200).json({ message: '任务已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除任务失败', error: error.message });
  }
};

// 从Markdown文件同步任务
exports.syncTaskFromFile = async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(req.workspacePath, 'flows', id + '.md');
    
    // 检查文件是否存在
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ message: '任务文件不存在' });
    }
    
    // 读取并解析Markdown文件
    const content = await fs.readFile(filePath, 'utf8');
    const taskData = parseMarkdown(content);
    
    // 更新任务
    const task = await Task.findOneAndUpdate(
      { id },
      { 
        ...taskData,
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );
    
    // 发送WebSocket通知
    const io = req.app.get('io');
    io.emit('task:updated', task);
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: '同步任务失败', error: error.message });
  }
}; 