import axios from 'axios';

// API基础URL - 直接使用相对路径，让代理或Docker网络处理正确的路由
const API_BASE_URL = '/api/v1';

// 项目相关API
export const projectApi = {
  // 获取所有项目
  getProjects: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/`);
      return response.data;
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  },

  // 获取项目详情
  getProjectById: async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`获取项目详情失败 (ID: ${projectId}):`, error);
      throw error;
    }
  },

  // 根据项目名称获取项目
  getProjectByName: async (projectName) => {
    try {
      // 获取所有项目
      const response = await axios.get(`${API_BASE_URL}/projects/`);
      // 查找匹配名称的项目
      const project = response.data.find(p => p.name === decodeURIComponent(projectName));
      if (!project) {
        throw new Error(`找不到名称为 "${projectName}" 的项目`);
      }
      return project;
    } catch (error) {
      console.error(`通过名称获取项目失败 (Name: ${projectName}):`, error);
      throw error;
    }
  },

  // 创建项目
  createProject: async (projectData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/`, projectData);
      return response.data;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  },

  // 更新项目
  updateProject: async (projectId, projectData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`更新项目失败 (ID: ${projectId}):`, error);
      throw error;
    }
  },

  // 删除项目
  deleteProject: async (projectId) => {
    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
      return true;
    } catch (error) {
      console.error(`删除项目失败 (ID: ${projectId}):`, error);
      throw error;
    }
  },
};

// 分支相关API
export const branchApi = {
  // 获取项目的所有分支
  getBranchesByProjectId: async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/branches/?project_id=${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`获取分支列表失败 (Project ID: ${projectId}):`, error);
      throw error;
    }
  },

  // 创建分支
  createBranch: async (branchData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/branches/`, branchData);
      return response.data;
    } catch (error) {
      console.error('创建分支失败:', error);
      throw error;
    }
  },

  // 更新分支
  updateBranch: async (branchId, branchData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/branches/${branchId}`, branchData);
      return response.data;
    } catch (error) {
      console.error(`更新分支失败 (ID: ${branchId}):`, error);
      throw error;
    }
  },

  // 删除分支
  deleteBranch: async (branchId) => {
    try {
      await axios.delete(`${API_BASE_URL}/branches/${branchId}`);
      return true;
    } catch (error) {
      console.error(`删除分支失败 (ID: ${branchId}):`, error);
      throw error;
    }
  },
};

// 节点相关API
export const nodeApi = {
  // 获取分支的所有节点
  getNodesByBranchId: async (branchId, parentId = null) => {
    try {
      let url = `${API_BASE_URL}/nodes/?branch_id=${branchId}`;
      if (parentId !== null) {
        url += `&parent_id=${parentId}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`获取节点列表失败 (Branch ID: ${branchId}):`, error);
      throw error;
    }
  },

  // 获取节点详情
  getNodeById: async (nodeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nodes/${nodeId}`);
      return response.data;
    } catch (error) {
      console.error(`获取节点详情失败 (ID: ${nodeId}):`, error);
      throw error;
    }
  },

  // 创建节点
  createNode: async (nodeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/nodes/`, nodeData);
      return response.data;
    } catch (error) {
      console.error('创建节点失败:', error);
      throw error;
    }
  },

  // 更新节点
  updateNode: async (nodeId, nodeData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/nodes/${nodeId}`, nodeData);
      return response.data;
    } catch (error) {
      console.error(`更新节点失败 (ID: ${nodeId}):`, error);
      throw error;
    }
  },

  // 删除节点
  deleteNode: async (nodeId) => {
    try {
      await axios.delete(`${API_BASE_URL}/nodes/${nodeId}`);
      return true;
    } catch (error) {
      console.error(`删除节点失败 (ID: ${nodeId}):`, error);
      throw error;
    }
  },
}; 