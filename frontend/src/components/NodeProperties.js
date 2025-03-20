import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { updateNode } from '../services/api';

const NodeProperties = ({ node, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'in-progress'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 当节点变化时更新表单数据
  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name || '',
        description: node.description || '',
        status: node.status || 'in-progress'
      });
    }
  }, [node]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('节点名称不能为空');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await updateNode(node.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status
      });
      
      console.log('节点更新成功');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('更新节点失败:', error);
      setError('更新节点失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!node) return null;

  return (
    <div className="w-80 border-l border-gray-200 bg-white p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">节点属性</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
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
            名称
          </label>
          <input 
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="输入节点名称"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            描述
          </label>
          <textarea 
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="输入节点描述"
            rows="3"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            状态
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="in-progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="abandoned">已弃用</option>
          </select>
        </div>
        
        <div className="flex">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-1 w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <FiSave />
            {isSubmitting ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-2">节点信息</div>
        <div className="text-xs text-gray-500">
          <p className="mb-1">ID: {node.id}</p>
          <p className="mb-1">位置: X:{node.position_x || 0}, Y:{node.position_y || 0}</p>
          <p className="mb-1">层级: {node.level === 0 ? '主节点' : '子节点'}</p>
          <p className="mb-1">创建时间: {new Date(node.created_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default NodeProperties; 