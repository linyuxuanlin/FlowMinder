# FlowMinder - 基于Git分支概念的项目管理系统

## 项目概述

FlowMinder是一个创新的项目管理Web应用，它结合了Git分支的概念来组织任务结构，并提供了本地Markdown文件与Web界面的双向同步功能。项目使用Docker Compose进行部署，确保了环境的一致性和部署的简便性。

### 核心特性

- **分支式任务管理**：任务分为主线和支线，主线任务可以延伸出支线任务，支线任务也可以继续延伸
- **灵活的任务状态**：支持自定义任务状态（如未开始、进行中、已完成等）
- **交互式可视化界面**：任务节点可以在网页上自由拖动、缩放和编辑
- **本地文件双向同步**：
  - 任务内容以Markdown格式存储在本地，可使用任何编辑器修改
  - 任务关系结构以配置文件形式存储，支持与Web界面双向同步
- **Docker化部署**：使用Docker Compose简化部署流程

## 技术栈选择

### 前端

- **React**：用于构建用户界面的JavaScript库
- **TypeScript**：增强代码的可维护性和类型安全
- **React Flow**：用于可视化和操作节点图的库
- **TailwindCSS**：用于快速构建自定义界面的CSS框架
- **Monaco Editor**：提供内嵌的Markdown编辑功能

### 后端

- **Node.js + Express**：构建RESTful API
- **TypeScript**：类型安全的JavaScript超集
- **Prisma**：现代数据库ORM工具
- **PostgreSQL**：关系型数据库，存储任务和关系数据
- **Socket.IO**：实现实时双向通信，支持文件变更的即时同步

### 部署与开发工具

- **Docker & Docker Compose**：容器化应用和服务编排
- **Nginx**：作为反向代理服务器
- **Chokidar**：监控文件系统变化
- **Jest & React Testing Library**：单元测试和集成测试

## 系统架构

### 整体架构

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Web界面 (React) |<--->|  后端API (Node)  |<--->|  数据库          |
|                  |     |                  |     |  (PostgreSQL)    |
+------------------+     +------------------+     +------------------+
                               ^      ^
                               |      |
                               v      v
                         +------------------+
                         |                  |
                         |  本地文件系统    |
                         |  (Markdown文件)  |
                         |                  |
                         +------------------+
```

### 数据流

1. **用户在Web界面编辑任务**：
   - 通过API将更改保存到数据库
   - 后端服务将更改同步到本地Markdown文件

2. **用户编辑本地Markdown文件**：
   - 文件监控服务检测到变化
   - 解析变更并通过API更新数据库
   - 通过WebSocket通知前端更新界面

3. **任务关系管理**：
   - 关系数据存储在专用配置文件中
   - 支持与数据库的双向同步
   - 前端使用React Flow可视化关系结构

## 数据模型

### 任务 (Task)

```typescript
interface Task {
  id: string;           // 唯一标识符
  title: string;        // 任务标题
  content: string;      // Markdown内容
  status: string;       // 任务状态
  parentId: string | null; // 父任务ID（主线或上级支线）
  filePath: string;     // 对应的本地Markdown文件路径
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
  position: {           // 在可视化界面中的位置
    x: number;
    y: number;
  };
}
```

### 任务关系 (TaskRelation)

```typescript
interface TaskRelation {
  id: string;           // 唯一标识符
  sourceId: string;     // 源任务ID
  targetId: string;     // 目标任务ID
  type: string;         // 关系类型
}
```

## 开发路线图

### 阶段1：项目初始化与基础架构

1. 创建项目结构和配置文件
2. 设置Docker Compose环境
3. 实现前端基础框架
4. 实现后端API基础结构
5. 设置数据库模型和迁移

### 阶段2：核心功能开发

1. 实现任务CRUD操作
2. 开发任务关系管理功能
3. 实现任务状态管理
4. 开发可视化任务图表界面
5. 实现拖拽、缩放等交互功能

### 阶段3：本地文件同步机制

1. 实现Markdown文件生成和解析
2. 开发文件系统监控服务
3. 实现双向同步逻辑
4. 开发任务关系配置文件格式和同步机制

### 阶段4：优化与测试

1. 实现实时协作功能
2. 优化性能和用户体验
3. 编写单元测试和集成测试
4. 进行安全性测试和优化

### 阶段5：部署与文档

1. 完善Docker部署配置
2. 编写用户文档和API文档
3. 准备示例项目和演示数据

## 文件结构

```
flowminder/
├── docker-compose.yml          # Docker Compose配置
├── .env                        # 环境变量
├── README.md                   # 项目文档
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/         # React组件
│   │   ├── hooks/              # 自定义React Hooks
│   │   ├── services/           # API服务
│   │   ├── types/              # TypeScript类型定义
│   │   └── utils/              # 工具函数
│   ├── public/                 # 静态资源
│   ├── package.json            # 前端依赖
│   └── tsconfig.json           # TypeScript配置
├── backend/                    # 后端应用
│   ├── src/
│   │   ├── controllers/        # API控制器
│   │   ├── models/             # 数据模型
│   │   ├── routes/             # API路由
│   │   ├── services/           # 业务逻辑服务
│   │   ├── utils/              # 工具函数
│   │   └── file-sync/          # 文件同步服务
│   ├── prisma/                 # Prisma ORM配置
│   │   └── schema.prisma       # 数据库模型定义
│   ├── package.json            # 后端依赖
│   └── tsconfig.json           # TypeScript配置
└── nginx/                      # Nginx配置
    └── default.conf            # 默认站点配置
```

## 下一步计划

按照上述路线图，我们将首先创建Docker Compose配置和项目基础结构，然后逐步实现各个功能模块。每个阶段完成后，我们将进行测试和优化，确保系统的稳定性和可用性。

## 贡献指南

欢迎对FlowMinder项目做出贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个Pull Request

## 许可证

本项目采用MIT许可证 - 详情请参阅LICENSE文件