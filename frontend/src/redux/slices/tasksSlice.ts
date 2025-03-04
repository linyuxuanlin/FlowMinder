import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Task {
  id: string;
  title: string;
  type: 'main' | 'branch';
  parent: string | null;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  position: {
    x: number;
    y: number;
  };
  content: string;
  metadata: {
    priority: string;
    dueDate: string | null;
    assignee: string;
    subtasks: {
      description: string;
      completed: boolean;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

interface TasksState {
  items: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  selectedTask: null,
  loading: false,
  error: null,
};

// 异步操作
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await api.get('/tasks');
  return response.data;
});

export const fetchTaskById = createAsyncThunk('tasks/fetchTaskById', async (id: string) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
});

export const createTask = createAsyncThunk('tasks/createTask', async (task: Partial<Task>) => {
  const response = await api.post('/tasks', task);
  return response.data;
});

export const updateTask = createAsyncThunk('tasks/updateTask', async (task: Partial<Task>) => {
  const response = await api.put(`/tasks/${task.id}`, task);
  return response.data;
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string) => {
  await api.delete(`/tasks/${id}`);
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    updateTaskPosition: (state, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
      const { id, position } = action.payload;
      const task = state.items.find(task => task.id === id);
      if (task) {
        task.position = position;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取任务失败';
      })
      // fetchTaskById
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取任务详情失败';
      })
      // createTask
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建任务失败';
      })
      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新任务失败';
      })
      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(task => task.id !== action.payload);
        if (state.selectedTask && state.selectedTask.id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '删除任务失败';
      });
  },
});

export const { setSelectedTask, updateTaskPosition } = tasksSlice.actions;
export default tasksSlice.reducer; 