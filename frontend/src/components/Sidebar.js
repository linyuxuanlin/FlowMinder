import React, { useState } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskIcon from '@mui/icons-material/Task';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import { v4 as uuidv4 } from 'uuid';

function Sidebar({ open, createNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nodeType, setNodeType] = useState('main');
  const [nodeLabel, setNodeLabel] = useState('');

  // 打开创建节点对话框
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // 关闭创建节点对话框
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNodeType('main');
    setNodeLabel('');
  };

  // 创建新节点
  const handleCreateNode = () => {
    if (!nodeLabel.trim()) return;

    const newNode = {
      id: uuidv4(),
      position: { x: 100, y: 100 },
      data: {
        label: nodeLabel,
        type: nodeType,
        content: '',
        status: 'not-started'
      }
    };

    createNode(newNode);
    handleCloseDialog();
  };

  return (
    <Box
      sx={{
        width: open ? 280 : 0,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: 'width 0.3s',
        height: '100%',
        pt: 8, // 为顶部导航栏留出空间
        borderRight: '1px solid #ddd',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          项目管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={handleOpenDialog}
        >
          创建新节点
        </Button>
      </Box>

      <Divider />

      <List>
        <ListItem button>
          <ListItemIcon>
            <TaskIcon />
          </ListItemIcon>
          <ListItemText primary="所有任务" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <SubtitlesIcon />
          </ListItemIcon>
          <ListItemText primary="主线任务" />
        </ListItem>
      </List>

      {/* 创建节点对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>创建新节点</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="node-label"
            label="节点标题"
            type="text"
            fullWidth
            variant="outlined"
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth>
            <InputLabel id="node-type-label">节点类型</InputLabel>
            <Select
              labelId="node-type-label"
              id="node-type"
              value={nodeType}
              label="节点类型"
              onChange={(e) => setNodeType(e.target.value)}
            >
              <MenuItem value="main">主线任务</MenuItem>
              <MenuItem value="sub">支线任务</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleCreateNode} variant="contained">
            创建
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sidebar;