import os
import json
from pathlib import Path
from typing import Dict, Any, Optional
import logging

from app.core.config import DEFAULT_PROJECTS_DIR

logger = logging.getLogger(__name__)

class SyncService:
    """处理项目数据与本地文件系统之间的同步"""
    
    def __init__(self):
        self.default_projects_dir = Path(DEFAULT_PROJECTS_DIR)
        self.default_projects_dir.mkdir(parents=True, exist_ok=True)
    
    def get_project_path(self, project_id: int, local_path: Optional[str] = None) -> Path:
        """获取项目的文件路径"""
        if local_path:
            path = Path(local_path)
            if not path.exists():
                path.mkdir(parents=True, exist_ok=True)
            return path
        else:
            path = self.default_projects_dir / str(project_id)
            path.mkdir(parents=True, exist_ok=True)
            return path
    
    def save_project_data(self, project_id: int, data: Dict[str, Any], local_path: Optional[str] = None) -> bool:
        """将项目数据保存到本地文件"""
        try:
            project_path = self.get_project_path(project_id, local_path)
            data_file = project_path / "flowminder_data.json"
            
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            return True
        except Exception as e:
            logger.error(f"保存项目数据失败: {str(e)}")
            return False
    
    def load_project_data(self, project_id: int, local_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """从本地文件加载项目数据"""
        try:
            project_path = self.get_project_path(project_id, local_path)
            data_file = project_path / "flowminder_data.json"
            
            if not data_file.exists():
                return None
            
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"加载项目数据失败: {str(e)}")
            return None
    
    def delete_project_data(self, project_id: int, local_path: Optional[str] = None) -> bool:
        """删除项目的本地数据文件"""
        try:
            project_path = self.get_project_path(project_id, local_path)
            data_file = project_path / "flowminder_data.json"
            
            if data_file.exists():
                data_file.unlink()
            
            # 如果是默认路径，并且文件夹为空，则删除文件夹
            if not local_path and project_path.exists() and not any(project_path.iterdir()):
                project_path.rmdir()
            
            return True
        except Exception as e:
            logger.error(f"删除项目数据失败: {str(e)}")
            return False
    
    def sync_project_with_local(self, project_id: int, project_data: Dict[str, Any], local_path: Optional[str] = None) -> Dict[str, Any]:
        """将项目数据与本地文件同步，处理冲突"""
        local_data = self.load_project_data(project_id, local_path)
        
        if not local_data:
            # 如果本地没有数据，则直接保存
            self.save_project_data(project_id, project_data, local_path)
            return project_data
        
        # 这里可以添加更复杂的合并逻辑，例如基于时间戳或版本号
        # 目前简单地以网页数据为准
        self.save_project_data(project_id, project_data, local_path)
        return project_data 