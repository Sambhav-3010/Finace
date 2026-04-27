"""
Entry point: reads parsed documents from MongoDB, chunks text, stores chunks in:
1) Local JSON files under data/chunks/
2) MongoDB chunks collection

Usage:
    cd python-rag
    python -m ingestion.chunk_docs
    python -m ingestion.chunk_docs --limit 20
    python -m ingestion.chunk_docs --rechunk
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from loguru import logger
from tqdm import tqdm

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import settings
from db.mongo import chunks as chunks_col
from db.mongo import documents as docs_col
from ingestion.chunker import chunk_text


def _resolve_parsed_path(path_value: str) -> Path:
    parsed_path = Path(path_value)
    if parsed_path.is_absolute():
        return parsed_path
    # parsed_text_path is currently stored as a path relative to python-rag
    return (Path(__file__).resolve().parents[1] / parsed_path).resolve()


def _load_full_text(parsed_text_path: str) -> str:
    path = _resolve_parsed_path(parsed_text_path)
    if not path.exists():
        raise FileNotFoundError(f"Parsed JSON not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        payload = json.load(f)
    return (payload.get("full_text") or "").strip()


def _save_chunk_json(regulation_id: str, chunks_payload: list[dict]) -> Path:
    out_dir = settings.data_dir / "chunks"
    out_dir.mkdir(parents=True, exist_ok=True)
    safe_name = regulation_id.replace("/", "-").replace("\\", "-")
    out_path = out_dir / f"{safe_name}_chunks.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(chunks_payload, f, ensure_ascii=False, indent=2)
    return out_path


def _find_candidate_docs(limit: int | None = None) -> list[dict]:
    cursor = docs_col().find(
        {
            "parsed_text_path": {"$exists": True, "$ne": ""},
            "extraction_status": {"$ne": "failed"},
            "char_count": {"$gt": 0},
        },
        {
            "_id": 0,
            "regulation_id": 1,
            "title": 1,
            "regulator": 1,
            "category": 1,
            "status": 1,
            "issue_date": 1,
            "parsed_text_path": 1,
        },
        sort=[("regulation_id", 1)],
    )
    if limit:
        cursor = cursor.limit(limit)
    return list(cursor)


def _already_chunked(regulation_id: str) -> bool:
    return chunks_col().find_one({"document_id": regulation_id}, {"_id": 1}) is not None


def chunk_all(
    limit: int | None = None,
    rechunk: bool = False,
    chunk_size: int = 700,
    overlap: int = 120,
) -> dict:
    candidates = _find_candidate_docs(limit=limit)
    logger.info(f"Found {len(candidates)} candidate parsed documents for chunking")

    stats = {
        "total": len(candidates),
        "chunked_docs": 0,
        "created_chunks": 0,
        "skipped_docs": 0,
        "failed_docs": 0,
    }

    for doc in tqdm(candidates, desc="Chunking docs", unit="doc"):
        regulation_id = doc["regulation_id"]
        try:
            if not rechunk and _already_chunked(regulation_id):
                stats["skipped_docs"] += 1
                continue

            if rechunk:
                chunks_col().delete_many({"document_id": regulation_id})

            text = _load_full_text(doc["parsed_text_path"])
            if not text:
                logger.warning(f"[{regulation_id}] Empty parsed text; skipping")
                stats["failed_docs"] += 1
                continue

            chunk_items = chunk_text(text, chunk_size=chunk_size, overlap=overlap)
            if not chunk_items:
                logger.warning(f"[{regulation_id}] No chunks generated; skipping")
                stats["failed_docs"] += 1
                continue

            now = datetime.now(timezone.utc).isoformat()
            mongo_rows: list[dict] = []
            chunk_json_payload: list[dict] = []

            for c in chunk_items:
                chunk_id = str(uuid4())
                row = {
                    "chunk_id": chunk_id,
                    "document_id": regulation_id,
                    "chunk_index": c.chunk_index,
                    "section": c.section,
                    "text": c.text,
                    "token_count": c.token_count,
                    "char_offset": c.char_offset,
                    "embedding": [],
                    "embedded": False,
                    "metadata": {
                        "regulator": doc.get("regulator", ""),
                        "category": doc.get("category", ""),
                        "status": doc.get("status", "active"),
                        "issue_date": doc.get("issue_date", ""),
                        "title": doc.get("title", ""),
                    },
                    "created_at": now,
                }
                mongo_rows.append(row)
                chunk_json_payload.append(
                    {
                        "chunk_index": c.chunk_index,
                        "section": c.section,
                        "text": c.text,
                        "token_count": c.token_count,
                        "char_offset": c.char_offset,
                    }
                )

            chunks_col().insert_many(mongo_rows, ordered=True)
            chunk_json_path = _save_chunk_json(regulation_id, chunk_json_payload)

            docs_col().update_one(
                {"regulation_id": regulation_id},
                {
                    "$set": {
                        "chunked": True,
                        "chunk_count": len(chunk_items),
                        "chunks_path": str(chunk_json_path),
                        "chunked_at": now,
                    }
                },
            )

            stats["chunked_docs"] += 1
            stats["created_chunks"] += len(chunk_items)
        except Exception as exc:
            logger.error(f"[{regulation_id}] chunking failed: {exc}")
            stats["failed_docs"] += 1

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description="Chunk parsed regulation documents into MongoDB + JSON")
    parser.add_argument("--limit", type=int, default=None, help="Only process first N parsed docs")
    parser.add_argument("--rechunk", action="store_true", help="Recreate chunks for docs even if already chunked")
    parser.add_argument("--chunk-size", type=int, default=700, help="Target tokens per chunk")
    parser.add_argument("--overlap", type=int, default=120, help="Overlap tokens between chunks")
    args = parser.parse_args()

    logger.info("=== Document Chunking Pipeline ===")
    stats = chunk_all(
        limit=args.limit,
        rechunk=args.rechunk,
        chunk_size=args.chunk_size,
        overlap=args.overlap,
    )
    logger.success(
        f"Done — docs chunked: {stats['chunked_docs']}, chunks created: {stats['created_chunks']}, "
        f"skipped docs: {stats['skipped_docs']}, failed docs: {stats['failed_docs']}"
    )


if __name__ == "__main__":
    main()
