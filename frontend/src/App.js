import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';

// 导入页面
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container sx={{ flex: 1, py: 4 }} maxWidth={false}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:projectName" element={<ProjectDetail />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App; 