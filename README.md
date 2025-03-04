# FlowMinder

FlowMinder是一个项目管理Web应用，专注于可视化任务流程和管理。

## 功能特点

- 创建和管理多条主线任务
- 每个主节点为一个Markdown文档
- 支持从主线延伸出支线任务
- 任务状态管理（如已完成、进行中等）
- 左到右的任务流视图，支持自由缩放和滚动
- 本地Markdown文件与Web界面双向同步
- 节点间关系使用本地配置文件描述，支持双向同步

## 技术栈

- 前端：React, TypeScript, TailwindCSS
- 后端：Node.js, Express
- 数据库：MongoDB
- 部署：Docker Compose

## 快速开始

1. 确保已安装Docker和Docker Compose
2. 克隆此仓库
3. 在项目根目录运行：

```bash
docker-compose up -d
```

4. 访问 http://localhost:3000 开始使用FlowMinder

## 本地文件同步

FlowMinder支持将任务节点作为Markdown文件存储在本地，您可以使用任何Markdown编辑器进行编辑，更改将自动同步到Web界面。

同样，在Web界面上的编辑也会实时更新本地文件。

## 配置

任务流的节点关系存储在`flow-config.json`文件中，该文件也支持双向同步。

## 许可证

MIT 