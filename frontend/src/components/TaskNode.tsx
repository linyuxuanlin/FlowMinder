import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskNode as TaskNodeType, TaskStatus } from '../types';
import { useFlowStore } from '../store/flowStore';

interface TaskNodeProps {
  node: TaskNodeType;
}

const TaskNode: React.FC<TaskNodeProps> = ({ node }) => {
  const { selectNode, selectedNodeId, updateNode } = useFlowStore();
  
  const statusColors = {
    [TaskStatus.TODO]: 'bg-yellow-100 border-yellow-300',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 border-blue-300',
    [TaskStatus.COMPLETED]: 'bg-green-100 border-green-300',
    [TaskStatus.BLOCKED]: 'bg-red-100 border-red-300',
  };
  
  const handleStatusChange = (newStatus: TaskStatus) => {
    updateNode(node.id, { status: newStatus });
  };
  
  const isSelected = selectedNodeId === node.id;
  
  return (
    <div 
      className={`w-64 rounded-lg shadow-md border-2 ${isSelected ? 'border-primary-500' : 'border-gray-200'} ${statusColors[node.status]} overflow-hidden`}
      onClick={() => selectNode(node.id)}
    >
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-lg">{node.title}</h3>
          <div className="relative group">
            <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200">
              <span>⋮</span>
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md border border-gray-200 hidden group-hover:block z-10">
              <ul className="py-1">
                <li 
                  className={`px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer ${node.status === TaskStatus.TODO ? 'font-semibold' : ''}`}
                  onClick={() => handleStatusChange(TaskStatus.TODO)}
                >
                  待办
                </li>
                <li 
                  className={`px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer ${node.status === TaskStatus.IN_PROGRESS ? 'font-semibold' : ''}`}
                  onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                >
                  进行中
                </li>
                <li 
                  className={`px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer ${node.status === TaskStatus.COMPLETED ? 'font-semibold' : ''}`}
                  onClick={() => handleStatusChange(TaskStatus.COMPLETED)}
                >
                  已完成
                </li>
                <li 
                  className={`px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer ${node.status === TaskStatus.BLOCKED ? 'font-semibold' : ''}`}
                  onClick={() => handleStatusChange(TaskStatus.BLOCKED)}
                >
                  阻塞
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {node.filePath && (
            <div className="mb-1">
              <span className="mr-1">📄</span>
              {node.filePath}
            </div>
          )}
        </div>
      </div>
      <div className="p-3 bg-white max-h-40 overflow-y-auto">
        <ReactMarkdown 
          className="prose prose-sm max-w-none"
          remarkPlugins={[remarkGfm]}
        >
          {node.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default TaskNode; 