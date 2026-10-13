"""
Read-only dashboard payload for the Finace ML Validation UI.

Loads measured artifacts from disk. Does not train, retune, or invent metrics.
Internal dataset stems are never exposed in API responses.
"""
from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from ml_validation.dataset.generate import load_cases
from ml_validation.model.predict import predict_workflow
from ml_validation.model.train import latest_model_dir
from ml_validation.paths import BANK_JSONL, DATASET_DIR, MLV_ROOT, REPORTS_DIR
from ml_validation.schema import ComplianceCase

# Current production/demo artifacts (internal only — not returned to clients).
_CURRENT_DATASET = "compliance_benchmark_v2"
_ROBUSTNESS_SET = "adversarial_challenge_v1"
_HUMAN_SET = "gold_human_v1"
_COMPARE_STEM = "ml_vs_finace_compliance_benchmark_v2_test"
_IMPORTANCE_STEM = "feature_importance_v2"


def _load_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    return data if isinstance(data, dict) else None


def _pct(value: float | None, digits: int = 1) -> str | None:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    return f"{round(float(value) * 100, digits)}%"


def _safe_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return f


def _model_display_name(meta: dict[str, Any] | None) -> str:
    raw = (meta or {}).get("status_model") or "unknown"
    if raw == "random_forest":
        return "Random Forest"
    if raw == "logistic_regression":
        return "Logistic Regression"
    return str(raw).replace("_", " ").title()


def _case_public(c: ComplianceCase) -> dict[str, Any]:
    return {
        "case_id": c.case_id,
        "domain": c.domain,
        "scenario": c.scenario,
        "scenario_type": c.scenario_type,
        "difficulty": c.difficulty,
        "regulatory_document": c.regulatory_document,
        "regulatory_section": c.regulatory_section,
        "source_chunk_id": c.source_chunk_id,
        "compliance_requirement": c.compliance_requirement,
        "evidence": c.evidence,
        "expected_status": c.expected_status,
        "expected_risk": c.expected_risk,
        "severity": c.severity,
        "requirement_id": c.requirement_id,
        "review_status": c.review_status,
        "review_notes": getattr(c, "review_notes", "") or "",
    }


def _with_prediction(c: ComplianceCase, *, include_explanation: bool = False) -> dict[str, Any]:
    base = _case_public(c)
    pred = predict_workflow(
        c.scenario,
        domain=c.domain,
        requirement=c.compliance_requirement,
        include_explanation=include_explanation,
    )
    ml_status = pred.get("compliance_status") if pred.get("available") else None
    ml_risk = pred.get("risk_category") if pred.get("available") else None
    status_probs = pred.get("status_probabilities") or {}
    confidence = None
    if ml_status and isinstance(status_probs, dict) and ml_status in status_probs:
        confidence = _safe_float(status_probs.get(ml_status))

    correct = None
    if ml_status is not None:
        correct = ml_status == c.expected_status

    base.update(
        {
            "ml_prediction": {
                "available": bool(pred.get("available")),
                "compliance_status": ml_status,
                "risk_category": ml_risk,
                "status_probabilities": status_probs if pred.get("available") else {},
                "risk_probabilities": pred.get("risk_probabilities") or {},
                "confidence": confidence,
                "notes": pred.get("notes") or [],
            },
            "result": (
                "correct"
                if correct is True
                else "incorrect"
                if correct is False
                else "unavailable"
            ),
        }
    )
    return base


