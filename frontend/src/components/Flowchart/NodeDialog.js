import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

const NodeDialog = ({
  open,
  onClose,
  onSave,
  node = null,
  dialogType = 'create', // 'create' 或 'edit'
}) => {
  const [nodeData, setNodeData] = useState({
    name: '',
    description: '',
    status: 'in_progress'
  });
  
  // 当节点数据变化时更新表单
  useEffect(() => {
    if (node && dialogType === 'edit') {
      setNodeData({
        name: node.name || '',
        description: node.description || '',
        status: node.status || 'in_progress',
      });
    } else {
      // 创建新节点时的默认值
      setNodeData({
        name: '',
        description: '',
        status: 'in_progress'
      });
    }
  }, [node, dialogType, open]);
  
  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNodeData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 提交表单
  const handleSubmit = () => {
    if (!nodeData.name.trim()) {
      return; // 名称不能为空
    }
    
    onSave(nodeData);
  };
  
  const dialogTitle = dialogType === 'create' 
    ? '创建新节点' 
    : '编辑节点';
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            name="name"
            label="节点名称"
            value={nodeData.name}
            onChange={handleChange}
            fullWidth
            required
            autoFocus
            error={!nodeData.name.trim()}
            helperText={!nodeData.name.trim() ? '节点名称不能为空' : ''}
          />
          
          <TextField
            name="description"
            label="节点描述"
            value={nodeData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          
          {dialogType === 'edit' && (
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select
                name="status"
                value={nodeData.status}
                onChange={handleChange}
                label="状态"
              >
                <MenuItem value="in_progress">进行中</MenuItem>
                <MenuItem value="completed">已完成</MenuItem>
                <MenuItem value="abandoned">已弃用</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!nodeData.name.trim()}
        >
          {dialogType === 'create' ? '创建' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeDialog; 