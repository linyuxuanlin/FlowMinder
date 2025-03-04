import React, { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useFlowStore } from '../store/flowStore';
import TaskNode from './TaskNode';

const FlowCanvas: React.FC = () => {
  const { nodes, connections, fetchFlow, updateNodePosition } = useFlowStore();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchFlow();
  }, [fetchFlow]);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragNodeId(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragNodeId) {
      const node = nodes.find(n => n.id === dragNodeId);
      if (node) {
        updateNodePosition(dragNodeId, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNodeId(null);
  };

  const renderConnections = () => {
    return connections.map(connection => {
      const sourceNode = nodes.find(node => node.id === connection.sourceId);
      const targetNode = nodes.find(node => node.id === connection.targetId);
      
      if (!sourceNode || !targetNode) return null;
      
      // 简单计算连接线的起点和终点
      const startX = sourceNode.position.x + 128; // 节点宽度的一半
      const startY = sourceNode.position.y + 100; // 估计节点高度的一半
      const endX = targetNode.position.x;
      const endY = targetNode.position.y + 100;
      
      return (
        <svg 
          key={connection.id}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <defs>
            <marker
              id={`arrowhead-${connection.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
          <path
            d={`M ${startX} ${startY} L ${endX} ${endY}`}
            stroke="#94a3b8"
            strokeWidth="2"
            fill="none"
            markerEnd={`url(#arrowhead-${connection.id})`}
          />
          {connection.label && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2 - 10}
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
              fontFamily="sans-serif"
              backgroundColor="#ffffff"
            >
              {connection.label}
            </text>
          )}
        </svg>
      );
    });
  };

  return (
    <div 
      className="w-full h-full bg-secondary-50 relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent 
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <div className="relative w-full h-full">
            {renderConnections()}
            {nodes.map(node => (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                  cursor: isDragging && dragNodeId === node.id ? 'grabbing' : 'grab',
                  zIndex: isDragging && dragNodeId === node.id ? 10 : 1
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              >
                <TaskNode node={node} />
              </div>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default FlowCanvas; 