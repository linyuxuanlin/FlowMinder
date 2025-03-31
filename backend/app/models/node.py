from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.database import Base

class NodeStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class NodeType(str, enum.Enum):
    MAIN = "main"
    SECONDARY = "secondary"
    TERTIARY = "tertiary"

class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(Enum(NodeStatus), default=NodeStatus.IN_PROGRESS)
    type = Column(Enum(NodeType), nullable=False)
    order = Column(Integer, default=0)  # 用于排序
    parent_id = Column(Integer, ForeignKey("nodes.id"), nullable=True)  # 可以为空，表示顶级节点
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    branch = relationship("Branch", back_populates="nodes")
    parent = relationship("Node", remote_side=[id], backref="children")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status.value if self.status else None,
            "type": self.type.value if self.type else None,
            "order": self.order,
            "parent_id": self.parent_id,
            "branch_id": self.branch_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        } 