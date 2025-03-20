import React, { useState, useEffect } from 'react';
import { createProject, updateProject } from '../services/api';
import { FiX } from 'react-icons/fi';

const ProjectForm = ({ project, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    path: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        path: project.path,
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('项目名称不能为空');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // 准备提交数据，path可以为空
      const submitData = {
        name: formData.name
      };
      
      // 只有当path不为空时添加到提交数据
      if (formData.path && formData.path.trim()) {
        submitData.path = formData.path;
      }

      if (project) {
        // 更新已有项目
        await updateProject(project.id, submitData);
      } else {
        // 创建新项目
        await createProject(submitData);
      }

      onProjectCreated();
    } catch (error) {
      console.error('Error saving project:', error);
      setError('保存项目时出错，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {project ? '编辑项目' : '创建新项目'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              项目名称
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入项目名称"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="path" className="block text-gray-700 font-medium mb-2">
              本地路径
            </label>
            <input
              type="text"
              id="path"
              name="path"
              value={formData.path}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入本地路径，用于双向同步"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-70"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;