def build_dashboard() -> dict[str, Any]:
    """Examiner-facing overview + performance + comparison + human status."""
    test_ev = _load_json(REPORTS_DIR / f"evaluation_{_CURRENT_DATASET}_test.json")
    unseen_ev = _load_json(REPORTS_DIR / f"evaluation_{_CURRENT_DATASET}_unseen_wording.json")
    robust_ev = _load_json(REPORTS_DIR / f"evaluation_{_ROBUSTNESS_SET}_all.json")
    compare = _load_json(REPORTS_DIR / f"{_COMPARE_STEM}.json")
    importance = _load_json(REPORTS_DIR / f"{_IMPORTANCE_STEM}.json")
    shortcut_qc = _load_json(REPORTS_DIR / f"shortcut_qc_{_CURRENT_DATASET}.json") or {}
    gold_meta = _load_json(DATASET_DIR / f"{_HUMAN_SET}_meta.json")
    gold_eval = _load_json(REPORTS_DIR / f"evaluation_{_HUMAN_SET}_approved.json")

    model_dir = latest_model_dir()
    meta = None
    if model_dir and (model_dir / "pipeline.json").exists():
        meta = _load_json(model_dir / "pipeline.json")

    # Only expose a safe model identifier and timestamp, never artifact paths or files.
    current_model_version = (meta or {}).get("created_at")
    test_artifact_path = REPORTS_DIR / f"evaluation_{_CURRENT_DATASET}_test.json"
    artifact_updated_at = (
        datetime.fromtimestamp(test_artifact_path.stat().st_mtime, timezone.utc).isoformat()
        if test_artifact_path.exists() else None
    )

    dataset_path = DATASET_DIR / f"{_CURRENT_DATASET}.jsonl"
    robust_path = DATASET_DIR / f"{_ROBUSTNESS_SET}.jsonl"
    human_path = DATASET_DIR / f"{_HUMAN_SET}.jsonl"

    counts_fallback = _load_json(MLV_ROOT / "artifact_counts.json") or {}

    n_scenarios = None
    if dataset_path.exists():
        n_scenarios = sum(1 for _ in dataset_path.open("r", encoding="utf-8"))
    if n_scenarios is None:
        n_scenarios = counts_fallback.get("compliance_scenarios")

    n_robust = None
    if robust_path.exists():
        n_robust = sum(1 for _ in robust_path.open("r", encoding="utf-8"))
    if n_robust is None:
        n_robust = counts_fallback.get("robustness_cases")
        if n_robust is None:
            n_robust = (robust_ev or {}).get("n")

    n_human = (gold_meta or {}).get("n")
    if n_human is None and human_path.exists():
        n_human = sum(1 for _ in human_path.open("r", encoding="utf-8"))
    if n_human is None:
        n_human = counts_fallback.get("human_validation_cases")

    test_status = (test_ev or {}).get("status") or {}
    unseen_status = (unseen_ev or {}).get("status") or {}
    robust_status = (robust_ev or {}).get("status") or {}
    main_acc = _safe_float(test_status.get("accuracy"))
    unseen_acc = _safe_float((unseen_ev or {}).get("status", {}).get("accuracy"))
    robust_acc = _safe_float((robust_ev or {}).get("status", {}).get("accuracy"))
    # Calibration error shown for the robustness evaluation (measured ECE on that set).
    robust_ece = _safe_float(robust_status.get("ece"))
    main_ece = _safe_float(test_status.get("ece"))

    human_review_status = (gold_meta or {}).get("review_status") or "pending_human_review"
    approved_n = 0
    if human_path.exists():
        approved_n = sum(
            1
            for c in load_cases(human_path)
            if (c.review_status or "").lower() in {"approved", "approve"}
        )
    human_metrics_available = bool(
        gold_eval and not gold_eval.get("pending") and (gold_eval.get("n") or 0) > 0
    )

    cm = test_status.get("confusion_matrix") or {}
    feature_rows = None
    if importance and importance.get("available"):
        feature_rows = (importance.get("status") or {}).get("features")

    top_feature_rows = sorted(feature_rows or [], key=lambda row: _safe_float(row.get("importance")) or 0, reverse=True)
    feature_warnings = []
    if top_feature_rows and (_safe_float(top_feature_rows[0].get("importance")) or 0) >= 0.5:
        feature_warnings.append({
            "kind": "feature_dominance",
            "severity": "review",
            "feature": top_feature_rows[0].get("feature"),
            "importance": _safe_float(top_feature_rows[0].get("importance")),
            "finding": "Measured feature importance is concentrated in this feature; feature importance is a model-behavior signal, not proof of causation.",
        })
    for phrase, finding in (shortcut_qc.get("suspicious_phrases") or {}).items():
        feature_warnings.append({
            "kind": "shortcut_qc",
            "severity": "review",
            "feature": phrase,
            "importance": _safe_float(finding.get("phi_vs_non_compliant")),
            "presence_rate": _safe_float(finding.get("presence_rate")),
            "finding": "Automated shortcut QC flagged a lexical association with the target label; this is a QC warning, not proof of leakage.",
        })

    disagreement = (compare or {}).get("risk_disagreement") or {}

    return {
        "available": bool(test_ev or model_dir),
        "architecture_note": (
            "Finace uses regulatory documents as the source of truth. "
            "The ML model provides an independent validation signal for compliance status and risk. "
            "It does not override regulatory evidence, deterministic rules, RAG, or Gemini reasoning."
        ),
        "overview": {
            "current_model": _model_display_name(meta),
            "model_type": (meta or {}).get("status_model"),
            "model_evaluated_at": (test_ev or {}).get("evaluated_at") or (test_ev or {}).get("created_at"),
            "evaluation_artifact_updated_at": artifact_updated_at,
            "model_trained_at": current_model_version,
            "dataset_version": "Current Model evaluation",
            "regulatory_requirement_count": _count_used_requirements(),
            "compliance_scenarios": n_scenarios,
            "main_test_accuracy": main_acc,
            "main_test_accuracy_display": _pct(main_acc),
            "test_macro_f1": _safe_float(test_status.get("macro_f1")),
            "test_macro_f1_display": _pct(_safe_float(test_status.get("macro_f1"))),
            "test_weighted_f1": _safe_float(test_status.get("weighted_f1")),
            "test_weighted_f1_display": _pct(_safe_float(test_status.get("weighted_f1"))),
            "test_precision": _safe_float((test_status.get("classification_report") or {}).get("macro avg", {}).get("precision")),
            "test_recall": _safe_float((test_status.get("classification_report") or {}).get("macro avg", {}).get("recall")),
            "test_ece": main_ece,
            "test_brier_score": _safe_float(test_status.get("brier_score")),
            "unseen_requirement_accuracy": unseen_acc,
            "unseen_requirement_accuracy_display": _pct(unseen_acc),
            "unseen_requirement_macro_f1": _safe_float(unseen_status.get("macro_f1")),
            "unseen_requirement_macro_f1_display": _pct(_safe_float(unseen_status.get("macro_f1"))),
            "robustness_accuracy": robust_acc,
            "robustness_accuracy_display": _pct(robust_acc),
            "adversarial_accuracy": robust_acc,
            "adversarial_accuracy_display": _pct(robust_acc),
            "adversarial_macro_f1": _safe_float(robust_status.get("macro_f1")),
            "adversarial_macro_f1_display": _pct(_safe_float(robust_status.get("macro_f1"))),
            "adversarial_ece": robust_ece,
            "adversarial_brier_score": _safe_float(robust_status.get("brier_score")),
            "human_validation_cases": n_human,
            "robustness_cases": n_robust,
        },
        "performance": {
            "metrics": [
                {
                    "key": "main_test_accuracy",
                    "label": "Main Test Accuracy",
                    "value": main_acc,
                    "display": _pct(main_acc),
                    "explanation": (
                        "Share of held-out test cases where the model predicted the expected "
                        "compliance status correctly."
                    ),
                },
                {
                    "key": "unseen_requirement_accuracy",
                    "label": "Unseen Requirement Accuracy",
                    "value": unseen_acc,
                    "display": _pct(unseen_acc),
                    "explanation": (
                        "Accuracy on requirements held out from training, measuring generalization "
                        "beyond scenarios tied to trained requirements."
                    ),
                },
                {
                    "key": "robustness_accuracy",
                    "label": "Robustness Test Accuracy",
                    "value": robust_acc,
                    "display": _pct(robust_acc),
                    "explanation": (
                        "Accuracy on deliberately difficult cases designed to reduce simple "
                        "keyword-based shortcuts."
                    ),
                },
                {
                    "key": "calibration_error",
                    "label": "Calibration Error",
                    "value": robust_ece,
                    "display": None if robust_ece is None else f"{robust_ece:.3f}",
                    "explanation": (
                        "Expected Calibration Error (ECE) on the robustness test set. "
                        "Lower values mean predicted confidence better matches correctness."
                    ),
                    "source": "robustness_set",
                },
                {
                    "key": "main_test_calibration_error",
                    "label": "Main Test Calibration Error",
                    "value": main_ece,
                    "display": None if main_ece is None else f"{main_ece:.3f}",
                    "explanation": "ECE measured on the main held-out test set.",
                    "source": "main_test",
                },
            ],
            "confusion_matrix": cm,
            "test_status": test_status,
            "unseen_status": unseen_status,
            "adversarial_status": robust_status,
            "per_domain_status_accuracy": (test_ev or {}).get("per_domain_status_accuracy"),
            "per_risk_status_accuracy": (test_ev or {}).get("per_risk_status_accuracy"),
            "n_test": (test_ev or {}).get("n"),
            "feature_importance": feature_rows,
            "feature_importance_notes": (importance or {}).get("notes") or [
                "Feature importance explains the ML validation model only — not regulatory evidence."
            ],
        },
        "robustness": {
            "n_cases": n_robust,
            "accuracy": robust_acc,
            "accuracy_display": _pct(robust_acc),
            "macro_f1": _safe_float(robust_status.get("macro_f1")),
            "macro_f1_display": _pct(_safe_float(robust_status.get("macro_f1"))),
            "ece": robust_ece,
            "brier_score": _safe_float(robust_status.get("brier_score")),
            "feature_warnings": feature_warnings,
            "calibration_error": robust_ece,
            "explanation": (
                "The model was additionally evaluated on difficult compliance scenarios containing "
                "indirect violations, paraphrased descriptions, partial compliance, realistic workflows, "
                "hard negatives, and cases where obvious compliance keywords may be absent or misleading."
            ),
        },
        "ml_vs_finace": {
            "n_compared": (compare or {}).get("n_compared"),
            "ml_vs_rules_risk_agreement": _safe_float(
                (compare or {}).get("ml_vs_rules_risk_agreement")
            ),
            "ml_vs_ground_truth_status_agreement": _safe_float(
                (compare or {}).get("ml_vs_ground_truth_status_agreement")
            ),
            "risk_disagreement": {
                "n_disagree": disagreement.get("n_disagree"),
                "rate": _safe_float(disagreement.get("rate")),
                "agreement_rate": _safe_float((compare or {}).get("ml_vs_rules_risk_agreement")),
                "review_required_count": (disagreement.get("categories") or {}).get("ambiguous_needs_review"),
                "pairs": disagreement.get("pairs") or {},
                "categories": disagreement.get("categories") or {},
                "interpretation": disagreement.get("interpretation") or [],
            },
            "note": (
                "A disagreement does not automatically mean that either system is wrong. "
                "It identifies a case that may require further examination against the regulatory evidence."
            ),
        },
        "human_validation": {
            "n_cases": n_human,
            "review_status": human_review_status,
            "approved_count": approved_n,
            "pending_count": max(0, int(n_human or 0) - approved_n),
            "pending": approved_n == 0,
            "metrics_available": human_metrics_available,
            "metrics": (
                {
                    "status_accuracy": _safe_float(
                        (gold_eval or {}).get("status", {}).get("accuracy")
                    ),
                    "n": (gold_eval or {}).get("n"),
                }
                if human_metrics_available
                else None
            ),
            "note": (
                "These cases are reserved for independent human/mentor review and are not used "
                "for model training. Accuracy is shown only after cases are approved."
            ),
        },
        "pipeline_steps": [
            {
                "title": "Regulatory Documents",
                "description": "Actual regulatory sources used as the foundation.",
            },
            {
                "title": "Compliance Requirements",
                "description": "Relevant compliance requirements are extracted from the regulatory corpus.",
            },
            {
                "title": "Scenario Dataset",
                "description": "Realistic compliance scenarios are generated from those requirements.",
            },
            {
                "title": "Quality Control",
                "description": "Automated checks reduce lexical shortcuts and near-duplicate leakage.",
            },
            {
                "title": "ML Model",
                "description": f"{_model_display_name(meta)} independently predicts compliance status.",
            },
            {
                "title": "Compliance Prediction",
                "description": "The model outputs compliance status, risk, and confidence scores.",
            },
            {
                "title": "Compare Against Finace",
                "description": "ML predictions are compared with expected outcomes and Finace assessments.",
            },
        ],
    }


