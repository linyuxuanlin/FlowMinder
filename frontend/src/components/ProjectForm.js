import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { createProject, updateProject } from '../services/api';

const ProjectForm = ({ project, onClose, onProjectCreated }) => {
  const [name, setName] = useState(project ? project.name : '');
  const [description, setDescription] = useState(project ? project.description || '' : '');
  const [path, setPath] = useState(project ? project.path || '' : '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('项目名称不能为空');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // 准备提交数据
      const projectData = {
        name: name.trim(),
        description: description.trim()
      };
      
      // 如果提供了路径，添加到数据中
      if (path.trim()) {
        projectData.path = path.trim();
      }
      
      console.log("提交项目数据:", projectData);
      
      if (project) {
        // 更新现有项目
        await updateProject(project.id, projectData);
      } else {
        // 创建新项目
        await createProject(projectData);
      }
      
      if (onProjectCreated) {
        onProjectCreated();
      }
      
      // 关闭表单
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('项目保存失败:', error);
      setError(error.response?.data?.detail || '项目保存失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{project ? '编辑项目' : '创建新项目'}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              项目名称 <span className="text-red-500">*</span>
            </label>
            <input 
              id="name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="输入项目名称"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              项目描述
            </label>
            <textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="输入项目描述"
              rows="3"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="path">
              项目路径
            </label>
            <input 
              id="path"
              type="text" 
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="(可选) 项目文件路径"
            />
            <p className="text-xs text-gray-500 mt-1">如不指定，将使用系统默认路径</p>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '保存中...' : (project ? '保存' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;