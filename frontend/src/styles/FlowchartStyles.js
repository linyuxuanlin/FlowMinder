// 流程图相关的样式

export const nodeTypes = {
  main: {
    backgroundColor: '#d7ccc8', // 浅棕色
    borderWidth: 2,
    borderColor: '#8d6e63', // 更深的棕色
    borderStyle: 'solid',
    padding: '10px',
    borderRadius: '8px',
    minWidth: '150px',
    textAlign: 'center',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  secondary: {
    padding: '10px',
    borderRadius: '8px',
    minWidth: '130px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }
};

export const nodeStatusColors = {
  in_progress: {
    backgroundColor: '#ffd54f', // 浅黄色
    borderColor: '#ffb300',
  },
  completed: {
    backgroundColor: '#81c784', // 浅绿色
    borderColor: '#4caf50',
  },
  abandoned: {
    backgroundColor: '#e0e0e0', // 浅灰色
    borderColor: '#9e9e9e',
  },
};

export const edgeStyles = {
  default: {
    stroke: '#8d6e63',
    strokeWidth: 2,
    markerEnd: {
      type: 'arrowclosed',
    },
  },
};

export const panelStyles = {
  propertyPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '300px',
    height: '100%',
    backgroundColor: '#fff',
    borderLeft: '1px solid #e0e0e0',
    padding: '16px',
    overflowY: 'auto',
    transition: 'transform 0.3s ease-in-out',
  },
  branchHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
}; 