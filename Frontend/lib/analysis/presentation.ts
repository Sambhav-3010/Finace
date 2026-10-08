/** Pure presentation helpers — no fabricated backend values. */

export type AgreementStatus = "agreement" | "disagreement" | "unavailable";

export function normalizeRisk(value?: string | null): string {
  return String(value || "").trim().toUpperCase();
}

export function normalizeStatus(value?: string | null): string {
  return String(value || "").trim().toUpperCase();
}

export function finaceHeadline(riskLevel?: string | null, score?: number | null): string {
  const risk = normalizeRisk(riskLevel);
  if (risk === "HIGH") return "HIGH RISK / POTENTIAL NON-COMPLIANCE";
  if (risk === "MEDIUM") return "MEDIUM RISK / PARTIAL EXPOSURE";
  if (risk === "LOW") return "LOW RISK";
  if (typeof score === "number") {
    if (score < 50) return "ELEVATED COMPLIANCE EXPOSURE";
    if (score < 75) return "MODERATE COMPLIANCE EXPOSURE";
    return "COMPLIANCE ASSESSMENT AVAILABLE";
  }
  return "COMPLIANCE ASSESSMENT";
}

/**
 * Compare Finace risk with independent ML validation.
 * Disagreement is shown only when available values clearly conflict.
 */
export function mlFinaceAgreement(
  finaceRisk?: string | null,
  ml?: {
    available?: boolean;
    compliance_status?: string;
    risk_category?: string;
  } | null
): AgreementStatus {
  if (!ml || ml.available === false || !ml.compliance_status) return "unavailable";
  const fr = normalizeRisk(finaceRisk);
  const mr = normalizeRisk(ml.risk_category);
  const ms = normalizeStatus(ml.compliance_status);

  const riskMismatch = Boolean(fr && mr && fr !== mr);
  const statusConflict =
    (fr === "HIGH" && (ms === "COMPLIANT" || mr === "LOW")) ||
    (fr === "LOW" && (ms === "NON_COMPLIANT" || mr === "HIGH")) ||
    (fr === "MEDIUM" && ms === "COMPLIANT" && mr === "LOW");

  if (riskMismatch || statusConflict) return "disagreement";
  return "agreement";
}

export function mlConfidence(
  ml?: {
    compliance_status?: string;
    status_probabilities?: Record<string, number>;
  } | null
): number | null {
  const status = ml?.compliance_status;
  const probs = ml?.status_probabilities || {};
  if (!status || probs[status] == null) return null;
  const n = Number(probs[status]);
  return Number.isFinite(n) ? n : null;
}

export function formatConfidence(value: number | null): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function evidenceLabel(status?: string): string {
  if (status === "SUPPORTED_IN_RETRIEVED_CONTEXT") return "Supported in retrieved context";
  if (status === "INSUFFICIENT_DIRECT_EVIDENCE") return "Insufficient direct evidence";
  return status ? status.replace(/_/g, " ") : "Not provided";
}

export function applicabilityLabel(value?: string): string {
  if (value === "REQUIRES_ENTITY_SPECIFIC_VALIDATION") return "Validate entity-specific";
  if (value === "NOT_ESTABLISHED") return "Not established";
  return value ? value.replace(/_/g, " ") : "Not provided";
}

export function domainDisplayName(domain?: string): string {
  const map: Record<string, string> = {
    vda_aml: "VDA / crypto AML",
    cross_border_fx: "FEMA / foreign exchange",
    grievance: "Grievance redressal",
    kyc_aml_controls: "KYC / AML controls",
  };
  if (!domain) return "Domain";
  return map[domain] || domain.replace(/_/g, " ");
}

export function meaningfulImpact(value?: number | null): boolean {
  if (value == null || Number.isNaN(Number(value))) return false;
  return Math.abs(Number(value)) >= 0.00005;
}
