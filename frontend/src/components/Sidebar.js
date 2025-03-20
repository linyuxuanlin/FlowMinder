import React from 'react';
import { FiPlus, FiFolderPlus } from 'react-icons/fi';

const Sidebar = ({ isOpen, projects, currentProjectId, onProjectClick, onAddProject }) => {
  return (
    <aside 
      className={`bg-gray-800 text-white h-full sidebar-transition ${
        isOpen ? 'w-64' : 'w-16'
      } flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className={`font-medium ${isOpen ? 'block' : 'hidden'}`}>项目</h2>
        <button 
          onClick={onAddProject}
          className="p-2 hover:bg-gray-700 rounded-md"
          title="新建项目"
        >
          <FiFolderPlus size={20} />
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {projects.map(project => (
          <div 
            key={project.id}
            onClick={() => onProjectClick(project.id)}
            className={`p-4 flex items-center cursor-pointer hover:bg-gray-700 ${
              project.id === currentProjectId ? 'bg-gray-700' : ''
            }`}
          >
            <FiFolderPlus size={20} className="min-w-[20px]" />
            {isOpen && (
              <span className="ml-3 truncate">{project.name}</span>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={onAddProject}
          className={`w-full flex items-center justify-center ${
            isOpen ? 'justify-start' : 'justify-center'
          } p-2 bg-primary hover:bg-opacity-90 rounded-md`}
        >
          <FiPlus size={20} />
          {isOpen && <span className="ml-2">新建项目</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 