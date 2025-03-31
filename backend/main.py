from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api import api_router
from app.core.config import API_V1_STR, create_necessary_directories
from app.db.database import init_db

# 创建必要的目录
create_necessary_directories()

app = FastAPI(
    title="FlowMinder API",
    description="FlowMinder 是一个将 git graph 理念用于项目管理的应用",
    version="0.1.0",
)

# 设置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应改为具体的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含 API 路由
app.include_router(api_router, prefix=API_V1_STR)

@app.get("/")
async def root():
    return {"message": "欢迎使用 FlowMinder API"}

@app.get(f"{API_V1_STR}/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    # 初始化数据库
    init_db()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 