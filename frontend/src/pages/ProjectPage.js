import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMenu, FiMoreVertical, FiPlus, FiEdit } from 'react-icons/fi';
import { getProject, createBranch, deleteProject, updateBranch } from '../services/api';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [showBranchRenameForm, setShowBranchRenameForm] = useState(false);
  const [branchToRename, setBranchToRename] = useState(null);

  // 获取项目数据，移除selectedBranch依赖，避免循环请求
  const fetchProject = useCallback(async (skipSettingBranch = false) => {
    // 防止短时间内重复请求
    const now = Date.now();
    if (now - lastFetchTime < 500) {
      console.log("请求过于频繁，跳过");
      return;
    }
    
    try {
      setLoading(true);
      setLastFetchTime(now);
      
      const response = await getProject(projectId);
      console.log("Fetched project data:", response.data);
      
      // 保存当前选择的分支ID
      const currentBranchId = selectedBranch?.id;
      
      setProject(response.data);

      // 设置默认选中的分支
      if (!skipSettingBranch && response.data && response.data.branches && response.data.branches.length > 0) {
        if (isInitialLoad) {
          // 首次加载时自动选择第一个分支
          setSelectedBranch(response.data.branches[0]);
          setIsInitialLoad(false);
        } else if (currentBranchId) {
          // 更新后保持当前选择的分支
          const branch = response.data.branches.find(b => b.id === currentBranchId);
          if (branch) {
            setSelectedBranch(branch);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, isInitialLoad, lastFetchTime]); // 移除selectedBranch依赖

  // 首次加载项目数据
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleNodeUpdate = () => {
    // 节点更新后刷新项目数据，但不重置分支选择
    fetchProject(true);
    setSelectedNode(null);
  };

  const handleAddBranch = async (branchName) => {
    try {
      console.log("Creating branch with name:", branchName);
      const response = await createBranch(projectId, { name: branchName });
      console.log("Branch created:", response.data);
      setShowBranchForm(false);
      
      // 重新获取项目数据
      const refreshedProject = await getProject(projectId);
      setProject(refreshedProject.data);
      
      // 查找新创建的分支并选中
      const newBranch = refreshedProject.data.branches.find(b => b.name === branchName);
      if (newBranch) {
        setSelectedBranch(newBranch);
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const handleUpdateProject = () => {
    setShowProjectForm(false);
    fetchProject(true);
  };
  
  const handleBranchChange = (branch) => {
    if (selectedBranch?.id !== branch.id) {
      setSelectedBranch(branch);
    }
  };

  // 处理分支重命名
  const handleBranchRename = async (branchName) => {
    if (!branchToRename) return;
    
    try {
      console.log(`Renaming branch ${branchToRename.id} to "${branchName}"`);
      await updateBranch(branchToRename.id, { name: branchName });
      setShowBranchRenameForm(false);
      setBranchToRename(null);
      
      // 重新获取项目数据
      fetchProject(true);
    } catch (error) {
      console.error('Error renaming branch:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  // 打开分支重命名对话框
  const openBranchRenameForm = (branch) => {
    setBranchToRename(branch);
    setShowBranchRenameForm(true);
  };

  if (loading && !project) {
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
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-semibold text-gray-700">分支</h3>
                    <button
                      onClick={() => setShowBranchForm(true)}
                      className="flex items-center gap-1 text-sm text-primary hover:text-opacity-80"
                    >
                      <FiPlus /> 添加分支
                    </button>
                  </div>
                  
                  <div className="branch-container">
                    {project.branches.map(branch => (
                      <div key={branch.id} className="relative group mb-2">
                        <button
                          onClick={() => handleBranchChange(branch)}
                          className={`px-4 py-1 rounded-md branch-btn ${
                            selectedBranch && selectedBranch.id === branch.id 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {branch.name}
                        </button>
                        
                        {/* 分支操作按钮 */}
                        <button 
                          className="opacity-0 group-hover:opacity-100 absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-sm text-gray-500 hover:text-primary transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            openBranchRenameForm(branch);
                          }}
                        >
                          <FiEdit size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedBranch && (
                  <ProjectFlow 
                    key={selectedBranch.id}
                    project={project} 
                    selectedBranch={selectedBranch}
                    onNodeSelect={handleNodeClick}
                  />
                )}
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

      {/* 分支重命名表单 */}
      {showBranchRenameForm && (
        <BranchForm 
          initialName={branchToRename?.name || ''}
          title="重命名分支"
          submitLabel="重命名"
          onClose={() => {
            setShowBranchRenameForm(false);
            setBranchToRename(null);
          }} 
          onSubmit={handleBranchRename}
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