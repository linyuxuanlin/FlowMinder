import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
}

const CreateTask: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isMainNode, setIsMainNode] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // 获取可能的父任务列表
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks?projectId=${projectId}`);
        setTasks(res.data);
      } catch (err) {
        console.error('获取任务列表失败:', err);
      }
    };

    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('任务标题不能为空');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const taskData = {
        title,
        description,
        projectId,
        isMainNode,
        parentId: parentId || undefined,
        status: 'pending'
      };
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks`, taskData);
      
      navigate(`/tasks/${res.data._id}`);
    } catch (err: any) {
      console.error('创建任务失败:', err);
      setError(err.response?.data?.message || '创建任务失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">创建新任务</h1>
      
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              checked={isMainNode}
              onChange={(e) => {
                setIsMainNode(e.target.checked);
                if (e.target.checked) {
                  setParentId(null); // 如果是主节点，则清除父节点选择
                }
              }}
              className="mr-2"
            />
            <label htmlFor="isMainNode" className="text-gray-700 text-sm font-bold">
              这是一个主线任务
            </label>
          </div>
        </div>
        
        {!isMainNode && (
          <div className="mb-6">
            <label htmlFor="parentId" className="block text-gray-700 text-sm font-bold mb-2">
              父任务（可选）
            </label>
            <select
              id="parentId"
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">-- 选择父任务 --</option>
              {tasks.map(task => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
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