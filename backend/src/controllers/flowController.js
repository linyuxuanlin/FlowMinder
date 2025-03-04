const Node = require('../models/Node');
const Connection = require('../models/Connection');
const FlowConfig = require('../models/FlowConfig');
const { 
  readConfigFile, 
  writeConfigFile, 
  readMarkdownFile 
} = require('../utils/fileSync');

/**
 * 获取完整的流程配置
 */
exports.getFlowConfig = async (req, res) => {
  try {
    // 从数据库获取节点和连接
    const nodes = await Node.find();
    const connections = await Connection.find();
    
    // 对于每个节点，如果有文件路径，读取文件内容
    const nodesWithContent = await Promise.all(nodes.map(async (node) => {
      const nodeObj = node.toObject();
      if (nodeObj.filePath) {
        const content = readMarkdownFile(nodeObj.filePath);
        if (content) {
          nodeObj.content = content;
        }
      }
      return nodeObj;
    }));
    
    // 构建流程配置
    const flowConfig = {
      nodes: nodesWithContent,
      connections,
      lastUpdated: new Date().toISOString()
    };
    
    // 保存到配置文件
    writeConfigFile(flowConfig);
    
    res.json({
      success: true,
      data: flowConfig
    });
  } catch (error) {
    console.error('获取流程配置失败:', error);
    res.status(500).json({
      success: false,
      error: '获取流程配置失败'
    });
  }
};

/**
 * 从配置文件同步流程
 */
exports.syncFromConfig = async (req, res) => {
  try {
    // 读取配置文件
    const config = readConfigFile();
    
    if (!config || !config.nodes || !config.connections) {
      return res.status(400).json({
        success: false,
        error: '配置文件格式无效'
      });
    }
    
    // 清空数据库
    await Node.deleteMany({});
    await Connection.deleteMany({});
    
    // 导入节点
    const nodePromises = config.nodes.map(async (nodeData) => {
      const node = new Node(nodeData);
      return node.save();
    });
    
    await Promise.all(nodePromises);
    
    // 导入连接
    const connectionPromises = config.connections.map(async (connData) => {
      const connection = new Connection(connData);
      return connection.save();
    });
    
    await Promise.all(connectionPromises);
    
    // 更新FlowConfig记录
    await FlowConfig.findOneAndUpdate(
      {},
      { lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      data: {
        message: '从配置文件同步成功',
        nodesCount: config.nodes.length,
        connectionsCount: config.connections.length
      }
    });
  } catch (error) {
    console.error('从配置文件同步失败:', error);
    res.status(500).json({
      success: false,
      error: '从配置文件同步失败'
    });
  }
};

/**
 * 将流程同步到配置文件
 */
exports.syncToConfig = async (req, res) => {
  try {
    // 从数据库获取节点和连接
    const nodes = await Node.find();
    const connections = await Connection.find();
    
    // 构建流程配置
    const flowConfig = {
      nodes,
      connections,
      lastUpdated: new Date().toISOString()
    };
    
    // 保存到配置文件
    const success = writeConfigFile(flowConfig);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: '写入配置文件失败'
      });
    }
    
    // 更新FlowConfig记录
    await FlowConfig.findOneAndUpdate(
      {},
      { lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      data: {
        message: '同步到配置文件成功',
        nodesCount: nodes.length,
        connectionsCount: connections.length
      }
    });
  } catch (error) {
    console.error('同步到配置文件失败:', error);
    res.status(500).json({
      success: false,
      error: '同步到配置文件失败'
    });
  }
}; 