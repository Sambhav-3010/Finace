"""
Embed one query string for retrieval.

Usage:
    cd python-rag
    python -m embeddings.embed_query --text "What are RBI KYC obligations for wallet onboarding?"
"""
from __future__ import annotations

import argparse
import os
import sys

from loguru import logger

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from embeddings.embedder import Embedder


def main() -> None:
    parser = argparse.ArgumentParser(description="Embed a single query string")
    parser.add_argument("--text", required=True, help="Query text to embed")
    parser.add_argument("--preview", type=int, default=8, help="How many dimensions to print")
    args = parser.parse_args()

    embedder = Embedder()
    vector = embedder.embed_query(args.text)
    if not vector:
        logger.error("No embedding generated")
        return

    preview = max(args.preview, 1)
    logger.info(f"Embedding dims: {len(vector)}")
    logger.info(f"First {preview} dims: {vector[:preview]}")


if __name__ == "__main__":
    main()
