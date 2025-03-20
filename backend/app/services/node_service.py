from sqlalchemy.orm import Session
from app.models.models import Node, Branch, Project
from app.schemas.schemas import NodeCreate, NodeUpdate
import uuid
from app.services.project_service import create_local_project_file

def get_nodes(db: Session, branch_id: str):
    return db.query(Node).filter(Node.branch_id == branch_id).all()

def get_node(db: Session, node_id: str):
    return db.query(Node).filter(Node.id == node_id).first()

def create_node(db: Session, node: NodeCreate):
    # 确定节点级别
    if node.parent_id:
        parent_node = db.query(Node).filter(Node.id == node.parent_id).first()
        if parent_node:
            # 如果是创建的二级节点，设置level为父节点level+1
            level = parent_node.level + 1
        else:
            level = node.level
    else:
        level = node.level
    
    db_node = Node(
        id=str(uuid.uuid4()),
        name=node.name,
        branch_id=node.branch_id,
        parent_id=node.parent_id,
        level=level,
        status=node.status,
        position_x=node.position_x,
        position_y=node.position_y
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    
    # 更新本地项目文件
    branch = db.query(Branch).filter(Branch.id == node.branch_id).first()
    if branch:
        project = db.query(Project).filter(Project.id == branch.project_id).first()
        if project and project.path:
            create_local_project_file(project)
    
    return db_node

def update_node(db: Session, node_id: str, node: NodeUpdate):
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if db_node:
        for key, value in node.model_dump(exclude_unset=True).items():
            setattr(db_node, key, value)
        db.commit()
        db.refresh(db_node)
        
        # 更新本地项目文件
        branch = db.query(Branch).filter(Branch.id == db_node.branch_id).first()
        if branch:
            project = db.query(Project).filter(Project.id == branch.project_id).first()
            if project and project.path:
                create_local_project_file(project)
    
    return db_node

def delete_node(db: Session, node_id: str):
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if db_node:
        branch_id = db_node.branch_id
        db.delete(db_node)
        db.commit()
        
        # 更新本地项目文件
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if branch:
            project = db.query(Project).filter(Project.id == branch.project_id).first()
            if project and project.path:
                create_local_project_file(project)
        
        return True
    return False 