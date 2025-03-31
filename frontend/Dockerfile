FROM node:18-alpine as build

WORKDIR /app

# 分离依赖安装步骤，只复制package文件
COPY package.json package-lock.json ./

# 使用缓存安装依赖，改用npm install避免依赖不一致问题
RUN npm config set cache /tmp/npm-cache && \
    npm install --quiet && \
    npm install mermaid@11.6.0 --quiet --save

# 分开复制不常变化的文件
COPY public ./public

# 复制源代码
COPY src ./src

# 生产环境使用的镜像
FROM node:18-alpine

WORKDIR /app

# 从构建阶段复制node_modules和其他文件
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/public /app/public
COPY --from=build /app/src /app/src
COPY package.json package-lock.json ./

# 添加healthcheck确保服务可用
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost:3000 || exit 1

EXPOSE 3000

CMD ["npm", "start"] 