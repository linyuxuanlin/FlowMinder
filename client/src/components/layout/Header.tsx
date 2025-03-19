import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold text-white no-underline">
          FlowMinder
        </Link>
      </div>
      <div>
        <Link 
          to="/projects/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
        >
          新建项目
        </Link>
      </div>
    </header>
  );
};

export default Header; 