"""
Quick environment/config debug for python-rag.

Usage:
    cd python-rag
    python -m api.debug_env
"""
from __future__ import annotations

import os
from pathlib import Path

from config import settings


def main() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    print(f"ENV_FILE_PATH={env_path}")
    print(f"ENV_FILE_EXISTS={env_path.exists()}")
    print(f"HAS_GROQ_KEY={bool(settings.groq_api_key)}")
    print(f"GROQ_MODEL={settings.groq_model}")
    print(f"RAG_ENABLE_LLM={os.getenv('RAG_ENABLE_LLM', '0')}")


if __name__ == "__main__":
    main()
