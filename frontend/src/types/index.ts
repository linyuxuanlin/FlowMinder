export interface Task {
  id: string;
  title: string;
  content: string;
  status: string;
  parentId: string | null;
  filePath: string;
  positionX: number;
  positionY: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TaskRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskNode {
  id: string;
  type: string;
  data: Task;
  position: {
    x: number;
    y: number;
  };
}

export interface TaskEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  data?: TaskRelation;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}