"""
JSON-only bridge for general-query mode.

Usage:
    cd python-rag
    python -m api.general_query --prompt "What are AEPS dispute guidelines?"
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import warnings

from loguru import logger

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from rag.rag_pipeline import RAGPipeline


def main() -> None:
    parser = argparse.ArgumentParser(description="Run general-query RAG and print JSON")
    parser.add_argument("--prompt", required=True, help="User prompt")
    parser.add_argument("--top-k", type=int, default=5, help="Retrieved chunks count")
    parser.add_argument("--regulator", default=None, help="Optional regulator filter")
    parser.add_argument("--category", default=None, help="Optional category filter")
    args = parser.parse_args()

    warnings.filterwarnings("ignore")
    logger.remove()  # ensure stdout is JSON only

    pipeline = RAGPipeline()
    result = pipeline.analyze(
        call_type="general_query",
        workflow_text=args.prompt,
        top_k=args.top_k,
        regulator=args.regulator,
        category=args.category,
        status="active",
    )
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
