# FlowMinder - 创新型项目管理工具

FlowMinder是一个基于Git分支概念的项目管理工具，专注于任务流程的可视化与双向同步功能。它允许用户以类似Git分支的方式组织任务，并在网页界面与本地Markdown文件之间实现无缝同步。

## 核心特性

- **分支式任务管理**：采用类似Git分支的概念，任务分为主线和支线，支线可以再衍生出支线
- **状态追踪**：任务可设置多种状态（未开始、进行中、已完成等）
- **交互式界面**：任务节点可在网页上自由拖动、缩放和编辑
- **本地文件同步**：
  - 任务内容以Markdown格式本地化存储，支持使用外部编辑器编辑
  - 任务关系通过配置文件描述
  - 网页与本地文件双向实时同步

## 技术架构

### 前端技术栈
- **框架**：React + TypeScript
- **状态管理**：Redux Toolkit
- **UI组件**：Material-UI
- **图表可视化**：React Flow（用于任务节点的可视化和交互）
- **Markdown编辑**：React-Markdown + CodeMirror

### 后端技术栈
- **框架**：Node.js + Express
- **数据库**：MongoDB（存储任务数据和关系）
- **文件监控**：Chokidar（监控本地文件变化）
- **API设计**：RESTful API

### 文件同步机制
- 使用WebSocket实现前端与后端的实时通信
- 后端监控本地文件变化，并将更改推送到前端
- 前端编辑后通过API保存到数据库，同时更新本地文件

### 容器化部署
- 使用Docker Compose编排多个服务：
  - 前端服务
  - 后端API服务
  - MongoDB数据库
  - 文件同步服务

## 开发路线图

### 第一阶段：基础框架搭建
1. 创建项目结构
2. 设置Docker容器配置
3. 实现基本的前端界面
4. 构建基础后端API

### 第二阶段：核心功能开发
1. 实现任务的分支结构
2. 开发任务状态管理功能
3. 构建交互式任务节点图
4. 实现任务创建、编辑和删除功能

### 第三阶段：文件同步功能
1. 设计本地文件结构
2. 实现Markdown文件的读写
3. 开发配置文件格式和处理逻辑
4. 构建文件监控和同步机制

### 第四阶段：用户体验优化
1. 改进UI/UX设计
2. 添加快捷键和辅助功能
3. 优化性能和响应速度
4. 实现用户偏好设置

### 第五阶段：测试和部署
1. 编写单元测试和集成测试
2. 优化Docker配置
3. 编写详细文档
4. 准备发布版本

## 本地文件结构设计

FlowMinder将使用以下文件结构在本地存储任务数据：

```
workspace/
├── flows/
│   ├── main/          # 主线任务
│   │   ├── task1.md   # 主线任务1的Markdown文件
│   │   └── task2.md   # 主线任务2的Markdown文件
│   └── branches/      # 支线任务
│       ├── branch1/   # 支线1的任务
│       │   ├── task1.md
│       │   └── task2.md
│       └── branch2/   # 支线2的任务
│           └── task1.md
└── config/
    └── flow.json      # 任务关系配置文件
```

## 配置文件格式

`flow.json` 文件将使用以下格式来描述任务之间的关系：

```json
{
  "nodes": [
    {
      "id": "main/task1",
      "type": "main",
      "status": "completed",
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "branches/branch1/task1",
      "type": "branch",
      "parent": "main/task1",
      "status": "in-progress",
      "position": { "x": 200, "y": 200 }
    }
  ],
  "edges": [
    {
      "source": "main/task1",
      "target": "branches/branch1/task1",
      "type": "branch"
    }
  ]
}
```

## 启动与安装

### 前提条件
- Docker 和 Docker Compose
- Git

### 安装步骤
1. 克隆项目仓库
   ```bash
   git clone https://github.com/yourusername/flowminder.git
   cd flowminder
   ```

2. 启动Docker容器
   ```bash
   docker-compose up -d
   ```

3. 访问应用
   ```
   http://localhost:3000
   ```

## 贡献指南

欢迎为FlowMinder项目做出贡献！请参阅 `CONTRIBUTING.md` 文件了解详情。

## 许可证

本项目采用 MIT 许可证。详见 `LICENSE` 文件。 