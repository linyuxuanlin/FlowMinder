import os
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 项目根目录
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent

# 数据库配置
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{ROOT_DIR}/data/flowminder.db")

# 默认项目存储路径
DEFAULT_PROJECTS_DIR = os.getenv("DEFAULT_PROJECTS_DIR", str(ROOT_DIR / "data" / "projects"))

# API配置
API_V1_STR = "/api/v1"

# 创建必要的目录
def create_necessary_directories():
    """创建必要的目录结构"""
    data_dir = ROOT_DIR / "data"
    projects_dir = Path(DEFAULT_PROJECTS_DIR)
    
    dirs_to_create = [
        data_dir,
        projects_dir
    ]
    
    for dir_path in dirs_to_create:
        dir_path.mkdir(parents=True, exist_ok=True) 