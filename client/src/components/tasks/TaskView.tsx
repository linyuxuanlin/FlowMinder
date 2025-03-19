import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Task {
  _id: string;
  title: string;
  description: string;
  filePath: string;
  status: 'pending' | 'in_progress' | 'completed';
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/${id}`);
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
      await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task._id}/content`, {
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
      await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task._id}`, {
        status: newStatus
      });
      
      setStatus(newStatus);
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
    <div className="p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="flex space-x-3">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border rounded py-1 px-2 text-sm bg-white"
            >
              <option value="pending">待处理</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
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
        <div className="text-sm text-gray-500 mt-1">
          最后更新: {new Date(task.updatedAt).toLocaleString()}
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
    </div>
  );
};

export default TaskView; 