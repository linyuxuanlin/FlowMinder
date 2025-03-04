import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import TaskBoard from './components/TaskBoard';
import TaskEditor from './components/TaskEditor';
import Sidebar from './components/Sidebar';
import { useSocket } from './contexts/SocketContext';
import { Task, TaskRelation } from './types';
import { fetchTasks, fetchTaskRelations } from './services/api';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [relations, setRelations] = useState<TaskRelation[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  // 加载任务和关系数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [tasksData, relationsData] = await Promise.all([
          fetchTasks(),
          fetchTaskRelations()
        ]);
        setTasks(tasksData);
        setRelations(relationsData);
        setError(null);
      } catch (err) {
        setError('加载数据失败，请稍后重试');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 监听Socket事件
  useEffect(() => {
    if (!socket) return;

    // 监听任务更新
    socket.on('task:update', (updatedTask: Task) => {
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      
      // 如果当前选中的任务被更新，也更新选中的任务
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
    });

    // 监听任务创建
    socket.on('task:create', (newTask: Task) => {
      setTasks(prevTasks => [...prevTasks, newTask]);
    });

    // 监听任务删除
    socket.on('task:delete', (taskId: string) => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    });

    // 监听关系更新
    socket.on('relation:update', (updatedRelation: TaskRelation) => {
      setRelations(prevRelations => 
        prevRelations.map(relation => relation.id === updatedRelation.id ? updatedRelation : relation)
      );
    });

    // 监听关系创建
    socket.on('relation:create', (newRelation: TaskRelation) => {
      setRelations(prevRelations => [...prevRelations, newRelation]);
    });

    // 监听关系删除
    socket.on('relation:delete', (relationId: string) => {
      setRelations(prevRelations => prevRelations.filter(relation => relation.id !== relationId));
    });

    return () => {
      socket.off('task:update');
      socket.off('task:create');
      socket.off('task:delete');
      socket.off('relation:update');
      socket.off('relation:create');
      socket.off('relation:delete');
    };
  }, [socket, selectedTask]);

  // 处理任务选择
  const handleTaskSelect = (task: Task | null) => {
    setSelectedTask(task);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar tasks={tasks} onSelectTask={handleTaskSelect} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">FlowMinder</h1>
          </div>
        </header>
        
        <main className="flex-1 flex overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-hidden">
                <ReactFlowProvider>
                  <TaskBoard 
                    tasks={tasks} 
                    relations={relations} 
                    onSelectTask={handleTaskSelect} 
                    selectedTask={selectedTask} 
                  />
                </ReactFlowProvider>
              </div>
              
              {selectedTask && (
                <div className="w-1/3 border-l border-gray-200 overflow-auto">
                  <TaskEditor 
                    task={selectedTask} 
                    onClose={() => setSelectedTask(null)} 
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;