from sqlalchemy.orm import Session
from app.models.models import Project, Branch, Node
from app.schemas.schemas import ProjectCreate, ProjectUpdate, BranchCreate, NodeCreate
import json
import os
import uuid

def get_projects(db: Session):
    return db.query(Project).all()

def get_project(db: Session, project_id: str):
    return db.query(Project).filter(Project.id == project_id).first()

def create_project(db: Session, project: ProjectCreate):
    db_project = Project(
        id=str(uuid.uuid4()),
        name=project.name,
        path=project.path if project.path else os.path.join(os.getcwd(), "projects")
    )
    db.add(db_project)
    
    # 创建默认分支
    default_branch = Branch(
        id=str(uuid.uuid4()),
        name="Branch 1",
        project_id=db_project.id
    )
    db.add(default_branch)
    
    # 创建默认起始节点
    start_node = Node(
        id=str(uuid.uuid4()),
        name="Start",
        branch_id=default_branch.id,
        level=1
    )
    db.add(start_node)
    
    db.commit()
    db.refresh(db_project)
    
    # 创建本地项目文件
    if db_project.path:
        create_local_project_file(db_project)
    
    return db_project

def update_project(db: Session, project_id: str, project: ProjectUpdate):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project:
        for key, value in project.model_dump(exclude_unset=True).items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
        
        # 更新本地文件
        if db_project.path:
            create_local_project_file(db_project)
        
    return db_project

def delete_project(db: Session, project_id: str):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project:
        # 删除本地文件
        try:
            if db_project.path and os.path.exists(f"{db_project.path}/{db_project.id}.json"):
                os.remove(f"{db_project.path}/{db_project.id}.json")
        except Exception as e:
            print(f"Error deleting local file: {e}")
        
        db.delete(db_project)
        db.commit()
        return True
    return False

def create_local_project_file(project):
    """创建本地项目文件"""
    try:
        if not os.path.exists(project.path):
            os.makedirs(project.path, exist_ok=True)
        
        project_file = f"{project.path}/{project.id}.json"
        
        # 项目数据结构
        project_data = {
            "id": project.id,
            "name": project.name,
            "path": project.path,
            "branches": []
        }
        
        # 添加分支数据
        for branch in project.branches:
            branch_data = {
                "id": branch.id,
                "name": branch.name,
                "nodes": []
            }
            
            # 添加节点数据
            for node in branch.nodes:
                node_data = {
                    "id": node.id,
                    "name": node.name,
                    "level": node.level,
                    "status": node.status,
                    "parent_id": node.parent_id,
                    "position_x": node.position_x,
                    "position_y": node.position_y
                }
                branch_data["nodes"].append(node_data)
            
            project_data["branches"].append(branch_data)
        
        # 写入文件
        with open(project_file, 'w', encoding='utf-8') as f:
            json.dump(project_data, f, ensure_ascii=False, indent=2)
            
    except Exception as e:
        print(f"Error creating local project file: {e}") 