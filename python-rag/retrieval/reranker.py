"""
Lightweight reranker for retrieved chunks.

This is intentionally simple for local MVP use:
- Scores lexical overlap between query tokens and chunk tokens
- Blends overlap score with base vector similarity score
"""
from __future__ import annotations

import re


_TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9]+")


def _tokens(text: str) -> set[str]:
    return {t.lower() for t in _TOKEN_PATTERN.findall(text or "") if t}


def rerank_hits(query: str, hits: list[dict], alpha: float = 0.2) -> list[dict]:
    """
    Re-rank retrieval hits using lexical overlap.

    Args:
        query: user query text
        hits: retrieval hits containing at least {"text", "score"}
        alpha: lexical blend weight in [0,1]. final = (1-alpha)*score + alpha*overlap
    """
    if not hits:
        return hits

    alpha = max(0.0, min(alpha, 1.0))
    q_tokens = _tokens(query)
    if not q_tokens:
        return hits

    reranked: list[dict] = []
    for hit in hits:
        text_tokens = _tokens(hit.get("text", ""))
        if not text_tokens:
            overlap = 0.0
        else:
            overlap = len(q_tokens & text_tokens) / max(len(q_tokens), 1)
        base = float(hit.get("score", 0.0))
        final_score = (1.0 - alpha) * base + alpha * overlap
        updated = dict(hit)
        updated["vector_score"] = base
        updated["lexical_overlap"] = overlap
        updated["score"] = final_score
        reranked.append(updated)

    reranked.sort(key=lambda x: x["score"], reverse=True)
    return reranked
