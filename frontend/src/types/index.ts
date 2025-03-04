// 任务节点类型
export interface TaskNode {
  id: string;
  title: string;
  content: string;
  status: TaskStatus;
  parentId?: string;
  position: {
    x: number;
    y: number;
  };
  filePath?: string; // 本地Markdown文件路径
}

// 任务状态枚举
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

// 任务连接类型
export interface TaskConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

// 任务流配置类型
export interface FlowConfig {
  nodes: TaskNode[];
  connections: TaskConnection[];
  lastUpdated: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 