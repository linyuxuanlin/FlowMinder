const express = require('express');
const router = express.Router();
const flowController = require('../controllers/flowController');

// 获取完整的流程配置
router.get('/', flowController.getFlowConfig);

// 从配置文件同步流程
router.post('/sync-from-config', flowController.syncFromConfig);

// 将流程同步到配置文件
router.post('/sync-to-config', flowController.syncToConfig);

module.exports = router; 