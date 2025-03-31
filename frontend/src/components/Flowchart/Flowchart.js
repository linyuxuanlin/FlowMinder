import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import Node from './Node';
import Edge from './Edge';
import NodeDialog from './NodeDialog';
import { nodeApi } from '../../services/api';
import './Flowchart.css';

const MAIN_NODE_WIDTH = 150;
const MAIN_NODE_HEIGHT = 60;
const SECONDARY_NODE_WIDTH = 120;
const SECONDARY_NODE_HEIGHT = 50;
const VERTICAL_DISTANCE = 150; // 主节点之间的垂直距离
const HORIZONTAL_DISTANCE = 200; // 主节点和二级节点之间的水平距离
const SECONDARY_VERTICAL_SPACING = 80; // 二级节点之间的垂直间距

const Flowchart = ({ branchId, onNodesChange }) => {
  // 状态管理
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 800 });
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [nodeDialogType, setNodeDialogType] = useState('create');
  const [currentParentNode, setCurrentParentNode] = useState(null);
  const [nodeTypeToCreate, setNodeTypeToCreate] = useState('main');
  const [editingNode, setEditingNode] = useState(null);
  
  const canvasRef = useRef(null);
  
  // 从API获取节点
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        if (!branchId) return;
        
        // 首先检查是否已有节点
        const existingNodes = await nodeApi.getNodesByBranchId(branchId);
        
        if (existingNodes && existingNodes.length > 0) {
          console.log('已存在节点：', existingNodes.length);
          setNodes(existingNodes);
          // 将节点数据传递给父组件
          if (onNodesChange) {
            onNodesChange(existingNodes);
          }
          return;
        }
        
        console.log('没有找到节点，创建初始节点');
        // 没有节点，创建初始节点
        const startNode = {
          name: '开始',
          type: 'main',
          parent_id: null,
          status: 'in_progress',
          position: 0,
          branch_id: branchId,
          description: '项目起始点'
        };
        
        try {
          const createdNode = await nodeApi.createNode(startNode);
          console.log('创建节点成功：', createdNode);
          setNodes([createdNode]);
          // 将节点数据传递给父组件
          if (onNodesChange) {
            onNodesChange([createdNode]);
          }
        } catch (error) {
          console.error('创建初始节点失败:', error);
          
          // 再次检查是否有节点（可能同时有其他请求创建了节点）
          const recheckNodes = await nodeApi.getNodesByBranchId(branchId);
          if (recheckNodes && recheckNodes.length > 0) {
            console.log('重新检查发现节点：', recheckNodes.length);
            setNodes(recheckNodes);
            // 将节点数据传递给父组件
            if (onNodesChange) {
              onNodesChange(recheckNodes);
            }
          }
        }
      } catch (error) {
        console.error('获取节点失败:', error);
      }
    };
    
    fetchNodes();
  }, [branchId, onNodesChange]);
  
  // 计算节点位置并记录最大Y坐标
  const calculateNodePositions = useCallback(() => {
    if (!nodes.length) return { positionedNodes: [], maxY: 0 };
    
    // 找出主节点并按position排序
    const mainNodes = [...nodes]
      .filter(node => node.type === 'main')
      .sort((a, b) => a.position - b.position);
    
    const positionedNodes = [];
    let currentY = 80; // 减小起始Y坐标，让内容更靠上
    let maxY = 0; // 跟踪最大Y坐标，确保画布高度足够
    
    // 处理主节点
    mainNodes.forEach((mainNode) => {
      // 定位主节点 - 距离左侧更近
      const mainNodePos = {
        x: 100, // 更靠近左侧
        y: currentY,
        width: MAIN_NODE_WIDTH,
        height: MAIN_NODE_HEIGHT
      };
      
      positionedNodes.push({
        ...mainNode,
        position: mainNodePos
      });
      
      // 递归处理子节点，从主节点开始
      const childrenHeight = processChildNodes(mainNode.id, mainNodePos.x + mainNodePos.width + HORIZONTAL_DISTANCE, currentY, 0, positionedNodes);
      
      maxY = Math.max(maxY, mainNodePos.y + mainNodePos.height, childrenHeight);
      
      // 更新Y坐标用于下一个主节点
      // 如果子节点的总高度大于主节点间的标准距离，则使用子节点的总高度来决定下一个主节点的位置
      const nextNodeOffset = Math.max(
        VERTICAL_DISTANCE, 
        childrenHeight > 0 ? childrenHeight - currentY + 80 : 0
      );
      
      currentY += nextNodeOffset;
    });
    
    return { positionedNodes, maxY };
  }, [nodes]);
  
  // 递归处理子节点
  const processChildNodes = (parentId, startX, parentY, level, positionedNodes) => {
    // 找出此节点的所有子节点
    const childNodes = nodes.filter(n => n.parent_id === parentId);
    
    if (childNodes.length === 0) return 0;
    
    let totalHeight = 0;
    let maxChildY = 0;
    
    // 计算子节点总高度（包括间距）
    totalHeight = (childNodes.length * SECONDARY_NODE_HEIGHT) +
                  ((childNodes.length - 1) * SECONDARY_VERTICAL_SPACING);
    
    // 使子节点在父节点的右侧居中排列
    const startY = parentY - (totalHeight / 2) + (MAIN_NODE_HEIGHT / 2);
    
    // 为了保持子节点之间的连接，按相对位置/索引排序
    const sortedChildren = [...childNodes].sort((a, b) => {
      if (typeof a.position === 'number' && typeof b.position === 'number') {
        return a.position - b.position;
      }
      return 0; // 如果没有位置属性，保持原始顺序
    });
    
    sortedChildren.forEach((childNode, index) => {
      // 计算此子节点的垂直位置
      const childY = startY + (index * (SECONDARY_NODE_HEIGHT + SECONDARY_VERTICAL_SPACING));
      
      // 确定节点大小，所有非主节点统一使用二级节点尺寸
      const childNodePos = {
        x: startX,
        y: childY,
        width: SECONDARY_NODE_WIDTH,
        height: SECONDARY_NODE_HEIGHT
      };
      
      positionedNodes.push({
        ...childNode,
        position: childNodePos
      });
      
      // 递归处理此节点的子节点，每一级向右移动固定距离
      const nextLevelX = childNodePos.x + childNodePos.width + HORIZONTAL_DISTANCE;
      
      // 如果是水平排列的子节点序列，应该在当前节点右侧的同一高度位置
      let childStartY = childY;
      if (childNode.type === 'secondary' || childNode.type === 'tertiary') {
        // 对于二级及更高级别的节点，子节点应该水平排列
        childStartY = childY;
      }
      
      const childMaxY = processChildNodes(childNode.id, nextLevelX, childStartY, level + 1, positionedNodes);
      
      maxChildY = Math.max(maxChildY, childMaxY, childY + childNodePos.height);
    });
    
    return maxChildY;
  };
  
  // 监听节点变化，动态调整画布高度
  useEffect(() => {
    if (nodes.length === 0) return; // 如果没有节点，不需要调整画布
    
    const { maxY } = calculateNodePositions();
    if (maxY === 0) return; // 如果计算结果为0，不进行调整
    
    // 计算需要的高度，加上一些底部边距
    const requiredHeight = maxY + 100;
    
    // 计算可见区域高度（减去上下边距和其他UI元素）
    const availableHeight = window.innerHeight - 100; // 假设顶部有约80px的空间被其他元素占用
    
    // 取可见区域高度和所需高度的较大值，确保有足够的空间
    const newHeight = Math.max(availableHeight, requiredHeight);
    
    // 只在高度发生显著变化时更新
    if (Math.abs(newHeight - canvasSize.height) > 50) {
      setCanvasSize(prev => ({ ...prev, height: newHeight }));
    }
  }, [nodes, calculateNodePositions, canvasSize.height]);
  
  // 计算边的位置
  const calculateEdges = useCallback(() => {
    if (!nodes.length) return { edges: [], positionedNodes: [] };
    
    const { positionedNodes } = calculateNodePositions();
    const edges = [];
    
    // 辅助函数：获取节点的具体类型和层级
    const getNodeLevel = (node) => {
      if (node.type === 'main') return 1;
      if (node.type === 'secondary') return 2;
      if (node.type === 'tertiary') return 3;
      return 4; // 更高层级
    };
    
    // 辅助函数：判断两个节点是否为兄弟节点（同父同类型）
    const areSiblings = (node1, node2) => {
      return node1.parent_id === node2.parent_id && 
             node1.type === node2.type;
    };
    
    // 辅助函数：判断节点2是否是节点1的直接子节点
    const isDirectChild = (parent, child) => {
      return child.parent_id === parent.id;
    };

    // 第一步：只处理主节点之间的连接（主节点序列）
    const mainNodes = positionedNodes
      .filter(node => node.type === 'main')
      .sort((a, b) => a.position - b.position);
    
    for (let i = 0; i < mainNodes.length - 1; i++) {
      const source = mainNodes[i];
      const target = mainNodes[i + 1];
      
      edges.push({
        id: `${source.id}-${target.id}`,
        source: source.id,
        target: target.id,
        sourcePosition: {
          x: source.position.x + source.position.width / 2,
          y: source.position.y + source.position.height,
        },
        targetPosition: {
          x: target.position.x + target.position.width / 2,
          y: target.position.y,
        },
        type: 'main'
      });
    }
    
    // 第二步：为每个节点创建到其直接子节点的连接（父子关系）
    positionedNodes.forEach(parentNode => {
      // 获取此节点的直接子节点
      const directChildren = positionedNodes.filter(node => isDirectChild(parentNode, node));
      
      // 为每个直接子节点创建一条连接
      directChildren.forEach(childNode => {
        // 确定连接类型
        let connectionType;
        const parentLevel = getNodeLevel(parentNode);
        const childLevel = getNodeLevel(childNode);
        
        if (parentLevel === 1 && childLevel === 2) {
          connectionType = 'secondary'; // 主节点到二级节点
        } else if (parentLevel === 2 && childLevel === 3) {
          connectionType = 'tertiary'; // 二级节点到三级节点
        } else {
          connectionType = 'tertiary'; // 更高级别的连接
        }
        
        edges.push({
          id: `${parentNode.id}-${childNode.id}`,
          source: parentNode.id,
          target: childNode.id,
          sourcePosition: {
            x: parentNode.position.x + parentNode.position.width,
            y: parentNode.position.y + parentNode.position.height / 2,
          },
          targetPosition: {
            x: childNode.position.x,
            y: childNode.position.y + childNode.position.height / 2,
          },
          type: connectionType
        });
      });
    });
    
    // 第三步：单独处理相同父节点下的同级节点之间的连接（兄弟关系）
    positionedNodes.forEach(node => {
      // 找出与当前节点是同级的节点（同父同类型）
      const siblings = positionedNodes.filter(n => 
        n.id !== node.id && areSiblings(node, n)
      );
      
      if (siblings.length === 0) return;
      
      // 找出相邻的节点
      // 对于水平排列的节点，寻找X坐标大于当前节点且最接近的
      // 对于垂直排列的节点，寻找Y坐标大于当前节点且最接近的
      let adjacentSibling = null;
      const nodeLevel = getNodeLevel(node);
      
      if (nodeLevel === 1) {
        // 主节点是垂直排列
        const candidateSiblings = siblings.filter(s => s.position.y > node.position.y);
        if (candidateSiblings.length > 0) {
          adjacentSibling = candidateSiblings.sort((a, b) => 
            a.position.y - b.position.y
          )[0];
        }
      } else if (nodeLevel >= 2) {
        // 二级及以上节点通常是水平排列
        const candidateSiblings = siblings.filter(s => s.position.x > node.position.x);
        if (candidateSiblings.length > 0) {
          adjacentSibling = candidateSiblings.sort((a, b) => 
            a.position.x - b.position.x
          )[0];
        }
      }
      
      // 如果找到了相邻节点，创建连接
      if (adjacentSibling) {
        // 根据节点排列方向决定连接样式
        let sourcePosition, targetPosition;
        
        if (nodeLevel === 1) {
          // 主节点垂直连接
          sourcePosition = {
            x: node.position.x + node.position.width / 2,
            y: node.position.y + node.position.height,
          };
          targetPosition = {
            x: adjacentSibling.position.x + adjacentSibling.position.width / 2,
            y: adjacentSibling.position.y,
          };
        } else {
          // 二级及以上节点水平连接
          sourcePosition = {
            x: node.position.x + node.position.width,
            y: node.position.y + node.position.height / 2,
          };
          targetPosition = {
            x: adjacentSibling.position.x,
            y: adjacentSibling.position.y + adjacentSibling.position.height / 2,
          };
        }
        
        // 检查是否已经存在这条连接
        const connectionId = `${node.id}-${adjacentSibling.id}-sibling`;
        const existingEdge = edges.find(e => e.id === connectionId);
        
        // 如果不存在，添加新连接
        if (!existingEdge) {
          edges.push({
            id: connectionId,
            source: node.id,
            target: adjacentSibling.id,
            sourcePosition,
            targetPosition,
            type: 'siblings'
          });
        }
      }
    });
    
    return { edges, positionedNodes };
  }, [calculateNodePositions, nodes]);
  
  // 选择节点
  const handleSelectNode = (node) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
    setSelectedEdge(null); // 取消选择边
  };
  
  // 选择边
  const handleSelectEdge = (edge) => {
    setSelectedEdge(edge.id === selectedEdge ? null : edge.id);
    setSelectedNode(null); // 取消选择节点
  };
  
  // 打开添加主节点对话框
  const handleAddMainNode = (parentNode) => {
    // 先记录当前的父节点
    setCurrentParentNode(parentNode);
    // 设置要创建的节点类型
    setNodeTypeToCreate('main');
    // 设置对话框类型为创建
    setNodeDialogType('create');
    // 打开节点对话框
    setNodeDialogOpen(true);
  };
  
  // 打开添加二级节点对话框
  const handleAddSecondaryNode = (parentNode) => {
    // 先记录当前的父节点
    setCurrentParentNode(parentNode);
    // 设置要创建的节点类型
    setNodeTypeToCreate('secondary');
    // 设置对话框类型为创建
    setNodeDialogType('create');
    // 打开节点对话框
    setNodeDialogOpen(true);
  };
  
  // 打开编辑节点对话框
  // eslint-disable-next-line no-unused-vars
  const handleEditNode = (node) => {
    setEditingNode(node);
    setNodeDialogType('edit');
    setNodeDialogOpen(true);
  };
  
  // 处理保存或创建节点
  const handleSaveNode = async (nodeData) => {
    try {
      if (nodeDialogType === 'create') {
        await createNode(nodeData);
      } else {
        await updateNode(nodeData);
      }
      
      setNodeDialogOpen(false);
      setEditingNode(null);
      setCurrentParentNode(null);
    } catch (error) {
      console.error('操作节点失败:', error);
    }
  };
  
  // 创建新节点
  const createNode = async (nodeData) => {
    try {
      let newNode = null;
      
      console.log('创建节点类型:', nodeTypeToCreate, '父节点类型:', currentParentNode?.type);
      
      // 处理不同的节点创建情况
      // 情况1: 二级、三级或更高级别节点添加后续节点（同级节点）
      if (currentParentNode && 
          (currentParentNode.type === 'secondary' || currentParentNode.type === 'tertiary' || currentParentNode.type === 'third_level') && 
          nodeTypeToCreate === 'main') {
        
        // 查找当前节点的所有同级节点
        const siblings = nodes.filter(n => 
          n.parent_id === currentParentNode.parent_id && 
          n.type === currentParentNode.type
        );
        
        let nodeType = currentParentNode.type; // 默认与父节点类型相同
        
        newNode = {
          name: nodeData.name,
          description: nodeData.description,
          type: nodeType, // 使用相同的节点类型
          parent_id: currentParentNode.parent_id, // 使用相同的父节点
          branch_id: branchId,
          position: siblings.length, // 放在同级节点的最后
          status: 'in_progress'
        };
        console.log('创建同级节点:', newNode);
      } 
      // 情况2: 二级、三级或更高级别节点添加子节点
      else if (currentParentNode && 
               (currentParentNode.type === 'secondary' || currentParentNode.type === 'tertiary' || currentParentNode.type === 'third_level') && 
               nodeTypeToCreate === 'secondary') {
        
        // 根据父节点类型确定子节点类型
        let childType = 'tertiary'; // 默认为三级节点
        
        // 如果父节点已经是三级或更高级别，继续使用tertiary类型
        if (currentParentNode.type === 'tertiary' || currentParentNode.type === 'third_level') {
          childType = 'tertiary';
        }
        
        newNode = {
          name: nodeData.name,
          description: nodeData.description,
          type: childType,
          parent_id: currentParentNode.id, // 使用当前节点ID作为父节点
          branch_id: branchId,
          position: 0,
          status: 'in_progress'
        };
        console.log('创建子节点:', newNode);
      }
      // 情况3: 主节点添加后续主节点
      else if (nodeTypeToCreate === 'main') {
        const mainNodes = nodes.filter(node => node.type === 'main');
        let position = 0;
        
        if (currentParentNode) {
          position = currentParentNode.position + 1;
          
          // 更新后续节点的位置
          for (const node of mainNodes) {
            if (node.position >= position) {
              await nodeApi.updateNode(node.id, {
                ...node,
                position: node.position + 1
              });
            }
          }
        } else {
          position = mainNodes.length;
        }
        
        newNode = {
          name: nodeData.name,
          description: nodeData.description,
          type: 'main',
          parent_id: null,
          branch_id: branchId,
          position,
          status: 'in_progress'
        };
        console.log('创建主节点:', newNode);
      }
      // 情况4: 主节点添加二级节点
      else if (nodeTypeToCreate === 'secondary') {
        newNode = {
          name: nodeData.name,
          description: nodeData.description,
          type: 'secondary',
          parent_id: currentParentNode.id,
          branch_id: branchId,
          position: 0,
          status: 'in_progress'
        };
        console.log('创建二级节点:', newNode);
      }
      
      // 创建新节点
      if (newNode) {
        const createdNode = await nodeApi.createNode(newNode);
        console.log('节点创建成功:', createdNode);
        
        // 刷新节点列表
        const updatedNodes = await nodeApi.getNodesByBranchId(branchId);
        setNodes(updatedNodes);
        // 将节点数据传递给父组件
        if (onNodesChange) {
          onNodesChange(updatedNodes);
        }
      } else {
        console.error('无法创建节点，未确定节点类型');
      }
    } catch (error) {
      console.error('创建节点失败:', error);
    }
  };
  
  // 更新节点
  const updateNode = async (nodeData) => {
    if (!editingNode) return;
    
    // 更新节点信息
    const updatedNode = {
      ...editingNode,
      name: nodeData.name,
      description: nodeData.description,
      status: nodeData.status
    };
    
    const updatedNodeData = await nodeApi.updateNode(editingNode.id, updatedNode);
    
    // 刷新节点列表
    const updatedNodes = await nodeApi.getNodesByBranchId(branchId);
    setNodes(updatedNodes);
    // 将节点数据传递给父组件
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
  };
  
  // 删除节点
  // eslint-disable-next-line no-unused-vars
  const handleDeleteNode = async () => {
    if (!selectedNode) return;
    
    try {
      const nodeToDelete = nodes.find(node => node.id === selectedNode);
      
      if (!nodeToDelete) return;
      
      // 如果是主节点，需要先检查是否有关联的二级节点
      if (nodeToDelete.type === 'main') {
        const childNodes = nodes.filter(node => node.parent_id === nodeToDelete.id);
        if (childNodes.length > 0) {
          alert('请先删除所有关联的二级节点');
          return;
        }
        
        // 更新后续主节点的位置
        const nodesToUpdate = nodes.filter(
          node => node.type === 'main' && node.position > nodeToDelete.position
        );
        
        for (const node of nodesToUpdate) {
          await nodeApi.updateNode(node.id, {
            ...node,
            position: node.position - 1
          });
        }
      }
      
      // 删除节点
      await nodeApi.deleteNode(nodeToDelete.id);
      
      // 刷新节点列表
      const updatedNodes = await nodeApi.getNodesByBranchId(branchId);
      setNodes(updatedNodes);
      
      // 清除选中状态
      setSelectedNode(null);
      // 将节点数据传递给父组件
      if (onNodesChange) {
        onNodesChange(updatedNodes);
      }
    } catch (error) {
      console.error('删除节点失败:', error);
    }
  };
  
  // 缩放控制
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // 画布点击事件 - 取消所有选择
  const handleCanvasClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };
  
  // 获取当前选中的节点
  // eslint-disable-next-line no-unused-vars
  const getSelectedNodeData = () => {
    return nodes.find(node => node.id === selectedNode);
  };
  
  // 计算节点和边
  const { edges, positionedNodes } = calculateEdges();
  
  return (
    <Box className="flowchart-container">
      {/* 缩放控制 */}
      <Box className="zoom-controls">
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<ZoomInIcon />}
          onClick={handleZoomIn}
        >
          放大
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<ZoomOutIcon />}
          onClick={handleZoomOut}
        >
          缩小
        </Button>
        <Typography variant="caption">
          缩放: {Math.round(scale * 100)}%
        </Typography>
      </Box>
      
      {/* 流程图画布 */}
      <Box
        ref={canvasRef}
        className="flowchart-canvas"
        onClick={handleCanvasClick}
      >
        <Box
          className="flowchart-content"
          sx={{
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {/* 渲染连接线 */}
          <svg 
            width={canvasSize.width} 
            height={canvasSize.height}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {edges.map(edge => {
              const isSelected = edge.id === selectedEdge;
              
              // 为源节点和目标节点添加位置信息
              const sourceNode = positionedNodes.find(n => n.id === edge.source);
              const targetNode = positionedNodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              return (
                <g key={edge.id} className={`flowchart-edge ${isSelected ? 'selected' : ''}`}>
                  <Edge
                    sourcePosition={edge.sourcePosition}
                    targetPosition={edge.targetPosition}
                    type={edge.type}
                    selected={isSelected}
                    onClick={() => handleSelectEdge(edge)}
                  />
                </g>
              );
            })}
          </svg>
          
          {/* 渲染节点 */}
          {positionedNodes.map(node => (
            <Node
              key={node.id}
              node={node}
              position={node.position}
              selected={node.id === selectedNode}
              onSelect={() => handleSelectNode(node)}
              onAddMainNode={handleAddMainNode}
              onAddSecondaryNode={handleAddSecondaryNode}
            />
          ))}
        </Box>
      </Box>
      
      {/* 节点对话框 */}
      <NodeDialog
        open={nodeDialogOpen}
        onClose={() => {
          setNodeDialogOpen(false);
          setEditingNode(null);
          setCurrentParentNode(null);
        }}
        onSave={handleSaveNode}
        node={editingNode}
        dialogType={nodeDialogType}
      />
    </Box>
  );
};

export default Flowchart; 