import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">FlowMinder</h1>
          <span className="ml-2 text-xs bg-primary-700 px-2 py-1 rounded">项目管理工具</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded text-sm">
            新建任务
          </button>
          <button className="bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded text-sm">
            保存
          </button>
          <button className="bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded text-sm">
            同步
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 