const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('yaml');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

// 获取所有任务
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};
    
    if (projectId) {
      query.projectId = projectId;
    }
    
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新任务
router.post('/', async (req, res) => {
  const { 
    title, 
    description, 
    projectId, 
    parentId, 
    position, 
    status,
    isMainNode 
  } = req.body;
  
  try {
    // 查找项目
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: '项目未找到' });
    }
    
    // 确定项目目录
    const projectDir = path.dirname(project.configPath);
    
    // 创建任务Markdown文件
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    const filePath = path.join(projectDir, fileName);
    
    // 初始Markdown内容
    const initialContent = `# ${title}\n\n${description || ''}`;
    
    // 写入文件
    await fs.writeFile(filePath, initialContent);
    
    // 创建任务
    const task = new Task({
      title,
      description,
      projectId,
      parentId: parentId || null,
      filePath,
      status: status || 'pending',
      position: position || { x: 0, y: 0 },
      isMainNode: isMainNode || false
    });
    
    const savedTask = await task.save();
    
    // 更新项目流配置
    const configContent = await fs.readFile(project.configPath, 'utf8');
    const config = yaml.parse(configContent);
    
    // 添加新节点
    const newNode = {
      id: savedTask._id.toString(),
      type: isMainNode ? 'mainNode' : 'taskNode',
      position: position || { x: 0, y: 0 },
      data: {
        title,
        status: status || 'pending',
        filePath: fileName
      }
    };
    
    config.nodes.push(newNode);
    
    // 如果有父节点，添加边
    if (parentId) {
      config.edges = config.edges || [];
      config.edges.push({
        id: `e${parentId}-${savedTask._id}`,
        source: parentId,
        target: savedTask._id.toString()
      });
    }
    
    // 保存配置
    await fs.writeFile(project.configPath, yaml.stringify(config));
    
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取单个任务
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: '任务未找到' });
    }
    
    // 读取任务文件内容
    const fileContent = await fs.readFile(task.filePath, 'utf8');
    
    res.json({
      task,
      content: fileContent
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 更新任务
router.put('/:id', async (req, res) => {
  const { title, description, status, position } = req.body;
  
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: '任务未找到' });
    }
    
    // 更新任务信息
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (position) task.position = position;
    task.updatedAt = Date.now();
    
    const updatedTask = await task.save();
    
    // 更新任务文件
    if (title || description) {
      const fileContent = await fs.readFile(task.filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      if (title) {
        // 更新标题行
        lines[0] = `# ${title}`;
      }
      
      if (description) {
        // 如果有描述行，更新它
        if (lines.length > 2) {
          lines[2] = description;
        } else {
          // 否则添加描述
          lines.push('');
          lines.push(description);
        }
      }
      
      await fs.writeFile(task.filePath, lines.join('\n'));
    }
    
    // 更新项目流配置
    const project = await Project.findById(task.projectId);
    if (project) {
      const configContent = await fs.readFile(project.configPath, 'utf8');
      const config = yaml.parse(configContent);
      
      // 更新节点
      const nodeIndex = config.nodes.findIndex(node => node.id === task._id.toString());
      if (nodeIndex !== -1) {
        if (title) config.nodes[nodeIndex].data.title = title;
        if (status) config.nodes[nodeIndex].data.status = status;
        if (position) config.nodes[nodeIndex].position = position;
      }
      
      // 保存配置
      await fs.writeFile(project.configPath, yaml.stringify(config));
    }
    
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 更新任务内容
router.put('/:id/content', async (req, res) => {
  const { content } = req.body;
  
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: '任务未找到' });
    }
    
    // 更新文件内容
    await fs.writeFile(task.filePath, content);
    
    // 更新任务时间戳
    task.updatedAt = Date.now();
    await task.save();
    
    res.json({ message: '内容已更新' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: '任务未找到' });
    }
    
    // 检查是否有子任务
    const childTasks = await Task.find({ parentId: task._id });
    if (childTasks.length > 0) {
      return res.status(400).json({ message: '无法删除有子任务的任务' });
    }
    
    // 删除任务文件
    await fs.remove(task.filePath);
    
    // 更新项目流配置
    const project = await Project.findById(task.projectId);
    if (project) {
      const configContent = await fs.readFile(project.configPath, 'utf8');
      const config = yaml.parse(configContent);
      
      // 移除节点
      config.nodes = config.nodes.filter(node => node.id !== task._id.toString());
      
      // 移除相关边
      config.edges = config.edges.filter(edge => 
        edge.source !== task._id.toString() && edge.target !== task._id.toString()
      );
      
      // 保存配置
      await fs.writeFile(project.configPath, yaml.stringify(config));
    }
    
    // 删除任务记录
    await task.remove();
    
    res.json({ message: '任务已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 