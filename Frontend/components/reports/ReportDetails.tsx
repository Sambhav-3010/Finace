import { ListOrdered } from "lucide-react";
import { motion } from "framer-motion";
import { AnalysisResultStack } from "@/components/analysis/AnalysisResultStack";
import { isPdfSourcePath } from "@/lib/docs/publicDocUrl";
import { useDocCatalog } from "@/hooks/useDocCatalog";
import { resolveDocPath } from "@/lib/docs/docCatalog";
import { toDisplayHtml, toDisplayText } from "@/lib/text/renderRich";

export function ReportDetails({ report }: { report: any }) {
  const { catalog } = useDocCatalog();

  const sources = (report.applicable_clauses || []).map((clause: any) => {
    const source = clause.source || clause.document_name || "";
    const resolvedPath =
      clause.document_path ||
      resolveDocPath(clause.document_name || "", catalog) ||
      (isPdfSourcePath(source) ? source : resolveDocPath(source, catalog));
    return {
      document_id: clause.document_id || clause.document_name || source,
      section: clause.section || clause.title,
      text: clause.text || "",
      relative_path: resolvedPath || "",
      source_file: source,
      title: clause.title,
      basis: clause.basis,
      applicability_note: clause.applicability_note,
    };
  });

  return (
    <>
      <AnalysisResultStack
        riskLevel={report.risk_level}
        complianceScore={report.compliance_score}
        riskFlags={report.risk_flags}
        ruleAssessments={report.rule_assessments}
        evidenceScope={report.evidence_scope}
        sources={sources}
        recommendations={report.recommendations}
        mlValidation={report.ml_validation}
        mlRisk={report.ml_risk}
        xai={report.xai}
        narrative={
          report.explanation ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-[2rem] p-6 sm:p-8 border-white/10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Assessment narrative
              </p>
              <div
                className="mt-4 text-white/80 leading-relaxed text-base prose-custom [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1"
                dangerouslySetInnerHTML={{ __html: toDisplayHtml(report.explanation || "") }}
              />
            </motion.div>
          ) : null
        }
      />

      {!!report.reasoning_steps?.length && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[2rem] p-6 border-white/10 mt-4"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <ListOrdered className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Decision Path</h3>
          </div>
          <ol className="space-y-3">
            {report.reasoning_steps.map((step: string, i: number) => (
              <li key={`${step}-${i}`} className="flex gap-3 text-sm text-white/70 leading-6">
                <span className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] text-accent">
                  {i + 1}
                </span>
                <span>{toDisplayText(step)}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      )}

    </>
  );
}
