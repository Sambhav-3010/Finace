"use client";

import { CheckCircle2 } from "lucide-react";
import { applicabilityLabel, evidenceLabel } from "@/lib/analysis/presentation";

type Assessment = {
  name?: string;
  risk_level?: string;
  recommendation?: string;
  evidence_status?: string;
  applicability?: string;
  triggered?: boolean;
};

/**
 * Shows remediation using backend recommendations and, when available,
 * pairs them with rule assessment evidence/applicability fields.
 */
export function RemediationPanel({
  recommendations,
  assessments,
}: {
  recommendations?: string[];
  assessments?: Assessment[];
}) {
  const recs = (recommendations || []).filter(Boolean);
  if (!recs.length) return null;

  const triggered = (assessments || []).filter((a) => a.triggered);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0c1211] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            Remediation
          </p>
          <p className="text-[11px] text-white/35">
            Recommended actions based on the assessment. Where applicability is not established,
            treat these as controls to validate for the entity — not absolute legal conclusions.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {recs.map((rec, i) => {
          const match = triggered[i] || triggered.find((a) =>
            (a.name || "").toLowerCase().split(/\s+/).some((token) => token.length > 3 && rec.toLowerCase().includes(token))
          );
          return (
            <li key={`${i}-${rec.slice(0, 24)}`} className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
              <p className="text-sm text-white/80 leading-6">{rec}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] uppercase tracking-wider">
                {match?.name ? (
                  <span className="rounded border border-white/10 px-2 py-1 text-white/45">
                    Control: {match.name}
                  </span>
                ) : null}
                {match?.risk_level ? (
                  <span className="rounded border border-white/10 px-2 py-1 text-white/45">
                    Risk: {match.risk_level}
                  </span>
                ) : null}
                {match?.evidence_status ? (
                  <span className="rounded border border-white/10 px-2 py-1 text-white/45">
                    Evidence: {evidenceLabel(match.evidence_status)}
                  </span>
                ) : null}
                {match?.applicability ? (
                  <span className="rounded border border-amber-300/20 px-2 py-1 text-amber-200/70">
                    Applicability: {applicabilityLabel(match.applicability)}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
