import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function NodeDetail({ open, setOpen, node, updateNodeContent, updateNodeStatus }) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // 当选中的节点改变时，更新状态
  useEffect(() => {
    if (node) {
      setContent(node.data.content || '');
      setStatus(node.data.status || 'not-started');
    }
  }, [node]);

  // 处理内容变化
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // 处理状态变化
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    updateNodeStatus(node.id, newStatus);
  };

  // 保存内容
  const handleSaveContent = () => {
    updateNodeContent(node.id, content);
  };

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 关闭抽屉
  const handleClose = () => {
    setOpen(false);
  };

  if (!node) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      classes={{ paper: 'node-detail-drawer' }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{node.data.label}</Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="status-label">状态</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            value={status}
            label="状态"
            onChange={handleStatusChange}
          >
            <MenuItem value="not-started">未开始</MenuItem>
            <MenuItem value="in-progress">进行中</MenuItem>
            <MenuItem value="completed">已完成</MenuItem>
          </Select>
        </FormControl>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="编辑" />
          <Tab label="预览" />
        </Tabs>

        {tabValue === 0 ? (
          <TextField
            multiline
            fullWidth
            minRows={12}
            maxRows={20}
            value={content}
            onChange={handleContentChange}
            variant="outlined"
            placeholder="在这里输入Markdown内容..."
            className="markdown-editor"
          />
        ) : (
          <Box className="markdown-preview">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <Typography color="textSecondary">暂无内容</Typography>
            )}
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSaveContent}>
            保存
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default NodeDetail;