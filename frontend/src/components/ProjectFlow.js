import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
  addEdge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FiPlus } from 'react-icons/fi';
import { createNode, getNodes, updateNode } from '../services/api';

// 自定义主节点组件
const MainNodeComponent = ({ data, isConnectable }) => {
  return (
    <div className="main-node">
      <div className="node-content">{data.label}</div>
      
      {/* 右侧添加子节点按钮 */}
      <button 
        className="add-button right-button"
        onClick={data.onAddSubNode}
      >
        <FiPlus />
      </button>
      
      {/* 下方添加后续节点按钮 */}
      <button 
        className="add-button bottom-button"
        onClick={data.onAddNextNode}
      >
        <FiPlus />
      </button>
    </div>
  );
};

// 自定义子节点组件
const SubNodeComponent = ({ data, isConnectable }) => {
  return (
    <div className={`sub-node status-${data.status || 'in-progress'}`}>
      <div className="node-content">{data.label}</div>
      
      {/* 右侧添加子子节点按钮 */}
      <button 
        className="add-button right-button"
        onClick={data.onAddSubNode}
      >
        <FiPlus />
      </button>
      
      {/* 下方添加后续子节点按钮 */}
      <button 
        className="add-button bottom-button"
        onClick={data.onAddNextNode}
      >
        <FiPlus />
      </button>
    </div>
  );
};

const nodeTypes = {
  mainNode: MainNodeComponent,
  subNode: SubNodeComponent,
};

