const { marked } = require('marked');

/**
 * 解析Markdown内容，提取任务信息
 * @param {string} markdown Markdown内容
 * @returns {Object} 任务数据对象
 */
exports.parseMarkdown = (markdown) => {
  try {
    const lines = markdown.split('\n');
    const taskData = {
      title: '',
      content: markdown,
      metadata: {
        priority: '中',
        subtasks: []
      }
    };
    
    // 提取标题
    const titleMatch = markdown.match(/^# (.+)$/m);
    if (titleMatch) {
      taskData.title = titleMatch[1].trim();
    }
    
    // 提取优先级
    const priorityMatch = markdown.match(/\*\*优先级\*\*:\s*(.+)$/m);
    if (priorityMatch) {
      taskData.metadata.priority = priorityMatch[1].trim();
    }
    
    // 提取截止日期
    const dueDateMatch = markdown.match(/\*\*截止日期\*\*:\s*(.+)$/m);
    if (dueDateMatch) {
      taskData.metadata.dueDate = new Date(dueDateMatch[1].trim());
    }
    
    // 提取负责人
    const assigneeMatch = markdown.match(/\*\*负责人\*\*:\s*(.+)$/m);
    if (assigneeMatch) {
      taskData.metadata.assignee = assigneeMatch[1].trim();
    }
    
    // 提取子任务
    const subtaskRegex = /- \[(x| )\] (.+)$/gm;
    let subtaskMatch;
    while ((subtaskMatch = subtaskRegex.exec(markdown)) !== null) {
      taskData.metadata.subtasks.push({
        description: subtaskMatch[2].trim(),
        completed: subtaskMatch[1] === 'x'
      });
    }
    
    return taskData;
  } catch (error) {
    console.error('解析Markdown失败:', error);
    return {
      title: '解析失败的任务',
      content: markdown,
      metadata: {
        priority: '中',
        subtasks: []
      }
    };
  }
};

/**
 * 根据任务数据生成Markdown内容
 * @param {Object} task 任务数据对象
 * @returns {string} Markdown内容
 */
exports.generateMarkdown = (task) => {
  try {
    let markdown = `# ${task.title || '未命名任务'}\n\n`;
    
    // 如果有内容，直接使用现有内容
    if (task.content && task.content.trim() !== '') {
      // 移除原有标题
      const contentWithoutTitle = task.content.replace(/^# .+\n/, '').trim();
      return `# ${task.title || '未命名任务'}\n\n${contentWithoutTitle}`;
    }
    
    // 否则，根据任务数据生成内容
    markdown += `## 描述\n${task.description || '暂无描述'}\n\n`;
    
    markdown += '## 详情\n';
    if (task.metadata) {
      if (task.metadata.priority) {
        markdown += `- **优先级**: ${task.metadata.priority}\n`;
      }
      
      if (task.metadata.dueDate) {
        const dueDate = new Date(task.metadata.dueDate);
        markdown += `- **截止日期**: ${dueDate.toISOString().split('T')[0]}\n`;
      }
      
      if (task.metadata.assignee) {
        markdown += `- **负责人**: ${task.metadata.assignee}\n`;
      }
    }
    
    markdown += '\n';
    
    // 添加子任务
    if (task.metadata && task.metadata.subtasks && task.metadata.subtasks.length > 0) {
      markdown += '## 子任务\n';
      task.metadata.subtasks.forEach(subtask => {
        const checkbox = subtask.completed ? '[x]' : '[ ]';
        markdown += `- ${checkbox} ${subtask.description}\n`;
      });
      markdown += '\n';
    }
    
    // 添加备注
    markdown += '## 备注\n';
    markdown += task.notes || '暂无备注';
    
    return markdown;
  } catch (error) {
    console.error('生成Markdown失败:', error);
    return `# ${task.title || '未命名任务'}\n\n生成内容时出错`;
  }
}; 