def _count_used_requirements() -> int | None:
    path = DATASET_DIR / f"{_CURRENT_DATASET}.jsonl"
    if not path.exists():
        return None
    return len({c.requirement_id for c in load_cases(path) if c.requirement_id})


def list_requirements(*, query: str = "", domain: str = "", offset: int = 0, limit: int = 25) -> dict[str, Any]:
    """Return traceable requirement records represented in the current evaluation dataset."""
    limit = max(1, min(int(limit), 100))
    offset = max(0, int(offset))
    query = query.strip().casefold()[:200]
    domain = domain.strip().casefold()[:80]
    dataset_path = DATASET_DIR / f"{_CURRENT_DATASET}.jsonl"
    used: dict[str, dict[str, Any]] = {}
    if dataset_path.exists():
        for case in load_cases(dataset_path):
            rid = case.requirement_id
            if not rid:
                continue
            entry = used.setdefault(rid, {"scenario_count": 0, "expected_outcomes": set()})
            entry["scenario_count"] += 1
            if case.expected_status:
                entry["expected_outcomes"].add(case.expected_status)
    if not BANK_JSONL.exists():
        return {"available": False, "total": 0, "offset": offset, "limit": limit, "requirements": []}
    rows = []
    with BANK_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            try:
                item = json.loads(line)
            except (json.JSONDecodeError, TypeError):
                continue
            rid = item.get("requirement_id")
            if rid not in used or not item.get("source_chunk_id"):
                continue
            if domain and domain not in str(item.get("domain") or "").casefold():
                continue
            haystack = " ".join(str(item.get(k) or "") for k in ("requirement_id", "domain", "regulator", "document_title", "section", "requirement", "source_chunk_id")).casefold()
            if query and query not in haystack:
                continue
            rows.append({
                "requirement_id": rid, "domain": item.get("domain"), "authority": item.get("regulator"),
                "document_title": item.get("document_title"), "section": item.get("section"),
                "page": item.get("page") or item.get("page_number"),
                "requirement_text": item.get("requirement"), "source_chunk_id": item.get("source_chunk_id"),
                "scenario_count": used[rid]["scenario_count"],
                "expected_outcomes": sorted(used[rid]["expected_outcomes"]),
                "review_status": item.get("review_status"),
            })
    rows.sort(key=lambda r: r["requirement_id"])
    return {"available": True, "total": len(rows), "offset": offset, "limit": limit, "requirements": rows[offset:offset + limit]}


