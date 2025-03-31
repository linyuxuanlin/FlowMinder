import React, { useState, useEffect, useCallback } from 'react';
import MermaidDiagram from './MermaidDiagram';
import { Box, Button, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

/**
 * Git流程图组件
 * @param {Object} props 组件属性
 * @param {Array} props.nodes 节点数据
 * @param {string} props.branchName 主分支名称
 */
const GitFlowChart = ({ nodes = [], branchName = 'TSENS' }) => {
  const [mermaidCode, setMermaidCode] = useState('');
  const [direction, setDirection] = useState('TB');
  
  // 从节点数据生成Mermaid格式的Git流程图代码
  const generateMermaidCode = useCallback(() => {
    // 找出所有主节点
    const mainNodes = nodes.filter(node => node.type === 'main')
      .sort((a, b) => a.position - b.position);
    
    if (mainNodes.length === 0) {
      setMermaidCode('');
      return;
    }
    
    let code = `%%{init: { 'logLevel': 'debug', 'theme': 'base', 'gitGraph': {'mainBranchName': '${branchName}'}} }%%\n`;
    code += `gitGraph ${direction}:\n`;
    
    // 添加配置
    code += `  config:\n    gitGraph:\n      parallelCommits: true\n---\n`;
    
    // 添加初始提交
    code += `  commit id: "Init"\n`;
    
    // 处理分支和提交
    const branches = new Set();
    const branchNodes = {}; // 按分支组织节点
    
    // 预处理：按分支整理节点
    nodes.forEach(node => {
      if (node.branch) {
        if (!branchNodes[node.branch]) {
          branchNodes[node.branch] = [];
          branches.add(node.branch);
        }
        branchNodes[node.branch].push(node);
      }
    });
    
    // 创建LLTR分支并添加相关节点
    if (branchNodes['LLTR']) {
      code += `  commit id: "LLTR"\n`;
      code += `  branch LLTR\n`;
      branchNodes['LLTR'].forEach(node => {
        // 根据节点内容设置不同的样式
        if (node.title === "搜集资料") {
          code += `  commit id: "搜集资料" tag: "阶段开始"\n`;
        } else if (node.title === "制作PPT") { 
          code += `  commit id: "制作PPT" tag: "阶段PPT"\n`;
        } else {
          code += `  commit id: "${node.title || node.name || '未命名节点'}"\n`;
        }
      });
      // 切换回主分支并合并LLTR
      code += `  checkout ${branchName}\n`;
      code += `  merge LLTR\n`;
    }
    
    // 创建P0分支并添加相关节点
    if (branchNodes['P0']) {
      code += `  commit id: "P0"\n`;
      code += `  branch P0\n`;
      branchNodes['P0'].forEach(node => {
        // 根据节点内容设置不同的样式
        if (node.title === "准备程序") {
          code += `  commit id: "准备程序" tag: "准备阶段"\n`;
        } else if (node.title === "测试程序") {
          code += `  commit id: "测试程序" tag: "测试阶段"\n`;
        } else {
          code += `  commit id: "${node.title || node.name || '未命名节点'}"\n`;
        }
      });
      // 切换回主分支
      code += `  checkout ${branchName}\n`;
    }
    
    // 添加P1-P3节点
    ['P1', 'P2', 'P3'].forEach(phase => {
      if (branchNodes[phase] && branchNodes[phase].length > 0) {
        code += `  commit id: "${phase}"\n`;
      }
    });
    
    setMermaidCode(code);
  }, [nodes, branchName, direction]);
  
  // 生成Mermaid代码
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      generateMermaidCode();
    }
  }, [nodes, branchName, direction, generateMermaidCode]);

  // 复制代码到剪贴板
  const handleCopyCode = () => {
    navigator.clipboard.writeText(mermaidCode)
      .then(() => {
        alert('代码已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {mermaidCode ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Git流程图</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="direction-select-label">图表方向</InputLabel>
                <Select
                  labelId="direction-select-label"
                  value={direction}
                  label="图表方向"
                  onChange={(e) => setDirection(e.target.value)}
                >
                  <MenuItem value={'TB'}>从上到下</MenuItem>
                  <MenuItem value={'LR'}>从左到右</MenuItem>
                </Select>
              </FormControl>
              <Button 
                startIcon={<ContentCopyIcon />} 
                size="small" 
                onClick={handleCopyCode}
                variant="outlined"
              >
                复制代码
              </Button>
            </Box>
          </Box>
          
          <MermaidDiagram chart={mermaidCode} style={{ minHeight: '400px' }} direction={direction} />
          
          <Paper 
            elevation={1} 
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#f5f5f5', 
              fontFamily: 'monospace',
              position: 'relative',
              whiteSpace: 'pre-wrap'
            }}
          >
            <Button 
              size="small" 
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={handleCopyCode}
              startIcon={<ContentCopyIcon />}
            >
              复制
            </Button>
            <Typography component="pre" sx={{ maxHeight: '200px', overflow: 'auto' }}>
              {mermaidCode}
            </Typography>
          </Paper>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          没有数据可以生成Git流程图
        </Typography>
      )}
    </Box>
  );
};

export default GitFlowChart;