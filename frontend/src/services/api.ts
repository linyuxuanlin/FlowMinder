import axios from 'axios';
import { Task, TaskRelation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 拦截器设置认证令牌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 任务相关API
export const fetchTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const fetchTask = async (id: string): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

// 任务关系相关API
export const fetchTaskRelations = async (): Promise<TaskRelation[]> => {
  const response = await api.get('/relations');
  return response.data;
};

export const createTaskRelation = async (relation: Omit<TaskRelation, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskRelation> => {
  const response = await api.post('/relations', relation);
  return response.data;
};

export const updateTaskRelation = async (id: string, relation: Partial<TaskRelation>): Promise<TaskRelation> => {
  const response = await api.put(`/relations/${id}`, relation);
  return response.data;
};

export const deleteTaskRelation = async (id: string): Promise<void> => {
  await api.delete(`/relations/${id}`);
};

// 用户认证相关API
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data.user;
};

export const register = async (email: string, password: string, name: string) => {
  const response = await api.post('/auth/register', { email, password, name });
  localStorage.setItem('token', response.data.token);
  return response.data.user;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export default api;