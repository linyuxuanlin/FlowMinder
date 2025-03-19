import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects`);
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

  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description || '暂无描述'}</p>
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