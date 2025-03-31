import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// 创建全局样式
const GlobalStyles = {
  html: {
    height: '100%',
    width: '100%',
  },
  body: {
    height: '100%',
    width: '100%',
    margin: 0,
    padding: 0,
  },
  '#root': {
    height: '100%',
    width: '100%',
  }
};

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#8d6e63', // 棕色
    },
    secondary: {
      main: '#78909c', // 蓝灰色
    },
    background: {
      default: '#f5f5f5',
    },
    status: {
      inProgress: '#ffd54f', // 进行中 - 浅黄色
      completed: '#81c784', // 已完成 - 浅绿色
      abandoned: '#e0e0e0', // 已弃用 - 浅灰色
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: GlobalStyles
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
); 