import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactFlow, { 
  Background, 
  Controls, 
  ConnectionLineType, 
  Node, 
  Edge, 
  ReactFlowInstance,
  MarkerType,
  NodeDragHandler,
  useNodesState,
  useEdgesState,
  getIncomers,
  getOutgoers
} from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import Sidebar from '../layout/Sidebar';

interface Project {
  _id: string;
  name: string;
  description: string;
  configPath: string;
  localPath: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  isMainNode: boolean;
  parentId: string | null;
  projectId: string;
  filePath: string;
  updatedAt: string;
}

interface FlowConfig {
  nodes: any[];
  edges: any[];
}

// 更新自定义节点组件，始终渲染按钮但通过CSS控制可见性
const CustomNode = ({ data }: { data: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative node-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: '100%', height: '100%' }}
    >
      <div className="p-2">
        {data.label}
      </div>
      
      <div 
        className={`add-button absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                   w-6 h-6 bg-white rounded-full flex items-center justify-center 
                   border border-gray-300 hover:border-blue-500 hover:bg-blue-50 
                   shadow-sm z-50 transition-opacity duration-200
                   ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          const projectId = data.task.projectId;
          window.location.href = `/projects/${projectId}/tasks/new?parentId=${data.task._id}`;
        }}
      >
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 font-bold text-sm">+</span>
      </div>
    </div>
  );
};

const API_URL = 'http://localhost:5000';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [showPathEditor, setShowPathEditor] = useState<boolean>(false);
  const [newLocalPath, setNewLocalPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const initialNodePositions = useRef<Map<string, { x: number, y: number }>>(new Map());

  // 设置自定义节点类型
  const nodeTypes = {
    default: CustomNode
  };

  // 添加branch的概念
  const [branches, setBranches] = useState<string[]>(['Branch 1', 'Branch 2']);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projects/${id}`);
        setProject(res.data.project);
        setTasks(res.data.tasks);
        
        // 将后端数据转换为ReactFlow格式
        const nodes = createGraphNodes(res.data.tasks);
        const edges = createGraphEdges(res.data.tasks);
        
        setNodes(nodes);
        setEdges(edges);
        
        // 保存初始节点位置
        nodes.forEach(node => {
          initialNodePositions.current.set(node.id, { ...node.position });
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('加载项目详情失败，请稍后重试');
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id, setNodes, setEdges]);

  const createGraphNodes = (tasks: Task[]): Node[] => {
    // 按主线和支线分组
    const mainNodes = tasks.filter(task => task.isMainNode);
    const subNodes = tasks.filter(task => !task.isMainNode);
    
    // 创建分支，如果没有足够的主节点，就使用默认分支
    const branchCount = Math.max(1, Math.ceil(mainNodes.length / 2));
    const activeBranches = branches.slice(0, branchCount);
    
    // 为每个分支创建主线节点
    const mainNodesPositioned: Node[] = [];
    let nodeCounter = 0;
    
    activeBranches.forEach((branchName, branchIndex) => {
      // 为每个分支创建分支标题节点
      mainNodesPositioned.push({
        id: `branch-${branchIndex}`,
        data: { 
          label: branchName,
          task: {
            _id: `branch-${branchIndex}`,
            title: branchName,
            isMainNode: true,
            projectId: id || ''
          },
          isHeaderNode: true
        },
        position: { x: branchIndex * 350, y: 0 },
        type: 'default',
        draggable: false,
        style: {
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '5px',
          padding: '10px',
          width: 180,
          fontWeight: 'bold',
          opacity: 0.8,
        }
      });
      
      // 为该分支分配主节点
      const branchMainNodes = mainNodes.filter((_, index) => 
        Math.floor(index / 2) === branchIndex && index < branchCount * 2
      );
      
      // 垂直排列每个分支下的主节点
      branchMainNodes.forEach((task, taskIndex) => {
        mainNodesPositioned.push({
          id: task._id,
          data: { 
            label: task.title,
            task,
            isMainNode: true
          },
          position: { x: branchIndex * 350, y: 100 + taskIndex * 200 },
          type: 'default',
          draggable: true,
          style: {
            background: '#f5e0c3',
            border: '2px solid #d4a76a',
            borderRadius: '5px',
            padding: '10px',
            width: 180,
            fontWeight: 'bold',
          }
        });
        
        nodeCounter++;
      });
    });
    
    // 为支线节点分配位置（基于父节点）
    const subNodesMap = new Map<string, Task[]>();
    subNodes.forEach(task => {
      if (task.parentId) {
        const tasks = subNodesMap.get(task.parentId) || [];
        tasks.push(task);
        subNodesMap.set(task.parentId, tasks);
      }
    });
    
    const subNodesPositioned: Node[] = [];
    
    // 递归为子节点分配位置，支线任务向右展开
    const positionSubNodes = (parentId: string, parentPos: { x: number, y: number }, level: number = 0) => {
      const children = subNodesMap.get(parentId) || [];
      const childrenNodes = children.map((task, index) => {
        // 计算子任务位置：垂直距离父节点下方150px，水平偏移根据层级
        const position = { 
          x: parentPos.x + (level * 250), // 子任务向右延伸
          y: parentPos.y + 150 + (index * 100) // 同级子任务从上到下排列
        };
        
        const node = {
          id: task._id,
          data: { 
            label: task.title,
            task,
            status: task.status 
          },
          position,
          type: 'default',
          draggable: true,
          style: {
            background: task.status === 'completed' ? '#d1fae5' : // 已完成 - 浅绿色
                      task.status === 'in_progress' ? '#fef3c7' : // 进行中 - 浅黄色
                      task.status === 'abandoned' ? '#e5e7eb' : // 已弃用 - 浅灰色
                      '#fef3c7', // 默认为浅黄色
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            width: 180,
            fontWeight: 'normal',
          }
        };
        
        // 递归处理子节点的子节点
        positionSubNodes(task._id, position, level + 1);
        
        return node;
      });
      
      subNodesPositioned.push(...childrenNodes);
    };
    
    // 以每个主线节点为起点处理其子节点
    mainNodesPositioned
      .filter(node => node.id.toString().indexOf('branch-') !== 0) // 排除分支标题节点
      .forEach(node => {
        positionSubNodes(node.id, node.position);
      });
    
    // 合并所有节点
    return [...mainNodesPositioned, ...subNodesPositioned];
  };

  const createGraphEdges = (tasks: Task[]): Edge[] => {
    const edges: Edge[] = [];
    
    // 为每个有父节点的任务创建边
    tasks.forEach(task => {
      if (task.parentId) {
        // 查找父任务确定是否是主节点
        const parentTask = tasks.find(t => t._id === task.parentId);
        const isParentMainNode = parentTask?.isMainNode || false;
        
        // 添加从父节点到当前节点的边
        edges.push({
          id: `e-${task.parentId}-${task._id}`,
          source: task.parentId,
          target: task._id,
          type: 'smoothstep',
          animated: task.status === 'in_progress',
          style: { 
            stroke: isParentMainNode ? '#d4a76a' : // 如果父节点是主节点，使用浅棕色
                   task.status === 'completed' ? '#10b981' : // 已完成 - 绿色
                   task.status === 'in_progress' ? '#f59e0b' : // 进行中 - 黄色
                   task.status === 'abandoned' ? '#9ca3af' : // 已弃用 - 灰色
                   '#f59e0b' // 默认为黄色
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: isParentMainNode ? '#d4a76a' : // 如果父节点是主节点，使用浅棕色
                  task.status === 'completed' ? '#10b981' : // 已完成 - 绿色
                  task.status === 'in_progress' ? '#f59e0b' : // 进行中 - 黄色
                  task.status === 'abandoned' ? '#9ca3af' : // 已弃用 - 灰色
                  '#f59e0b' // 默认为黄色
          }
        });
        
        // 如果任务已完成且不是已放弃状态，添加一条从当前节点回到父节点的虚线（表示合并）
        if (task.status === 'completed') {
          edges.push({
            id: `e-${task._id}-${task.parentId}`,
            source: task._id,
            target: task.parentId,
            type: 'smoothstep',
            style: { 
              stroke: '#10b981',  // 已完成 - 绿色
              strokeDasharray: '5 5'
            }
          });
        }
      }
    });
    
    // 连接同一分支内的主节点
    const mainNodes = tasks.filter(task => task.isMainNode);
    const branchMap = new Map<number, Task[]>();
    
    // 按分支对主节点进行分组
    mainNodes.forEach((task, index) => {
      const branchIndex = Math.floor(index / 2); // 每个分支最多2个主节点
      const branchTasks = branchMap.get(branchIndex) || [];
      branchTasks.push(task);
      branchMap.set(branchIndex, branchTasks);
    });
    
    // 连接每个分支内的主节点
    branchMap.forEach((branchTasks) => {
      for (let i = 0; i < branchTasks.length - 1; i++) {
        edges.push({
          id: `e-main-${branchTasks[i]._id}-${branchTasks[i+1]._id}`,
          source: branchTasks[i]._id,
          target: branchTasks[i+1]._id,
          type: 'smoothstep',
          style: { 
            stroke: '#d4a76a', // 主线连接使用浅棕色
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#d4a76a'
          }
        });
      }
    });
    
    // 连接分支标题和第一个主节点
    branchMap.forEach((branchTasks, branchIndex) => {
      if (branchTasks.length > 0) {
        edges.push({
          id: `e-branch-${branchIndex}-${branchTasks[0]._id}`,
          source: `branch-${branchIndex}`,
          target: branchTasks[0]._id,
          type: 'smoothstep',
          style: { 
            stroke: '#d1d5db',
            strokeWidth: 1.5,
            opacity: 0.7
          }
        });
      }
    });
    
    return edges;
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    // 当点击节点时，显示任务详情
    const task = tasks.find(t => t._id === node.id);
    if (task) {
      setSelectedTask(task);
      setEditingTask(null);
    }
  };

  const handleEditTask = () => {
    if (selectedTask) {
      setEditingTask({ ...selectedTask });
    }
  };

  const handleSaveTask = async () => {
    if (!editingTask || !editingTask._id) return;
    
    try {
      setSaving(true);
      
      await axios.put(`${API_URL}/api/tasks/${editingTask._id}`, {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status
      });
      
      // 更新本地数据
      setTasks(tasks.map(task => 
        task._id === editingTask._id ? { ...task, ...editingTask } : task
      ));
      
      setSelectedTask({ ...selectedTask!, ...editingTask });
      setEditingTask(null);
      
      // 重新生成节点和边
      const updatedTasks = tasks.map(task => 
        task._id === editingTask._id ? { ...task, ...editingTask } : task
      );
      setNodes(createGraphNodes(updatedTasks));
      setEdges(createGraphEdges(updatedTasks));
      
      setSaving(false);
    } catch (err) {
      console.error('Error updating task:', err);
      setSaving(false);
    }
  };

  const handleCreateTask = () => {
    navigate(`/projects/${id}/tasks/new`);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleUpdateLocalPath = async () => {
    if (!project || !newLocalPath.trim()) return;
    
    try {
      setSaving(true);
      
      await axios.put(`${API_URL}/api/projects/${project._id}/path`, {
        newPath: newLocalPath
      });
      
      // 更新本地数据
      setProject({
        ...project,
        localPath: newLocalPath
      });
      
      setShowPathEditor(false);
      setSaving(false);
    } catch (err) {
      console.error('Error updating local path:', err);
      setSaving(false);
    }
  };

  // 处理节点拖动结束，复位节点位置
  const onNodeDragStop: NodeDragHandler = useCallback((_, node) => {
    const initialPosition = initialNodePositions.current.get(node.id);
    if (initialPosition) {
      // 延迟复位，让用户有拖动的体验
      setTimeout(() => {
        setNodes(nodes => nodes.map(n => {
          if (n.id === node.id) {
            return {
              ...n,
              position: initialPosition
            };
          }
          return n;
        }));
      }, 300);
    }
  }, [setNodes]);

  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="p-4 text-center">项目不存在</div>;
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* 添加左侧边栏 */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-gray-600 mt-1">{project.description || '暂无描述'}</p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="mr-4">本地路径: {project.localPath}</span>
                <button 
                  onClick={() => {
                    setNewLocalPath(project.localPath);
                    setShowPathEditor(true);
                  }}
                  className="text-blue-500 hover:text-blue-600"
                >
                  修改路径
                </button>
              </div>
            </div>
            <button
              onClick={handleCreateTask}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              创建任务
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onInit={setReactFlowInstance}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            nodeTypes={nodeTypes}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      {/* 右侧任务详情面板 */}
      {selectedTask && (
        <div className="w-96 border-l overflow-auto p-4 bg-white">
          {editingTask ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">编辑任务</h2>
                <div className="space-x-2">
                  <button
                    onClick={handleSaveTask}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  任务标题
                </label>
                <input
                  type="text"
                  value={editingTask.title || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  任务描述
                </label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={5}
                />
              </div>

              {/* 只有非主线任务才显示状态选择器 */}
              {!editingTask.isMainNode && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    任务状态
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ 
                      ...editingTask, 
                      status: e.target.value as 'pending' | 'in_progress' | 'completed' | 'abandoned' 
                    })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="pending">待处理</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                    <option value="abandoned">已弃用</option>
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                <div className="space-x-2">
                  <button
                    onClick={handleEditTask}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                  >
                    编辑
                  </button>
                  <Link
                    to={`/tasks/${selectedTask._id}`}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm inline-block"
                  >
                    查看内容
                  </Link>
                </div>
              </div>

              {/* 只有非主线任务才显示状态 */}
              {!selectedTask.isMainNode && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">状态</h3>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedTask.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    selectedTask.status === 'abandoned' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedTask.status === 'completed' ? '已完成' :
                     selectedTask.status === 'in_progress' ? '进行中' :
                     selectedTask.status === 'abandoned' ? '已弃用' :
                     '待处理'}
                  </span>
                </div>
              )}

              {selectedTask.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">描述</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedTask.description}</p>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700">类型</h3>
                <p>{selectedTask.isMainNode ? '主线任务' : '支线任务'}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700">文件路径</h3>
                <p className="text-gray-600 truncate">{selectedTask.filePath}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700">最后更新</h3>
                <p>{new Date(selectedTask.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 本地路径修改对话框 */}
      {showPathEditor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">修改本地同步路径</h2>
            <p className="text-sm text-gray-600 mb-4">
              修改路径后，系统将自动将原路径下的文件复制到新路径。
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                新路径
              </label>
              <input
                type="text"
                value={newLocalPath}
                onChange={(e) => setNewLocalPath(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPathEditor(false)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleUpdateLocalPath}
                disabled={saving || !newLocalPath.trim()}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '更新中...' : '更新路径'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails; 