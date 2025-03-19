declare module 'reactflow' {
  import * as React from 'react';
  
  export interface NodeProps {
    id: string;
    data: any;
    position: { x: number; y: number };
    type?: string;
    style?: React.CSSProperties;
  }
  
  export interface EdgeProps {
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
    style?: React.CSSProperties;
    markerEnd?: {
      type: string;
      width: number;
      height: number;
      color: string;
    };
  }
  
  export interface ReactFlowProps {
    nodes: NodeProps[];
    edges: EdgeProps[];
    onNodeClick?: (event: React.MouseEvent, node: NodeProps) => void;
    onInit?: (instance: any) => void;
    connectionLineType?: string;
    fitView?: boolean;
    nodeTypes?: Record<string, React.ComponentType<any>>;
  }
  
  export interface BackgroundProps {
    variant?: string;
    gap?: number;
    size?: number;
    color?: string;
  }
  
  export interface ControlsProps {
    position?: string;
    showZoom?: boolean;
    showFitView?: boolean;
    showInteractive?: boolean;
  }
  
  export const Background: React.FC<BackgroundProps>;
  export const Controls: React.FC<ControlsProps>;
  
  export type Node = NodeProps;
  export type Edge = EdgeProps;
  export type ReactFlowInstance = any;
  
  export const MarkerType: {
    Arrow: string;
    ArrowClosed: string;
  };
  
  export const ConnectionLineType: {
    Bezier: string;
    Straight: string;
    Step: string;
    SmoothStep: string;
  };
  
  const ReactFlow: React.FC<ReactFlowProps>;
  export default ReactFlow;
} 