from sqlalchemy import Column, String, Integer, ForeignKey, Float, DateTime, func
from sqlalchemy.orm import relationship
from uuid import uuid4
from app.db.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    name = Column(String, index=True)
    path = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    branches = relationship("Branch", back_populates="project", cascade="all, delete-orphan")

class Branch(Base):
    __tablename__ = "branches"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    name = Column(String, index=True)
    project_id = Column(String, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="branches")
    nodes = relationship("Node", back_populates="branch", cascade="all, delete-orphan")

class Node(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    name = Column(String, index=True)
    branch_id = Column(String, ForeignKey("branches.id"))
    parent_id = Column(String, ForeignKey("nodes.id"), nullable=True)
    level = Column(Integer, default=1)  # 1: 主节点, 2+: 次级节点
    status = Column(String, default="in_progress")  # in_progress, completed, abandoned
    position_x = Column(Float, default=0)
    position_y = Column(Float, default=0)

    branch = relationship("Branch", back_populates="nodes")
    parent = relationship("Node", remote_side=[id], backref="children") 