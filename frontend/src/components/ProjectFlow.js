import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, Background, MiniMap, 
  addEdge, useNodesState, useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FiPlus } from 'react-icons/fi';
import { createNode } from '../services/api';

// 自定义节点
const MainNode = ({ data }) => (
  <div className="main-node">
    {data.label}
    {data.onAddSubNode && (
      <div 
        className="add-button add-right"
        onClick={data.onAddSubNode}
      >
        <FiPlus />
      </div>
    )}
    {data.onAddNextNode && (
      <div 
        className="add-button add-bottom"
        onClick={data.onAddNextNode}
      >
        <FiPlus />
      </div>
    )}
  </div>
);

const SubNode = ({ data }) => {
  const statusClass = `status-${data.status || 'in-progress'}`;
  
  return (
    <div className={`sub-node ${statusClass}`}>
      {data.label}
      {data.onAddSubNode && (
        <div 
          className="add-button add-right"
          onClick={data.onAddSubNode}
        >
          <FiPlus />
        </div>
      )}
      {data.onAddNextNode && (
        <div 
          className="add-button add-bottom"
          onClick={data.onAddNextNode}
        >
          <FiPlus />
        </div>
      )}
    </div>
  );
};

// 节点类型映射
const nodeTypes = {
  mainNode: MainNode,
  subNode: SubNode,
};

