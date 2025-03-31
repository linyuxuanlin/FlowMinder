import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// 导入API服务
import { projectApi } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    local_path: '',
  });

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      const projectsData = await projectApi.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // 创建项目
  const createProject = async () => {
    try {
      await projectApi.createProject(formData);
      setOpenCreateDialog(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // 更新项目
  const updateProject = async () => {
    try {
      await projectApi.updateProject(currentProject.id, formData);
      setOpenEditDialog(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  // 删除项目
  const deleteProject = async () => {
    try {
      await projectApi.deleteProject(currentProject.id);
      setOpenDeleteDialog(false);
      setCurrentProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      local_path: '',
    });
  };

  // 打开编辑对话框
  const handleEdit = (project) => {
    setCurrentProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      local_path: project.local_path || '',
    });
    setOpenEditDialog(true);
  };

  // 打开删除对话框
  const handleDelete = (project) => {
    setCurrentProject(project);
    setOpenDeleteDialog(true);
  };

  // 处理表单变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 加载项目列表
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          FlowMinder
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          创建项目
        </Button>
      </Box>

      {/* 项目列表 */}
      <Grid container spacing={3}>
        {projects.length > 0 ? (
          projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
              >
                <CardContent
                  sx={{ flexGrow: 1 }}
                  onClick={() => navigate(`/projects/${encodeURIComponent(project.name)}`)}
                >
                  <Typography variant="h6" component="h2">
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description || '没有描述'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    本地路径: {project.local_path || '使用默认路径'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project);
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
              没有项目，请创建一个新项目。
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* 创建项目对话框 */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>创建新项目</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="项目名称"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="项目描述"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
          />
          <TextField
            margin="dense"
            name="local_path"
            label="本地路径 (可选)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.local_path}
            onChange={handleChange}
            helperText="留空将使用默认路径"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>取消</Button>
          <Button onClick={createProject} disabled={!formData.name}>
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* 编辑项目对话框 */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>编辑项目</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="项目名称"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="项目描述"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
          />
          <TextField
            margin="dense"
            name="local_path"
            label="本地路径 (可选)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.local_path}
            onChange={handleChange}
            helperText="留空将使用默认路径"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>取消</Button>
          <Button onClick={updateProject} disabled={!formData.name}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除项目对话框 */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>删除项目</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除项目 "{currentProject?.name}" 吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>取消</Button>
          <Button onClick={deleteProject} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home; 