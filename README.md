# FlowMinder

FlowMinder 是一个现代化的项目管理工具，它将任务流程可视化与 Markdown 文档管理完美结合。通过直观的流程图界面和实时的文档同步功能，帮助团队更好地组织和追踪项目进展。

## 功能特点

- 🎯 **可视化任务流程**：通过直观的流程图展示任务之间的关系和依赖
- 📝 **Markdown 文档支持**：使用 Markdown 格式编写和管理任务详情
- 🔄 **实时同步**：文档变更自动同步，确保内容始终保持最新
- 🎨 **美观的用户界面**：基于 Material-UI 的现代化界面设计
- 🔌 **双向编辑**：支持在界面中编辑或通过外部编辑器修改文档

## 技术架构

### 前端技术栈

- React.js：用户界面开发框架
- Material-UI：UI 组件库
- React Flow：流程图可视化组件
- React Markdown：Markdown 渲染

### 后端技术栈

- Node.js + Express：后端服务框架
- fs-extra：文件系统操作
- chokidar：文件变更监控

### 部署架构

- Docker：容器化部署
- Docker Compose：多容器编排
- Nginx：前端服务器和反向代理

## 快速开始

### 环境要求

- Docker
- Docker Compose

### 安装步骤

1. 克隆项目代码：
   ```bash
   git clone [项目地址]
   cd FlowMinder
   ```

2. 启动服务：
   ```bash
   docker-compose up -d
   ```

3. 访问应用：
   打开浏览器访问 http://localhost:3000

## 使用指南

### 创建任务节点

1. 点击工具栏中的「添加节点」按钮
2. 在画布中点击放置节点
3. 输入任务标题和详细描述
4. 选择任务类型（主任务/子任务）

### 连接任务节点

1. 将鼠标悬停在节点上，显示连接点
2. 拖动连接点到目标节点
3. 自动创建任务依赖关系

### 编辑任务内容

- 直接在界面中编辑：点击节点打开编辑器
- 外部编辑：在 `data/nodes` 目录下找到对应的 Markdown 文件

### 更新任务状态

- 点击节点状态图标
- 选择新的状态（进行中/已完成）

## 数据存储

- 流程图配置：`data/flow-config.json`
- 任务文档：`data/nodes/*.md`

## 开发指南

### 本地开发环境设置

1. 前端开发：
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. 后端开发：
   ```bash
   cd backend
   npm install
   npm run dev
   ```

### 项目结构

```
├── frontend/          # 前端项目
│   ├── src/           # 源代码
│   ├── Dockerfile     # 前端容器配置
│   └── nginx.conf     # Nginx配置
├── backend/           # 后端项目
│   ├── server.js      # 服务器入口
│   └── Dockerfile     # 后端容器配置
├── data/              # 数据存储
└── compose.yml        # Docker编排配置
```

## 许可证

MIT

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

