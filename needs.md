


请帮我写一个python web应用FlowMinder。这是一个把git graph理念用于项目管理的项目。在网页上编辑的所有数据会与本地双向同步。

详细的功能要求如下：

- 主页
  - 在主页上，我可以创建项目。已创建的项目会以卡片的形式展现，我可以对已经创建的项目进行编辑和删除等操作。卡片右侧有操作按钮：编辑项目属性、删除项目。
  - 创建项目时，我可以选择项目对应的本地路径，用于双向同步。项目路径是可选的，如果没有填写，则为默认路径
- 某个任务中
  - 在主页点进某个任务时，UI的视图分为左中右和顶栏。
  - 顶栏从左到右为侧栏切换按钮（点击可以收缩/展开项目列表侧栏），FlowMinder的名称（点击可以跳转回主页），居中显示的项目名称、最右侧的项目菜单按钮（展开可以编辑项目属性/删除项目等）。
  - 左栏为项目列表侧栏，可通过顶栏的侧栏切换按钮切换折叠/展开状态，默认为折叠，只显示图标，点击展开按钮可以查看完整的项目列表。侧栏可以看到所有的项目，可以点击切换项目，也可以按‘+’按钮新增项目。
  - 中间的内容页为主区域，显示任务流程图。按照任务的步骤顺序，为从上往下分布。不同的branch请水平排列。
  - 画布顶部有分支栏，显示不同的分支。点击分支右上角编辑按钮弹出的编辑操作框中，应该有重命名和删除的选项。分支栏中的分支应该可以拖放排序
  - 最右侧为节点的属性页，默认不显示。当鼠标点击某个节点时，会弹出节点的属性，此时可以修改节点的名称、设置节点的状态（默认为进行中，此外还有已完成/已弃用）。


任务流程的逻辑：

- 在一个项目中可以创建不同的分支Branch 1/2/3等，不同分支之间水平排布。
- 在每个branch下，可以往下建立主节点，例如 P1、P2、P3等，固定第一个节点为“Start”，按箭头顺序逐次往下连接接下来的节点。
- 当光标移动到每一个节点上时，会在节点的右侧和下方出现'+'按钮，点击右侧的按钮可以创建二级节点，点击下方的'+'按钮会创建主节点。例如，点击P1节点右侧的'+'按钮，会在其右侧增加一个P1.1二级节点，并用箭头连接到这个节点；点击P1节点下方的'+'按钮，会创建一个P2同级节点，同样用箭头连接。在二级节点上也可以创建其下一级的二级节点或同级的节点。
- 画布中节点间的关系请按照不同的列排列。例如，所有主节点之间是按顺序从上到下的，连线需要带箭头，且需要垂直居中排布；所有二级节点列是在主节点列的右侧，也要按顺序从上往下带箭头连接，且垂直居中排布。节点可以被拖动，被拖动后请让它恢复原位。

节点类型与样式：

- 主节点：
  - 使用浅棕色背景
  - 有更粗的字体和边框
  - 不带有状态属性
- 二级及以上的节点：
  - 根据状态显示不同颜色
  - （默认）进行中：浅黄色
  - 已完成：浅绿色
  - 已弃用：浅灰色

设计风格：Material UI
请同时为这个网页生成本地favicon
docker compose配置文档请使用compose.yml,且不要出现version: '3'语句

请先不要生成代码，先生成整个项目的从框架到细节的开发路线，填写在README.md中，随后再沿着开发路线完成代码的编写。