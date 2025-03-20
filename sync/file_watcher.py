import time
import os
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import requests
from typing import Dict, List

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, api_url: str):
        self.api_url = api_url
        # 避免重复处理同一文件的修改
        self.last_modified_time: Dict[str, float] = {}
        # 添加一个冷却期，避免频繁同步
        self.cooldown_period = 2  # 秒

    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.json'):
            current_time = time.time()
            # 检查是否在冷却期内
            if event.src_path in self.last_modified_time and \
               current_time - self.last_modified_time[event.src_path] < self.cooldown_period:
                return
            
            self.last_modified_time[event.src_path] = current_time
            self.sync_file_to_app(event.src_path)
    
    def sync_file_to_app(self, file_path: str):
        try:
            print(f"Detected changes in {file_path}, syncing to app...")
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 提取项目ID
            project_id = data.get('id')
            if not project_id:
                print(f"Error: No project ID found in {file_path}")
                return
            
            # 同步项目基本信息
            self.sync_project(project_id, {
                "name": data.get('name'),
                "path": data.get('path')
            })
            
            # 同步分支和节点信息
            self.sync_branches_and_nodes(project_id, data.get('branches', []))
            
            print(f"Sync completed for {file_path}")
        except Exception as e:
            print(f"Error syncing file {file_path}: {e}")
    
    def sync_project(self, project_id: str, project_data: dict):
        try:
            # 更新项目信息
            response = requests.put(
                f"{self.api_url}/api/projects/{project_id}", 
                json=project_data
            )
            if response.status_code != 200:
                print(f"Error updating project: {response.text}")
        except Exception as e:
            print(f"Error syncing project {project_id}: {e}")
    
    def sync_branches_and_nodes(self, project_id: str, branches: List[dict]):
        try:
            # 获取当前项目的所有分支
            response = requests.get(f"{self.api_url}/api/projects/{project_id}/branches")
            if response.status_code != 200:
                print(f"Error getting branches: {response.text}")
                return
            
            existing_branches = {branch['id']: branch for branch in response.json()}
            
            # 同步分支
            for branch in branches:
                branch_id = branch.get('id')
                if not branch_id:
                    continue
                
                if branch_id in existing_branches:
                    # 更新现有分支
                    requests.put(
                        f"{self.api_url}/api/branches/{branch_id}", 
                        json={"name": branch.get('name')}
                    )
                else:
                    # 创建新分支
                    requests.post(
                        f"{self.api_url}/api/projects/{project_id}/branches", 
                        json={"name": branch.get('name')}
                    )
                
                # 同步节点
                self.sync_nodes(branch_id, branch.get('nodes', []))
        except Exception as e:
            print(f"Error syncing branches for project {project_id}: {e}")
    
    def sync_nodes(self, branch_id: str, nodes: List[dict]):
        try:
            # 获取当前分支的所有节点
            response = requests.get(f"{self.api_url}/api/branches/{branch_id}/nodes")
            if response.status_code != 200:
                print(f"Error getting nodes: {response.text}")
                return
            
            existing_nodes = {node['id']: node for node in response.json()}
            
            # 同步节点
            for node in nodes:
                node_id = node.get('id')
                if not node_id:
                    continue
                
                node_data = {
                    "name": node.get('name'),
                    "level": node.get('level', 1),
                    "status": node.get('status', 'in_progress'),
                    "position_x": node.get('position_x', 0),
                    "position_y": node.get('position_y', 0)
                }
                
                if node_id in existing_nodes:
                    # 更新现有节点
                    requests.put(
                        f"{self.api_url}/api/nodes/{node_id}", 
                        json=node_data
                    )
                else:
                    # 创建新节点
                    node_data["parent_id"] = node.get('parent_id')
                    requests.post(
                        f"{self.api_url}/api/branches/{branch_id}/nodes", 
                        json=node_data
                    )
        except Exception as e:
            print(f"Error syncing nodes for branch {branch_id}: {e}")

def start_watching(directory_path: str, api_url: str = "http://localhost:8000"):
    """
    开始监控指定目录中的变化并同步到应用
    
    Args:
        directory_path: 要监控的目录路径
        api_url: API服务器的URL
    """
    # 确保目录存在
    if not os.path.exists(directory_path):
        os.makedirs(directory_path, exist_ok=True)
    
    event_handler = FileChangeHandler(api_url)
    observer = Observer()
    observer.schedule(event_handler, directory_path, recursive=True)
    observer.start()
    
    print(f"开始监控目录: {directory_path}")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    # 示例：监控当前目录下的所有JSON文件
    start_watching(".") 