import React from 'react';

// 连接线（边）组件
const Edge = ({
  sourcePosition,
  targetPosition,
  type = 'main',
  selected,
  onClick
}) => {
  // 计算连接线路径
  const generatePath = () => {
    const { x: x1, y: y1 } = sourcePosition;
    const { x: x2, y: y2 } = targetPosition;
    
    // 根据类型决定连线样式
    switch (type) {
      case 'main': 
        // 主节点之间的垂直连接（从下到上）
        const mainMidY = (y1 + y2) / 2;
        return `M ${x1} ${y1} L ${x1} ${mainMidY} L ${x2} ${mainMidY} L ${x2} ${y2}`;
        
      case 'siblings': 
        // 判断是垂直连接还是水平连接
        if (Math.abs(y1 - y2) > Math.abs(x1 - x2)) {
          // 垂直连接 - 适用于主节点之间
          const siblingMidY = (y1 + y2) / 2;
          return `M ${x1} ${y1} L ${x1} ${siblingMidY} L ${x2} ${siblingMidY} L ${x2} ${y2}`;
        } else {
          // 水平连接 - 适用于同级的二级/三级节点
          const siblingMidX = (x1 + x2) / 2;
          return `M ${x1} ${y1} L ${siblingMidX} ${y1} L ${siblingMidX} ${y2} L ${x2} ${y2}`;
        }
        
      case 'secondary':
      case 'tertiary':
        // 水平连接（从左到右）- 父节点到子节点
        const midX = (x1 + x2) / 2;
        return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        
      default:
        // 默认为直线连接
        return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
  };
  
  // 计算箭头位置和方向
  const calculateArrow = () => {
    const { x: x1, y: y1 } = sourcePosition;
    const { x: x2, y: y2 } = targetPosition;
    
    // 判断是垂直连接还是水平连接
    const isVertical = Math.abs(y1 - y2) > Math.abs(x1 - x2);
    
    if (type === 'main' || (type === 'siblings' && isVertical)) {
      // 垂直连接箭头，指向下方
      return {
        points: `${x2},${y2 - 8} ${x2 - 5},${y2 - 15} ${x2 + 5},${y2 - 15}`,
        transform: ''
      };
    } else if (type === 'siblings' && !isVertical) {
      // 水平连接箭头，指向右方（同级二级/三级节点）
      return {
        points: `${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5} ${x2},${y2}`,
        transform: ''
      };
    } else if (type === 'secondary' || type === 'tertiary') {
      // 水平连接箭头，指向右方（父子关系）
      return {
        points: `${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5} ${x2},${y2}`,
        transform: ''
      };
    }
    
    // 默认箭头
    return {
      points: `${x2},${y2} ${x2 - 5},${y2 - 5} ${x2 - 5},${y2 + 5}`,
      transform: ''
    };
  };
  
  const arrow = calculateArrow();
  
  // 确定是否使用虚线（仅对同级节点类型的连接使用虚线）
  const isDashed = type === 'siblings';
  
  return (
    <>
      {/* 连接线路径 */}
      <path
        d={generatePath()}
        stroke={selected ? '#1976d2' : '#555'}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
        strokeDasharray={isDashed ? '5,5' : 'none'}
      />
      
      {/* 箭头 */}
      <polygon
        points={arrow.points}
        transform={arrow.transform}
        fill={selected ? '#1976d2' : '#555'}
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      />
    </>
  );
};

export default Edge; 