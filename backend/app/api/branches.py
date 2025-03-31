from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db.database import get_db
from app.models.branch import Branch
from app.models.project import Project

router = APIRouter()

# Pydantic 模型
class BranchBase(BaseModel):
    name: str
    order: Optional[int] = 0

class BranchCreate(BranchBase):
    project_id: int

class BranchUpdate(BranchBase):
    name: Optional[str] = None
    order: Optional[int] = None

class BranchResponse(BranchBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 路由
@router.post("/", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch(branch: BranchCreate, db: Session = Depends(get_db)):
    # 检查项目是否存在
    project = db.query(Project).filter(Project.id == branch.project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_branch = Branch(
        name=branch.name,
        order=branch.order,
        project_id=branch.project_id
    )
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.get("/", response_model=List[BranchResponse])
def read_branches(project_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Branch)
    if project_id:
        query = query.filter(Branch.project_id == project_id)
    branches = query.offset(skip).limit(limit).all()
    return branches

@router.get("/{branch_id}", response_model=BranchResponse)
def read_branch(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch

@router.put("/{branch_id}", response_model=BranchResponse)
def update_branch(branch_id: int, branch: BranchUpdate, db: Session = Depends(get_db)):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    update_data = branch.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_branch, key, value)
    
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_branch(branch_id: int, db: Session = Depends(get_db)):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    db.delete(db_branch)
    db.commit()
    return None 