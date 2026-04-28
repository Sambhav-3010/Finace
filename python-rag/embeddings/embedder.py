"""
Sentence-transformers embedding wrapper.
"""
from __future__ import annotations

import os
from typing import Sequence

from sentence_transformers import SentenceTransformer

from config import settings


class Embedder:
    def __init__(self, model_name: str | None = None, local_files_only: bool = False):
        self.model_name = model_name or settings.embedding_model
        self.local_files_only = local_files_only
        self._model: SentenceTransformer | None = None

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            cache_dir = settings.data_dir / "hf_cache"
            cache_dir.mkdir(parents=True, exist_ok=True)
            os.environ.setdefault("HF_HOME", str(cache_dir))
            os.environ.setdefault("TRANSFORMERS_CACHE", str(cache_dir))
            self._model = SentenceTransformer(
                self.model_name,
                local_files_only=self.local_files_only,
            )
        return self._model

    def embed_texts(self, texts: Sequence[str], batch_size: int = 32) -> list[list[float]]:
        if not texts:
            return []
        vectors = self.model.encode(
            list(texts),
            batch_size=batch_size,
            show_progress_bar=False,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
        return vectors.tolist()

    def embed_query(self, text: str) -> list[float]:
        vectors = self.embed_texts([text], batch_size=1)
        return vectors[0] if vectors else []
