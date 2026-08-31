"""ReportLab style helpers for compliance PDFs."""
from __future__ import annotations

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet


def build_pdf_styles():
    base = getSampleStyleSheet()
    return {
        "base": base,
        "title": ParagraphStyle(
            "MainTitle",
            parent=base["Title"],
            fontSize=28,
            spaceAfter=30,
            textColor=colors.HexColor("#0f172a"),
            alignment=TA_CENTER,
        ),
        "subtitle": ParagraphStyle(
            "SubTitle",
            parent=base["Heading2"],
            fontSize=16,
            textColor=colors.HexColor("#475569"),
            alignment=TA_CENTER,
        ),
        "header": ParagraphStyle(
            "SectionHeader",
            parent=base["Heading1"],
            fontSize=18,
            spaceBefore=20,
            spaceAfter=15,
            textColor=colors.HexColor("#1e293b"),
            borderPadding=10,
        ),
        "body": ParagraphStyle(
            "BodyJustify",
            parent=base["BodyText"],
            fontSize=11,
            leading=16,
            alignment=TA_JUSTIFY,
            spaceAfter=10,
        ),
        "bullet": ParagraphStyle(
            "BulletItem",
            parent=base["BodyText"],
            fontSize=11,
            leading=16,
            leftIndent=20,
            spaceAfter=8,
        ),
        "mono": ParagraphStyle(
            "CodeStyle",
            parent=base["BodyText"],
            fontName="Courier",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155"),
            leftIndent=10,
            rightIndent=10,
            backColor=colors.HexColor("#f1f5f9"),
            spaceBefore=10,
            spaceAfter=10,
        ),
    }


def as_list(value) -> list[str]:
    if isinstance(value, list):
        return [str(v) for v in value]
    return []
