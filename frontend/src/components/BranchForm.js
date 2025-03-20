import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const BranchForm = ({ initialName = '', title = '添加分支', submitLabel = '创建', onClose, onSubmit }) => {
  const [branchName, setBranchName] = useState(initialName);
  const [error, setError] = useState('');

  // 当initialName改变时更新表单
  useEffect(() => {
    setBranchName(initialName);
  }, [initialName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!branchName.trim()) {
      setError('分支名称不能为空');
      return;
    }
    
    try {
      onSubmit(branchName);
    } catch (error) {
      console.error('Error with branch operation:', error);
      setError('操作失败，请稍后重试');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
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
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              分支名称 <span className="text-red-500">*</span>
            </label>
            <input 
              id="name"
              type="text" 
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="输入分支名称"
              autoFocus
            />
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
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchForm; 