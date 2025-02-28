const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const chokidar = require('chokidar');

const app = express();
const PORT = process.env.PORT || 5000;

// 数据目录
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const NODES_DIR = path.join(DATA_DIR, 'nodes');
const CONFIG_FILE = path.join(DATA_DIR, 'flow-config.json');

// 确保目录存在
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(NODES_DIR);

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 初始化配置文件
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeJsonSync(CONFIG_FILE, { nodes: [], edges: [] });
}

// 获取流程图数据
app.get('/api/flow', (req, res) => {
  try {
    const flowData = fs.readJsonSync(CONFIG_FILE);
    res.json(flowData);
  } catch (error) {
    console.error('Error reading flow data:', error);
    res.status(500).json({ error: 'Failed to read flow data' });
  }
});

// 创建新节点
app.post('/api/nodes', async (req, res) => {
  try {
    const nodeData = req.body;
    const nodeId = nodeData.id || uuidv4();
    nodeData.id = nodeId;

    // 更新配置文件
    const flowData = fs.readJsonSync(CONFIG_FILE);
    flowData.nodes.push(nodeData);
    fs.writeJsonSync(CONFIG_FILE, flowData);

    // 创建Markdown文件
    const mdFilePath = path.join(NODES_DIR, `${nodeId}.md`);
    await fs.writeFile(mdFilePath, nodeData.data.content || '');

    res.status(201).json(nodeData);
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ error: 'Failed to create node' });
  }
});

// 更新节点内容
app.put('/api/nodes/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // 更新配置文件中的内容
    const flowData = fs.readJsonSync(CONFIG_FILE);
    const nodeIndex = flowData.nodes.findIndex(node => node.id === id);

    if (nodeIndex === -1) {
      return res.status(404).json({ error: 'Node not found' });
    }

    flowData.nodes[nodeIndex].data.content = content;
    fs.writeJsonSync(CONFIG_FILE, flowData);

    // 更新Markdown文件
    const mdFilePath = path.join(NODES_DIR, `${id}.md`);
    await fs.writeFile(mdFilePath, content || '');

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating node content:', error);
    res.status(500).json({ error: 'Failed to update node content' });
  }
});

// 更新节点状态
app.put('/api/nodes/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 更新配置文件中的状态
    const flowData = fs.readJsonSync(CONFIG_FILE);
    const nodeIndex = flowData.nodes.findIndex(node => node.id === id);

    if (nodeIndex === -1) {
      return res.status(404).json({ error: 'Node not found' });
    }

    flowData.nodes[nodeIndex].data.status = status;
    fs.writeJsonSync(CONFIG_FILE, flowData);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating node status:', error);
    res.status(500).json({ error: 'Failed to update node status' });
  }
});

// 更新节点位置
app.put('/api/nodes/:id/position', (req, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;

    // 更新配置文件中的位置
    const flowData = fs.readJsonSync(CONFIG_FILE);
    const nodeIndex = flowData.nodes.findIndex(node => node.id === id);

    if (nodeIndex === -1) {
      return res.status(404).json({ error: 'Node not found' });
    }

    flowData.nodes[nodeIndex].position = position;
    fs.writeJsonSync(CONFIG_FILE, flowData);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating node position:', error);
    res.status(500).json({ error: 'Failed to update node position' });
  }
});

// 创建新边
app.post('/api/edges', (req, res) => {
  try {
    const edgeData = req.body;
    const edgeId = edgeData.id || uuidv4();
    edgeData.id = edgeId;

    // 更新配置文件
    const flowData = fs.readJsonSync(CONFIG_FILE);
    flowData.edges.push(edgeData);
    fs.writeJsonSync(CONFIG_FILE, flowData);

    res.status(201).json(edgeData);
  } catch (error) {
    console.error('Error creating edge:', error);
    res.status(500).json({ error: 'Failed to create edge' });
  }
});

// 监视Markdown文件变化
const watcher = chokidar.watch(NODES_DIR, {
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', async (filePath) => {
  try {
    const nodeId = path.basename(filePath, '.md');
    const content = await fs.readFile(filePath, 'utf8');

    // 更新配置文件中的内容
    const flowData = fs.readJsonSync(CONFIG_FILE);
    const nodeIndex = flowData.nodes.findIndex(node => node.id === nodeId);

    if (nodeIndex !== -1) {
      flowData.nodes[nodeIndex].data.content = content;
      fs.writeJsonSync(CONFIG_FILE, flowData);
      console.log(`Node ${nodeId} content updated from file change`);
    }
  } catch (error) {
    console.error('Error handling file change:', error);
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});