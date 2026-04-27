"""
Generate embeddings for chunk records in MongoDB.

Usage:
    cd python-rag
    python -m embeddings.embed_chunks
    python -m embeddings.embed_chunks --limit 500
    python -m embeddings.embed_chunks --batch-size 32
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone

from loguru import logger
from tqdm import tqdm

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from db.mongo import chunks as chunks_col
from embeddings.embedder import Embedder


def _fetch_unembedded(limit: int | None = None) -> list[dict]:
    cursor = chunks_col().find(
        {
            "$or": [
                {"embedded": {"$ne": True}},
                {"embedding": {"$exists": False}},
                {"embedding": []},
            ]
        },
        {"_id": 1, "chunk_id": 1, "text": 1},
        sort=[("chunk_id", 1)],
    )
    if limit:
        cursor = cursor.limit(limit)
    return list(cursor)


def embed_all(limit: int | None = None, batch_size: int = 32) -> dict:
    rows = _fetch_unembedded(limit=limit)
    logger.info(f"Found {len(rows)} unembedded chunks")
    if not rows:
        return {"total": 0, "embedded": 0, "failed": 0}

    embedder = Embedder()
    stats = {"total": len(rows), "embedded": 0, "failed": 0}

    for i in tqdm(range(0, len(rows), batch_size), desc="Embedding chunks", unit="batch"):
        batch = rows[i:i + batch_size]
        texts = [(r.get("text") or "").strip() for r in batch]
        # Keep positional mapping stable even if text is blank
        safe_texts = [t if t else " " for t in texts]

        try:
            vectors = embedder.embed_texts(safe_texts, batch_size=len(batch))
        except Exception as exc:
            logger.error(f"Embedding batch failed at offset {i}: {exc}")
            stats["failed"] += len(batch)
            continue

        now = datetime.now(timezone.utc).isoformat()
        for row, vec in zip(batch, vectors):
            try:
                chunks_col().update_one(
                    {"_id": row["_id"]},
                    {
                        "$set": {
                            "embedding": vec,
                            "embedded": True,
                            "embedded_at": now,
                        }
                    },
                )
                stats["embedded"] += 1
            except Exception as exc:
                logger.error(f"Failed updating chunk {row.get('chunk_id', str(row['_id']))}: {exc}")
                stats["failed"] += 1

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate embeddings for unembedded chunks in MongoDB")
    parser.add_argument("--limit", type=int, default=None, help="Only embed first N unembedded chunks")
    parser.add_argument("--batch-size", type=int, default=32, help="Embedding batch size")
    args = parser.parse_args()

    logger.info("=== Chunk Embedding Pipeline ===")
    stats = embed_all(limit=args.limit, batch_size=args.batch_size)
    logger.success(
        f"Done — total: {stats['total']}, embedded: {stats['embedded']}, failed: {stats['failed']}"
    )


if __name__ == "__main__":
    main()
