const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// 获取所有任务
router.get('/', taskController.getAllTasks);

// 获取单个任务
router.get('/:id', taskController.getTaskById);

// 创建任务
router.post('/', taskController.createTask);

// 更新任务
router.put('/:id', taskController.updateTask);

// 删除任务
router.delete('/:id', taskController.deleteTask);

// 从文件同步任务
router.post('/:id/sync-from-file', taskController.syncTaskFromFile);

module.exports = router; 