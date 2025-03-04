const fs = require('fs-extra');
const path = require('path');
const Task = require('../models/Task');
const { parseMarkdown, generateMarkdown } = require('../utils/markdownUtils');

// 获取工作区文件列表
exports.getWorkspaceFiles = async (req, res) => {
  try {
    const workspacePath = req.workspacePath;
    const flowsPath = path.join(workspacePath, 'flows');
    
    // 确保目录存在
    await fs.ensureDir(flowsPath);
    
    // 递归获取所有文件
    const files = await getFilesRecursively(flowsPath);
    
    // 格式化文件路径
    const formattedFiles = files.map(file => {
      const relativePath = path.relative(workspacePath, file);
      return {
        path: relativePath,
        name: path.basename(file),
        type: path.extname(file).substring(1) || 'folder'
      };
    });
    
    res.status(200).json(formattedFiles);
  } catch (error) {
    res.status(500).json({ message: '获取文件列表失败', error: error.message });
  }
};

// 读取文件内容
exports.getFileContent = async (req, res) => {
  try {
    const { filePath } = req.params;
    const fullPath = path.join(req.workspacePath, filePath);
    
    // 检查文件是否存在
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    // 读取文件内容
    const content = await fs.readFile(fullPath, 'utf8');
    
    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ message: '读取文件失败', error: error.message });
  }
};

// 更新文件内容
exports.updateFileContent = async (req, res) => {
  try {
    const { filePath } = req.params;
    const { content } = req.body;
    const fullPath = path.join(req.workspacePath, filePath);
    
    // 检查文件是否存在
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    // 写入文件内容
    await fs.writeFile(fullPath, content);
    
    // 如果是Markdown任务文件，同步到数据库
    if (filePath.startsWith('flows/') && filePath.endsWith('.md')) {
      const taskId = filePath.replace('flows/', '').replace('.md', '');
      const taskData = parseMarkdown(content);
      
      // 更新任务
      await Task.findOneAndUpdate(
        { id: taskId },
        { 
          ...taskData,
          updatedAt: Date.now()
        },
        { new: true, upsert: true }
      );
      
      // 发送WebSocket通知
      const io = req.app.get('io');
      io.emit('task:updated', { id: taskId });
    }
    
    res.status(200).json({ message: '文件已更新' });
  } catch (error) {
    res.status(500).json({ message: '更新文件失败', error: error.message });
  }
};

// 创建文件
exports.createFile = async (req, res) => {
  try {
    const { filePath } = req.params;
    const { content, isDirectory } = req.body;
    const fullPath = path.join(req.workspacePath, filePath);
    
    // 检查文件是否已存在
    if (await fs.pathExists(fullPath)) {
      return res.status(400).json({ message: '文件已存在' });
    }
    
    if (isDirectory) {
      // 创建目录
      await fs.ensureDir(fullPath);
    } else {
      // 创建文件
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content || '');
      
      // 如果是Markdown任务文件，同步到数据库
      if (filePath.startsWith('flows/') && filePath.endsWith('.md')) {
        const taskId = filePath.replace('flows/', '').replace('.md', '');
        const taskData = parseMarkdown(content || '');
        
        // 创建任务
        const task = new Task({
          id: taskId,
          ...taskData
        });
        
        await task.save();
        
        // 发送WebSocket通知
        const io = req.app.get('io');
        io.emit('task:created', task);
      }
    }
    
    res.status(201).json({ message: '文件已创建' });
  } catch (error) {
    res.status(500).json({ message: '创建文件失败', error: error.message });
  }
};

// 删除文件
exports.deleteFile = async (req, res) => {
  try {
    const { filePath } = req.params;
    const fullPath = path.join(req.workspacePath, filePath);
    
    // 检查文件是否存在
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    // 删除文件
    await fs.remove(fullPath);
    
    // 如果是Markdown任务文件，从数据库中删除
    if (filePath.startsWith('flows/') && filePath.endsWith('.md')) {
      const taskId = filePath.replace('flows/', '').replace('.md', '');
      
      // 删除任务
      await Task.findOneAndDelete({ id: taskId });
      
      // 发送WebSocket通知
      const io = req.app.get('io');
      io.emit('task:deleted', { id: taskId });
    }
    
    res.status(200).json({ message: '文件已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除文件失败', error: error.message });
  }
};

// 递归获取目录中的所有文件
async function getFilesRecursively(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFilesRecursively(res) : res;
  }));
  return Array.prototype.concat(...files);
} 