import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMenu, FiMoreVertical, FiPlus } from 'react-icons/fi';
import { getProject, createBranch } from '../services/api';
import Sidebar from '../components/Sidebar';
import ProjectFlow from '../components/ProjectFlow';
import NodeProperties from '../components/NodeProperties';
import BranchForm from '../components/BranchForm';
import ProjectForm from '../components/ProjectForm';

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [activeMenu, setActiveMenu] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProject(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleNodeUpdate = () => {
    // 节点更新后重新获取项目数据
    fetchProject();
    setSelectedNode(null);
  };

  const handleAddBranch = async (branchName) => {
    try {
      await createBranch(projectId, { name: branchName });
      setShowBranchForm(false);
      fetchProject();
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  };

  const handleUpdateProject = () => {
    setShowProjectForm(false);
    fetchProject();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>加载中...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>项目未找到</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 顶栏 */}
      <header className="bg-primary text-white h-16 flex items-center px-4 z-10">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 mr-4 hover:bg-primary-dark rounded-md"
        >
          <FiMenu size={24} />
        </button>
        
        <h1 
          onClick={() => navigate('/')}
          className="text-xl font-bold mr-10 cursor-pointer"
        >
          FlowMinder
        </h1>
        
        <h2 className="text-lg flex-grow text-center">{project.name}</h2>
        
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(!activeMenu)}
            className="p-2 hover:bg-primary-dark rounded-md"
          >
            <FiMoreVertical size={24} />
          </button>
          
          {activeMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <button 
                onClick={() => {
                  setActiveMenu(false);
                  setShowProjectForm(true);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                编辑项目属性
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('确定要删除这个项目吗？')) {
                    navigate('/');
                  }
                }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                删除项目
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar 
          isOpen={sidebarOpen} 
          projects={[project]} 
          currentProjectId={projectId} 
          onProjectClick={(id) => navigate(`/projects/${id}`)}
          onAddProject={() => navigate('/')}
        />

        {/* 主要内容区 */}
        <main className="flex-1 overflow-hidden flex">
          {/* 流程图区域 */}
          <div className="flex-1 overflow-hidden">
            {project.branches.length > 0 ? (
              <ProjectFlow 
                project={project} 
                onNodeClick={handleNodeClick}
                onNodeAdded={fetchProject}
                onAddBranch={() => setShowBranchForm(true)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <p className="mb-4 text-gray-600">该项目还没有分支</p>
                <button
                  onClick={() => setShowBranchForm(true)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md"
                >
                  <FiPlus /> 添加分支
                </button>
              </div>
            )}
          </div>

          {/* 节点属性区域 */}
          {selectedNode && (
            <NodeProperties 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)}
              onUpdate={handleNodeUpdate}
            />
          )}
        </main>
      </div>

      {/* 新增分支表单 */}
      {showBranchForm && (
        <BranchForm 
          onClose={() => setShowBranchForm(false)} 
          onSubmit={handleAddBranch}
        />
      )}

      {/* 编辑项目表单 */}
      {showProjectForm && (
        <ProjectForm 
          project={project}
          onClose={() => setShowProjectForm(false)}
          onProjectCreated={handleUpdateProject}
        />
      )}
    </div>
  );
};

export default ProjectPage; 