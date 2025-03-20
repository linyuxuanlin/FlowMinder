FROM python:3.9-slim

WORKDIR /app

RUN pip install --no-cache-dir watchdog requests

COPY . /app/

CMD ["python", "sync_service.py"] 