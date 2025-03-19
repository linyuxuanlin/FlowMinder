const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();
const Task = require('../models/Task');

// 文件内容同步
router.post('/sync', async (req, res) => {
  const { taskId, content } = req.body;
  
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: '任务未找到' });
    }
    
    // 更新文件内容
    await fs.writeFile(task.filePath, content);
    
    // 更新任务时间戳
    task.updatedAt = Date.now();
    await task.save();
    
    res.json({ message: '文件已同步' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 文件内容读取
router.get('/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: '任务未找到' });
    }
    
    // 检查文件是否存在
    if (!(await fs.pathExists(task.filePath))) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    // 读取文件内容
    const content = await fs.readFile(task.filePath, 'utf8');
    
    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 文件监视服务状态
router.get('/watch/status', (req, res) => {
  res.json({ status: 'active' });
});

// 导出文件
router.get('/export/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: '任务未找到' });
    }
    
    // 检查文件是否存在
    if (!(await fs.pathExists(task.filePath))) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    res.download(task.filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 