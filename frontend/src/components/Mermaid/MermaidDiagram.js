import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Box, Paper } from '@mui/material';

// 初始化mermaid配置
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true
  },
  gitGraph: {
    showBranches: true,
    showCommitLabel: true,
    mainBranchName: 'TSENS',
    mainBranchOrder: 1,
    rotateCommitLabel: false,
    arrowMarkerAbsolute: false,
    labelColor: '#000000',
    nodeSpacing: 100,
    nodePadding: 10,
    branchColors: ['#ffbc00', '#b76ef0', '#1e88e5'],
    nodeLabel: {
      width: 75,
      height: 30,
      x: -50,
      y: -50
    }
  }
});

/**
 * Mermaid图表组件
 * @param {Object} props 组件属性
 * @param {string} props.chart mermaid图表定义
 * @param {Object} props.style 额外的样式
 * @param {string} props.direction 图表方向，可选 'TB' (自上而下) 或 'LR' (从左到右)
 */
const MermaidDiagram = ({ chart, style, direction = 'TB' }) => {
  const mermaidRef = useRef(null);
  
  useEffect(() => {
    if (mermaidRef.current && chart) {
      // 每次渲染前清空内容
      mermaidRef.current.innerHTML = '';
      
      // 支持方向设置
      let processedChart = chart;
      if (direction && !chart.includes('gitGraph TB:') && !chart.includes('gitGraph LR:')) {
        processedChart = chart.replace('gitGraph', `gitGraph ${direction}:`);
      }
      
      // 使用mermaid库渲染图表
      try {
        mermaid.render('mermaid-svg', processedChart, (svgCode) => {
          mermaidRef.current.innerHTML = svgCode;
          
          // 添加自定义CSS
          const svgElement = mermaidRef.current.querySelector('svg');
          if (svgElement) {
            // 为不同类型的节点添加不同的样式
            const styleElement = document.createElement('style');
            styleElement.textContent = `
              .node.LLTR rect { fill: #b76ef0 !important; }
              .node.P0 rect { fill: #1e88e5 !important; }
              .node.tag-阶段开始 rect { fill: #9c27b0 !important; }
              .node.tag-阶段PPT rect { fill: #673ab7 !important; }
              .node.tag-准备阶段 rect { fill: #2196f3 !important; }
              .node.tag-测试阶段 rect { fill: #03a9f4 !important; }
            `;
            svgElement.appendChild(styleElement);
          }
        });
      } catch (error) {
        console.error('Mermaid渲染失败:', error);
        mermaidRef.current.innerHTML = `<div class="error">图表渲染失败: ${error.message}</div>`;
      }
    }
  }, [chart, direction]);

  return (
    <Paper elevation={1} style={{ padding: '16px', overflow: 'auto', ...style }}>
      <Box ref={mermaidRef} />
    </Paper>
  );
};

export default MermaidDiagram;