const ProjectFlow = ({ project, onNodeClick, onNodeAdded, onAddBranch }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedBranch, setSelectedBranch] = useState(
    project.branches.length > 0 ? project.branches[0].id : null
  );

  // 将项目数据转换为React Flow节点和边
  React.useEffect(() => {
    if (!project || !project.branches || project.branches.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // 找到当前选中的分支
    const activeBranch = project.branches.find(branch => branch.id === selectedBranch) || project.branches[0];
    if (!activeBranch) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const flowNodes = [];
    const flowEdges = [];
    const nodeMap = new Map();
    
    // 添加每个分支作为一个水平行
    let branchStartX = 50;
    const branchStartY = 50;
    const branchSpacing = 200;

    project.branches.forEach((branch, branchIndex) => {
      // 分支标题节点
      const branchTitleNodeId = `branch-${branch.id}`;
      flowNodes.push({
        id: branchTitleNodeId,
        type: 'mainNode',
        position: { x: branchStartX, y: branchStartY + branchIndex * branchSpacing },
        data: { 
          label: branch.name,
          isTitle: true,
          status: 'in_progress'
        },
      });
      
      // 如果是当前选中的分支，添加其所有节点
      if (branch.id === activeBranch.id) {
        // 排序节点：先主节点，按垂直位置排序
        const mainNodes = branch.nodes
          .filter(node => node.level === 1)
          .sort((a, b) => a.position_y - b.position_y);
        
        // 初始布局位置
        let currentX = branchStartX + 200;
        const startY = branchStartY + branchIndex * branchSpacing;
        const xSpacing = 200;
        const ySpacing = 100;
        
        // 添加主节点
        mainNodes.forEach((node, nodeIndex) => {
          const nodeId = node.id;
          const position = { 
            x: node.position_x || currentX, 
            y: node.position_y || startY
          };
          
          flowNodes.push({
            id: nodeId,
            type: 'mainNode',
            position,
            data: { 
              label: node.name,
              status: node.status,
              onAddSubNode: () => handleAddNode(branch.id, nodeId, 'sub'),
              onAddNextNode: () => handleAddNode(branch.id, nodeId, 'main')
            },
          });
          
          nodeMap.set(nodeId, position);
          
          // 添加与前一个节点的连接
          if (nodeIndex > 0) {
            flowEdges.push({
              id: `e-${mainNodes[nodeIndex - 1].id}-${nodeId}`,
              source: mainNodes[nodeIndex - 1].id,
              target: nodeId,
              type: 'smoothstep',
            });
          }
          
          currentX += xSpacing;
          
          // 添加子节点
          const childNodes = branch.nodes
            .filter(n => n.parent_id === nodeId)
            .sort((a, b) => a.position_x - b.position_x);
          
          let subX = position.x + 150;
          let subY = position.y;
          
          childNodes.forEach((childNode, childIndex) => {
            const childId = childNode.id;
            const childPosition = { 
              x: childNode.position_x || subX, 
              y: childNode.position_y || subY
            };
            
            flowNodes.push({
              id: childId,
              type: 'subNode',
              position: childPosition,
              data: { 
                label: childNode.name,
                status: childNode.status,
                onAddSubNode: () => handleAddNode(branch.id, childId, 'sub'),
                onAddNextNode: () => handleAddNode(branch.id, childId, 'sub-next')
              },
            });
            
            nodeMap.set(childId, childPosition);
            
            // 添加与父节点或前一个子节点的连接
            if (childIndex === 0) {
              // 第一个子节点连接到父节点
              flowEdges.push({
                id: `e-${nodeId}-${childId}`,
                source: nodeId,
                target: childId,
                type: 'smoothstep',
              });
            } else {
              // 其他子节点连接到前一个子节点
              flowEdges.push({
                id: `e-${childNodes[childIndex - 1].id}-${childId}`,
                source: childNodes[childIndex - 1].id,
                target: childId,
                type: 'smoothstep',
              });
            }
            
            subX += 150;
            
            // 处理更深层次的子节点（递归）
            const subChildNodes = branch.nodes
              .filter(n => n.parent_id === childId)
              .sort((a, b) => a.position_y - b.position_y);
            
            let deepSubX = childPosition.x;
            let deepSubY = childPosition.y + 80;
            
            subChildNodes.forEach((subChild, subChildIndex) => {
              const subChildId = subChild.id;
              const subChildPosition = { 
                x: subChild.position_x || deepSubX, 
                y: subChild.position_y || deepSubY
              };
              
              flowNodes.push({
                id: subChildId,
                type: 'subNode',
                position: subChildPosition,
                data: { 
                  label: subChild.name,
                  status: subChild.status,
                  onAddSubNode: () => handleAddNode(branch.id, subChildId, 'sub'),
                  onAddNextNode: () => handleAddNode(branch.id, subChildId, 'sub-next')
                },
              });
              
              nodeMap.set(subChildId, subChildPosition);
              
              // 连接到父节点
              flowEdges.push({
                id: `e-${childId}-${subChildId}`,
                source: childId,
                target: subChildId,
                type: 'smoothstep',
              });
              
              deepSubY += 80;
            });
          });
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [project, selectedBranch]);

  // 处理节点添加
  const handleAddNode = async (branchId, parentId, type) => {
    try {
      const nodeName = type === 'main' ? 'New Step' : 'New Task';
      
      // 计算新节点位置
      const parentNode = nodes.find(n => n.id === parentId);
      let position_x = 0;
      let position_y = 0;
      let level = 1;
      let parent_id = null;
      
      if (parentNode) {
        if (type === 'main') {
          // 主节点在下方
          position_x = parentNode.position.x;
          position_y = parentNode.position.y + 150;
          level = 1;
        } else if (type === 'sub') {
          // 子节点在右侧
          position_x = parentNode.position.x + 150;
          position_y = parentNode.position.y;
          level = parentNode.data.status !== undefined ? 2 : 2; // 根据父节点类型判断
          parent_id = parentId;
        } else if (type === 'sub-next') {
          // 同级子节点在下方
          position_x = parentNode.position.x;
          position_y = parentNode.position.y + 80;
          level = 2;
          parent_id = parentNode.data.parentId || parentId;
        }
      }
      
      const newNode = {
        name: nodeName,
        branch_id: branchId,
        parent_id,
        level,
        status: 'in_progress',
        position_x,
        position_y
      };
      
      await createNode(branchId, newNode);
      
      // 刷新节点
      if (onNodeAdded) {
        onNodeAdded();
      }
    } catch (error) {
      console.error('Error adding node:', error);
    }
  };

  // 处理分支切换
  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
  };

  // 处理节点点击
  const onNodeClickHandler = (_, node) => {
    // 对于标题节点不执行操作
    if (node.data.isTitle) return;
    
    // 查找完整的节点数据
    const selectedBranchData = project.branches.find(b => b.id === selectedBranch);
    if (!selectedBranchData) return;
    
    const nodeData = selectedBranchData.nodes.find(n => n.id === node.id);
    if (nodeData && onNodeClick) {
      onNodeClick(nodeData);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 分支选择器 */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex space-x-2">
          {project.branches.map(branch => (
            <button
              key={branch.id}
              onClick={() => handleBranchChange(branch.id)}
              className={`px-4 py-1 rounded-md ${
                selectedBranch === branch.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {branch.name}
            </button>
          ))}
        </div>
        <button
          onClick={onAddBranch}
          className="flex items-center gap-1 text-sm text-primary hover:text-opacity-80"
        >
          <FiPlus /> 添加分支
        </button>
      </div>
      
      {/* 流程图 */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClickHandler}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ProjectFlow; 