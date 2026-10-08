"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BrainCircuit, ArrowUpRight, Scale } from "lucide-react";
import {
  finaceHeadline,
  formatConfidence,
  mlConfidence,
  mlFinaceAgreement,
  normalizeRisk,
  normalizeStatus,
} from "@/lib/analysis/presentation";

const ML_VALIDATION_HREF = "/dashboard/ml-validation" as Route;

type MlValidationPayload = {
  available?: boolean;
  compliance_status?: string;
  risk_category?: string;
  status_probabilities?: Record<string, number>;
  notes?: string[];
  features?: Record<string, number>;
  explanation?: {
    top_features?: Array<{ feature?: string; contribution?: number; label?: string }>;
    features?: Array<{ feature?: string; shap_value?: number; label?: string }>;
  };
};

function statusTone(status?: string) {
  const s = normalizeStatus(status);
  if (s === "NON_COMPLIANT") return "text-rose-300 border-rose-400/30 bg-rose-500/10";
  if (s === "PARTIAL") return "text-amber-300 border-amber-400/30 bg-amber-500/10";
  if (s === "COMPLIANT") return "text-emerald-300 border-emerald-400/30 bg-emerald-500/10";
  return "text-white/70 border-white/15 bg-white/5";
}

export function MLValidationCard({
  mlValidation,
  finaceRiskLevel,
  riskFlags,
  ruleAssessments,
  compact = false,
}: {
  mlValidation?: MlValidationPayload | null;
  finaceRiskLevel?: string;
  riskFlags?: string[];
  ruleAssessments?: Array<{ name?: string; triggered?: boolean; risk_level?: string }>;
  compact?: boolean;
}) {
  if (!mlValidation || mlValidation.available === false || !mlValidation.compliance_status) {
    return null;
  }

  const confidence = mlConfidence(mlValidation);
  const agreement = mlFinaceAgreement(finaceRiskLevel, mlValidation);
  const triggered = (ruleAssessments || []).filter((r) => r.triggered);
  const featureRows =
    mlValidation.explanation?.features ||
    mlValidation.explanation?.top_features ||
    [];
  const featureEntries =
    featureRows.length > 0
      ? featureRows.slice(0, 6).map((f) => ({
          label: f.label || f.feature || "feature",
          value: Number((f as any).shap_value ?? (f as any).contribution ?? 0),
        }))
      : Object.entries(mlValidation.features || {})
          .filter(([, v]) => Number(v) !== 0)
          .sort((a, b) => Math.abs(Number(b[1])) - Math.abs(Number(a[1])))
          .slice(0, 6)
          .map(([k, v]) => ({ label: k.replace(/_/g, " "), value: Number(v) }));

  return (
    <div className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.05] p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10">
            <BrainCircuit className="h-4 w-4 text-sky-300" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/80">
              Independent ML Validation
            </p>
            <p className="text-[11px] text-white/40 leading-5">
              Independent validation signal. Does not override Finace assessment or regulatory
              evidence.
            </p>
          </div>
        </div>
        <Link
          href={ML_VALIDATION_HREF}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-400/25 bg-sky-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-sky-200 hover:bg-sky-500/20 transition"
        >
          View ML Analysis
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className={`grid gap-2 ${compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3"}`}>
        <Metric
          label="ML Prediction"
          value={
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusTone(mlValidation.compliance_status)}`}>
              {normalizeStatus(mlValidation.compliance_status).replace(/_/g, " ")}
            </span>
          }
        />
        <Metric label="ML Risk" value={normalizeRisk(mlValidation.risk_category) || "—"} />
        <Metric label="Confidence" value={formatConfidence(confidence)} />
      </div>

      {agreement !== "unavailable" && (
        <div
          className={`rounded-xl border p-3.5 space-y-3 ${
            agreement === "disagreement"
              ? "border-amber-400/30 bg-amber-500/[0.08]"
              : "border-emerald-400/25 bg-emerald-500/[0.06]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Scale className="h-3.5 w-3.5 text-white/50" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
              {agreement === "disagreement" ? "ML / Finace Disagreement" : "ML / Finace Agreement"}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-white/35">Finace Assessment</p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {finaceHeadline(finaceRiskLevel)}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-white/35">ML Validation</p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {normalizeStatus(mlValidation.compliance_status).replace(/_/g, " ")} /{" "}
                {normalizeRisk(mlValidation.risk_category) || "—"} RISK
              </p>
            </div>
          </div>

          {agreement === "disagreement" ? (
            <>
              <div className="inline-flex rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-100">
                Review Required
              </div>
              <p className="text-[12px] leading-5 text-white/55">
                An ML/Finace disagreement does not automatically indicate that either component is
                incorrect. The case should be reviewed against the underlying regulatory evidence.
              </p>
            </>
          ) : (
            <p className="text-[12px] leading-5 text-white/55">
              The independent ML signal is consistent with the Finace assessment on the available
              risk/status fields.
            </p>
          )}
        </div>
      )}

      {agreement === "disagreement" && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Why is there a disagreement?
          </p>
          <p className="text-[11px] text-white/35">
            Showing signals already returned by the backend. This is not a legal conclusion about why
            the model predicted a given class.
          </p>

          {(riskFlags?.length || triggered.length) > 0 && (
            <SignalBlock
              title="Workflow signals detected"
              items={
                riskFlags?.length
                  ? riskFlags.slice(0, 8)
                  : triggered.map((t) => t.name || "Triggered control").slice(0, 8)
              }
            />
          )}

          <SignalBlock
            title="Finace signals"
            items={[
              triggered.length
                ? `${triggered.length} deterministic rule(s) triggered`
                : "Deterministic rules evaluated",
              "Retrieved regulatory evidence considered in assessment",
              finaceRiskLevel ? `Workflow risk level: ${normalizeRisk(finaceRiskLevel)}` : null,
            ].filter(Boolean) as string[]}
          />

          <SignalBlock
            title="ML signal"
            items={[
              `ML predicted ${normalizeStatus(mlValidation.compliance_status).replace(/_/g, " ")}`,
              `Confidence: ${formatConfidence(confidence)}`,
              mlValidation.risk_category
                ? `ML risk: ${normalizeRisk(mlValidation.risk_category)}`
                : null,
            ].filter(Boolean) as string[]}
          />

          {featureEntries.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                ML model features contributing to this prediction
              </p>
              <ul className="mt-1.5 space-y-1">
                {featureEntries.map((f) => (
                  <li key={f.label} className="flex justify-between gap-3 text-[11px] text-white/55">
                    <span>{f.label}</span>
                    <span className="font-mono text-white/35">{f.value.toFixed(3)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[10px] text-white/30">
                Feature values describe model input/behavior, not regulatory proof.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-white/35">{label}</p>
      <div className="mt-1 text-sm font-medium text-white/85">{value}</div>
    </div>
  );
}

function SignalBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-white/40">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((item) => (
          <li key={item} className="text-[12px] text-white/65 leading-5">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
