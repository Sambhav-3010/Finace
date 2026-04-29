"""
Generate compliance report PDF from analysis payload.

Usage:
    cd python-rag
    python -m reports.report_generator --input-json .\\sample_analysis.json --report-id rep-001 --org-name "Acme Fintech"
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import settings


def _as_list(value) -> list[str]:
    if isinstance(value, list):
        return [str(v) for v in value]
    return []


def generate_report_pdf(
    analysis: dict,
    report_id: str,
    org_name: str,
    output_dir: Path | None = None,
) -> Path:
    out_dir = output_dir or (settings.data_dir / "reports")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{report_id}.pdf"

    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph("Compliance Report", styles["Title"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph(f"Report ID: {report_id}", styles["Normal"]))
    story.append(Paragraph(f"Organization: {org_name}", styles["Normal"]))
    story.append(Paragraph(f"Generated At: {datetime.now(timezone.utc).isoformat()}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Executive Summary", styles["Heading2"]))
    story.append(
        Paragraph(
            f"Risk Level: <b>{analysis.get('risk_level', 'LOW')}</b><br/>"
            f"Compliance Score: <b>{analysis.get('compliance_score', 0)}</b>",
            styles["BodyText"],
        )
    )
    story.append(Spacer(1, 10))

    story.append(Paragraph("Risk Flags", styles["Heading2"]))
    for flag in _as_list(analysis.get("risk_flags")):
        story.append(Paragraph(f"- {flag}", styles["BodyText"]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Applicable Clauses", styles["Heading2"]))
    clauses = analysis.get("applicable_clauses", [])
    if isinstance(clauses, list):
        for c in clauses[:20]:
            title = str(c.get("title", "Clause"))
            source = str(c.get("source", ""))
            text = str(c.get("text", ""))[:1200]
            story.append(Paragraph(f"<b>{title}</b> ({source})", styles["BodyText"]))
            story.append(Paragraph(text, styles["BodyText"]))
            story.append(Spacer(1, 6))

    story.append(Paragraph("Recommendations", styles["Heading2"]))
    for rec in _as_list(analysis.get("recommendations")):
        story.append(Paragraph(f"- {rec}", styles["BodyText"]))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Reasoning Steps", styles["Heading2"]))
    for step in _as_list(analysis.get("reasoning_steps")):
        story.append(Paragraph(f"- {step}", styles["BodyText"]))

    if analysis.get("superseded_references") or analysis.get("superseded_change_notes"):
        story.append(Spacer(1, 10))
        story.append(Paragraph("Superseded / Change Notes", styles["Heading2"]))
        for ref in _as_list(analysis.get("superseded_references")):
            story.append(Paragraph(f"- Reference: {ref}", styles["BodyText"]))
        for note in _as_list(analysis.get("superseded_change_notes")):
            story.append(Paragraph(f"- Note: {note}", styles["BodyText"]))

    doc = SimpleDocTemplate(str(out_path), pagesize=A4)
    doc.build(story)
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate compliance PDF report from analysis JSON")
    parser.add_argument("--input-json", required=True, help="Path to analysis json file")
    parser.add_argument("--report-id", required=True, help="Unique report id")
    parser.add_argument("--org-name", required=True, help="Organization name")
    args = parser.parse_args()

    with open(args.input_json, "r", encoding="utf-8") as f:
        payload = json.load(f)

    analysis = payload.get("analysis", payload)
    out = generate_report_pdf(analysis, report_id=args.report_id, org_name=args.org_name)
    print(str(out))


if __name__ == "__main__":
    main()
