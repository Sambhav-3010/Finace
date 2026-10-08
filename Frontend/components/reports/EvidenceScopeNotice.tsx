"use client";

import { Info } from "lucide-react";

/**
 * Compact Evidence & Applicability card.
 * Important for regulatory accuracy — kept visible, but no longer a full-width blocker.
 */
export function EvidenceScopeNotice({ scope }: { scope?: any }) {
  if (!scope) return null;
  const warnings: string[] = scope.warnings || [];
  const unresolved: string[] = scope.unresolved_domains || [];
  if (!warnings.length && !unresolved.length) return null;

  return (
    <div className="rounded-xl border border-amber-300/25 bg-amber-400/[0.08] px-3.5 py-3">
      <div className="flex items-start gap-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/90">
            Evidence & Applicability
          </p>
          <p className="mt-1.5 text-[12px] leading-5 text-amber-50/75">
            Some workflow domains may not have directly applicable evidence in the indexed corpus.
            Findings in these areas are potential exposure assessments and require validation against
            the regulatory framework applicable to the entity.
          </p>
          {unresolved.length > 0 && (
            <p className="mt-1.5 text-[11px] text-amber-100/55">
              Domains needing validation: {unresolved.join(", ").replace(/_/g, " ")}
            </p>
          )}
          {warnings.slice(0, 2).map((warning) => (
            <p key={warning} className="mt-1 text-[11px] leading-5 text-amber-100/50">
              {warning}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
