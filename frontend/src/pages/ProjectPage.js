import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMenu, FiMoreVertical, FiPlus } from 'react-icons/fi';
import { getProject, createBranch, deleteProject } from '../services/api';
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
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProject(projectId);
      console.log("Fetched project data:", response.data);
      setProject(response.data);

      // 如果有新创建的分支，刷新一次以确保获取到节点数据
      if (response.data && response.data.branches && response.data.branches.some(b => b.nodes.length === 0)) {
        console.log("Found branches with no nodes, scheduling refresh");
        setTimeout(() => {
          console.log("Refreshing project data to get updated nodes");
          getProject(projectId).then(newResponse => {
            console.log("Refreshed project data:", newResponse.data);
            setProject(newResponse.data);
          }).catch(err => {
            console.error("Error in refresh:", err);
          });
        }, 1000);
      }
      
      // 设置默认选中的分支
      if (response.data && response.data.branches && response.data.branches.length > 0) {
        if (!selectedBranch) {
          setSelectedBranch(response.data.branches[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedBranch]);

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
      console.log("Creating branch with name:", branchName);
      await createBranch(projectId, { name: branchName });
      setShowBranchForm(false);
      await fetchProject();
      
      // 创建分支后，获取刷新后的项目数据并设置最新的分支为选中状态
      const refreshedProject = await getProject(projectId);
      if (refreshedProject.data && refreshedProject.data.branches.length > 0) {
        // 查找新创建的分支
        const newBranch = refreshedProject.data.branches.find(b => b.name === branchName);
        if (newBranch) {
          setSelectedBranch(newBranch);
        }
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      // 显示更详细的错误信息
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const handleUpdateProject = () => {
    setShowProjectForm(false);
    fetchProject();
  };
  
  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
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
                    deleteProject(projectId).then(() => {
                      navigate('/');
                    }).catch(err => {
                      console.error('Error deleting project:', err);
                      alert('删除项目失败');
                    });
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
              <>
                {/* 分支选择器 */}
                <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex space-x-2 overflow-x-auto">
                    {project.branches.map(branch => (
                      <button
                        key={branch.id}
                        onClick={() => handleBranchChange(branch)}
                        className={`px-4 py-1 rounded-md ${
                          selectedBranch && selectedBranch.id === branch.id 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {branch.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowBranchForm(true)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-opacity-80"
                  >
                    <FiPlus /> 添加分支
                  </button>
                </div>
                
                <ProjectFlow 
                  project={project} 
                  selectedBranch={selectedBranch}
                  onNodeSelect={handleNodeClick}
                />
              </>
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