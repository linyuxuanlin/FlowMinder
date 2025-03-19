import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projects`);
        setProjects(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('获取项目列表失败');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止点击事件冒泡
    
    if (!window.confirm('确定要删除此项目吗？这将删除所有相关任务和内容。')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/projects/${id}`);
      // 更新本地项目列表
      setProjects(projects.filter(project => project._id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('删除项目失败，请稍后重试');
    }
  };

  const handleEditProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止点击事件冒泡
    navigate(`/projects/${id}/edit`);
  };

  const handleProjectClick = (id: string) => {
    navigate(`/projects/${id}`);
  };

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">我的项目</h1>
        <Link 
          to="/projects/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          新建项目
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg text-gray-600 mb-4">暂无项目</h3>
          <Link 
            to="/projects/new" 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            创建第一个项目
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div 
              key={project._id} 
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white overflow-hidden cursor-pointer"
              onClick={() => handleProjectClick(project._id)}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 truncate">{project.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2 h-12">
                  {project.description || '暂无描述'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    更新于 {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleEditProject(project._id, e)}
                      className="p-2 rounded-full hover:bg-gray-100"
                      title="编辑项目"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project._id, e)}
                      className="p-2 rounded-full hover:bg-gray-100"
                      title="删除项目"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-blue-500"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList; 