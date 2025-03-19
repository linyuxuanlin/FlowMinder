import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header';
import ProjectsList from './components/projects/ProjectsList';
import ProjectDetails from './components/projects/ProjectDetails';
import TaskView from './components/tasks/TaskView';
import CreateProject from './components/projects/CreateProject';
import EditProject from './components/projects/EditProject';
import CreateTask from './components/tasks/CreateTask';
import NotFound from './components/common/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<ProjectsList />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/projects/:id/edit" element={<EditProject />} />
            <Route path="/projects/:projectId/tasks/new" element={<CreateTask />} />
            <Route path="/tasks/:id" element={<TaskView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App; 