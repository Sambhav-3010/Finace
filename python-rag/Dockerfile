# Finace python-rag API — AWS / Docker (t2.micro + swap recommended)
#
# Build:
#   docker compose build --no-cache
#   docker compose up -d

FROM python:3.12-slim-bookworm

ARG EMBEDDING_MODEL=BAAI/bge-large-en-v1.5

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000 \
    DATA_DIR=/app/data \
    FASTEMBED_CACHE_PATH=/app/data/fastembed_cache \
    EMBEDDING_BACKEND=fastembed \
    EMBEDDING_MODEL=${EMBEDDING_MODEL} \
    RAG_LIGHT_XAI=1 \
    RETRIEVAL_MAX_CANDIDATES=300 \
    WARM_EMBEDDER=1 \
    OMP_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/data/fastembed_cache \
    && python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='${EMBEDDING_MODEL}')"

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=15s --start-period=180s --retries=5 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.environ.get(\"PORT\", \"8000\")}/health', timeout=10)"

CMD ["sh", "-c", "exec uvicorn api.app:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
