from fastapi import APIRouter

api_router = APIRouter()

# 导入并包含其他路由器
from app.api.projects import router as projects_router
from app.api.branches import router as branches_router
from app.api.nodes import router as nodes_router

api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(branches_router, prefix="/branches", tags=["branches"])
api_router.include_router(nodes_router, prefix="/nodes", tags=["nodes"]) 