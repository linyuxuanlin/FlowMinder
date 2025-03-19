import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

// 添加API_URL常量
const API_URL = 'http://localhost:5000';

interface Project {
  _id: string;
  name: string;
}

const Sidebar: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <div className="sidebar">
      <h2 className="text-lg font-semibold mb-4">项目列表</h2>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <ul className="sidebar-nav">
          {projects.map((project) => (
            <li key={project._id}>
              <NavLink 
                to={`/projects/${project._id}`}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {project.name}
              </NavLink>
            </li>
          ))}
          <li className="mt-4">
            <NavLink 
              to="/projects/new"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              + 新建项目
            </NavLink>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;