"use client";

import { ExternalLink, FileText, AlertTriangle } from "lucide-react";
import { isPdfSourcePath, resolvePublicDocUrl } from "@/lib/docs/publicDocUrl";
import { sourceLabel } from "@/lib/workflow/sourceUtils";
import { domainDisplayName } from "@/lib/analysis/presentation";

type SourceLike = {
  document_id?: string;
  title?: string;
  section?: string;
  text?: string;
  content?: string;
  relative_path?: string;
  source_file?: string;
  source?: string;
  file_path?: string;
  basis?: string;
  applicability_note?: string;
  evidence_scope?: {
    basis?: string;
    applicability_note?: string;
  };
};

export function RegulatoryEvidencePanel({
  sources,
  evidenceScope,
  compact = false,
}: {
  sources?: SourceLike[];
  evidenceScope?: {
    unresolved_domains?: string[];
    warnings?: string[];
    direct_evidence_domains?: string[];
    method_note?: string;
  } | null;
  compact?: boolean;
}) {
  const items = sources || [];
  const found = items.filter((s) => {
    const basis = s.basis || s.evidence_scope?.basis;
    return basis !== "mismatched_sector" && (s.text || s.content || s.section || s.document_id);
  });
  const unresolved = evidenceScope?.unresolved_domains || [];
  const warnings = evidenceScope?.warnings || [];

  if (!found.length && !unresolved.length && !warnings.length) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0c1211] p-4 sm:p-5 space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-200/80">
          Regulatory Evidence
        </p>
        <p className="mt-1 text-[12px] text-white/45">
          Regulatory documents are the source of truth.
        </p>
      </div>

      {found.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300/80">
            Evidence Found
          </p>
          <ul className={`mt-2 space-y-2 ${compact ? "max-h-64 overflow-y-auto" : ""}`} style={{ scrollbarWidth: "thin" }}>
            {found.slice(0, compact ? 5 : 12).map((source, i) => {
              const relPath =
                source.relative_path ||
                source.source_file ||
                source.source ||
                source.file_path ||
                "";
              const docUrl = isPdfSourcePath(relPath) ? resolvePublicDocUrl(relPath) : null;
              const name = sourceLabel(source);
              const note = source.applicability_note || source.evidence_scope?.applicability_note;
              const excerpt = (source.text || source.content || "").toString().trim();

              return (
                <li key={`${name}-${i}`} className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.05] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {docUrl ? (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{name}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                        </a>
                      ) : (
                        <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/80">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-white/40" />
                          <span className="truncate">{name}</span>
                        </p>
                      )}
                      {source.section ? (
                        <p className="mt-1 text-[11px] text-white/45">Section / clause: {source.section}</p>
                      ) : null}
                      {source.document_id ? (
                        <p className="mt-0.5 text-[10px] font-mono text-white/30">
                          Source: {source.document_id}
                        </p>
                      ) : null}
                    </div>
                    {source.basis || source.evidence_scope?.basis ? (
                      <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/40">
                        {(source.basis || source.evidence_scope?.basis || "").replace(/_/g, " ")}
                      </span>
                    ) : null}
                  </div>
                  {excerpt ? (
                    <p className="mt-2 text-[12px] leading-5 text-white/60 line-clamp-3">
                      {excerpt}
                    </p>
                  ) : null}
                  {note ? <p className="mt-2 text-[11px] text-white/40">{note}</p> : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(unresolved.length > 0 || warnings.length > 0) && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200/80">
            Evidence Gap / Applicability Requires Validation
          </p>
          <p className="mt-2 text-[12px] leading-5 text-white/50">
            Directly applicable evidence was not established in the retrieved corpus. Further
            entity-specific regulatory validation is required. An evidence gap is not proof that a
            violation exists.
          </p>
          <ul className="mt-2 space-y-2">
            {unresolved.map((domain) => (
              <li
                key={domain}
                className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-3 py-2.5"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                <div>
                  <p className="text-sm text-amber-50/90">{domainDisplayName(domain)}</p>
                  <p className="mt-0.5 text-[11px] text-amber-100/55">
                    Applicability requires validation against the entity&apos;s regulatory framework.
                  </p>
                </div>
              </li>
            ))}
            {warnings.slice(0, 4).map((warning) => (
              <li key={warning} className="text-[11px] leading-5 text-amber-100/60 px-1">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evidenceScope?.method_note ? (
        <p className="text-[10px] text-white/30">{evidenceScope.method_note}</p>
      ) : null}
    </section>
  );
}
