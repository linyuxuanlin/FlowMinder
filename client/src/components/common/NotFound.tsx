import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">页面未找到</p>
      <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
        返回首页
      </Link>
    </div>
  );
};

export default NotFound; 