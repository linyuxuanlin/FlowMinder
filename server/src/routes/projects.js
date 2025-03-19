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
  const { name, description } = req.body;
  
  try {
    // 创建项目目录
    const projectsDir = process.env.PROJECTS_DIR || path.join(__dirname, '../../../projects');
    const projectDir = path.join(projectsDir, name.replace(/[^a-z0-9]/gi, '_').toLowerCase());
    
    // 确保目录不存在，否则返回错误
    if (await fs.pathExists(projectDir)) {
      return res.status(400).json({ message: '项目名称已存在' });
    }
    
    // 创建项目目录和配置文件
    await fs.ensureDir(projectDir);
    
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
      configPath: configPath
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

// 删除项目
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目未找到' });
    }
    
    // 删除项目目录
    const projectDir = path.dirname(project.configPath);
    await fs.remove(projectDir);
    
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