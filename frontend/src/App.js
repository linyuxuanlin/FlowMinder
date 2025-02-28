import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ReactFlow, { Controls, Background } from 'react-flow-renderer';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NodeDetail from './components/NodeDetail';
import CustomNode from './components/CustomNode';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// 注册自定义节点类型
const nodeTypes = {
  customNode: CustomNode,
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  // 加载流程图数据
  useEffect(() => {
    const fetchFlowData = async () => {
      try {
        const response = await axios.get('/api/flow');
        if (response.data) {
          setNodes(response.data.nodes.map(node => ({
            ...node,
            type: 'customNode',
          })));
          setEdges(response.data.edges);
        }
      } catch (error) {
        console.error('Error fetching flow data:', error);
      }
    };

    fetchFlowData();
  }, []);

  // 处理节点点击
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setDetailOpen(true);
  };

  // 处理节点拖动结束
  const onNodeDragStop = (event, node) => {
    // 更新节点位置到后端
    axios.put(`/api/nodes/${node.id}/position`, {
      position: node.position
    }).catch(error => {
      console.error('Error updating node position:', error);
    });
  };

  // 处理连接创建
  const onConnect = (params) => {
    // 创建新的边
    const newEdge = {
      ...params,
      animated: true,
      style: { stroke: '#1976d2' }
    };
    
    // 更新前端状态
    setEdges(eds => [...eds, newEdge]);
    
    // 发送到后端
    axios.post('/api/edges', newEdge)
      .catch(error => {
        console.error('Error creating edge:', error);
        // 如果失败，回滚边的添加
        setEdges(eds => eds.filter(e => e.id !== newEdge.id));
      });
  };

  // 创建新节点
  const createNode = (nodeData) => {
    const newNode = {
      ...nodeData,
      type: 'customNode',
    };

    // 更新前端状态
    setNodes(nds => [...nds, newNode]);

    // 发送到后端
    axios.post('/api/nodes', newNode)
      .catch(error => {
        console.error('Error creating node:', error);
        // 如果失败，回滚节点的添加
        setNodes(nds => nds.filter(n => n.id !== newNode.id));
      });
  };

  // 更新节点内容
  const updateNodeContent = (nodeId, content) => {
    // 更新前端状态
    setNodes(nds =>
      nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, content } } : n))
    );

    // 发送到后端
    axios.put(`/api/nodes/${nodeId}/content`, { content })
      .catch(error => {
        console.error('Error updating node content:', error);
      });
  };

  // 更新节点状态
  const updateNodeStatus = (nodeId, status) => {
    // 更新前端状态
    setNodes(nds =>
      nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, status } } : n))
    );

    // 发送到后端
    axios.put(`/api/nodes/${nodeId}/status`, { status })
      .catch(error => {
        console.error('Error updating node status:', error);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        <Sidebar 
          open={sidebarOpen} 
          createNode={createNode} 
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100vh',
            overflow: 'hidden',
            pt: 8, // 为顶部导航栏留出空间
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </Box>
        {selectedNode && (
          <NodeDetail
            open={detailOpen}
            setOpen={setDetailOpen}
            node={selectedNode}
            updateNodeContent={updateNodeContent}
            updateNodeStatus={updateNodeStatus}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;