# FlowMinder

FlowMinder是一个将git graph理念应用于项目管理的Python web应用。用户可以在网页上创建和编辑项目任务流程图，所有数据将与本地文件系统进行双向同步。

## 项目架构

### 技术栈

- **前端**：
  - React.js：构建交互式用户界面
  - Tailwind CSS：样式设计
  - React Flow：实现流程图功能
  - Axios：处理API请求

- **后端**：
  - FastAPI：高性能Python Web框架
  - SQLAlchemy：ORM框架
  - Pydantic：数据验证
  - Watchdog：监控本地文件变化

- **数据库**：
  - SQLite：轻量级数据库，便于本地数据存储

- **部署**：
  - Docker：容器化部署
  - 浏览器本地访问

### 系统架构

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  前端 (React.js) │◄────►│  后端 (FastAPI)  │◄────►│  本地文件系统    │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  ▲
                                  │
                                  ▼
                         ┌─────────────────┐
                         │                 │
                         │  数据库 (SQLite) │
                         │                 │
                         └─────────────────┘
```

### 目录结构

```
FlowMinder/
├── backend/                # 后端代码
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── core/           # 核心配置
│   │   ├── db/             # 数据库
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # 数据验证模式
│   │   └── services/       # 业务逻辑
│   ├── main.py             # 应用入口
│   └── requirements.txt    # 依赖
│
├── frontend/               # 前端代码
│   ├── public/
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── styles/         # 样式
│   │   └── utils/          # 工具函数
│   ├── package.json
│   └── tailwind.config.js
│
├── sync/                   # 同步服务
│   ├── file_watcher.py     # 文件监控
│   └── sync_service.py     # 同步逻辑
│
├── docker-compose.yml      # Docker配置
└── README.md               # 项目文档
```

## 数据模型

### 项目模型 (Project)

```python
class Project:
    id: str                 # 唯一标识符
    name: str               # 项目名称
    path: str               # 本地路径
    created_at: datetime    # 创建时间
    updated_at: datetime    # 更新时间
    branches: List[Branch]  # 分支列表
```

### 分支模型 (Branch)

```python
class Branch:
    id: str                 # 唯一标识符
    name: str               # 分支名称
    project_id: str         # 所属项目ID
    nodes: List[Node]       # 节点列表
```

### 节点模型 (Node)

```python
class Node:
    id: str                 # 唯一标识符
    name: str               # 节点名称
    branch_id: str          # 所属分支ID
    parent_id: str          # 父节点ID（如果有）
    level: int              # 节点级别（1为主节点，2+为次级节点）
    status: str             # 节点状态（进行中/已完成/已弃用）
    position_x: float       # X坐标位置
    position_y: float       # Y坐标位置
    children: List[Node]    # 子节点列表
```

## API设计

### 项目管理

- `GET /api/projects` - 获取所有项目
- `POST /api/projects` - 创建新项目
- `GET /api/projects/{id}` - 获取特定项目
- `PUT /api/projects/{id}` - 更新项目
- `DELETE /api/projects/{id}` - 删除项目

### 分支管理

- `GET /api/projects/{id}/branches` - 获取项目的所有分支
- `POST /api/projects/{id}/branches` - 创建新分支
- `PUT /api/branches/{id}` - 更新分支
- `DELETE /api/branches/{id}` - 删除分支

### 节点管理

- `GET /api/branches/{id}/nodes` - 获取分支的所有节点
- `POST /api/branches/{id}/nodes` - 创建新节点
- `PUT /api/nodes/{id}` - 更新节点（包括状态更改）
- `DELETE /api/nodes/{id}` - 删除节点

## 同步机制

FlowMinder将通过以下方式实现本地双向同步：

1. **应用到本地**：
   - 当用户在Web界面进行操作时，变更会通过API保存到数据库
   - 同步服务会将变更写入对应的本地文件（JSON格式）

2. **本地到应用**：
   - 使用Watchdog监控本地文件变化
   - 检测到文件变化时，读取内容并更新数据库
   - 通过WebSocket通知前端更新视图

## 用户界面

### 主页

- 项目卡片列表
- 创建项目按钮
- 每个项目卡片上的编辑/删除操作

### 项目页面

- **顶栏**：侧栏切换按钮、项目名称、项目菜单
- **左栏**：项目列表（可折叠）
- **中间区域**：任务流程图展示
- **右栏**：节点属性编辑面板（点击节点时显示）

### 交互设计

- 节点右侧的"+"按钮：创建二级节点
- 节点下方的"+"按钮：创建同级主节点
- 节点点击：显示属性面板
- 拖拽节点：调整位置

## 开发计划

1. 项目初始化和环境配置
2. 后端基础框架搭建
3. 数据模型和API实现
4. 前端基础组件开发
5. 流程图交互功能实现
6. 本地同步机制开发
7. 单元测试和集成测试
8. 部署配置 