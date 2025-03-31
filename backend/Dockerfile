FROM python:3.9-slim as build

WORKDIR /app

# 首先只复制requirements.txt
COPY requirements.txt .

# 使用缓存安装依赖，使用pip cache
RUN pip install --upgrade pip && \
    pip install --cache-dir=/tmp/pip-cache -r requirements.txt

# 最终镜像
FROM python:3.9-slim

WORKDIR /app

# 复制已安装的依赖
COPY --from=build /usr/local/lib/python3.9/site-packages/ /usr/local/lib/python3.9/site-packages/
COPY --from=build /usr/local/bin/ /usr/local/bin/

# 安装curl用于健康检查，减少安装层数
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 分开复制应用代码，先复制不常变化的文件
COPY ./app/models ./app/models
COPY ./app/db ./app/db
COPY ./app/core ./app/core

# 最后复制经常变化的文件
COPY . .

# 添加healthcheck确保服务可用
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 