// 初始化Mermaid
mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true
    },
    gitGraph: {
        showCommitLabel: true,
        showBranches: true,
        mainBranchName: 'main'
    }
});

// 全局变量
const projectPath = '../example_project';
let currentBranch = 'Branch1'; // 默认分支

// DOM元素
const diagramContainer = document.getElementById('mermaid-diagram');
const branchButtons = document.querySelectorAll('.branch-btn');

/**
 * 读取markdown文件并提取mermaid内容
 * @param {string} branchName - 分支名称
 * @returns {Promise<string>} - mermaid图表内容
 */
async function fetchMermaidContent(branchName) {
    try {
        const response = await fetch(`${projectPath}/${branchName}.md`);
        if (!response.ok) {
            throw new Error(`无法获取${branchName}.md文件: ${response.statusText}`);
        }
        
        const markdown = await response.text();
        
        // 提取mermaid内容
        const mermaidMatch = markdown.match(/```mermaid([\s\S]*?)```/);
        if (mermaidMatch && mermaidMatch[1]) {
            return mermaidMatch[1].trim();
        } else {
            throw new Error(`在${branchName}.md中未找到mermaid内容`);
        }
    } catch (error) {
        console.error('获取Mermaid内容时出错:', error);
        return '图表加载失败';
    }
}

/**
 * 渲染mermaid图表
 * @param {string} content - mermaid图表内容
 */
async function renderMermaidDiagram(content) {
    // 清空容器
    diagramContainer.innerHTML = '';
    
    try {
        // 渲染图表
        const { svg } = await mermaid.render('mermaid-diagram-svg', content);
        diagramContainer.innerHTML = svg;
    } catch (error) {
        console.error('渲染Mermaid图表时出错:', error);
        diagramContainer.innerHTML = `<div class="error-message">图表渲染失败: ${error.message}</div>`;
    }
}

/**
 * 加载分支图表
 * @param {string} branchName - 分支名称
 */
async function loadBranchDiagram(branchName) {
    // 更新当前分支
    currentBranch = branchName;
    
    // 更新活动按钮状态
    branchButtons.forEach(btn => {
        if (btn.dataset.branch === branchName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 获取并渲染图表
    const mermaidContent = await fetchMermaidContent(branchName);
    await renderMermaidDiagram(mermaidContent);
}

// 事件监听器 - 分支按钮点击
branchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const branchName = btn.dataset.branch;
        loadBranchDiagram(branchName);
    });
});

// 初始化 - 加载默认分支
document.addEventListener('DOMContentLoaded', () => {
    loadBranchDiagram(currentBranch);
    
    // 设置自动刷新 (每10秒)
    setInterval(() => {
        loadBranchDiagram(currentBranch);
    }, 10000);
}); 