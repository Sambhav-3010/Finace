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
        "Write a MASSIVE, exhaustive, multi-page equivalent deep analysis. You MUST use HTML tags such as <h1> for main sections, <h2> for sub-sections, and <p> for paragraphs to structure the response professionally.\n\n"
        "Break it down into the following sections:\n"
        "1. Executive Overview: A comprehensive summary of the legal standing.\n"
        "2. Detailed Risk Breakdown: A meticulous, point-by-point analysis of every single risk identified.\n"
        "3. Regulatory Mapping: How the workflow maps to specific regulatory clauses.\n"
        "4. Operational Impact: What this means for the business process.\n"
        "5. Remediation Plan: An exhaustive, step-by-step list of actions required to achieve compliance.\n"
        "NEVER truncate your response. Provide the maximum possible detail with rich formatting.\n\n"
        f"Output JSON schema:\n{json.dumps(output_schema)}"
    )
