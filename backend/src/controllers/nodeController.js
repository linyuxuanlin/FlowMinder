const Node = require('../models/Node');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { 
  readMarkdownFile, 
  writeMarkdownFile, 
  deleteMarkdownFile 
} = require('../utils/fileSync');

/**
 * 获取所有节点
 */
exports.getAllNodes = async (req, res) => {
  try {
    const nodes = await Node.find();
    res.json({
      success: true,
      data: nodes
    });
  } catch (error) {
    console.error('获取节点失败:', error);
    res.status(500).json({
      success: false,
      error: '获取节点失败'
    });
  }
};

/**
 * 获取单个节点
 */
exports.getNodeById = async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({
        success: false,
        error: '节点不存在'
      });
    }

    // 如果有文件路径，读取文件内容
    if (node.filePath) {
      const content = readMarkdownFile(node.filePath);
      node.content = content || node.content;
    }

    res.json({
      success: true,
      data: node
    });
  } catch (error) {
    console.error('获取节点失败:', error);
    res.status(500).json({
      success: false,
      error: '获取节点失败'
    });
  }
};

/**
 * 创建节点
 */
exports.createNode = async (req, res) => {
  try {
    const { title, content, status, parentId, position } = req.body;
    
    // 创建文件路径
    const fileName = `${uuidv4()}.md`;
    const filePath = parentId 
      ? `nodes/${parentId}/${fileName}` 
      : `nodes/${fileName}`;
    
    // 创建节点
    const node = new Node({
      title,
      content,
      status,
      parentId,
      position,
      filePath
    });
    
    // 保存到数据库
    await node.save();
    
    // 写入文件
    writeMarkdownFile(filePath, content || '');
    
    res.status(201).json({
      success: true,
      data: node
    });
  } catch (error) {
    console.error('创建节点失败:', error);
    res.status(500).json({
      success: false,
      error: '创建节点失败'
    });
  }
};

/**
 * 更新节点
 */
exports.updateNode = async (req, res) => {
  try {
    const { title, content, status } = req.body;
    
    // 查找节点
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({
        success: false,
        error: '节点不存在'
      });
    }
    
    // 更新节点
    const updatedNode = await Node.findByIdAndUpdate(
      req.params.id,
      { title, content, status },
      { new: true }
    );
    
    // 如果有文件路径，更新文件内容
    if (node.filePath && content !== undefined) {
      writeMarkdownFile(node.filePath, content);
    }
    
    res.json({
      success: true,
      data: updatedNode
    });
  } catch (error) {
    console.error('更新节点失败:', error);
    res.status(500).json({
      success: false,
      error: '更新节点失败'
    });
  }
};

/**
 * 更新节点位置
 */
exports.updateNodePosition = async (req, res) => {
  try {
    const { position } = req.body;
    
    // 更新节点位置
    const updatedNode = await Node.findByIdAndUpdate(
      req.params.id,
      { position },
      { new: true }
    );
    
    if (!updatedNode) {
      return res.status(404).json({
        success: false,
        error: '节点不存在'
      });
    }
    
    res.json({
      success: true,
      data: updatedNode
    });
  } catch (error) {
    console.error('更新节点位置失败:', error);
    res.status(500).json({
      success: false,
      error: '更新节点位置失败'
    });
  }
};

/**
 * 删除节点
 */
exports.deleteNode = async (req, res) => {
  try {
    // 查找节点
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({
        success: false,
        error: '节点不存在'
      });
    }
    
    // 删除文件
    if (node.filePath) {
      deleteMarkdownFile(node.filePath);
    }
    
    // 删除节点
    await Node.findByIdAndDelete(req.params.id);
    
    // 删除子节点
    const childNodes = await Node.find({ parentId: req.params.id });
    for (const childNode of childNodes) {
      if (childNode.filePath) {
        deleteMarkdownFile(childNode.filePath);
      }
      await Node.findByIdAndDelete(childNode._id);
    }
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('删除节点失败:', error);
    res.status(500).json({
      success: false,
      error: '删除节点失败'
    });
  }
}; 