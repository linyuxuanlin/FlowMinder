FROM node:16-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "server.js"]