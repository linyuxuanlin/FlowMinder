import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface Project {
  _id: string;
  name: string;
  description: string;
  configPath: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  isMainNode: boolean;
}

interface FlowConfig {
  nodes: any[];
  edges: any[];
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [flowConfig, setFlowConfig] = useState<FlowConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${id}`);
        setProject(res.data.project);
        setTasks(res.data.tasks);
        setFlowConfig(res.data.config);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('加载项目详情失败，请稍后重试');
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="p-4 text-center">项目不存在</div>;
  }

  const mainTasks = tasks.filter(task => task.isMainNode);
  const subTasks = tasks.filter(task => !task.isMainNode);

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <Link
            to={`/projects/${project._id}/tasks/new`}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            创建任务
          </Link>
        </div>
        <p className="text-gray-600 mt-2">{project.description || '暂无描述'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">任务流</h2>
        <div className="flow-container bg-gray-100 p-4 rounded border">
          {/* 这里将来会实现任务流可视化 */}
          <div className="text-center py-12 text-gray-500">
            任务流视图将在这里显示
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">主线任务</h2>
          {mainTasks.length === 0 ? (
            <div className="text-gray-500 p-4 border rounded">暂无主线任务</div>
          ) : (
            <div className="space-y-3">
              {mainTasks.map(task => (
                <div key={task._id} className="border rounded p-3 task-node main-node">
                  <Link to={`/tasks/${task._id}`} className="font-medium hover:text-blue-500">
                    {task.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {task.description || '暂无描述'}
                  </p>
                  <div className="flex justify-end mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status === 'completed' ? '已完成' :
                       task.status === 'in_progress' ? '进行中' : '待处理'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">支线任务</h2>
          {subTasks.length === 0 ? (
            <div className="text-gray-500 p-4 border rounded">暂无支线任务</div>
          ) : (
            <div className="space-y-3">
              {subTasks.map(task => (
                <div key={task._id} className="border rounded p-3 task-node sub-node">
                  <Link to={`/tasks/${task._id}`} className="font-medium hover:text-blue-500">
                    {task.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {task.description || '暂无描述'}
                  </p>
                  <div className="flex justify-end mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status === 'completed' ? '已完成' :
                       task.status === 'in_progress' ? '进行中' : '待处理'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails; 