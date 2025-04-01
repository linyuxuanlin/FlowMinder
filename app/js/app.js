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
const DEFAULT_PATH = '/mermaid'; // 默认mermaid文件路径
let lastModified = {}; // 存储文件的最后修改时间
let lastBranchList = ''; // 存储上次的分支列表
let currentProject = ''; // 当前项目名称，初始为空字符串

// DOM元素
const diagramContainer = document.getElementById('mermaid-diagram');
const selectProjectBtn = document.getElementById('select-project-btn');

/**
 * 从服务器加载mermaid文件
 */
async function loadMermaidFromServer() {
    try {
        // 获取服务器上可用的mermaid文件
        const response = await fetch(`${DEFAULT_PATH}/`);
        if (!response.ok) {
            throw new Error('无法获取mermaid文件列表');
        }
        
        // 解析目录中的文件
        const fileListText = await response.text();
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(fileListText, 'text/html');
        
        // 找到所有链接，筛选出.md文件
        const links = Array.from(htmlDoc.querySelectorAll('a'));
        availableBranches = links
            .map(link => link.getAttribute('href'))
            .filter(href => href && href.endsWith('.md'))
            .map(href => href.replace(/\.md$/, ''));
        
        // 获取当前项目名称
        // 从URL路径中提取项目名称
        const pathParts = window.location.pathname.split('/');
        // 获取mermaid文件夹的真实名称
        let folderName = '';
        for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i] === 'mermaid' && i < pathParts.length - 1) {
                folderName = pathParts[i + 1];
                break;
            }
        }
        // 如果找不到特定项目名，就使用mermaid文件夹的名称
        currentProject = folderName || pathParts[pathParts.length - 2] || 'example_project';
        
        // 更新UI，显示当前项目名称
        selectProjectBtn.textContent = `${currentProject}`;
        selectProjectBtn.disabled = false; // 启用选择按钮
        
        // 更新分支按钮
        updateBranchButtons();
        
        // 加载默认分支或第一个可用分支
        if (availableBranches.length > 0) {
            if (!availableBranches.includes(currentBranch)) {
                currentBranch = availableBranches[0];
            }
            await loadBranchDiagram(currentBranch);
        } else {
            diagramContainer.innerHTML = '<div class="error-message">未找到任何markdown文件</div>';
        }
    } catch (error) {
        console.error('加载mermaid文件时出错:', error);
        diagramContainer.innerHTML = `<div class="error-message">加载失败: ${error.message}</div>`;
    }
}

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
        
        // 储存当前项目名称（使用文件夹的实际名称）
        currentProject = folderName;
        
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
        selectProjectBtn.textContent = `${folderName}`;
        
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
 * 检查文件是否有更新
 * @param {string} branchName - 分支名称
 * @returns {Promise<boolean>} - 文件是否有更新
 */
