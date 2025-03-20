import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 项目相关API
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (project) => api.post('/projects', project);
export const updateProject = (id, project) => api.put(`/projects/${id}`, project);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// 分支相关API
export const getBranches = (projectId) => api.get(`/projects/${projectId}/branches`);
export const createBranch = (projectId, branch) => api.post(`/projects/${projectId}/branches`, branch);
export const updateBranch = (branchId, branch) => api.put(`/branches/${branchId}`, branch);
export const deleteBranch = (branchId) => api.delete(`/branches/${branchId}`);

// 节点相关API
export const getNodes = (branchId) => api.get(`/branches/${branchId}/nodes`).then(response => response.data);
export const createNode = (branchId, node) => api.post(`/branches/${branchId}/nodes`, node);
export const updateNode = (nodeId, node) => api.put(`/nodes/${nodeId}`, node);
export const deleteNode = (nodeId) => api.delete(`/nodes/${nodeId}`);

export default api; 