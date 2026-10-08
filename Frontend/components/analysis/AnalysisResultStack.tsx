"use client";

import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { FinaceAssessmentCard } from "@/components/analysis/FinaceAssessmentCard";
import { RegulatoryEvidencePanel } from "@/components/analysis/RegulatoryEvidencePanel";
import { RemediationPanel } from "@/components/analysis/RemediationPanel";
import { EvidenceScopeNotice } from "@/components/reports/EvidenceScopeNotice";
import { RuleImpactPanel } from "@/components/reports/RuleImpactPanel";
import { ExplainabilityPanel } from "@/components/reports/ExplainabilityPanel";
import { MLRiskPanel } from "@/components/reports/MLRiskPanel";
import { MLValidationCard } from "@/components/ml-validation/MLValidationCard";
import { isPdfSourcePath, resolvePublicDocUrl } from "@/lib/docs/publicDocUrl";
import { sourceLabel } from "@/lib/workflow/sourceUtils";

type Assessment = {
  rule_id?: string;
  name?: string;
  risk_level?: string;
  triggered?: boolean;
  status?: string;
  evidence_status?: string;
  applicability?: string;
  recommendation?: string;
};

/**
 * Canonical examiner-facing order for a Finace analysis result.
 * Finace assessment is always primary; ML is independent and later in the stack.
 */
export function AnalysisResultStack({
  riskLevel,
  complianceScore,
  riskFlags,
  ruleAssessments,
  evidenceScope,
  sources,
  recommendations,
  mlValidation,
  mlRisk,
  xai,
  narrative,
  showSources = true,
  compact = false,
}: {
  riskLevel?: string;
  complianceScore?: number;
  riskFlags?: string[];
  ruleAssessments?: Assessment[];
  evidenceScope?: any;
  sources?: any[];
  recommendations?: string[];
  mlValidation?: any;
  mlRisk?: any;
  xai?: any;
  narrative?: ReactNode;
  showSources?: boolean;
  compact?: boolean;
}) {
  const findings = (ruleAssessments || [])
    .filter((r) => r.triggered && r.status !== "not_applicable")
    .map((r) => ({
      label: r.name || r.rule_id || "Control",
      risk: r.risk_level,
      detail: r.triggered ? "Triggered" : undefined,
    }));

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-[11px] leading-5 text-white/40">
        Regulatory documents → source of truth → RAG evidence →{" "}
        <span className="text-accent/80">Finace assessment</span> → independent ML validation → review
        disagreements
      </div>

      <FinaceAssessmentCard
        riskLevel={riskLevel}
        complianceScore={complianceScore}
        findings={findings}
        riskFlags={riskFlags}
      />

      <EvidenceScopeNotice scope={evidenceScope} />

      {narrative}

      <RegulatoryEvidencePanel
        sources={sources}
        evidenceScope={evidenceScope}
        compact={compact}
      />

      <RemediationPanel recommendations={recommendations} assessments={ruleAssessments} />

      <MLValidationCard
        mlValidation={mlValidation}
        finaceRiskLevel={riskLevel}
        riskFlags={riskFlags}
        ruleAssessments={ruleAssessments}
        compact={compact}
      />

      <RuleImpactPanel assessments={ruleAssessments} />

      {(xai || mlRisk) && (
        <div className="space-y-2">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Model / Surrogate Explanation
          </p>
          <p className="px-1 text-[11px] text-white/40">
            These explanations describe model or surrogate-model behavior and are not regulatory
            evidence.
          </p>
          {xai ? <ExplainabilityPanel xai={xai} compact={compact} /> : null}
          {mlRisk ? <MLRiskPanel mlRisk={mlRisk} compact={compact} /> : null}
        </div>
      )}

      {showSources && sources && sources.length > 0 ? <SourcesSection sources={sources} /> : null}
    </div>
  );
}

function SourcesSection({ sources }: { sources: any[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0c1211] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Sources</p>
      <p className="mt-1 text-[11px] text-white/35">Regulatory source references returned for this analysis.</p>
      <ul className="mt-3 space-y-2">
        {sources.map((source, si) => {
          const relPath =
            source.relative_path ||
            source.source_file ||
            source.source ||
            source.file_path ||
            source.document_id ||
            "";
          const docUrl = isPdfSourcePath(relPath) ? resolvePublicDocUrl(relPath) : null;
          const fileName = sourceLabel(source);
          const excerpt = (source.text || source.content || "").toString().trim();

          return (
            <li key={si} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
              {docUrl ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] text-accent/90 hover:text-accent"
                >
                  <span className="truncate">{fileName}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                </a>
              ) : (
                <p className="truncate text-[13px] text-white/70">{fileName}</p>
              )}
              {source.section ? (
                <p className="mt-1 text-[11px] text-white/40">Section: {source.section}</p>
              ) : null}
              {source.document_id ? (
                <p className="mt-0.5 text-[10px] font-mono text-white/30">{source.document_id}</p>
              ) : null}
              {excerpt ? (
                <p className="mt-1.5 text-[12px] leading-5 text-white/50 line-clamp-2">{excerpt}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
