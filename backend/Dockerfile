FROM node:16-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install
# 全局安装ts-node并确保PATH正确
RUN npm install -g ts-node typescript
ENV PATH /app/node_modules/.bin:$PATH

# 复制源代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 4000

# 启动应用
CMD ["npm", "start"]