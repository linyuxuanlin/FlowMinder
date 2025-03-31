请帮我写一个web应用FlowMinder。这是一个把git graph理念用于项目管理的应用。

我可以自定义项目的文件夹路径，例如当前示例的项目路径在 ./example_project。请帮我在这个目录下根据Mermaid中gitgraph功能创建不同的并行分支例如Branch1.md,Branch2.md……。每个分支的markdown中均包含mermaid格式的gitgraph。

Mermaid中gitgraph功能的参考文档位于 mermaid_gitgraph.md。请使用从上往下的git流程图方向


随后，帮我把example_project这个项目通过docker compose的方式，部署为一个网页mermaid展示。在本地修改example_project中的mermaid，在网页上也能及时更新。

在这个项目管理的概念中，不同的Branch代表的是同一个项目中的不同子任务分支。分支都会大致分几个阶段：P0, P1, P2, P3。在不同的阶段中，会出现不同的小任务。有一些完成了，就会merge回去；如果未完成或废弃了，则不merge，保持末端节点的状态。每一次commit用来代表任务的推进状态。

docker compose 请使用compose.yml,且不要出现version: '3'语句