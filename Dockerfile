# DemandIQ Production Multi-Stage Dockerfile
FROM python:3.12-slim as backend

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH /app/backend:/app/backend/apps

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend/
COPY scripts /app/scripts/
COPY main.py app.py /app/

EXPOSE 8000

CMD ["python", "main.py", "runserver", "0.0.0.0:8000"]
