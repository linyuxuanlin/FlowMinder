import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';

// 添加API_URL常量
const API_URL = 'http://localhost:5000';

interface Project {
  _id: string;
  name: string;
}

const Sidebar: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isProjectPage = location.pathname.includes('/projects/');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projects`);
        setProjects(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 如果在项目页面，默认将侧边栏折叠为精简版
  useEffect(() => {
    if (isProjectPage) {
      setCollapsed(true);
    }
  }, [isProjectPage]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  if (loading) {
    return (
      <div className="w-64 h-full bg-gray-800 text-white p-4">
        <div className="text-center py-4">加载中...</div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 text-white h-full transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <h2 className="text-xl font-bold">FlowMinder</h2>}
        <button 
          className="text-gray-400 hover:text-white"
          onClick={toggleSidebar}
        >
          {collapsed ? 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            : 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          }
        </button>
      </div>

      <nav className="py-4">
        <ul>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center py-2 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {!collapsed && <span>主页</span>}
            </NavLink>
          </li>
          
          {!collapsed && (
            <li className="mt-4 px-4">
              <h3 className="text-sm uppercase tracking-wide text-gray-400">项目</h3>
            </li>
          )}
          
          {projects.map(project => (
            <li key={project._id}>
              <NavLink 
                to={`/projects/${project._id}`} 
                className={({ isActive }) => 
                  `flex items-center py-2 px-4 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} truncate`
                }
                title={project.name}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2.01 2z" />
                </svg>
                {!collapsed && <span className="truncate">{project.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;