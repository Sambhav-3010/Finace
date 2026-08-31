"""
Generate compliance report PDF from analysis payload.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import settings
from reports.pdf_styles import build_pdf_styles
from reports.sections.core_sections import (
    append_citations,
    append_cover,
    append_executive_summary,
    append_methodology,
    append_risk_section,
    append_workflow_appendix,
)
from reports.sections.trust_sections import append_conversation_snapshots, append_trust_analytics


def generate_report_pdf(
    analysis: dict,
    report_id: str,
    org_name: str,
    output_dir: Path | None = None,
) -> Path:
    out_dir = output_dir or (settings.data_dir / "reports")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{report_id}.pdf"

    styles = build_pdf_styles()
    story = []

    append_cover(story, styles, analysis, report_id, org_name)
    append_methodology(story, styles)
    append_executive_summary(story, styles, analysis)
    append_risk_section(story, styles, analysis)
    append_citations(story, styles, analysis)
    append_trust_analytics(story, styles, analysis)
    append_conversation_snapshots(story, styles, analysis)
    append_workflow_appendix(story, styles, analysis)

    doc = SimpleDocTemplate(
        str(out_path),
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18,
    )
    doc.build(story)
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate compliance PDF report")
    parser.add_argument("--input-json", required=True)
    parser.add_argument("--report-id", required=True)
    parser.add_argument("--org-name", required=True)
    args = parser.parse_args()

    with open(args.input_json, "r", encoding="utf-8") as f:
        payload = json.load(f)

    analysis = payload.get("analysis", payload)
    if "workflow_input" not in analysis and "workflow_input" in payload:
        analysis["workflow_input"] = payload["workflow_input"]

    print(str(generate_report_pdf(analysis, report_id=args.report_id, org_name=args.org_name)))


if __name__ == "__main__":
    main()
