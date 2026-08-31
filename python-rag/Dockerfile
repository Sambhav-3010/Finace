# Finace python-rag API — AWS / Docker (t2.micro friendly, ~1GB RAM)
#
# Build:
#   docker build -t finace-python-rag .
#
# Run:
#   docker run -d --name finace-rag -p 8000:8000 --env-file .env finace-python-rag
#
# Override port:
#   docker run -d -p 9000:9000 -e PORT=9000 --env-file .env finace-python-rag

FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000 \
    DATA_DIR=/app/data \
    EMBEDDING_BACKEND=fastembed \
    RAG_LIGHT_XAI=1 \
    RETRIEVAL_MAX_CANDIDATES=800 \
    OMP_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

WORKDIR /app

# libgomp1 — required by onnxruntime (fastembed)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/data

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.environ.get(\"PORT\", \"8000\")}/health', timeout=5)"

CMD ["sh", "-c", "exec uvicorn api.app:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
