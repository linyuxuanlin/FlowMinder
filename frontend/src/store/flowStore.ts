import { create } from 'zustand';
import axios from 'axios';
import { TaskNode, TaskConnection, TaskStatus, FlowConfig } from '../types';

interface FlowState {
  nodes: TaskNode[];
  connections: TaskConnection[];
  selectedNodeId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  fetchFlow: () => Promise<void>;
  addNode: (node: Omit<TaskNode, 'id'>) => Promise<void>;
  updateNode: (id: string, updates: Partial<TaskNode>) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  addConnection: (connection: Omit<TaskConnection, 'id'>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  selectNode: (id: string | null) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => Promise<void>;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  connections: [],
  selectedNodeId: null,
  isLoading: false,
  error: null,

  fetchFlow: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/flow`);
      const flowConfig: FlowConfig = response.data.data;
      set({ 
        nodes: flowConfig.nodes, 
        connections: flowConfig.connections,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching flow:', error);
      set({ 
        error: '获取任务流数据失败', 
        isLoading: false 
      });
    }
  },

  addNode: async (nodeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/nodes`, nodeData);
      const newNode: TaskNode = response.data.data;
      set(state => ({ 
        nodes: [...state.nodes, newNode],
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error adding node:', error);
      set({ 
        error: '添加节点失败', 
        isLoading: false 
      });
    }
  },

  updateNode: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/api/nodes/${id}`, updates);
      const updatedNode: TaskNode = response.data.data;
      set(state => ({ 
        nodes: state.nodes.map(node => node.id === id ? updatedNode : node),
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error updating node:', error);
      set({ 
        error: '更新节点失败', 
        isLoading: false 
      });
    }
  },

  deleteNode: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/api/nodes/${id}`);
      set(state => ({ 
        nodes: state.nodes.filter(node => node.id !== id),
        connections: state.connections.filter(
          conn => conn.sourceId !== id && conn.targetId !== id
        ),
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error deleting node:', error);
      set({ 
        error: '删除节点失败', 
        isLoading: false 
      });
    }
  },

  addConnection: async (connectionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/api/connections`, connectionData);
      const newConnection: TaskConnection = response.data.data;
      set(state => ({ 
        connections: [...state.connections, newConnection],
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error adding connection:', error);
      set({ 
        error: '添加连接失败', 
        isLoading: false 
      });
    }
  },

  deleteConnection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/api/connections/${id}`);
      set(state => ({ 
        connections: state.connections.filter(conn => conn.id !== id),
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error deleting connection:', error);
      set({ 
        error: '删除连接失败', 
        isLoading: false 
      });
    }
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  updateNodePosition: async (id, position) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, position } : node
      )
    }));
    
    try {
      await axios.put(`${API_URL}/api/nodes/${id}/position`, { position });
    } catch (error) {
      console.error('Error updating node position:', error);
      set({ error: '更新节点位置失败' });
    }
  }
})); 