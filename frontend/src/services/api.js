import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 项目相关API
export const getProjects = () => api.get('/api/projects');
export const getProject = (id) => api.get(`/api/projects/${id}`);
export const createProject = (project) => api.post('/api/projects', project);
export const updateProject = (id, project) => api.put(`/api/projects/${id}`, project);
export const deleteProject = (id) => api.delete(`/api/projects/${id}`);

// 分支相关API
export const getBranches = (projectId) => api.get(`/api/projects/${projectId}/branches`);
export const createBranch = (projectId, branch) => api.post(`/api/projects/${projectId}/branches`, branch);
export const updateBranch = (branchId, branch) => api.put(`/api/branches/${branchId}`, branch);
export const deleteBranch = (branchId) => api.delete(`/api/branches/${branchId}`);

// 节点相关API
export const getNodes = (branchId) => api.get(`/api/branches/${branchId}/nodes`);
export const createNode = (branchId, node) => api.post(`/api/branches/${branchId}/nodes`, node);
export const updateNode = (nodeId, node) => api.put(`/api/nodes/${nodeId}`, node);
export const deleteNode = (nodeId) => api.delete(`/api/nodes/${nodeId}`);

export default api; 