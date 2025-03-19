# FlowMinder

FlowMinder是一个基于Docker的项目管理Web应用，专注于可视化任务流和Markdown文档的双向同步。

## 项目概述

FlowMinder允许用户创建项目任务流，其中：
- 每个主节点为一个Markdown文档
- 可以从主线延伸出支线任务
- 每个任务都可以设置状态（例如已完成）
- 任务流视图从上到下展示，支持自由缩放和滚动
- 支持本地Markdown文件与Web界面的双向实时同步
- 节点间关系通过本地配置文件描述，也支持双向同步

## 技术架构

### 前端
- React.js + TypeScript
- Tailwind CSS 用于UI设计
- React Flow 用于任务流可视化
- Monaco Editor 用于Markdown编辑

### 后端
- Node.js + Express.js
- WebSocket 用于实时同步
- 文件系统操作用于管理本地Markdown文件

### 数据库
- MongoDB 用于存储项目和任务数据

### 文件系统
- 本地Markdown文件存储
- 配置文件（JSON/YAML）用于描述节点关系

### 部署
- Docker Compose 用于容器编排
- 三个主要容器：前端、后端和数据库

## 目录结构

```
flowminder/
├── client/                 # 前端React应用
├── server/                 # 后端Express应用
├── data/                   # 数据卷挂载目录
│   ├── db/                 # MongoDB数据
│   └── projects/           # 项目文件存储
├── compose.yml             # Docker Compose配置
└── README.md               # 项目文档
```

## 主要功能

1. 项目管理：创建、编辑、删除项目
2. 任务流创建：可视化创建任务流和节点
3. Markdown编辑：在Web界面编辑Markdown内容
4. 双向同步：Web界面与本地文件实时同步
5. 任务状态：设置和跟踪任务状态
6. 可视化：缩放、平移任务流视图

## 实现路线图

1. 搭建基础项目结构和Docker环境
2. 实现前端任务流可视化
3. 实现后端API和数据模型
4. 开发Markdown编辑和预览功能
5. 实现文件系统同步功能
6. 开发配置文件解析和同步功能
7. 优化用户界面和交互体验
8. 完善部署和文档 