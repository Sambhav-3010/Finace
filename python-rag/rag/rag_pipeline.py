"""
Hybrid RAG pipeline:
1) Deterministic rules
2) Retrieval
3) Prompt + LLM JSON reasoning
4) Merge outputs (highest risk wins)

Usage:
    cd python-rag
    python -m rag.rag_pipeline --workflow "We support P2P crypto without KYC."
"""
from __future__ import annotations

import argparse
import json
import os
import sys

from loguru import logger

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from rag.llm_client import LLMClient
from rag.output_schema import ApplicableClause, ComplianceOutput
from rag.prompt_builder import build_compliance_prompt
from retrieval.retriever import LocalRetriever
from rules.rule_engine import evaluate_rules


_RISK_RANK = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}


def _pick_higher_risk(a: str, b: str) -> str:
    return a if _RISK_RANK.get(a, 1) >= _RISK_RANK.get(b, 1) else b


class RAGPipeline:
    def __init__(self):
        self.retriever = LocalRetriever()
        self.llm = LLMClient()

    def analyze(
        self,
        call_type: str,
        workflow_text: str,
        existing_report_text: str = "",
        top_k: int = 5,
        regulator: str | None = None,
        category: str | None = None,
        status: str | None = "active",
    ) -> dict:
        if call_type not in {"general_query", "new_report", "update_report"}:
            raise ValueError("call_type must be one of: general_query, new_report, update_report")

        # Update flow should see active + superseded context, not only active.
        if call_type == "update_report":
            status = None

        # Step 1: deterministic rules
        rule_out = evaluate_rules(workflow_text)

        # Step 2: retrieval
        hits = self.retriever.search(
            query_text=workflow_text,
            top_k=top_k,
            regulator=regulator,
            category=category,
            status=status or "",
            use_reranker=True,
        )

        # Step 3: LLM reasoning
        prompt = build_compliance_prompt(
            call_type=call_type,
            workflow_text=workflow_text,
            retrieved_chunks=hits,
            existing_report_text=existing_report_text,
            top_k=top_k,
        )
        llm_raw = self.llm.generate_json(prompt)
        llm_struct = ComplianceOutput.model_validate(llm_raw)

        # Add retrieved clauses
        clauses: list[ApplicableClause] = []
        for hit in hits:
            clauses.append(
                ApplicableClause(
                    title=hit.get("section") or "Clause",
                    text=(hit.get("text") or "")[:1200],
                    source=hit.get("document_id") or "",
                )
            )

        # Step 4: merge rule + llm outputs
        final_risk = _pick_higher_risk(rule_out["risk_level"], llm_struct.risk_level)
        merged_flags = list(dict.fromkeys(rule_out["risk_flags"] + llm_struct.risk_flags))
        merged_recs = list(
            dict.fromkeys(rule_out["recommendations"] + llm_struct.recommendations)
        )
        if rule_out["triggered_rules"]:
            score = min(llm_struct.compliance_score, 60)
            if final_risk == "HIGH":
                score = min(score, 40)
        else:
            score = llm_struct.compliance_score

        final = ComplianceOutput(
            call_type=call_type,  # force consistent response type
            risk_level=final_risk,
            risk_flags=merged_flags,
            applicable_clauses=clauses if clauses else llm_struct.applicable_clauses,
            explanation=llm_struct.explanation,
            recommendations=merged_recs,
            compliance_score=score,
            reasoning_steps=llm_struct.reasoning_steps,
            superseded_references=llm_struct.superseded_references,
            superseded_change_notes=llm_struct.superseded_change_notes,
        )

        # Augment explainability for update calls from retrieved superseded docs.
        if call_type == "update_report":
            superseded_docs = [
                h.get("document_id", "")
                for h in hits
                if h.get("metadata", {}).get("status") == "superseded"
            ]
            if superseded_docs:
                dedup = list(dict.fromkeys([d for d in superseded_docs if d]))
                final.superseded_references = list(
                    dict.fromkeys(final.superseded_references + dedup)
                )
                if not final.superseded_change_notes:
                    final.superseded_change_notes = [
                        "Update includes superseded/legacy references for change comparison."
                    ]

        return {
            "analysis": final.model_dump(),
            "rules": rule_out,
            "retrieval_hits": hits,
        }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run hybrid compliance RAG analysis")
    parser.add_argument(
        "--call-type",
        default="general_query",
        choices=["general_query", "new_report", "update_report"],
        help="Type of AI call",
    )
    parser.add_argument("--workflow", required=True, help="Workflow/business description text")
    parser.add_argument(
        "--existing-report-file",
        default=None,
        help="Path to existing report text file (used for update_report)",
    )
    parser.add_argument("--top-k", type=int, default=5, help="Top-k retrieved chunks")
    parser.add_argument("--regulator", default=None, help="Optional regulator filter")
    parser.add_argument("--category", default=None, help="Optional category filter")
    parser.add_argument("--status", default="active", help="Optional status filter")
    args = parser.parse_args()

    existing_text = ""
    if args.existing_report_file:
        with open(args.existing_report_file, "r", encoding="utf-8") as f:
            existing_text = f.read()

    pipeline = RAGPipeline()
    result = pipeline.analyze(
        call_type=args.call_type,
        workflow_text=args.workflow,
        existing_report_text=existing_text,
        top_k=args.top_k,
        regulator=args.regulator,
        category=args.category,
        status=args.status if args.status else None,
    )
    logger.info(json.dumps(result["analysis"], indent=2))


if __name__ == "__main__":
    main()
