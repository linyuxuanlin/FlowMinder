import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiFolderPlus } from 'react-icons/fi';
import { getProjects, deleteProject } from '../services/api';
import ProjectForm from '../components/ProjectForm';

const HomePage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleProjectCreated = () => {
    setShowModal(false);
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">FlowMinder</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">我的项目</h2>
          <button
            onClick={handleCreateProject}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-opacity-90"
          >
            <FiPlus /> 创建项目
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>加载中...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiFolderPlus className="mx-auto text-gray-400 text-6xl mb-4" />
            <h3 className="text-xl font-medium mb-2">还没有项目</h3>
            <p className="text-gray-600 mb-4">点击"创建项目"按钮开始您的第一个项目流程图</p>
            <button
              onClick={handleCreateProject}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              创建项目
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium">{project.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-gray-600 hover:text-primary"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-gray-600 hover:text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-2">
                    本地路径: {project.path}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    创建时间: {new Date(project.created_at).toLocaleString()}
                  </p>
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full bg-secondary text-white py-2 rounded-md hover:bg-opacity-90"
                  >
                    查看项目
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <ProjectForm
          project={editingProject}
          onClose={() => setShowModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default HomePage; 