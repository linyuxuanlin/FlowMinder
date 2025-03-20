import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
  addEdge, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createNode, getNodes } from '../services/api';

const ProjectFlow = ({ project, selectedBranch, onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const lastBranchIdRef = useRef(null);

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
      
      const branchNodes = await getNodes(selectedBranch.id);
      console.log('Received branch nodes:', branchNodes);
      
      if (branchNodes && branchNodes.length > 0) {
        // 转换节点为React Flow格式
        const flowNodes = branchNodes.map(node => ({
          id: node.id,
          type: 'default',
          position: { x: node.position_x || 0, y: node.position_y || 0 },
          data: { 
            label: node.name, 
            description: node.description,
            level: node.level,
            status: node.status,
            taskId: node.task_id,
            nodeType: node.level === 0 ? 'main' : 'sub',
          },
          className: `flow-node ${node.level === 0 ? 'main-node' : 'sub-node'} ${node.status || 'default'}`
        }));

        // 为相连节点创建边
        const flowEdges = [];
        branchNodes.forEach(node => {
          if (node.parent_id) {
            flowEdges.push({
              id: `e-${node.parent_id}-${node.id}`,
              source: node.parent_id,
              target: node.id,
              animated: true,
              style: { stroke: '#555' }
            });
          }
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
      // 只有在分支改变时才清空节点，避免频繁的状态更新
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
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [setEdges]);

  // 处理节点选择
  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  }, [onNodeSelect]);

  // 计算新节点的位置
  const calculateNodePosition = (isMainNode = false) => {
    const defaultX = 250;
    const defaultY = 100;
    
    // 如果没有现有节点，返回默认位置
    if (nodesRef.current.length === 0) {
      return { x: defaultX, y: defaultY };
    }
    
    // 判断要创建的是主节点还是子节点
    if (isMainNode) {
      // 查找最右侧的主节点
      const mainNodes = nodesRef.current.filter(node => node.data.level === 0);
      if (mainNodes.length === 0) {
        return { x: defaultX, y: defaultY };
      }
      
      // 找到最右侧的主节点，新主节点放在其右侧
      const rightmostNode = mainNodes.reduce((max, node) => 
        node.position.x > max.position.x ? node : max, mainNodes[0]);
      return { x: rightmostNode.position.x + 250, y: rightmostNode.position.y };
    } else {
      // 如果选中了节点，新子节点放在其下方
      if (selectedNode) {
        // 查找与选中节点关联的所有子节点
        const childNodes = nodesRef.current.filter(node => 
          edgesRef.current.some(edge => 
            edge.source === selectedNode.id && edge.target === node.id
          )
        );
        
        if (childNodes.length === 0) {
          // 如果没有子节点，放在正下方
          return { x: selectedNode.position.x, y: selectedNode.position.y + 150 };
        } else {
          // 如果有子节点，找到最下方的子节点，新节点放在其下方
          const bottomChild = childNodes.reduce((max, node) => 
            node.position.y > max.position.y ? node : max, childNodes[0]);
          return { x: selectedNode.position.x, y: bottomChild.position.y + 150 };
        }
      } else {
        // 如果没有选中节点，默认位置
        return { x: defaultX, y: defaultY };
      }
    }
  };

  // 创建新节点
  const createNewNode = async (nodeType) => {
    if (!selectedBranch) {
      console.error('No branch selected');
      alert('请先选择一个分支');
      return;
    }

    try {
      let nodeName = nodeType === 'main' ? '主要里程碑' : '子任务';
      let position = calculateNodePosition(nodeType === 'main');
      
      // 如果分支中没有节点，创建一个"开始"节点
      if (nodesRef.current.length === 0) {
        nodeName = '开始';
      }
      
      console.log(`Creating ${nodeType} node with name "${nodeName}" at position:`, position);
      
      const newNodeData = {
        name: nodeName,
        description: '',
        branch_id: selectedBranch.id,
        level: nodeType === 'main' ? 0 : 1,
        position_x: position.x,
        position_y: position.y,
        status: 'in-progress',
        parent_id: nodeType === 'main' ? null : (selectedNode ? selectedNode.id : null)
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
      <div className="flow-actions" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        <button onClick={() => createNewNode('main')} className="flow-action-btn">
          添加主节点
        </button>
        <button 
          onClick={() => createNewNode('sub')} 
          className="flow-action-btn"
          disabled={!selectedNode}
        >
          添加子节点
        </button>
      </div>
      
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
            onInit={onInit}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            nodesDraggable={true}
            elementsSelectable={true}
            snapToGrid={true}
            snapGrid={[15, 15]}
            style={{ background: '#f5f5f5' }}
          >
            <Controls />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.data?.nodeType === 'main') return '#0041d0';
                if (n.data?.nodeType === 'sub') return '#ff0072';
                return '#eee';
              }}
              nodeColor={(n) => {
                if (n.data?.nodeType === 'main') return '#bbf7d0';
                return '#ffcce3';
              }}
            />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default ProjectFlow; 