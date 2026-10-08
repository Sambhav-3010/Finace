"use client";

import { ShieldCheck } from "lucide-react";
import { finaceHeadline, normalizeRisk } from "@/lib/analysis/presentation";

function riskTone(risk?: string) {
  const r = normalizeRisk(risk);
  if (r === "HIGH") return "border-rose-400/35 bg-rose-500/15 text-rose-200";
  if (r === "MEDIUM") return "border-amber-400/35 bg-amber-500/15 text-amber-100";
  if (r === "LOW") return "border-emerald-400/35 bg-emerald-500/15 text-emerald-100";
  return "border-white/15 bg-white/5 text-white/80";
}

type Finding = {
  label: string;
  risk?: string;
  detail?: string;
};

export function FinaceAssessmentCard({
  riskLevel,
  complianceScore,
  findings,
  riskFlags,
}: {
  riskLevel?: string;
  complianceScore?: number;
  findings?: Finding[];
  riskFlags?: string[];
}) {
  const headline = finaceHeadline(riskLevel, complianceScore);
  const rows: Finding[] =
    findings && findings.length > 0
      ? findings
      : (riskFlags || []).slice(0, 8).map((flag) => ({
          label: flag,
          risk: riskLevel,
        }));

  return (
    <section className="rounded-2xl border border-accent/25 bg-accent/[0.07] p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/15">
          <ShieldCheck className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent/90">
            Finace Compliance Assessment
          </p>
          <p className="mt-1 text-[11px] text-white/40">
            Primary result · Regulatory documents remain the source of truth
          </p>
        </div>
        {typeof complianceScore === "number" && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-white/35">Score</p>
            <p className="text-lg font-semibold text-white">{complianceScore}/100</p>
          </div>
        )}
      </div>

      <div className={`rounded-xl border px-4 py-3 ${riskTone(riskLevel)}`}>
        <p className="text-[10px] uppercase tracking-[0.16em] opacity-70">Overall</p>
        <p className="mt-1 text-base sm:text-lg font-semibold tracking-tight">{headline}</p>
        {riskLevel ? (
          <p className="mt-1 text-[12px] opacity-80">Finace risk level: {normalizeRisk(riskLevel)}</p>
        ) : null}
      </div>

      {rows.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Key Risk Findings
          </p>
          <div className="mt-2 space-y-1.5">
            {rows.map((row, i) => (
              <div
                key={`${row.label}-${i}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/85">{row.label}</p>
                  {row.detail ? (
                    <p className="mt-0.5 text-[11px] text-white/40">{row.detail}</p>
                  ) : null}
                </div>
                {row.risk ? (
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${riskTone(
                      row.risk
                    )}`}
                  >
                    {normalizeRisk(row.risk)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
