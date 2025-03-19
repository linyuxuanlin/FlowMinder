import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// 添加API_URL常量
const API_URL = 'http://localhost:5000';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  localPath?: string;
}

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projects`);
        setProjects(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('加载项目失败，请稍后重试。');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (collapsed) {
    return (
      <div className="fixed left-0 top-0 bottom-0 z-10 flex items-center">
        <button
          className="bg-gray-800 text-white p-2 rounded-r-md shadow-lg hover:bg-gray-700"
          onClick={() => setCollapsed(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 w-80 min-w-80 border-r h-full overflow-auto relative">
      <div className="absolute top-0 right-0 p-2">
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex justify-between items-center mb-6 pr-8">
        <h1 className="text-2xl font-bold">项目列表</h1>
        <Link
          to="/projects/new"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          创建新项目
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">暂无项目</p>
          <Link
            to="/projects/new"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            创建第一个项目
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                <p className="text-gray-600 mb-2 line-clamp-2">{project.description || '暂无描述'}</p>
                {project.localPath && (
                  <p className="text-xs text-gray-500 mb-2 truncate">
                    路径: {project.localPath}
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>创建: {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span>更新: {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 border-t">
                <Link
                  to={`/projects/${project._id}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  查看详情 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList; 