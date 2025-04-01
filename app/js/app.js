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
let selectedFiles = {}; // 存储选择的文件对象
let currentBranch = 'Branch1'; // 默认分支
let availableBranches = []; // 可用的分支列表

// DOM元素
const diagramContainer = document.getElementById('mermaid-diagram');
const selectProjectBtn = document.getElementById('select-project-btn');

/**
 * 选择项目文件夹功能
 */
async function selectProjectFolder() {
    try {
        // 创建一个不可见的文件选择器元素
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true; // 允许选择文件夹
        input.style.display = 'none';
        document.body.appendChild(input);
        
        // 创建一个Promise来处理文件选择结果
        const fileSelected = new Promise((resolve) => {
            input.addEventListener('change', resolve, {once: true});
        });
        
        // 触发文件选择对话框
        input.click();
        
        // 等待用户选择文件夹
        await fileSelected;
        
        // 如果没有选择任何文件，返回
        if (input.files.length === 0) {
            document.body.removeChild(input);
            return;
        }
        
        // 读取选择的文件
        const files = Array.from(input.files);
        const folderName = files[0].webkitRelativePath.split('/')[0];
        
        // 筛选出md文件并按分支名称存储
        selectedFiles = {};
        availableBranches = [];
        
        files.forEach(file => {
            if (file.name.endsWith('.md')) {
                const filePathParts = file.webkitRelativePath.split('/');
                
                // 只处理直接在选择文件夹下的md文件
                if (filePathParts.length === 2) {
                    const branchName = file.name.replace(/\.md$/, '');
                    selectedFiles[branchName] = file;
                    availableBranches.push(branchName);
                }
            }
        });
        
        // 更新UI，显示所选文件夹名称
        selectProjectBtn.textContent = `项目: ${folderName}`;
        
        // 更新分支按钮
        updateBranchButtons();
        
        // 检查当前分支是否在可用分支中
        if (availableBranches.length > 0) {
            if (!availableBranches.includes(currentBranch)) {
                currentBranch = availableBranches[0];
            }
            // 加载分支
            await loadBranchDiagram(currentBranch);
        } else {
            diagramContainer.innerHTML = '<div class="error-message">在选择的文件夹中未找到任何markdown文件</div>';
        }
        
        // 移除临时的input元素
        document.body.removeChild(input);
    } catch (error) {
        console.error('选择项目文件夹时出错:', error);
        alert('选择项目文件夹失败，请重试！');
    }
}

/**
 * 更新分支按钮
 */
function updateBranchButtons() {
    // 获取分支按钮的父容器
    const branchSelector = document.querySelector('.branch-selector');
    if (!branchSelector) return;
    
    // 清空现有按钮
    branchSelector.innerHTML = '';
    
    // 添加新的分支按钮
    availableBranches.forEach(branchName => {
        const button = document.createElement('button');
        button.className = 'branch-btn';
        button.dataset.branch = branchName;
        button.textContent = branchName;
        
        if (branchName === currentBranch) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', () => {
            loadBranchDiagram(branchName);
        });
        
        branchSelector.appendChild(button);
    });
}

/**
 * 读取markdown文件并提取mermaid内容
 * @param {string} branchName - 分支名称
 * @returns {Promise<{content: string, success: boolean, errorMessage: string}>} - 返回包含成功状态和内容/错误信息的对象
 */
async function fetchMermaidContent(branchName) {
    // 检查是否已选择文件
    if (Object.keys(selectedFiles).length === 0) {
        return {
            success: false,
            errorMessage: '请先选择项目文件夹',
            content: ''
        };
    }
    
    // 检查是否有对应分支的文件
    if (!selectedFiles[branchName]) {
        return {
            success: false,
            errorMessage: `未找到分支 "${branchName}" 的文件`,
            content: ''
        };
    }
    
    try {
        // 使用FileReader读取文件内容
        const fileContent = await readFileAsText(selectedFiles[branchName]);
        
        // 提取mermaid内容
        const mermaidMatch = fileContent.match(/```mermaid([\s\S]*?)```/);
        if (mermaidMatch && mermaidMatch[1]) {
            return {
                success: true,
                content: mermaidMatch[1].trim(),
                errorMessage: ''
            };
        } else {
            throw new Error(`在${branchName}.md中未找到mermaid内容`);
        }
    } catch (error) {
        console.error('获取Mermaid内容时出错:', error);
        return {
            success: false,
            errorMessage: `图表加载失败: ${error.message}`,
            content: ''
        };
    }
}

/**
 * 使用FileReader读取文件内容
 * @param {File} file - 文件对象
 * @returns {Promise<string>} - 文件内容
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

/**
 * 渲染mermaid图表
 * @param {object} contentObj - 包含图表内容和状态的对象
 */
async function renderMermaidDiagram(contentObj) {
    // 清空容器
    diagramContainer.innerHTML = '';
    
    // 如果获取内容失败，直接显示错误信息
    if (!contentObj.success) {
        diagramContainer.innerHTML = `<div class="error-message">${contentObj.errorMessage}</div>`;
        return;
    }
    
    try {
        // 渲染图表
        const { svg } = await mermaid.render('mermaid-diagram-svg', contentObj.content);
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
    
    // 更新活动按钮状态（获取当前所有分支按钮）
    document.querySelectorAll('.branch-btn').forEach(btn => {
        if (btn.dataset.branch === branchName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 获取并渲染图表
    const contentObj = await fetchMermaidContent(branchName);
    await renderMermaidDiagram(contentObj);
}

// 事件监听器 - 选择项目按钮点击
selectProjectBtn.addEventListener('click', selectProjectFolder);

// 初始化 - 提示用户选择项目
document.addEventListener('DOMContentLoaded', () => {
    // 不再自动加载预设项目，而是显示提示
    diagramContainer.innerHTML = '<div class="info-message">请点击右上角"选择项目文件夹"按钮选择本地Mermaid项目</div>';
    
    // 设置自动刷新 (每10秒，仅当已选择项目路径时)
    setInterval(() => {
        if (Object.keys(selectedFiles).length > 0) {
            loadBranchDiagram(currentBranch);
        }
    }, 10000);
}); 