async function checkFileUpdated(branchName) {
    try {
        const url = `${DEFAULT_PATH}/${branchName}.md`;
        const response = await fetch(url, {
            method: 'HEAD',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            return false;
        }
        
        // 获取Last-Modified头
        const modified = response.headers.get('Last-Modified');
        if (!modified) {
            return true; // 如果无法获取修改时间，假设文件已更新
        }
        
        // 检查是否与上次记录的修改时间不同
        if (!lastModified[branchName] || lastModified[branchName] !== modified) {
            lastModified[branchName] = modified;
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('检查文件更新时出错:', error);
        return false;
    }
}

/**
 * 读取markdown文件并提取mermaid内容
 * @param {string} branchName - 分支名称
 * @returns {Promise<{content: string, success: boolean, errorMessage: string}>} - 返回包含成功状态和内容/错误信息的对象
 */
async function fetchMermaidContent(branchName) {
    try {
        let fileContent = '';
        
        // 判断是使用本地文件还是服务器文件
        if (Object.keys(selectedFiles).length > 0 && selectedFiles[branchName]) {
            // 从本地文件中读取内容
            fileContent = await readFileAsText(selectedFiles[branchName]);
        } else {
            // 从服务器获取文件内容
            const response = await fetch(`${DEFAULT_PATH}/${branchName}.md`, {
                cache: 'no-cache' // 添加no-cache确保获取最新内容
            });
            if (!response.ok) {
                throw new Error(`无法获取${branchName}.md文件`);
            }
            
            // 保存Last-Modified
            const modified = response.headers.get('Last-Modified');
            if (modified) {
                lastModified[branchName] = modified;
            }
            
            fileContent = await response.text();
        }
        
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
    // 如果获取内容失败，直接显示错误信息
    if (!contentObj.success) {
        diagramContainer.innerHTML = `<div class="error-message">${contentObj.errorMessage}</div>`;
        return;
    }
    
    try {
        // 保存当前容器的属性
        const oldContainer = diagramContainer.cloneNode(false);
        
        // 创建临时容器进行渲染
        const tempContainer = document.createElement('div');
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);
        
        // 渲染图表到临时容器
        const { svg } = await mermaid.render('mermaid-diagram-svg', contentObj.content);
        tempContainer.innerHTML = svg;
        
        // 只有在内容真正发生变化时才更新主容器
        if (diagramContainer.innerHTML !== tempContainer.innerHTML) {
            // 复制当前滚动位置
            const svgElement = tempContainer.querySelector('svg');
            if (svgElement) {
                // 将渲染好的内容移动到主容器
                diagramContainer.innerHTML = '';
                diagramContainer.appendChild(svgElement);
            }
        }
        
        // 移除临时容器
        document.body.removeChild(tempContainer);
    } catch (error) {
        console.error('渲染Mermaid图表时出错:', error);
        diagramContainer.innerHTML = `<div class="error-message">图表渲染失败: ${error.message}</div>`;
    }
}

/**
 * 加载分支图表
 * @param {string} branchName - 分支名称
 * @param {boolean} preserveScroll - 是否保留滚动位置
 */
async function loadBranchDiagram(branchName, preserveScroll = false) {
    // 保存当前滚动位置
    const scrollPosition = preserveScroll ? {
        x: window.scrollX,
        y: window.scrollY
    } : null;
    
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
    
    // 恢复滚动位置
    if (scrollPosition) {
        window.scrollTo(scrollPosition.x, scrollPosition.y);
    }
}

/**
 * 检查分支列表是否有更新
 * @returns {Promise<boolean>} - 分支列表是否有更新
 */
async function checkBranchListUpdated() {
    try {
        const response = await fetch(`${DEFAULT_PATH}/`, {
            method: 'GET',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            return false;
        }
        
        const fileListText = await response.text();
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(fileListText, 'text/html');
        
        // 获取当前分支列表
        const links = Array.from(htmlDoc.querySelectorAll('a'));
        const currentBranchList = links
            .map(link => link.getAttribute('href'))
            .filter(href => href && href.endsWith('.md'))
            .map(href => href.replace(/\.md$/, ''))
            .sort()
            .join(',');
        
        // 检查是否有变化
        if (lastBranchList !== currentBranchList) {
            lastBranchList = currentBranchList;
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('检查分支列表更新时出错:', error);
        return false;
    }
}

/**
 * 更新分支列表
 * @returns {Promise<void>}
 */
async function updateBranchList() {
    try {
        // 如果使用的是本地文件，则不需要从服务器更新
        if (Object.keys(selectedFiles).length > 0) {
            return;
        }
        
        const response = await fetch(`${DEFAULT_PATH}/`);
        if (!response.ok) {
            throw new Error('无法获取mermaid文件列表');
        }
        
        const fileListText = await response.text();
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(fileListText, 'text/html');
        
        // 找到所有链接，筛选出.md文件
        const links = Array.from(htmlDoc.querySelectorAll('a'));
        availableBranches = links
            .map(link => link.getAttribute('href'))
            .filter(href => href && href.endsWith('.md'))
            .map(href => href.replace(/\.md$/, ''));
        
        // 确保显示的是当前项目名称
        selectProjectBtn.textContent = `${currentProject}`;
        
        // 更新分支按钮
        updateBranchButtons();
        
        // 检查当前分支是否在可用分支中，如果不在则加载第一个可用分支
        if (availableBranches.length > 0) {
            if (!availableBranches.includes(currentBranch)) {
                currentBranch = availableBranches[0];
                await loadBranchDiagram(currentBranch);
            }
        } else {
            diagramContainer.innerHTML = '<div class="error-message">未找到任何markdown文件</div>';
        }
    } catch (error) {
        console.error('更新分支列表时出错:', error);
    }
}

// 事件监听器 - 选择项目按钮点击
selectProjectBtn.addEventListener('click', selectProjectFolder);

// 初始化 - 自动加载默认路径的mermaid文件
document.addEventListener('DOMContentLoaded', () => {
    // 自动加载服务器上的mermaid文件
    loadMermaidFromServer();
    
    // 设置自动刷新 (每10秒检查更新)
    setInterval(async () => {
        if (currentBranch) {
            // 检查分支列表是否有更新
            const branchListUpdated = await checkBranchListUpdated();
            if (branchListUpdated) {
                await updateBranchList();
            }
            
            // 检查当前分支内容是否有更新
            const hasUpdates = await checkFileUpdated(currentBranch);
            if (hasUpdates) {
                loadBranchDiagram(currentBranch, true); // 保留滚动位置
            }
        }
    }, 10000);
}); 