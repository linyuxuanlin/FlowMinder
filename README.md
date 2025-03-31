# FlowMinder

FlowMinder是一个基于Git图形理念的项目管理web应用。它使用Mermaid.js库渲染Git图形，帮助团队可视化项目的各个分支和任务进展。

## 功能特点

- 使用Mermaid gitgraph从上至下展示项目分支流程图
- 支持多个并行分支的可视化展示
- 实时更新（每10秒自动刷新图表）
- 响应式设计，适配不同设备屏幕
- 通过Docker Compose轻松部署

## 项目结构

```
FlowMinder/
├── app/                  # Web应用源码
│   ├── css/              # 样式文件
│   ├── js/               # JavaScript文件
│   └── index.html        # 主页面
├── example_project/      # 示例项目文件夹
│   ├── Branch1.md        # 用户界面开发分支
│   ├── Branch2.md        # 后端API开发分支
│   └── Branch3.md        # 部署与DevOps分支
├── compose.yml           # Docker Compose配置
├── nginx.conf            # Nginx配置
├── mermaid_gitgraph.md   # Mermaid gitgraph参考文档
└── README.md             # 项目说明
```

## 快速开始

### 前提条件

- 安装 [Docker](https://www.docker.com/get-started) 和 [Docker Compose](https://docs.docker.com/compose/install/)

### 运行应用

1. 克隆此仓库：

```bash
git clone https://github.com/yourusername/FlowMinder.git
cd FlowMinder
```

2. 启动Docker容器：

```bash
docker compose up -d
```

3. 打开浏览器访问应用：

```
http://localhost:8080
```

## 自定义项目

您可以通过修改`example_project`目录中的Markdown文件来自定义项目。每个分支文件应该包含有效的Mermaid gitgraph代码。

### 创建新分支

1. 在`example_project`目录中创建一个新的Markdown文件，例如`NewBranch.md`
2. 在文件中添加Mermaid gitgraph代码
3. 修改`app/index.html`以添加新分支的按钮

### Mermaid gitgraph语法

基本语法示例：

```mermaid
gitGraph TD:
    commit id: "初始化项目"
    branch develop
    checkout develop
    commit id: "添加新功能"
    checkout main
    merge develop
    commit id: "发布版本"
```

## 许可证

MIT 