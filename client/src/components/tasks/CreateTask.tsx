import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// API_URL常量
const API_URL = 'http://localhost:5000';

// 创建URLSearchParams接口
interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  isMainNode: boolean;
  parentId: string | null;
}

const CreateTask: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从URL获取parentId参数
  const queryParams = new URLSearchParams(location.search);
  const parentIdFromUrl = queryParams.get('parentId');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'in_progress',
    isMainNode: false,
    parentId: parentIdFromUrl || '',
    filePath: ''
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 如果URL中有parentId，默认为支线任务
  useEffect(() => {
    if (parentIdFromUrl) {
      setFormData(prev => ({
        ...prev, 
        parentId: parentIdFromUrl,
        isMainNode: false
      }));
    }
  }, [parentIdFromUrl]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/tasks?projectId=${projectId}`);
        setTasks(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('获取任务列表失败，请稍后重试');
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('任务标题不能为空');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const taskData = {
        title: formData.title,
        description: formData.description,
        projectId,
        isMainNode: formData.isMainNode,
        parentId: formData.parentId || undefined,
        status: formData.isMainNode ? 'in_progress' : formData.status,
        filePath: formData.filePath
      };
      
      const res = await axios.post(`${API_URL}/api/tasks`, taskData);
      
      // 创建成功后返回项目详情页
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      console.error('创建任务失败:', err);
      setError(err.response?.data?.message || '创建任务失败，请稍后重试');
      setLoading(false);
    }
  };

  // 过滤可用的父任务
  const availableParentTasks = tasks.filter(task => {
    // 如果是主线任务，所有任务都可以作为父任务
    if (formData.isMainNode) return true;
    
    // 如果是支线任务，只有其他非abandoned状态的任务可以作为父任务
    return task.status !== 'abandoned';
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{parentIdFromUrl ? '创建子任务' : '创建新任务'}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            任务标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入任务标题"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            任务描述
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入任务描述（可选）"
            rows={4}
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isMainNode"
              checked={formData.isMainNode}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  isMainNode: e.target.checked,
                  parentId: e.target.checked ? '' : formData.parentId 
                });
              }}
              className="mr-2"
              disabled={!!parentIdFromUrl} // 如果从URL获取到parentId，禁用主线任务选项
            />
            <label htmlFor="isMainNode" className="text-gray-700 text-sm font-bold">
              这是一个主线任务
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            主线任务将显示在任务流的中央主线上，支线任务会从主线任务派生出来。主线任务无需设置状态。
            {parentIdFromUrl && <span className="text-blue-500"> (当前正在创建子任务，无法选择为主线任务)</span>}
          </p>
        </div>
        
        {!formData.isMainNode && (
          <div className="mb-6">
            <label htmlFor="parentId" className="block text-gray-700 text-sm font-bold mb-2">
              父任务 <span className="text-red-500">*</span>
            </label>
            <select
              id="parentId"
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || '' })}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required={!formData.isMainNode}
              disabled={!!parentIdFromUrl} // 如果从URL获取到parentId，禁用选择
            >
              <option value="">-- 选择父任务 --</option>
              {availableParentTasks.map(task => (
                <option key={task._id} value={task._id}>
                  {task.title} {task.isMainNode ? '(主线)' : '(支线)'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              支线任务必须选择一个父任务。支线任务完成后将合并回父任务（除非标记为已弃用）。
              {parentIdFromUrl && <span className="text-blue-500"> (父任务已自动选择)</span>}
            </p>
          </div>
        )}
        
        {!formData.isMainNode && (
          <div className="mb-6">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
              任务状态
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="abandoned">已弃用</option>
            </select>
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="filePath" className="block text-gray-700 text-sm font-bold mb-2">
            文件路径
          </label>
          <input
            type="text"
            id="filePath"
            value={formData.filePath}
            onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入关联文件路径（可选）"
          />
          <p className="text-xs text-gray-500 mt-1">
            可以指定任务关联的文件路径，方便后续查看和编辑文件内容。
          </p>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || (!formData.isMainNode && !formData.parentId)}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建任务'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask; 