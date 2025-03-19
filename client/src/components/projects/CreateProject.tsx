import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 添加API_URL常量
const API_URL = 'http://localhost:5000';

const CreateProject: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('项目名称不能为空');
      return;
    }
    
    if (!localPath.trim()) {
      setError('请选择本地同步路径');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/api/projects`, {
        name,
        description,
        localPath
      });
      
      navigate(`/projects/${res.data._id}`);
    } catch (err: any) {
      console.error('创建项目失败:', err);
      setError(err.response?.data?.message || '创建项目失败，请稍后重试');
      setLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      // 在实际应用中，这里需要使用Electron等工具来实现本地文件夹选择
      // 在Web应用中可能需要调用后端API或使用File API
      // 这里我们使用一个模拟的路径选择器
      const folderPath = prompt('请输入本地同步路径', 'C:\\Projects\\MyProject');
      if (folderPath) {
        setLocalPath(folderPath);
      }
    } catch (err) {
      console.error('选择文件夹失败:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">创建新项目</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            项目名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入项目名称"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            项目描述
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入项目描述（可选）"
            rows={4}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            本地同步路径 <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <input
              type="text"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="选择本地同步路径"
              readOnly
              required
            />
            <button
              type="button"
              onClick={handleSelectFolder}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-r"
            >
              选择文件夹
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            所有任务的Markdown文件将在此路径下同步
          </p>
        </div>
        
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
            {loading ? '创建中...' : '创建项目'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject; 