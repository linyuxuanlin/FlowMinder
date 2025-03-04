const express = require('express');
const router = express.Router();
const flowController = require('../controllers/flowController');

// 获取流程
router.get('/', flowController.getFlow);

// 更新流程
router.put('/', flowController.updateFlow);

// 从配置文件同步流程
router.post('/sync-from-config', flowController.syncFlowFromConfig);

module.exports = router; 