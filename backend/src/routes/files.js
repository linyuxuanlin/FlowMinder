const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

// 获取工作区文件列表
router.get('/', fileController.getWorkspaceFiles);

// 读取文件内容
router.get('/:filePath(*)', fileController.getFileContent);

// 更新文件内容
router.put('/:filePath(*)', fileController.updateFileContent);

// 创建文件
router.post('/:filePath(*)', fileController.createFile);

// 删除文件
router.delete('/:filePath(*)', fileController.deleteFile);

module.exports = router; 