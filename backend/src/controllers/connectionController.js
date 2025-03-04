const Connection = require('../models/Connection');
const Node = require('../models/Node');

/**
 * 获取所有连接
 */
exports.getAllConnections = async (req, res) => {
  try {
    const connections = await Connection.find();
    res.json({
      success: true,
      data: connections
    });
  } catch (error) {
    console.error('获取连接失败:', error);
    res.status(500).json({
      success: false,
      error: '获取连接失败'
    });
  }
};

/**
 * 获取单个连接
 */
exports.getConnectionById = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({
        success: false,
        error: '连接不存在'
      });
    }
    res.json({
      success: true,
      data: connection
    });
  } catch (error) {
    console.error('获取连接失败:', error);
    res.status(500).json({
      success: false,
      error: '获取连接失败'
    });
  }
};

/**
 * 创建连接
 */
exports.createConnection = async (req, res) => {
  try {
    const { sourceId, targetId, label } = req.body;
    
    // 验证源节点和目标节点是否存在
    const sourceNode = await Node.findById(sourceId);
    const targetNode = await Node.findById(targetId);
    
    if (!sourceNode || !targetNode) {
      return res.status(400).json({
        success: false,
        error: '源节点或目标节点不存在'
      });
    }
    
    // 检查是否已存在相同的连接
    const existingConnection = await Connection.findOne({
      sourceId,
      targetId
    });
    
    if (existingConnection) {
      return res.status(400).json({
        success: false,
        error: '连接已存在'
      });
    }
    
    // 创建连接
    const connection = new Connection({
      sourceId,
      targetId,
      label
    });
    
    await connection.save();
    
    res.status(201).json({
      success: true,
      data: connection
    });
  } catch (error) {
    console.error('创建连接失败:', error);
    res.status(500).json({
      success: false,
      error: '创建连接失败'
    });
  }
};

/**
 * 更新连接
 */
exports.updateConnection = async (req, res) => {
  try {
    const { label } = req.body;
    
    const updatedConnection = await Connection.findByIdAndUpdate(
      req.params.id,
      { label },
      { new: true }
    );
    
    if (!updatedConnection) {
      return res.status(404).json({
        success: false,
        error: '连接不存在'
      });
    }
    
    res.json({
      success: true,
      data: updatedConnection
    });
  } catch (error) {
    console.error('更新连接失败:', error);
    res.status(500).json({
      success: false,
      error: '更新连接失败'
    });
  }
};

/**
 * 删除连接
 */
exports.deleteConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        error: '连接不存在'
      });
    }
    
    await Connection.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('删除连接失败:', error);
    res.status(500).json({
      success: false,
      error: '删除连接失败'
    });
  }
}; 