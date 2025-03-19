import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

interface Project {
  _id: string;
  name: string;
  description: string;
  localPath: string;
}

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    localPath: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projects/${id}`);
        const project = res.data.project;
        
        setFormData({
          name: project.name,
          description: project.description || '',
          localPath: project.localPath || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('获取项目详情失败:', err);
        setError('无法加载项目详情，请稍后重试');
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('项目名称不能为空');
      return;
    }
    
    try {
      setSaving(true);
      
      await axios.put(`${API_URL}/api/projects/${id}`, {
        name: formData.name,
        description: formData.description,
        localPath: formData.localPath
      });
      
      navigate(`/projects/${id}`);
    } catch (err: any) {
      console.error('更新项目失败:', err);
      setError(err.response?.data?.message || '更新项目失败，请稍后重试');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">编辑项目</h1>
      
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
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入项目描述（可选）"
            rows={4}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="localPath" className="block text-gray-700 text-sm font-bold mb-2">
            本地路径
          </label>
          <input
            type="text"
            id="localPath"
            value={formData.localPath}
            onChange={(e) => setFormData({ ...formData, localPath: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="输入项目本地同步路径（可选）"
          />
          <p className="text-xs text-gray-500 mt-1">
            指定本地文件夹路径，系统将自动同步项目内容到该目录。
          </p>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate(`/projects/${id}`)}
            className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject; 