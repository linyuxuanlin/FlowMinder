import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/material/styles';

// 悬浮时显示的控制按钮
const ActionButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: theme.palette.common.white,
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  width: 30,
  height: 30,
  '& .MuiSvgIcon-root': {
    fontSize: 18,
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

// 节点组件
const Node = ({
  node,
  position,
  selected,
  onSelect,
  onAddMainNode, 
  onAddSecondaryNode
}) => {
  const [hover, setHover] = useState(false);
  
  // 根据节点类型确定样式
  const getNodeStyles = () => {
    const isMain = node.type === 'main';
    const isSecondary = node.type === 'secondary';
    
    const baseStyles = {
      position: 'absolute',
      left: position.x,
      top: position.y,
      width: position.width,
      height: position.height,
      borderRadius: '8px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      zIndex: selected ? 10 : 1,
      boxSizing: 'border-box',
      userSelect: 'none',
    };
    
    // 主节点样式
    const mainStyles = {
      backgroundColor: '#d7ccc8', // 浅棕色
      border: '2px solid #8d6e63', // 更深的棕色
      boxShadow: selected 
        ? '0 0 0 2px #8d6e63, 0 0 10px rgba(0,0,0,0.3)' 
        : '0 2px 5px rgba(0,0,0,0.1)',
      fontWeight: 'bold',
    };
    
    // 二级节点样式，根据状态不同显示不同颜色
    const secondaryStyles = {
      backgroundColor: 
        node.status === 'completed' ? '#81c784' : // 已完成 - 浅绿色
        node.status === 'abandoned' ? '#e0e0e0' : // 已弃用 - 浅灰色
        '#ffd54f', // 默认进行中 - 浅黄色
      border: `2px solid ${
        node.status === 'completed' ? '#4caf50' : 
        node.status === 'abandoned' ? '#9e9e9e' : 
        '#ffb300'
      }`,
      boxShadow: selected 
        ? `0 0 0 2px ${node.status === 'completed' ? '#4caf50' : node.status === 'abandoned' ? '#9e9e9e' : '#ffb300'}, 0 0 10px rgba(0,0,0,0.3)` 
        : '0 2px 4px rgba(0,0,0,0.1)',
    };
    
    // 三级节点样式 - 使用与二级节点类似但更浅的颜色
    const thirdLevelStyles = {
      ...secondaryStyles,
      backgroundColor: 
        node.status === 'completed' ? '#a5d6a7' : // 更浅的绿色
        node.status === 'abandoned' ? '#eeeeee' : // 更浅的灰色
        '#fff176', // 更浅的黄色
      border: `2px dashed ${
        node.status === 'completed' ? '#4caf50' : 
        node.status === 'abandoned' ? '#9e9e9e' : 
        '#ffb300'
      }`,
    };
    
    // 合并样式
    if (isMain) {
      return { ...baseStyles, ...mainStyles };
    } else if (isSecondary) {
      return { ...baseStyles, ...secondaryStyles };
    } else {
      return { ...baseStyles, ...thirdLevelStyles };
    }
  };
  
  // 鼠标悬停处理
  const handleMouseEnter = () => {
    setHover(true);
  };
  
  // 鼠标离开处理
  const handleMouseLeave = () => {
    setHover(false);
  };
  
  // 点击添加下级节点
  const handleAddMainNodeClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    onAddMainNode(node);
  };
  
  // 点击添加子节点
  const handleAddSecondaryNodeClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    onAddSecondaryNode(node);
  };
  
  // 判断是否显示下级和子级按钮 - 移除对三级节点的限制
  const showDownButton = true; // 允许所有节点添加下级节点
  const showRightButton = true; // 允许所有节点添加子级节点
  
  // 根据节点类型获取提示文本
  const getDownButtonTooltip = () => {
    if (node.type === 'secondary' || node.type === 'tertiary' || node.type === 'third_level') return "添加后续节点";
    return "添加下级主节点";
  };
  
  const getRightButtonTooltip = () => {
    if (node.type === 'secondary') return "添加三级节点";
    if (node.type === 'tertiary' || node.type === 'third_level') return "添加下一级节点";
    return "添加二级节点";
  };
  
  return (
    <Box
      sx={getNodeStyles()}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Typography variant="subtitle1" noWrap sx={{ maxWidth: '100%' }}>
        {node.name}
      </Typography>
      
      {/* 下方添加按钮 - 添加下级节点 */}
      {showDownButton && (hover || selected) && (
        <Tooltip title={getDownButtonTooltip()}>
          <ActionButton
            size="small"
            onClick={handleAddMainNodeClick}
            sx={{
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20
            }}
          >
            <KeyboardArrowDownIcon />
          </ActionButton>
        </Tooltip>
      )}
      
      {/* 右侧添加按钮 - 添加子节点 */}
      {showRightButton && (hover || selected) && (
        <Tooltip title={getRightButtonTooltip()}>
          <ActionButton
            size="small"
            onClick={handleAddSecondaryNodeClick}
            sx={{
              right: '-15px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20
            }}
          >
            <AddIcon />
          </ActionButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default Node; 