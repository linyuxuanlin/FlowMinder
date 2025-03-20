from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json

from app.db.database import engine, Base, get_db
from app.models import models
from app.schemas import schemas
from app.services import project_service, branch_service, node_service
from app.core.config import settings

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket连接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# WebSocket路由
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# 健康检查路由
@app.get("/")
def read_root():
    return {"message": "FlowMinder API is running!"}

# 项目API路由
@app.get("/api/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    projects = project_service.get_projects(db)
    return projects

@app.post("/api/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return project_service.create_project(db, project)

@app.get("/api/projects/{project_id}", response_model=schemas.ProjectFull)
def get_project(project_id: str, db: Session = Depends(get_db)):
    db_project = project_service.get_project(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="项目未找到")
    return db_project

@app.put("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: str, project: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    db_project = project_service.update_project(db, project_id, project)
    if db_project is None:
        raise HTTPException(status_code=404, detail="项目未找到")
    return db_project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    success = project_service.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="项目未找到")
    return {"message": "项目已删除"}

# 分支API路由
@app.get("/api/projects/{project_id}/branches", response_model=List[schemas.BranchResponse])
def get_branches(project_id: str, db: Session = Depends(get_db)):
    return branch_service.get_branches(db, project_id)

@app.post("/api/projects/{project_id}/branches", response_model=schemas.BranchResponse)
def create_branch(project_id: str, branch: schemas.BranchCreate, db: Session = Depends(get_db)):
    # 打印接收到的数据，帮助调试
    print(f"Creating branch with project_id: {project_id}, branch data: {branch}")
    
    # 确保设置了project_id字段
    branch_data = branch.model_dump()
    branch_data["project_id"] = project_id
    branch_obj = schemas.BranchCreate(**branch_data)
    
    return branch_service.create_branch(db, branch_obj)

@app.put("/api/branches/{branch_id}", response_model=schemas.BranchResponse)
def update_branch(branch_id: str, branch: schemas.BranchUpdate, db: Session = Depends(get_db)):
    db_branch = branch_service.update_branch(db, branch_id, branch)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="分支未找到")
    return db_branch

@app.delete("/api/branches/{branch_id}")
def delete_branch(branch_id: str, db: Session = Depends(get_db)):
    success = branch_service.delete_branch(db, branch_id)
    if not success:
        raise HTTPException(status_code=404, detail="分支未找到")
    return {"message": "分支已删除"}

# 节点API路由
@app.get("/api/branches/{branch_id}/nodes", response_model=List[schemas.NodeResponse])
def get_nodes(branch_id: str, db: Session = Depends(get_db)):
    return node_service.get_nodes(db, branch_id)

@app.post("/api/branches/{branch_id}/nodes", response_model=schemas.NodeResponse)
def create_node(branch_id: str, node: schemas.NodeCreate, db: Session = Depends(get_db)):
    node.branch_id = branch_id
    return node_service.create_node(db, node)

@app.put("/api/nodes/{node_id}", response_model=schemas.NodeResponse)
def update_node(node_id: str, node: schemas.NodeUpdate, db: Session = Depends(get_db)):
    db_node = node_service.update_node(db, node_id, node)
    if db_node is None:
        raise HTTPException(status_code=404, detail="节点未找到")
    return db_node

@app.delete("/api/nodes/{node_id}")
def delete_node(node_id: str, db: Session = Depends(get_db)):
    success = node_service.delete_node(db, node_id)
    if not success:
        raise HTTPException(status_code=404, detail="节点未找到")
    return {"message": "节点已删除"} 