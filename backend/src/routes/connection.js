const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');

// 获取所有连接
router.get('/', connectionController.getAllConnections);

// 获取单个连接
router.get('/:id', connectionController.getConnectionById);

// 创建连接
router.post('/', connectionController.createConnection);

// 更新连接
router.put('/:id', connectionController.updateConnection);

// 删除连接
router.delete('/:id', connectionController.deleteConnection);

module.exports = router; 