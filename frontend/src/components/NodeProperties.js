import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { updateNode } from '../services/api';

const NodeProperties = ({ node, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'in_progress',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name,
        status: node.status,
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
      await updateNode(node.id, formData);
      onUpdate();
    } catch (error) {
      console.error('Error updating node:', error);
      setError('更新节点失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果是一级节点，不允许修改状态
  const isMainNode = node && node.level === 1;

  return (
    <div className="w-80 bg-white h-full border-l border-gray-200 shadow-lg flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="font-medium">节点属性</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            节点名称
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {!isMainNode && (
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700 font-medium mb-2">
              节点状态
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="abandoned">已弃用</option>
            </select>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-opacity-90 disabled:opacity-70"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        {node && (
          <>
            <p>节点ID: {node.id}</p>
            <p>节点级别: {node.level === 1 ? '主节点' : '二级节点'}</p>
            <p>创建时间: {new Date().toLocaleString()}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default NodeProperties; 