const ProjectFlow = ({ project, selectedBranch, onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const lastBranchIdRef = useRef(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const nodePositionsRef = useRef(new Map());

  // 记录节点初始位置
  const storeNodePosition = (nodeId, position) => {
    nodePositionsRef.current.set(nodeId, { ...position });
  };

  // 处理React Flow初始化
  const onInit = useCallback((instance) => {
    console.log('React Flow initialized:', instance);
    setReactFlowInstance(instance);
  }, []);

  // 加载分支节点
  const loadBranchNodes = useCallback(async () => {
    if (!selectedBranch) return;
    
    // 防止重复加载相同分支
    if (lastBranchIdRef.current === selectedBranch.id && dataLoaded) {
      console.log(`Skipping load for branch ${selectedBranch.id} - already loaded`);
      return;
    }
    
    // 记录当前加载的分支ID
    lastBranchIdRef.current = selectedBranch.id;
    
    try {
      setLoading(true);
      setDataLoaded(false);
      console.log(`Loading nodes for branch: ${selectedBranch.id}`);
      
      let branchNodes = await getNodes(selectedBranch.id);
      console.log('Received branch nodes:', branchNodes);
      
      // 如果分支没有节点，自动创建一个起始节点
      if (!branchNodes || branchNodes.length === 0) {
        console.log('Empty branch detected, creating Start node automatically');
        try {
          const startNodeData = {
            name: 'Start',
            description: '起始节点',
            branch_id: selectedBranch.id,
            parent_id: null,
            level: 0,
            position_x: 250,
            position_y: 100,
            status: 'in-progress'
          };
          
          const result = await createNode(selectedBranch.id, startNodeData);
          console.log('Start node created automatically:', result);
          
          // 等待100毫秒确保数据已经写入
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 重新获取节点
          const updatedNodes = await getNodes(selectedBranch.id);
          console.log('Updated nodes after creating Start node:', updatedNodes);
          
          if (updatedNodes && updatedNodes.length > 0) {
            branchNodes = updatedNodes;
          } else {
            // 如果仍然没有获取到节点，手动创建一个本地节点
            console.log('No nodes returned from API, creating local fallback node');
            branchNodes = [{
              id: 'temp-start-' + Date.now(),
              name: 'Start',
              description: '起始节点',
              branch_id: selectedBranch.id,
              parent_id: null,
              level: 0,
              position_x: 250,
              position_y: 100,
              status: 'in-progress'
            }];
          }
        } catch (error) {
          console.error('Error creating start node:', error);
          // 创建失败时的后备方案：本地创建一个临时节点
          branchNodes = [{
            id: 'temp-start-' + Date.now(),
            name: 'Start',
            description: '起始节点',
            branch_id: selectedBranch.id,
            parent_id: null,
            level: 0,
            position_x: 250,
            position_y: 100,
            status: 'in-progress'
          }];
        }
      }
      
      if (branchNodes && branchNodes.length > 0) {
        // 按层级和垂直位置排序节点
        const sortedMainNodes = branchNodes
          .filter(node => node.level === 0)
          .sort((a, b) => a.position_y - b.position_y);

        const mainColumn = 250;
        const subColumn = 500;
        const verticalSpacing = 150;
        
        // 转换节点为React Flow格式
        const flowNodes = [];
        const flowEdges = [];
        
        // 处理主节点
        sortedMainNodes.forEach((node, index) => {
          // 使用保存的位置或计算新位置
          const position = { 
            x: node.position_x || mainColumn, 
            y: node.position_y || index * verticalSpacing + 100 
          };
          
          // 保存节点的初始位置
          storeNodePosition(node.id, position);
          
          flowNodes.push({
            id: node.id,
            type: 'mainNode',
            position,
            data: { 
              label: node.name,
              description: node.description,
              status: node.status,
              onAddSubNode: () => handleAddNode(node.id, 'sub'),
              onAddNextNode: () => handleAddNode(node.id, 'next'),
            }
          });
          
          // 如果不是第一个节点，添加与前一个主节点的连接
          if (index > 0) {
            flowEdges.push({
              id: `e-${sortedMainNodes[index-1].id}-${node.id}`,
              source: sortedMainNodes[index-1].id,
              target: node.id,
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { strokeWidth: 2 }
            });
          }
          
          // 查找并添加此主节点的子节点
          const childNodes = branchNodes
            .filter(childNode => childNode.parent_id === node.id)
            .sort((a, b) => a.position_y - b.position_y);
            
          childNodes.forEach((childNode, childIndex) => {
            const childPosition = { 
              x: childNode.position_x || subColumn, 
              y: childNode.position_y || position.y + childIndex * 100 
            };
            
            // 保存子节点的初始位置
            storeNodePosition(childNode.id, childPosition);
            
            flowNodes.push({
              id: childNode.id,
              type: 'subNode',
              position: childPosition,
              data: { 
                label: childNode.name,
                description: childNode.description,
                status: childNode.status,
                onAddSubNode: () => handleAddNode(childNode.id, 'sub'),
                onAddNextNode: () => handleAddNode(childNode.id, 'next-sub'),
              }
            });
            
            // 添加从父节点到子节点的连接
            flowEdges.push({
              id: `e-${node.id}-${childNode.id}`,
              source: node.id,
              target: childNode.id,
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { strokeWidth: 2 }
            });
            
            // 处理子节点的子节点 (第三级)
            const grandChildNodes = branchNodes
              .filter(grandChild => grandChild.parent_id === childNode.id)
              .sort((a, b) => a.position_y - b.position_y);
              
            let prevGrandChildId = null;
            
            grandChildNodes.forEach((grandChild, gcIndex) => {
              const grandChildPosition = { 
                x: grandChild.position_x || subColumn + 250, 
                y: grandChild.position_y || childPosition.y + gcIndex * 100 
              };
              
              storeNodePosition(grandChild.id, grandChildPosition);
              
              flowNodes.push({
                id: grandChild.id,
                type: 'subNode',
                position: grandChildPosition,
                data: { 
                  label: grandChild.name,
                  description: grandChild.description,
                  status: grandChild.status,
                  onAddSubNode: () => handleAddNode(grandChild.id, 'sub'),
                  onAddNextNode: () => handleAddNode(grandChild.id, 'next-sub'),
                }
              });
              
              // 添加从父子节点到孙子节点的连接
              flowEdges.push({
                id: `e-${childNode.id}-${grandChild.id}`,
                source: childNode.id,
                target: grandChild.id,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { strokeWidth: 2 }
              });
              
              // 如果不是第一个孙节点，添加与前一个的连接
              if (prevGrandChildId) {
                flowEdges.push({
                  id: `e-${prevGrandChildId}-${grandChild.id}`,
                  source: prevGrandChildId,
                  target: grandChild.id,
                  type: 'smoothstep',
                  markerEnd: { type: MarkerType.ArrowClosed },
                  style: { strokeWidth: 2 }
                });
              }
              
              prevGrandChildId = grandChild.id;
            });
          });
        });

        console.log('Setting flow nodes:', flowNodes.length);
        
        // 直接设置节点和边，避免使用setTimeout引起的闪烁
        setNodes(flowNodes);
        setEdges(flowEdges);
        nodesRef.current = flowNodes;
        edgesRef.current = flowEdges;
        
        // 标记数据已加载完成
        setDataLoaded(true);
        
        // 如果有节点，确保画布适配所有节点
        if (flowNodes.length > 0 && reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2 });
          }, 100);
        }
      } else {
        console.log('No nodes found for this branch');
        // 清空节点和边
        setNodes([]);
        setEdges([]);
        nodesRef.current = [];
        edgesRef.current = [];
      }
    } catch (error) {
      console.error('Error loading branch nodes:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, setNodes, setEdges, reactFlowInstance, dataLoaded]);

  // 当选中分支改变时加载新分支的节点
  useEffect(() => {
    if (selectedBranch) {
      // 只有在分支改变时才清空节点和边数据
      if (lastBranchIdRef.current !== selectedBranch.id) {
        setNodes([]);
        setEdges([]);
        setDataLoaded(false);
      }
      
      loadBranchNodes();
    }
  }, [selectedBranch, loadBranchNodes, setNodes, setEdges]);

  // 处理节点连接
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  // 处理节点点击
  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
    if (onNodeSelect) {
      // 查找完整的节点数据
      if (selectedBranch && selectedBranch.nodes) {
        const nodeData = selectedBranch.nodes.find(n => n.id === node.id);
        if (nodeData) {
          onNodeSelect(nodeData);
        }
      }
    }
  }, [onNodeSelect, selectedBranch]);

  // 处理节点拖动结束 - 保存新位置
  const onNodeDragStop = useCallback((event, node) => {
    const { id, position } = node;
    
    // 查找节点索引
    const nodeIndex = nodesRef.current.findIndex(n => n.id === id);
    if (nodeIndex >= 0) {
      // 更新节点位置
      const updatedNode = {
        ...nodesRef.current[nodeIndex],
        position
      };
      
      // 更新节点列表
      const updatedNodes = [...nodesRef.current];
      updatedNodes[nodeIndex] = updatedNode;
      nodesRef.current = updatedNodes;
      
      // 保存到后端
      updateNode(id, { 
        position_x: position.x,
        position_y: position.y
      }).catch(err => {
        console.error('Error saving node position:', err);
      });
    }
  }, []);

  // 创建新节点
  const handleAddNode = async (parentId, nodeType) => {
    if (!selectedBranch) {
      console.error('No branch selected');
      alert('请先选择一个分支');
      return;
    }

    try {
      // 确定节点名称
      let nodeName;
      let level;
      let position_x;
      let position_y;
      
      // 查找父节点
      const parentNode = nodesRef.current.find(node => node.id === parentId);
      if (!parentNode) {
        console.error('Parent node not found');
        return;
      }
      
      // 根据节点类型设置位置和级别
      if (nodeType === 'next') {
        // 添加下一个主节点
        nodeName = '主步骤';
        level = 0;
        position_x = parentNode.position.x;
        position_y = parentNode.position.y + 150;
        parentId = null; // 主节点没有父节点
      } else if (nodeType === 'sub') {
        // 添加子节点
        nodeName = '子任务';
        level = 1;
        position_x = parentNode.position.x + 250;
        position_y = parentNode.position.y;
      } else if (nodeType === 'next-sub') {
        // 添加下一个子节点
        nodeName = '子任务';
        level = 1;
        position_x = parentNode.position.x;
        position_y = parentNode.position.y + 100;
      }
      
      console.log(`Creating ${nodeType} node with name "${nodeName}" at position: (${position_x}, ${position_y})`);
      
      const newNodeData = {
        name: nodeName,
        description: '',
        branch_id: selectedBranch.id,
        parent_id: nodeType === 'next' ? null : parentId,
        level,
        position_x,
        position_y,
        status: 'in-progress'
      };
      
      await createNode(selectedBranch.id, newNodeData);
      console.log('Node created, reloading nodes');
      
      // 设置为未加载状态，以便重新加载节点数据
      setDataLoaded(false);
      
      // 重新加载节点以确保UI更新
      await loadBranchNodes();
      
    } catch (error) {
      console.error('Error creating node:', error);
      alert(`创建节点失败: ${error.message}`);
    }
  };

  return (
    <div className="project-flow-container" style={{ width: '100%', height: '100%' }}>      
      <div className="react-flow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
        {loading && !dataLoaded ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">加载节点中...</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onInit={onInit}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            nodesDraggable={true}
            elementsSelectable={true}
            style={{ background: '#f8f8f8' }}
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default ProjectFlow; 