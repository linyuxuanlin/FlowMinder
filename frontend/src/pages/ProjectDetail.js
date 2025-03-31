import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// 导入API服务
import { projectApi, branchApi, nodeApi } from '../services/api';
// 导入流程图组件
import Flowchart from '../components/Flowchart/Flowchart';
// 导入Git流程图组件
import GitFlowChart from '../components/Mermaid/GitFlowChart';

const ProjectDetail = () => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [branches, setBranches] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [openCreateBranchDialog, setOpenCreateBranchDialog] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [nodes, setNodes] = useState([]);
  
  const menuOpen = Boolean(menuAnchorEl);

  // 获取项目详情
  const fetchProject = async () => {
    try {
      const projectData = await projectApi.getProjectByName(projectName);
      setProject(projectData);
    } catch (error) {
      console.error('获取项目详情失败:', error);
      showAlert('获取项目详情失败', 'error');
    }
  };

  // 获取分支列表
  const fetchBranches = async () => {
    try {
      if (!project) return;
      
      const branchesData = await branchApi.getBranchesByProjectId(project.id);
      setBranches(branchesData);
      if (branchesData.length > 0 && !selectedBranch) {
        setSelectedBranch(branchesData[0]);
      }
    } catch (error) {
      console.error('获取分支列表失败:', error);
      showAlert('获取分支列表失败', 'error');
    }
  };

  // 创建分支
  const createBranch = async () => {
    try {
      if (!project) return;
      
      const branchData = {
        name: branchName,
        project_id: project.id,
        order: branches.length // 新分支放在最后
      };
      
      const newBranch = await branchApi.createBranch(branchData);
      
      setOpenCreateBranchDialog(false);
      setBranchName('');
      fetchBranches();
      showAlert('分支创建成功', 'success');
      
      // 设置新创建的分支为选中分支
      setSelectedBranch(newBranch);
    } catch (error) {
      console.error('创建分支失败:', error);
      showAlert('创建分支失败', 'error');
    }
  };

  // 显示提示信息
  const showAlert = (message, severity = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // 打开/关闭抽屉
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 打开菜单
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // 关闭菜单
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // 删除项目
  const handleDeleteProject = async () => {
    try {
      if (!project) return;
      
      await projectApi.deleteProject(project.id);
      navigate('/');
    } catch (error) {
      console.error('删除项目失败:', error);
      showAlert('删除项目失败', 'error');
    }
  };

  // 编辑项目
  const handleEditProject = () => {
    // TODO: 实现编辑项目功能
    handleMenuClose();
  };
  
  // 选择分支
  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    fetchNodes(branch.id);
  };

  // 获取节点数据
  const fetchNodes = async (branchId) => {
    if (!branchId) return;
    
    try {
      const nodesData = await nodeApi.getNodesByBranchId(branchId);
      setNodes(nodesData);
    } catch (error) {
      console.error('获取节点数据失败:', error);
      showAlert('获取节点数据失败', 'error');
    }
  };

  // 第一次加载时获取项目信息
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProject();
  }, [projectName]);
  
  // 当项目信息变更时获取分支信息
  useEffect(() => {
    if (project) {
      fetchBranches();
    }
  }, [project]);
  
  // 当选中分支初次载入时获取节点数据
  useEffect(() => {
    if (selectedBranch && selectedBranch.id) {
      fetchNodes(selectedBranch.id);
    }
  }, [selectedBranch?.id]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 顶栏 */}
      <AppBar position="fixed">
        <Toolbar variant="dense">
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            FlowMinder
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            {project?.name || '加载中...'}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditProject}>编辑项目</MenuItem>
            <MenuItem onClick={handleDeleteProject}>删除项目</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* 侧栏 */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            top: '48px',
            height: 'calc(100% - 48px)',
          },
        }}
      >
        <List>
          <ListItem button onClick={() => navigate('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="主页" />
          </ListItem>
          <Divider />
          <ListItem>
            <Typography variant="subtitle1">项目列表</Typography>
          </ListItem>
          {/* TODO: 实现项目列表 */}
          <ListItem button onClick={() => {}}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="创建新项目" />
          </ListItem>
        </List>
      </Drawer>

      {/* 主要内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          pt: 0,
          mt: '48px',
          ml: drawerOpen ? '240px' : 0,
          transition: 'margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
          height: 'calc(100vh - 48px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            mb: 0
          }}
        >
          {/* 分支选择栏 */}
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>分支:</Typography>
            {branches.map((branch) => (
              <Button
                key={branch.id}
                variant={selectedBranch?.id === branch.id ? "contained" : "outlined"}
                size="small"
                sx={{ mr: 1, mb: 0.5 }}
                onClick={() => handleSelectBranch(branch)}
              >
                {branch.name}
              </Button>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => setOpenCreateBranchDialog(true)}
              sx={{ mr: 1, mb: 0.5 }}
            >
              创建分支
            </Button>
          </Box>

          {/* 流程图区域 */}
          {selectedBranch ? (
            <>
              <Flowchart 
                branchId={selectedBranch.id} 
                onNodesChange={setNodes}
              />
              {/* Git流程图视图 */}
              <Box sx={{ mt: 2, p: 1, borderTop: '1px solid #eee' }}>
                <GitFlowChart 
                  nodes={nodes} 
                  branchName={selectedBranch.name} 
                />
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                请选择或创建一个分支来查看流程图
              </Typography>
            </Box>
          )}
          
          {/* 节点属性面板 - 使用现有面板 */}
        </Paper>
      </Box>

      {/* 创建分支对话框 */}
      <Dialog 
        open={openCreateBranchDialog} 
        onClose={() => setOpenCreateBranchDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>创建新分支</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="分支名称"
            type="text"
            fullWidth
            variant="outlined"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateBranchDialog(false)}>取消</Button>
          <Button onClick={createBranch} disabled={!branchName}>创建</Button>
        </DialogActions>
      </Dialog>

      {/* 提示信息 */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetail; 