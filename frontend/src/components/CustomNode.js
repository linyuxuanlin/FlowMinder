import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Box, Typography, Chip } from '@mui/material';

function CustomNode({ data, isConnectable }) {
  // 确定节点类型样式
  const nodeTypeClass = data.type === 'main' ? 'main' : 'sub';
  
  // 确定状态样式
  const statusClass = data.status === 'completed' ? 'completed' : 
                     data.status === 'in-progress' ? 'in-progress' : '';
  
  // 状态文本
  const statusText = data.status === 'completed' ? '已完成' : 
                    data.status === 'in-progress' ? '进行中' : '未开始';

  return (
    <div className={`custom-node ${nodeTypeClass}`}>
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      
      {/* 节点头部 */}
      <div className="custom-node-header">
        <Typography className="custom-node-title" variant="subtitle1">
          {data.label}
        </Typography>
        <Chip 
          label={statusText}
          size="small"
          className={`custom-node-status ${statusClass}`}
        />
      </div>
      
      {/* 节点内容预览 */}
      <Box className="custom-node-content">
        {data.content ? (
          <Typography variant="body2">
            {data.content.length > 150 
              ? `${data.content.substring(0, 150)}...` 
              : data.content}
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary">
            暂无内容
          </Typography>
        )}
      </Box>
      
      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default CustomNode;