import React, { useState } from 'react';
import { useFlowStore } from '../store/flowStore';
import { TaskStatus } from '../types';

const Sidebar: React.FC = () => {
  const { nodes, selectedNodeId, selectNode } = useFlowStore();
  const [filter, setFilter] = useState<string>('all');

  const filteredNodes = filter === 'all' 
    ? nodes 
    : nodes.filter(node => node.status === filter);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-2">任务列表</h2>
        <div className="flex space-x-1 mb-2">
          <button 
            className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${filter === TaskStatus.TODO ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter(TaskStatus.TODO)}
          >
            待办
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${filter === TaskStatus.IN_PROGRESS ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter(TaskStatus.IN_PROGRESS)}
          >
            进行中
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${filter === TaskStatus.COMPLETED ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter(TaskStatus.COMPLETED)}
          >
            已完成
          </button>
        </div>
        <input 
          type="text" 
          placeholder="搜索任务..." 
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />
      </div>
      <ul className="divide-y divide-gray-200">
        {filteredNodes.map(node => (
          <li 
            key={node.id}
            className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedNodeId === node.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
            onClick={() => selectNode(node.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{node.title}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                node.status === TaskStatus.TODO ? 'bg-yellow-100 text-yellow-800' :
                node.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                node.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {node.status === TaskStatus.TODO ? '待办' :
                 node.status === TaskStatus.IN_PROGRESS ? '进行中' :
                 node.status === TaskStatus.COMPLETED ? '已完成' : '阻塞'}
              </span>
            </div>
            {node.parentId && (
              <p className="text-xs text-gray-500 mt-1">
                子任务
              </p>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar; 