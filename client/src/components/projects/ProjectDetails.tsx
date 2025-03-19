import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactFlow, { Background, Controls, ConnectionLineType, Node, Edge, ReactFlowInstance, MarkerType } from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';

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

// 自定义节点类型
const nodeTypes = {};

const API_URL = 'http://localhost:5000';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [showPathEditor, setShowPathEditor] = useState<boolean>(false);
  const [newLocalPath, setNewLocalPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projects/${id}`);
        setProject(res.data.project);
        setTasks(res.data.tasks);
        
        // 将后端数据转换为ReactFlow格式
        const nodes = createGraphNodes(res.data.tasks);
        const edges = createGraphEdges(res.data.tasks);
        
        setFlowNodes(nodes);
        setFlowEdges(edges);
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
  }, [id]);

  const createGraphNodes = (tasks: Task[]): Node[] => {
    // 按主线和支线分组
    const mainNodes = tasks.filter(task => task.isMainNode);
    const subNodes = tasks.filter(task => !task.isMainNode);
    
    // 为主线节点分配Y轴位置（垂直排列）
    const mainNodesPositioned = mainNodes.map((task, index) => ({
      id: task._id,
      data: { 
        label: task.title,
        task,
        status: task.status 
      },
      position: { x: 100, y: index * 150 },
      type: 'default',
      style: {
        background: task.status === 'completed' ? '#d1fae5' : 
                   task.status === 'in_progress' ? '#dbeafe' : 
                   task.status === 'abandoned' ? '#fee2e2' : '#fff9db',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        width: 180
      }
    }));
    
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
    
    // 递归为子节点分配位置
    const positionSubNodes = (parentId: string, depth: number, parentPos: { x: number, y: number }) => {
      const children = subNodesMap.get(parentId) || [];
      const childrenNodes = children.map((task, index) => {
        // 支线节点向右偏移，Y轴位置在父节点周围分布
        const position = { 
          x: parentPos.x + 300 * depth, 
          y: parentPos.y + (index - Math.floor(children.length / 2)) * 120 
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
          style: {
            background: task.status === 'completed' ? '#d1fae5' : 
                      task.status === 'in_progress' ? '#dbeafe' : 
                      task.status === 'abandoned' ? '#fee2e2' : '#fff9db',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            width: 180
          }
        };
        
        // 递归处理子节点的子节点
        positionSubNodes(task._id, depth + 1, position);
        
        return node;
      });
      
      subNodesPositioned.push(...childrenNodes);
    };
    
    // 以每个主线节点为起点处理其子节点
    mainNodesPositioned.forEach(node => {
      positionSubNodes(node.id, 1, node.position);
    });
    
    return [...mainNodesPositioned, ...subNodesPositioned];
  };

  const createGraphEdges = (tasks: Task[]): Edge[] => {
    const edges: Edge[] = [];
    
    // 为每个有父节点的任务创建边
    tasks.forEach(task => {
      if (task.parentId) {
        // 添加从父节点到当前节点的边
        edges.push({
          id: `e-${task.parentId}-${task._id}`,
          source: task.parentId,
          target: task._id,
          type: 'smoothstep',
          animated: task.status === 'in_progress',
          style: { 
            stroke: task.status === 'completed' ? '#10b981' : 
                   task.status === 'in_progress' ? '#3b82f6' : 
                   task.status === 'abandoned' ? '#ef4444' : '#f59e0b' 
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: task.status === 'completed' ? '#10b981' : 
                  task.status === 'in_progress' ? '#3b82f6' : 
                  task.status === 'abandoned' ? '#ef4444' : '#f59e0b'
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
              stroke: '#10b981',
              strokeDasharray: '5 5'
            }
          });
        }
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
      setFlowNodes(createGraphNodes(updatedTasks));
      setFlowEdges(createGraphEdges(updatedTasks));
      
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
            nodes={flowNodes}
            edges={flowEdges}
            onNodeClick={onNodeClick}
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

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700">状态</h3>
                <span className={`inline-block px-2 py-1 rounded text-sm ${
                  selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedTask.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  selectedTask.status === 'abandoned' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedTask.status === 'completed' ? '已完成' :
                   selectedTask.status === 'in_progress' ? '进行中' :
                   selectedTask.status === 'abandoned' ? '已弃用' :
                   '待处理'}
                </span>
              </div>

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