def list_cases(
    set_name: str,
    *,
    limit: int = 20,
    offset: int = 0,
    predict: bool = True,
) -> dict[str, Any]:
    """
    List cases from robustness, human, or comparison sample sets.

    set_name: robustness | human | comparison
    """
    limit = max(1, min(int(limit), 50))
    offset = max(0, int(offset))

    if set_name == "comparison":
        compare = _load_json(REPORTS_DIR / f"{_COMPARE_STEM}.json") or {}
        samples = ((compare.get("risk_disagreement") or {}).get("samples")) or []
        dataset_path = DATASET_DIR / f"{_CURRENT_DATASET}.jsonl"
        by_id: dict[str, ComplianceCase] = {}
        if dataset_path.exists():
            by_id = {c.case_id: c for c in load_cases(dataset_path)}

        page = samples[offset : offset + limit]
        rows: list[dict[str, Any]] = []
        for s in page:
            cid = s.get("case_id")
            c = by_id.get(cid) if cid else None
            agreement = (
                "agreement"
                if s.get("ml_risk") and s.get("ml_risk") == s.get("rule_risk")
                else "disagreement"
            )
            if c and predict:
                row = _with_prediction(c)
            elif c:
                row = _case_public(c)
                row["ml_prediction"] = {
                    "available": s.get("ml_status") is not None,
                    "compliance_status": s.get("ml_status"),
                    "risk_category": s.get("ml_risk"),
                }
            else:
                row = {
                    "case_id": cid,
                    "domain": s.get("domain"),
                    "scenario_type": s.get("scenario_type"),
                    "requirement_id": s.get("requirement_id"),
                    "expected_status": s.get("expected_status"),
                    "expected_risk": s.get("expected_risk"),
                    "ml_prediction": {
                        "available": s.get("ml_status") is not None,
                        "compliance_status": s.get("ml_status"),
                        "risk_category": s.get("ml_risk"),
                    },
                }
            row["finace_rules"] = {
                "risk_level": s.get("rule_risk"),
                "triggered_rules": s.get("triggered_rules") or [],
            }
            row["disagreement"] = {
                "pair": s.get("pair"),
                "category": s.get("category"),
                "note": s.get("note"),
            }
            row["agreement"] = agreement
            rows.append(row)
        return {
            "set": "comparison",
            "total": len(samples),
            "offset": offset,
            "limit": limit,
            "cases": rows,
        }

    stem = _ROBUSTNESS_SET if set_name == "robustness" else _HUMAN_SET if set_name == "human" else None
    if stem is None:
        return {"error": "unknown_set", "set": set_name, "cases": [], "total": 0}

    path = DATASET_DIR / f"{stem}.jsonl"
    if not path.exists():
        return {"set": set_name, "total": 0, "offset": offset, "limit": limit, "cases": [], "available": False}

    all_cases = load_cases(path)
    page_cases = all_cases[offset : offset + limit]
    rows = []
    for c in page_cases:
        if predict and set_name == "robustness":
            rows.append(_with_prediction(c))
        elif predict and set_name == "human":
            # Show ML prediction for examiner context; never invent reviewer outcomes.
            row = _with_prediction(c)
            row["reviewer_decision"] = c.review_status
            row["reviewer_notes"] = getattr(c, "review_notes", "") or ""
            rows.append(row)
        else:
            rows.append(_case_public(c))

    return {
        "set": set_name,
        "total": len(all_cases),
        "offset": offset,
        "limit": limit,
        "cases": rows,
        "available": True,
    }


def get_case_detail(case_id: str) -> dict[str, Any] | None:
    """Lookup a case across current / robustness / human sets and attach ML prediction."""
    stems = [_CURRENT_DATASET, _ROBUSTNESS_SET, _HUMAN_SET]
    found: ComplianceCase | None = None
    source_set = None
    for stem in stems:
        path = DATASET_DIR / f"{stem}.jsonl"
        if not path.exists():
            continue
        for c in load_cases(path):
            if c.case_id == case_id:
                found = c
                source_set = (
                    "main"
                    if stem == _CURRENT_DATASET
                    else "robustness"
                    if stem == _ROBUSTNESS_SET
                    else "human"
                )
                break
        if found:
            break
    if not found:
        return None

    row = _with_prediction(found, include_explanation=False)
    row["set"] = source_set
    row["layers"] = {
        "regulatory_evidence": {
            "regulatory_document": found.regulatory_document,
            "regulatory_section": found.regulatory_section,
            "source_chunk_id": found.source_chunk_id,
            "compliance_requirement": found.compliance_requirement,
            "evidence": found.evidence,
            "expected_status": found.expected_status,
            "expected_risk": found.expected_risk,
        },
        "ml_prediction": row.get("ml_prediction"),
    }
    return row
