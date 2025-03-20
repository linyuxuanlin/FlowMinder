from sqlalchemy.orm import Session
from app.models.models import Branch, Project
from app.schemas.schemas import BranchCreate, BranchUpdate
import uuid
from app.services.project_service import create_local_project_file

def get_branches(db: Session, project_id: str):
    return db.query(Branch).filter(Branch.project_id == project_id).all()

def get_branch(db: Session, branch_id: str):
    return db.query(Branch).filter(Branch.id == branch_id).first()

def create_branch(db: Session, branch: BranchCreate):
    db_branch = Branch(
        id=str(uuid.uuid4()),
        name=branch.name,
        project_id=branch.project_id
    )
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    
    # 更新本地项目文件
    project = db.query(Project).filter(Project.id == branch.project_id).first()
    if project and project.path:
        create_local_project_file(project)
    
    return db_branch

def update_branch(db: Session, branch_id: str, branch: BranchUpdate):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if db_branch:
        for key, value in branch.model_dump(exclude_unset=True).items():
            setattr(db_branch, key, value)
        db.commit()
        db.refresh(db_branch)
        
        # 更新本地项目文件
        project = db.query(Project).filter(Project.id == db_branch.project_id).first()
        if project and project.path:
            create_local_project_file(project)
    
    return db_branch

def delete_branch(db: Session, branch_id: str):
    db_branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if db_branch:
        project_id = db_branch.project_id
        db.delete(db_branch)
        db.commit()
        
        # 更新本地项目文件
        project = db.query(Project).filter(Project.id == project_id).first()
        if project and project.path:
            create_local_project_file(project)
        
        return True
    return False 