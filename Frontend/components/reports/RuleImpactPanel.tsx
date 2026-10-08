"use client";

import {
  applicabilityLabel,
  evidenceLabel,
  meaningfulImpact,
  normalizeRisk,
} from "@/lib/analysis/presentation";

type Assessment = {
  rule_id?: string;
  name?: string;
  risk_level?: string;
  triggered?: boolean;
  status?: string;
  impact_rank?: number;
  impact_value?: number;
  impact_units?: string;
  impact_basis?: string;
  evidence_status?: string;
  applicability?: string;
};

function tone(level?: string) {
  const r = normalizeRisk(level);
  if (r === "HIGH") return "text-rose-300 border-rose-400/25 bg-rose-500/10";
  if (r === "MEDIUM") return "text-amber-300 border-amber-400/25 bg-amber-500/10";
  return "text-emerald-300 border-emerald-400/25 bg-emerald-500/10";
}

export function RuleImpactPanel({ assessments }: { assessments?: Assessment[] }) {
  const rows = (assessments || []).filter((row) => row.status !== "not_applicable");
  if (!rows.length) return null;

  return (
    <section className="rounded-[1.4rem] border border-white/10 bg-[#0c1211] p-5">
      <div className="border-b border-white/10 pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Detected Compliance Controls
        </p>
        <p className="mt-1 text-xs leading-5 text-white/45">
          Deterministic rules evaluated for this workflow. Separate from ML validation and from
          surrogate model explanations.
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">Deterministic Rules</p>
      </div>

      <ol className="mt-4 space-y-3">
        {rows.map((row, index) => {
          const impact = Number(row.impact_value || 0);
          const showImpact = meaningfulImpact(impact);
          return (
            <li
              key={row.rule_id || row.name || index}
              className="rounded-xl border border-white/8 bg-white/[0.025] p-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    <span className="mr-2 text-white/35">{index + 1}.</span>
                    {row.name || row.rule_id}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-5 text-white/50">
                    {row.triggered
                      ? "Deterministic compliance pattern detected."
                      : "Applicable pattern evaluated; not triggered for this workflow."}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={`rounded border px-2 py-1 text-[10px] font-semibold uppercase ${tone(
                      row.risk_level
                    )}`}
                  >
                    {row.risk_level || "—"}
                  </span>
                  <span
                    className={`rounded border px-2 py-1 text-[10px] font-semibold uppercase ${
                      row.triggered
                        ? "border-rose-400/25 bg-rose-500/10 text-rose-300"
                        : "border-white/10 text-white/45"
                    }`}
                  >
                    {row.triggered ? "Triggered" : "Not triggered"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] uppercase tracking-wider">
                <span className="rounded border border-white/10 px-2 py-1 text-white/45">
                  Evidence: {evidenceLabel(row.evidence_status)}
                </span>
                <span className="rounded border border-amber-300/20 px-2 py-1 text-amber-200/70">
                  Applicability: {applicabilityLabel(row.applicability)}
                </span>
              </div>

              {showImpact && (
                <p
                  className="mt-2 text-[11px] text-white/40"
                  title={`Numeric contribution in ${row.impact_units || "model units"}. Not a legal weight.`}
                >
                  Model-linked contribution: {impact >= 0 ? "+" : ""}
                  {impact.toFixed(4)}
                  {row.impact_units ? ` (${row.impact_units})` : ""}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
