from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

from app.db.database import get_db
from app.models.node import Node, NodeStatus, NodeType
from app.models.branch import Branch

router = APIRouter()

# Pydantic 模型
class NodeStatusEnum(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class NodeTypeEnum(str, Enum):
    MAIN = "main"
    SECONDARY = "secondary"
    TERTIARY = "tertiary"

class NodeBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[NodeStatusEnum] = NodeStatusEnum.IN_PROGRESS
    type: NodeTypeEnum
    order: Optional[int] = 0
    parent_id: Optional[int] = None

class NodeCreate(NodeBase):
    branch_id: int

class NodeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[NodeStatusEnum] = None
    order: Optional[int] = None

class NodeResponse(NodeBase):
    id: int
    branch_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 路由
@router.post("/", response_model=NodeResponse, status_code=status.HTTP_201_CREATED)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    # 检查分支是否存在
    branch = db.query(Branch).filter(Branch.id == node.branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    # 如果有父节点，检查父节点是否存在
    if node.parent_id:
        parent_node = db.query(Node).filter(Node.id == node.parent_id).first()
        if parent_node is None:
            raise HTTPException(status_code=404, detail="Parent node not found")
    
    db_node = Node(
        name=node.name,
        description=node.description,
        status=node.status,
        type=node.type,
        order=node.order,
        parent_id=node.parent_id,
        branch_id=node.branch_id
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

@router.get("/", response_model=List[NodeResponse])
def read_nodes(
    branch_id: Optional[int] = None, 
    parent_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(Node)
    if branch_id:
        query = query.filter(Node.branch_id == branch_id)
    if parent_id is not None:  # 包括 parent_id = 0 的情况
        query = query.filter(Node.parent_id == parent_id)
    nodes = query.offset(skip).limit(limit).all()
    return nodes

@router.get("/{node_id}", response_model=NodeResponse)
def read_node(node_id: int, db: Session = Depends(get_db)):
    node = db.query(Node).filter(Node.id == node_id).first()
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

@router.put("/{node_id}", response_model=NodeResponse)
def update_node(node_id: int, node: NodeUpdate, db: Session = Depends(get_db)):
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if db_node is None:
        raise HTTPException(status_code=404, detail="Node not found")
    
    update_data = node.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_node, key, value)
    
    db.commit()
    db.refresh(db_node)
    return db_node

@router.delete("/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(node_id: int, db: Session = Depends(get_db)):
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if db_node is None:
        raise HTTPException(status_code=404, detail="Node not found")
    
    db.delete(db_node)
    db.commit()
    return None 