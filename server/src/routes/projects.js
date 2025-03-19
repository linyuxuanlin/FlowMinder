const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('yaml');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

// 获取所有项目
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新项目
router.post('/', async (req, res) => {
  const { name, description, localPath } = req.body;
  
  try {
    // 验证本地路径
    if (!localPath) {
      return res.status(400).json({ message: '本地路径不能为空' });
    }
    
    // 检查路径是否存在，如果不存在则创建
    try {
      await fs.ensureDir(localPath);
    } catch (err) {
      return res.status(400).json({ message: '无法创建或访问本地路径' });
    }
    
    // 创建项目目录
    const projectDir = localPath;
    
    // 确保目录不存在，否则返回错误
    if (await fs.pathExists(path.join(projectDir, 'flow-config.yaml'))) {
      return res.status(400).json({ message: '项目配置文件已存在于该路径' });
    }
    
    // 创建配置文件
    const configPath = path.join(projectDir, 'flow-config.yaml');
    const initialConfig = {
      name: name,
      description: description,
      nodes: [],
      edges: []
    };
    
    await fs.writeFile(configPath, yaml.stringify(initialConfig));
    
    // 保存项目到数据库
    const project = new Project({
      name,
      description,
      configPath,
      localPath
    });
    
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取单个项目
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目未找到' });
    }
    
    // 读取项目配置
    const configContent = await fs.readFile(project.configPath, 'utf8');
    const config = yaml.parse(configContent);
    
    // 查找所有相关任务
    const tasks = await Task.find({ projectId: project._id });
    
    res.json({
      project,
      config,
      tasks
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 更新项目
router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目未找到' });
    }
    
    // 更新项目信息
    if (name) project.name = name;
    if (description) project.description = description;
    project.updatedAt = Date.now();
    
    const updatedProject = await project.save();
    
    // 更新配置文件
    if (name || description) {
      const configContent = await fs.readFile(project.configPath, 'utf8');
      const config = yaml.parse(configContent);
      
      if (name) config.name = name;
      if (description) config.description = description;
      
      await fs.writeFile(project.configPath, yaml.stringify(config));
    }
    
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 更新项目本地路径
router.put('/:id/path', async (req, res) => {
  const { newPath } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目未找到' });
    }
    
    // 验证新路径
    if (!newPath) {
      return res.status(400).json({ message: '新路径不能为空' });
    }
    
    const oldPath = project.localPath;
    
    // 如果路径相同，不需要更新
    if (oldPath === newPath) {
      return res.json({ message: '路径未变更' });
    }
    
    // 检查并创建新路径
    try {
      await fs.ensureDir(newPath);
    } catch (err) {
      return res.status(400).json({ message: '无法创建或访问新路径' });
    }
    
    // 复制旧路径下的所有文件到新路径
    try {
      await fs.copy(oldPath, newPath, {
        overwrite: false,
        errorOnExist: false
      });
    } catch (err) {
      return res.status(500).json({ message: '复制文件失败: ' + err.message });
    }
    
    // 更新项目中的配置文件路径
    const oldConfigPath = project.configPath;
    const newConfigPath = path.join(newPath, path.basename(oldConfigPath));
    
    // 更新数据库中的路径
    project.localPath = newPath;
    project.configPath = newConfigPath;
    project.updatedAt = Date.now();
    
    // 更新所有任务的文件路径
    const tasks = await Task.find({ projectId: project._id });
    for (const task of tasks) {
      const oldTaskPath = task.filePath;
      const relativePath = path.relative(oldPath, oldTaskPath);
      const newTaskPath = path.join(newPath, relativePath);
      
      task.filePath = newTaskPath;
      task.updatedAt = Date.now();
      await task.save();
    }
    
    const updatedProject = await project.save();
    
    res.json({
      message: '本地路径已更新',
      project: updatedProject
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 删除项目
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目未找到' });
    }
    
    // 删除相关任务
    await Task.deleteMany({ projectId: project._id });
    
    // 删除项目记录
    await project.remove();
    
    res.json({ message: '项目已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 更新项目流配置
router.put('/:id/flow', async (req, res) => {
  const { nodes, edges } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目未找到' });
    }
    
    // 读取配置文件
    const configContent = await fs.readFile(project.configPath, 'utf8');
    const config = yaml.parse(configContent);
    
    // 更新节点和边
    if (nodes) config.nodes = nodes;
    if (edges) config.edges = edges;
    
    // 写回配置文件
    await fs.writeFile(project.configPath, yaml.stringify(config));
    
    res.json({ message: '流程图已更新' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 