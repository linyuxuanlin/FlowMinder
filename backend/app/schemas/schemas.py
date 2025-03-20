from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Node Schemas
class NodeBase(BaseModel):
    name: str
    level: int = 1
    status: str = "in_progress"
    position_x: float = 0
    position_y: float = 0

class NodeCreate(NodeBase):
    branch_id: str
    parent_id: Optional[str] = None

class NodeUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None

class NodeResponse(NodeBase):
    id: str
    branch_id: str
    parent_id: Optional[str] = None
    
    class Config:
        from_attributes = True

# Branch Schemas
class BranchBase(BaseModel):
    name: str

class BranchCreate(BranchBase):
    project_id: str

class BranchUpdate(BaseModel):
    name: Optional[str] = None

class BranchResponse(BranchBase):
    id: str
    project_id: str
    
    class Config:
        from_attributes = True

class BranchWithNodes(BranchResponse):
    nodes: List[NodeResponse] = []

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    path: str

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    path: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProjectWithBranches(ProjectResponse):
    branches: List[BranchResponse] = []

class ProjectFull(ProjectResponse):
    branches: List[BranchWithNodes] = [] 