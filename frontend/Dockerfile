FROM node:16-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install
# 确保开发依赖也被安装
RUN npm install -g vite
ENV PATH /app/node_modules/.bin:$PATH

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]