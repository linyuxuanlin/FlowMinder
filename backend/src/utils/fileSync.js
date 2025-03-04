const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../../data');

/**
 * 确保数据目录存在
 */
const ensureDataDir = () => {
  fs.ensureDirSync(DATA_DIR);
};

/**
 * 读取Markdown文件内容
 * @param {string} filePath - 文件路径
 * @returns {string} 文件内容
 */
const readMarkdownFile = (filePath) => {
  const fullPath = path.join(DATA_DIR, filePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    console.error(`读取文件失败: ${fullPath}`, error);
    return '';
  }
};

/**
 * 写入Markdown文件内容
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 * @returns {boolean} 是否成功
 */
const writeMarkdownFile = (filePath, content) => {
  const fullPath = path.join(DATA_DIR, filePath);
  try {
    // 确保目录存在
    fs.ensureDirSync(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`写入文件失败: ${fullPath}`, error);
    return false;
  }
};

/**
 * 删除Markdown文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否成功
 */
const deleteMarkdownFile = (filePath) => {
  const fullPath = path.join(DATA_DIR, filePath);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    return true;
  } catch (error) {
    console.error(`删除文件失败: ${fullPath}`, error);
    return false;
  }
};

/**
 * 读取配置文件
 * @param {string} configPath - 配置文件路径
 * @returns {Object} 配置对象
 */
const readConfigFile = (configPath = 'flow-config.json') => {
  const fullPath = path.join(DATA_DIR, configPath);
  try {
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
    return { nodes: [], connections: [], lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error(`读取配置文件失败: ${fullPath}`, error);
    return { nodes: [], connections: [], lastUpdated: new Date().toISOString() };
  }
};

/**
 * 写入配置文件
 * @param {Object} config - 配置对象
 * @param {string} configPath - 配置文件路径
 * @returns {boolean} 是否成功
 */
const writeConfigFile = (config, configPath = 'flow-config.json') => {
  const fullPath = path.join(DATA_DIR, configPath);
  try {
    fs.writeFileSync(fullPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`写入配置文件失败: ${fullPath}`, error);
    return false;
  }
};

module.exports = {
  ensureDataDir,
  readMarkdownFile,
  writeMarkdownFile,
  deleteMarkdownFile,
  readConfigFile,
  writeConfigFile
}; 