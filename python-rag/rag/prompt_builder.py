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
        "You are a fintech compliance analysis engine.\n"
        f"Call type: {call_type}\n"
        "Analyze the provided workflow against the retrieved regulatory context.\n"
        "All outputs must be explainable and justified.\n"
        "Return only strict JSON with no markdown.\n\n"
        f"Workflow Input:\n{workflow_text}\n\n"
        f"{existing_block}\n"
        f"Regulatory Context:\n{context}\n\n"
        "Instructions:\n"
        "1) Identify key compliance risks.\n"
        "2) Cite only from provided context.\n"
        "3) Provide concise recommendations.\n"
        "4) compliance_score must be integer 0-100.\n"
        "5) Add reasoning_steps to explain conclusion path.\n"
        "6) For update_report, include superseded_references and superseded_change_notes.\n\n"
        f"Output JSON schema:\n{json.dumps(output_schema)}"
    )
