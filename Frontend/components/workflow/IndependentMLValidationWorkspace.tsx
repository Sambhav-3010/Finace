"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, BrainCircuit, RefreshCw, Scale, ShieldCheck } from "lucide-react";
import { mlValidationApi } from "@/services/api";

type ValidationDashboard = {
  available?: boolean;
  architecture_note?: string;
  overview?: Record<string, any>;
  performance?: Record<string, any>;
  robustness?: Record<string, any>;
  ml_vs_finace?: Record<string, any>;
};

function Metric({ label, value, detail }: { label: string; value: unknown; detail?: string }) {
  const shown = value == null || value === "" ? "Not available" : String(value);
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{label}</p>
    <p className="mt-2 break-words text-xl font-semibold tracking-tight text-white sm:text-2xl">{shown}</p>
    {detail && <p className="mt-1 text-xs text-white/40">{detail}</p>}
  </div>;
}

export function IndependentMLValidationWorkspace() {
  const [data, setData] = useState<ValidationDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await mlValidationApi.dashboard();
      setData(response as ValidationDashboard);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const overview = data?.overview || {};
  const comparison = data?.ml_vs_finace || {};
  const disagreement = comparison?.risk_disagreement || {};
  const warnings = data?.robustness?.feature_warnings || [];

  return <section aria-label="Independent ML Validation" className="flex-1 overflow-y-auto px-3 pb-8 pt-16" style={{ scrollbarWidth: "thin" }}>
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <header className="glass rounded-[1.6rem] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-400/10"><BrainCircuit className="h-5 w-5 text-sky-200" /></div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200/75">Independent validation signal</p>
              <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">ML Validation</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Inspect measured model performance and its comparison with Finace. ML validation supplements the compliance assessment; it does not replace it.</p>
            </div>
          </div>
          <Link href="/dashboard/ml-validation" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white/65 transition hover:border-accent/25 hover:text-accent">Open detailed dashboard <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
      </header>

      {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="status" aria-label="Loading ML validation metrics">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />)}</div> : error || !data?.available ? <div role="alert" className="glass rounded-2xl p-5"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div className="flex-1"><h2 className="font-medium text-white">Validation data unavailable</h2><p className="mt-1 text-sm text-white/50">The current ML validation metrics could not be loaded. Your chat and compliance assessment remain available.</p><button type="button" onClick={() => void load()} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/5"><RefreshCw className="h-3.5 w-3.5" />Retry</button></div></div></div> : <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Current model" value={overview.current_model} detail={overview.model_type ? String(overview.model_type).replace(/_/g, " ") : undefined} />
          <Metric label="Test accuracy" value={overview.main_test_accuracy_display} detail={data.performance?.n_test ? `${data.performance.n_test.toLocaleString()} held-out cases` : undefined} />
          <Metric label="Test macro-F1" value={overview.test_macro_f1_display} />
          <Metric label="Unseen requirement accuracy" value={overview.unseen_requirement_accuracy_display} />
          <Metric label="Adversarial accuracy" value={overview.adversarial_accuracy_display} detail={overview.adversarial_macro_f1_display ? `Macro-F1 ${overview.adversarial_macro_f1_display}` : undefined} />
          <Metric label="Test expected calibration error" value={overview.test_ece == null ? null : Number(overview.test_ece).toFixed(4)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-[1.4rem] p-5 sm:p-6">
            <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-accent" /><h2 className="text-sm font-semibold text-white">Finace and ML comparison</h2></div>
            <p className="mt-2 text-xs leading-5 text-white/45">Agreement here uses exact ML risk-category equality with the deterministic rules baseline in the stored paired evaluation.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Risk agreement" value={comparison.ml_vs_rules_risk_agreement == null ? null : `${(comparison.ml_vs_rules_risk_agreement * 100).toFixed(1)}%`} />
              <Metric label="Risk disagreements" value={disagreement.n_disagree} />
              <Metric label="Disagreement rate" value={disagreement.rate == null ? null : `${(disagreement.rate * 100).toFixed(1)}%`} />
              <Metric label="Cases requiring review" value={disagreement.review_required_count} />
            </div>
            <p className="mt-3 text-[11px] leading-5 text-white/40">High-risk-only agreement and status-level paired Finace metrics are not available in the current evaluation data.</p>
          </div>
          <div className="glass rounded-[1.4rem] p-5 sm:p-6">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /><h2 className="text-sm font-semibold text-white">Robustness</h2></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Adversarial cases" value={data.robustness?.n_cases} />
              <Metric label="Adversarial ECE" value={data.robustness?.ece == null ? null : Number(data.robustness.ece).toFixed(4)} />
            </div>
            {warnings.length > 0 ? <div className="mt-4 space-y-2">{warnings.map((warning: any) => <div key={`${warning.kind}-${warning.feature}`} className="rounded-xl border border-amber-300/20 bg-amber-400/[0.06] p-3"><p className="text-xs font-medium text-amber-100">Measured warning: {String(warning.feature || "model behavior").replace(/_/g, " ")}{warning.importance != null ? ` · ${(warning.importance * 100).toFixed(1)}% importance` : ""}</p><p className="mt-1 text-[11px] leading-5 text-white/45">{warning.finding}</p></div>)}</div> : <p className="mt-4 text-xs text-white/45">No measured shortcut warnings are available.</p>}
          </div>
        </div>
        <p className="text-center text-[11px] text-white/35">Model trained {overview.model_trained_at || "date unavailable"} · evaluation artifact updated {overview.evaluation_artifact_updated_at || "date unavailable"}</p>
      </>}
    </div>
  </section>;
}
