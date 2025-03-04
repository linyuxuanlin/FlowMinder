import React from 'react';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-secondary-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <FlowCanvas />
        </main>
      </div>
    </div>
  );
};

export default App; 