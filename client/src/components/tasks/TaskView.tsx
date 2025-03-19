import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// 添加API_URL常量
const API_URL = 'http://localhost:5000';

interface Task {
  _id: string;
  title: string;
  description: string;
  filePath: string;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  projectId: string;
  parentId: string | null;
  isMainNode: boolean;
  updatedAt: string;
}

const TaskView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/tasks/${id}`);
        setTask(res.data.task);
        setContent(res.data.content);
        setEditedContent(res.data.content);
        setStatus(res.data.task.status);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('加载任务失败，请稍后重试');
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  const handleContentSave = async () => {
    if (!task) return;
    
    try {
      setSaveLoading(true);
      await axios.put(`${API_URL}/api/tasks/${task._id}/content`, {
        content: editedContent
      });
      
      setContent(editedContent);
      setIsEditing(false);
      setSaveLoading(false);
    } catch (err) {
      console.error('Error saving content:', err);
      setSaveLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    
    try {
      await axios.put(`${API_URL}/api/tasks/${task._id}`, {
        status: newStatus
      });
      
      setStatus(newStatus);
      setTask({
        ...task,
        status: newStatus as Task['status']
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!task) {
    return <div className="p-4 text-center">任务不存在</div>;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Link 
            to={`/projects/${task.projectId}`}
            className="text-blue-500 hover:text-blue-600 mb-2 inline-block"
          >
            ← 返回项目
          </Link>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="flex items-center space-x-4 mt-1">
            <span className={`inline-block px-2 py-1 rounded text-sm ${
              status === 'completed' ? 'bg-green-100 text-green-800' :
              status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              status === 'abandoned' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {status === 'completed' ? '已完成' :
               status === 'in_progress' ? '进行中' :
               status === 'abandoned' ? '已弃用' :
               '待处理'}
            </span>
            <span className="text-sm text-gray-500">
              最后更新: {new Date(task.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border rounded py-1 px-2 text-sm bg-white"
          >
            <option value="pending">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="abandoned">已弃用</option>
          </select>
          
          <button
            onClick={() => {
              if (isEditing) {
                handleContentSave();
              } else {
                setIsEditing(true);
              }
            }}
            className={`py-1 px-3 rounded text-white text-sm ${
              isEditing 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={saveLoading}
          >
            {saveLoading 
              ? '保存中...' 
              : isEditing 
                ? '保存' 
                : '编辑'}
          </button>
          
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedContent(content);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm"
            >
              取消
            </button>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        {isEditing ? (
          <div className="markdown-editor">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="markdown-editor-input"
              placeholder="使用Markdown编辑内容..."
            />
            <div className="markdown-preview">
              <ReactMarkdown>{editedContent}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <div>
          <span>类型: {task.isMainNode ? '主线任务' : '支线任务'}</span>
          {task.parentId && (
            <span className="ml-4">父任务ID: {task.parentId}</span>
          )}
        </div>
        <div>
          文件路径: {task.filePath}
        </div>
      </div>
    </div>
  );
};

export default TaskView; 