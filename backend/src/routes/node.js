const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/nodeController');

// 获取所有节点
router.get('/', nodeController.getAllNodes);

// 获取单个节点
router.get('/:id', nodeController.getNodeById);

// 创建节点
router.post('/', nodeController.createNode);

// 更新节点
router.put('/:id', nodeController.updateNode);

// 更新节点位置
router.put('/:id/position', nodeController.updateNodePosition);

// 删除节点
router.delete('/:id', nodeController.deleteNode);

module.exports = router; 