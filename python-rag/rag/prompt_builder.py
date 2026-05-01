"""
Prompt builder for compliance RAG reasoning.
"""
from __future__ import annotations

import json


def _serialize_chunks(chunks: list[dict], max_chunks: int = 5) -> str:
    selected = chunks[:max_chunks]
    lines: list[str] = []
    for i, c in enumerate(selected, start=1):
        title = c.get("metadata", {}).get("title", "")
        doc_id = c.get("document_id", "")
        section = c.get("section", "GENERAL")
        text = (c.get("text") or "").strip()
        lines.append(
            f"[Chunk {i}] doc={doc_id} section={section} title={title}\n{text}"
        )
    return "\n\n".join(lines)


def build_compliance_prompt(
    call_type: str,
    workflow_text: str,
    retrieved_chunks: list[dict],
    existing_report_text: str = "",
    top_k: int = 5,
) -> str:
    context = _serialize_chunks(retrieved_chunks, max_chunks=top_k)
    output_schema = {
        "call_type": "general_query|new_report|update_report",
        "risk_level": "HIGH|MEDIUM|LOW",
        "risk_flags": ["..."],
        "applicable_clauses": [{"title": "...", "text": "...", "source": "..."}],
        "explanation": "...",
        "recommendations": ["..."],
        "compliance_score": 0,
        "reasoning_steps": ["..."],
        "superseded_references": ["doc_id or circular ref"],
        "superseded_change_notes": ["what changed and why"],
    }
    existing_block = ""
    if existing_report_text.strip():
        existing_block = f"\nExisting Report Content:\n{existing_report_text}\n"

    return (
        "You are an ELITE fintech compliance legal expert.\n"
        f"Call type: {call_type}\n\n"
        "GOAL: Analyze the workflow and provide PRECISE, actionable legal guidance based ONLY on the provided context.\n\n"
        "STRICT RULES:\n"
        "1. BE EXTREMELY DETAILED AND COMPREHENSIVE. Do NOT give brief 7-10 line summaries. If asked to elaborate, you MUST provide a massive, exhaustive breakdown of ALL relevant points.\n"
        "2. CITE SPECIFIC ANNEXURES. If the context mentions 'Annexure A' or 'Annexure B', you MUST explain exactly what they require for this specific workflow in extensive detail.\n"
        "3. EXHAUSTIVE LISTS. If the context contains multiple requirements or points, you MUST extract and list EVERY SINGLE ONE of them (e.g., list all 10 points) in your explanation.\n"
        "4. DIRECT QUOTES. Use the 'applicable_clauses' section to quote the most relevant paragraph of the law.\n"
        "5. NO MARKDOWN. Return only valid JSON.\n\n"
        f"Workflow Input:\n{workflow_text}\n\n"
        f"{existing_block}\n"
        f"Regulatory Context (The Evidence):\n{context}\n\n"
        "Expected Explanation Style:\n"
        "Write a substantial, multi-paragraph deep analysis. First, summarize the legal standing in detail. Then, provide a comprehensive, numbered list of EVERY specific requirement or point (Point 1, Point 2, ... Point 10) found in the context. Never truncate your response.\n\n"
        f"Output JSON schema:\n{json.dumps(output_schema)}"
    )
