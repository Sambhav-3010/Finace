"""
Deterministic rule definitions for hybrid compliance scoring.
"""
from __future__ import annotations


RULES: list[dict] = [
    {
        "rule_id": "R001_NO_KYC",
        "name": "Missing KYC",
        "risk_level": "HIGH",
        "patterns": [r"\bno\s+kyc\b", r"\bwithout\s+kyc\b", r"\bskip\s+kyc\b"],
        "flag": "KYC process appears missing or bypassed",
        "recommendation": "Implement mandatory full KYC before onboarding or activation.",
    },
    {
        "rule_id": "R002_P2P_CRYPTO",
        "name": "P2P Crypto Exposure",
        "risk_level": "HIGH",
        "patterns": [r"\bp2p\b.*\bcrypto\b", r"\bcrypto\b.*\bp2p\b", r"\bvirtual\s+asset\b"],
        "flag": "Potential high AML risk from P2P/crypto activity",
        "recommendation": "Add AML controls, enhanced due diligence, and transaction monitoring.",
    },
    {
        "rule_id": "R003_CROSS_BORDER_NO_FEMA",
        "name": "Cross-border Without FEMA Controls",
        "risk_level": "HIGH",
        "patterns": [r"\bcross[- ]border\b", r"\bforeign\s+transfer\b", r"\binternational\s+remittance\b"],
        "requires_any": [r"\bfema\b", r"\bfx\s+compliance\b", r"\bforex\s+declaration\b"],
        "flag": "Cross-border flow detected without explicit FEMA/FX compliance terms",
        "recommendation": "Add FEMA checks, regulatory reporting, and forex declaration workflow.",
    },
    {
        "rule_id": "R004_NO_GRIEVANCE",
        "name": "Missing Grievance Redressal",
        "risk_level": "MEDIUM",
        "patterns": [r"\bno\s+grievance\b", r"\bwithout\s+grievance\b", r"\bno\s+complaint\b"],
        "flag": "Grievance redressal/complaint handling appears absent",
        "recommendation": "Define grievance process with SLA, escalation matrix, and audit trail.",
    },
]
