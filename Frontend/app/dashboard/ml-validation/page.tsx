"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  ShieldCheck,
  GitBranch,
  Target,
  FlaskConical,
  Scale,
  Users,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight as RightIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mlValidationApi } from "@/services/api";
import { ConfusionMatrix } from "@/components/ml-validation/ConfusionMatrix";
import { FeatureImportanceBars } from "@/components/ml-validation/FeatureImportanceBars";
import { CaseDetailPanel } from "@/components/ml-validation/CaseDetailPanel";
import { ACCENT_HEX } from "@/lib/theme/colors";

type DashboardPayload = any;

const SECTIONS = [
  { id: "overview", label: "Overview", icon: BrainCircuit },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "performance", label: "Model Performance", icon: Target },
  { id: "robustness", label: "Robustness Testing", icon: FlaskConical },
  { id: "grounding", label: "Regulatory Grounding", icon: ShieldCheck },
  { id: "compare", label: "ML vs Finace", icon: Scale },
  { id: "human", label: "Human Validation", icon: Users },
] as const;

export default function MLValidationPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<(typeof SECTIONS)[number]["id"]>("overview");

  const [robustCases, setRobustCases] = useState<any[]>([]);
  const [compareCases, setCompareCases] = useState<any[]>([]);
  const [humanCases, setHumanCases] = useState<any[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [requirementQuery, setRequirementQuery] = useState("");
  const [requirementDomain, setRequirementDomain] = useState("");
  const [requirementOffset, setRequirementOffset] = useState(0);
  const [requirementTotal, setRequirementTotal] = useState(0);
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const [requirementsError, setRequirementsError] = useState<string | null>(null);
  const [requirementSelected, setRequirementSelected] = useState<any | null>(null);
  const [requirementRefresh, setRequirementRefresh] = useState(0);

  useEffect(() => {
    if (active !== "grounding") return;
    let cancelled = false;
    setRequirementsLoading(true);
    setRequirementsError(null);
    mlValidationApi.requirements({ q: requirementQuery, domain: requirementDomain, limit: 25, offset: requirementOffset })
      .then((res: any) => {
        if (cancelled) return;
        setRequirements(res?.requirements || []);
        setRequirementTotal(Number(res?.total) || 0);
        setRequirementSelected((current: any) => current && (res?.requirements || []).some((r: any) => r.requirement_id === current.requirement_id) ? current : (res?.requirements || [])[0] || null);
      })
      .catch(() => { if (!cancelled) setRequirementsError("Unable to load regulatory requirements. Please retry."); })
      .finally(() => { if (!cancelled) setRequirementsLoading(false); });
    return () => { cancelled = true; };
  }, [active, requirementQuery, requirementDomain, requirementOffset, requirementRefresh]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await mlValidationApi.dashboard();
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) {
          setError("Unable to load ML validation data. Please retry.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const retryDashboard = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res: any = await mlValidationApi.dashboard(); setData(res); }
    catch { setError("Unable to load ML validation data. Please retry."); }
    finally { setLoading(false); }
  }, []);

  const loadCases = useCallback(async (setName: "robustness" | "human" | "comparison") => {
    setCasesLoading(true);
    setCasesError(null);
    try {
      const res: any = await mlValidationApi.cases({ set: setName, limit: 12, offset: 0 });
      const rows = res?.cases || [];
      if (setName === "robustness") setRobustCases(rows);
      if (setName === "comparison") setCompareCases(rows);
      if (setName === "human") setHumanCases(rows);
      if (rows[0]) setSelected(rows[0]);
    } catch {
      setCasesError("Unable to load validation cases. Please retry.");
    } finally {
      setCasesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active === "robustness" || active === "grounding") {
      if (!robustCases.length) void loadCases("robustness");
    }
    if (active === "compare" && !compareCases.length) void loadCases("comparison");
    if (active === "human" && !humanCases.length) void loadCases("human");
  }, [active, robustCases.length, compareCases.length, humanCases.length, loadCases]);

  const overview = data?.overview;
  const performance = data?.performance;
  const robustness = data?.robustness;
  const compare = data?.ml_vs_finace;
  const human = data?.human_validation;

  const domainChart = useMemo(() => {
    const map = performance?.per_domain_status_accuracy || {};
    return Object.entries(map).map(([domain, acc]) => ({
      domain,
      accuracy: Math.round(Number(acc) * 1000) / 10,
    }));
  }, [performance]);

  const metricCards = [
    { label: "Current Model · Type", value: overview?.model_type ? `${overview?.current_model || "Current model"} · ${String(overview.model_type).replace(/_/g, " ")}` : overview?.current_model || "Not available" },
    {
      label: "Compliance Scenarios",
      value: overview?.compliance_scenarios?.toLocaleString?.() || "Not available",
    },
    { label: "Test Accuracy", value: overview?.main_test_accuracy_display || "Not available" },
    { label: "Test Macro-F1", value: overview?.test_macro_f1_display || "Not available" },
    { label: "Regulatory Requirements", value: overview?.regulatory_requirement_count?.toLocaleString?.() || "Not available" },
    {
      label: "Unseen Requirement Accuracy",
      value: overview?.unseen_requirement_accuracy_display || "Not available",
    },
    { label: "Unseen Requirement Macro-F1", value: overview?.unseen_requirement_macro_f1_display || "Not available" },
    { label: "Adversarial Accuracy", value: overview?.adversarial_accuracy_display || "Not available" },
    { label: "Adversarial Macro-F1", value: overview?.adversarial_macro_f1_display || "Not available" },
    { label: "Test ECE", value: overview?.test_ece != null ? Number(overview.test_ece).toFixed(4) : "Not available" },
    { label: "Adversarial ECE", value: overview?.adversarial_ece != null ? Number(overview.adversarial_ece).toFixed(4) : "Not available" },
    {
      label: "Human Validation",
      value:
        overview?.human_validation_cases != null
          ? `${overview.human_validation_cases} Cases`
          : "—",
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto min-h-[50vh] max-w-6xl space-y-5" role="status" aria-label="Loading ML Validation">
        <div className="h-32 animate-pulse rounded-3xl bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />)}</div>
      </div>
    );
  }

  if (error || !data?.available) {
    return (
      <div className="glass rounded-[1.8rem] p-8 max-w-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-xl font-semibold text-white">ML Validation</h1>
            <p className="mt-2 text-sm text-white/55">
              {error ||
                "ML validation artifacts are not available. Ensure the Python RAG service is running and the current model has been trained."}
            </p>
            <button type="button" onClick={retryDashboard} className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm text-white/75 hover:bg-white/5">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="glass rounded-[1.8rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent/80">
              Independent validation
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              ML Validation
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/55 leading-6">
              Independent machine learning validation of Finace compliance assessments.
            </p>
          </div>
          <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-accent/70">Current Model</p>
            <p className="text-lg font-semibold text-accent">{overview?.current_model || "Not available"}</p>
            <p className="mt-1 text-[11px] text-accent/55">Model version trained {overview?.model_trained_at || "timestamp unavailable"}</p>
            <p className="mt-1 text-[11px] text-accent/55">Evaluated {overview?.model_evaluated_at || "timestamp unavailable"}</p>
            <p className="mt-1 text-[10px] text-accent/45">Evaluation artifact updated {overview?.evaluation_artifact_updated_at || "date unavailable"}</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-[13px] leading-6 text-white/60">
          {data.architecture_note}
        </p>
      </header>

      <nav className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const on = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] transition ${
                on
                  ? "border-accent/30 bg-accent/12 text-accent"
                  : "border-white/8 bg-white/[0.03] text-white/50 hover:text-white/80"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </nav>

      {active === "overview" && (
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metricCards.map((card) => (
              <div key={card.label} className="glass rounded-[1.4rem] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-[1.4rem] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/40">
              How Finace and ML work together
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
              <ArchCard
                title="Regulatory Source"
                body="Documents and retrieved clauses remain the source of truth."
              />
              <ArchCard
                title="Finace Engine"
                body="RAG, deterministic rules, and Gemini produce the primary compliance assessment."
              />
              <ArchCard
                title="ML Validation"
                body="An independent prediction used as a validation signal — never a replacement."
              />
            </div>
          </div>
        </section>
      )}

      {active === "pipeline" && (
        <section className="glass rounded-[1.4rem] p-6">
          <h2 className="text-lg font-semibold text-white">ML Pipeline</h2>
          <p className="mt-1 text-sm text-white/50">
            From regulatory sources to an independent compliance prediction.
          </p>
          <ol className="mt-6 space-y-3">
            {(data.pipeline_steps || []).map((step: any, idx: number) => (
              <li
                key={step.title}
                className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-xs font-semibold text-accent">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white/90">{step.title}</p>
                    {idx < (data.pipeline_steps?.length || 0) - 1 && (
                      <ChevronRight className="h-3.5 w-3.5 text-white/25" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-white/50">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {active === "performance" && (
        <section className="space-y-4">
          <div className="glass rounded-[1.4rem] p-6">
            <h2 className="text-lg font-semibold text-white">Model Performance</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/35">
                    <th className="py-2 pr-4 font-medium">Metric</th>
                    <th className="py-2 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {(performance?.metrics || [])
                    .filter((m: any) =>
                      [
                        "main_test_accuracy",
                        "unseen_requirement_accuracy",
                        "robustness_accuracy",
                        "calibration_error",
                      ].includes(m.key)
                    )
                    .map((m: any) => (
                      <tr key={m.key} className="border-b border-white/5">
                        <td className="py-3 pr-4">
                          <p className="text-white/85">{m.label}</p>
                          <p className="mt-1 text-[12px] text-white/40 max-w-xl">{m.explanation}</p>
                        </td>
                        <td className="py-3 text-lg font-semibold tabular-nums text-accent">
                          {m.display ?? "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2 text-[13px] text-white/50 leading-6">
              <p>
                {overview?.main_test_accuracy_display} accuracy means the model correctly classified
                approximately{" "}
                {overview?.main_test_accuracy != null
                  ? Math.round(overview.main_test_accuracy * 100)
                  : "97"}{" "}
                out of every 100 cases in the held-out test set.
              </p>
              <p>
                {overview?.unseen_requirement_accuracy_display} unseen requirement accuracy measures
                how well the model generalizes to requirements not directly represented in training.
              </p>
              <p>
                {overview?.robustness_accuracy_display} robustness accuracy comes from deliberately
                difficult cases designed to reduce simple keyword-based shortcuts.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass rounded-[1.4rem] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/40">
                Confusion Matrix
              </h3>
              <div className="mt-4">
                <ConfusionMatrix
                  labels={performance?.confusion_matrix?.labels}
                  matrix={performance?.confusion_matrix?.matrix}
                />
              </div>
            </div>
            <div className="glass rounded-[1.4rem] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/40">
                Feature Importance
              </h3>
              <div className="mt-4">
                <FeatureImportanceBars features={performance?.feature_importance} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricTable title="Test set · per-class performance" data={performance?.test_status} />
            <MetricTable title="Unseen requirements · per-class performance" data={performance?.unseen_status} />
          </div>
          <div className="glass rounded-[1.4rem] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">Test set class distribution</h3>
            <ClassDistribution data={performance?.test_status?.classification_report} />
          </div>
          {domainChart.length > 0 && (
            <div className="glass rounded-[1.4rem] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/40">
                Per-domain accuracy
              </h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainChart} margin={{ left: 0, right: 8, top: 8, bottom: 24 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="domain"
                      tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                      angle={-25}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0f1715",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                      }}
                      formatter={(value) => [`${value ?? 0}%`, "Accuracy"]}
                    />
                    <Bar dataKey="accuracy" fill={ACCENT_HEX} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      )}

      {active === "robustness" && (
        <section className="space-y-4">
          <div className="glass rounded-[1.4rem] p-6">
            <h2 className="text-lg font-semibold text-white">Robustness Testing</h2>
            <p className="mt-2 text-sm text-white/55 leading-6">{robustness?.explanation}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatTile label="Robustness Test Cases" value={robustness?.n_cases ?? "—"} />
              <StatTile label="Accuracy" value={robustness?.accuracy_display ?? "—"} />
              <StatTile label="Adversarial Macro-F1" value={robustness?.macro_f1_display ?? "Not available"} />
              <StatTile label="ECE" value={robustness?.ece != null ? Number(robustness.ece).toFixed(4) : "Not available"} />
            </div>
            {!!robustness?.feature_warnings?.length && <div className="mt-5 space-y-2"><h3 className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">Measured model behavior warnings</h3>{robustness.feature_warnings.map((warning: any) => <div key={`${warning.kind}-${warning.feature}`} className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-3"><p className="text-sm font-medium text-amber-100">{String(warning.feature || "Feature").replace(/_/g, " ")}{warning.importance != null ? ` · ${(warning.importance * 100).toFixed(1)}% importance` : ""}{warning.presence_rate != null ? ` · ${(warning.presence_rate * 100).toFixed(1)}% occurrence` : ""}</p><p className="mt-1 text-xs leading-5 text-white/50">{warning.finding}</p></div>)}</div>}
          </div>
          <CaseBrowser
            title="Inspect robustness cases"
            cases={robustCases}
            loading={casesLoading}
            error={casesError}
            selectedId={selected?.case_id}
            onSelect={setSelected}
            onRetry={() => void loadCases("robustness")}
            mode="robustness"
          />
        </section>
      )}

      {active === "grounding" && (
        <section className="space-y-4">
          <div className="glass rounded-[1.4rem] p-6">
            <h2 className="text-lg font-semibold text-white">Regulatory Grounding</h2>
            <p className="mt-2 text-sm text-white/55 leading-6">
              Regulatory Source → Requirement → Scenario → Expected Outcome → ML Prediction
            </p>
            <p className="mt-3 text-[13px] text-white/40">
              Regulatory evidence is visually separated from the ML prediction so examiners can see
              that the model is not generating regulatory truth.
            </p>
          </div>
          <RequirementBrowser
            rows={requirements} loading={requirementsLoading} error={requirementsError}
            query={requirementQuery} onQuery={(v: string) => { setRequirementQuery(v); setRequirementOffset(0); }}
            domain={requirementDomain} onDomain={(v: string) => { setRequirementDomain(v); setRequirementOffset(0); }}
            offset={requirementOffset} total={requirementTotal} onOffset={setRequirementOffset}
            selected={requirementSelected} onSelect={setRequirementSelected} onRetry={() => setRequirementRefresh((v) => v + 1)}
          />
        </section>
      )}

      {active === "compare" && (
        <section className="space-y-4">
          <div className="glass rounded-[1.4rem] p-6">
            <h2 className="text-lg font-semibold text-white">ML vs Finace</h2>
            <p className="mt-2 text-sm text-white/55 leading-6">
              How the independent ML validation signal compares with the existing Finace compliance
              engine (deterministic rules baseline in this comparison).
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatTile label="Cases compared" value={compare?.n_compared ?? "—"} />
              <StatTile
                label="ML vs rules risk agreement"
                value={
                  compare?.ml_vs_rules_risk_agreement != null
                    ? `${(compare.ml_vs_rules_risk_agreement * 100).toFixed(0)}%`
                    : "—"
                }
              />
              <StatTile
                label="Disagreements"
                value={compare?.risk_disagreement?.n_disagree ?? "—"}
              />
              <StatTile label="Risk disagreement rate" value={compare?.risk_disagreement?.rate != null ? `${(compare.risk_disagreement.rate * 100).toFixed(1)}%` : "Not available"} />
              <StatTile label="Cases requiring review" value={compare?.risk_disagreement?.review_required_count ?? "Not available"} />
            </div>
            <p className="mt-3 text-xs text-white/40">Comparison uses exact risk-category equality between ML and the deterministic rules baseline. High-risk-only agreement and status-level paired Finace metrics are unavailable. Benchmark agreement against expected labels is separate from Finace agreement.</p>
            {compare?.risk_disagreement?.pairs && (
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-wider text-white/35">
                  Disagreement pairs
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(compare.risk_disagreement.pairs).map(([pair, n]) => (
                    <span
                      key={pair}
                      className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200"
                    >
                      {String(pair).replace(/__/g, " / ").replace(/_/g, " ")}: {String(n)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-4 text-[13px] text-white/45 leading-6">{compare?.note}</p>
          </div>
          <CaseBrowser
            title="Comparison samples"
            cases={compareCases}
            loading={casesLoading}
            error={casesError}
            selectedId={selected?.case_id}
            onSelect={setSelected}
            onRetry={() => void loadCases("comparison")}
            mode="comparison"
          />
        </section>
      )}

      {active === "human" && (
        <section className="space-y-4">
          <div className="glass rounded-[1.4rem] p-6">
            <h2 className="text-lg font-semibold text-white">Human Validation</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatTile label="Reviewer-confirmed cases" value={human?.approved_count ?? "Not available"} />
              <StatTile label="Pending reviews" value={human?.pending_count ?? "Not available"} />
              <StatTile
                label="Cases Reserved for Human Validation"
                value={human?.n_cases ?? "—"}
              />
              <StatTile
                label="Review Status"
                value={
                  human?.pending
                    ? "Pending Human Review"
                    : (human?.review_status || "—").replace(/_/g, " ")
                }
              />
            </div>
            {human?.pending && (
              <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
                Pending Human Review — accuracy is not shown until cases are independently approved.
              </p>
            )}
            {human?.metrics_available && human?.metrics?.status_accuracy != null && (
              <p className="mt-4 text-sm text-white/60">
                Approved-subset accuracy:{" "}
                <span className="text-accent font-semibold">
                  {(human.metrics.status_accuracy * 100).toFixed(1)}%
                </span>{" "}
                (n={human.metrics.n})
              </p>
            )}
            <p className="mt-3 text-[13px] text-white/45">{human?.note}</p>
          </div>
          <CaseBrowser
            title="Human validation cases"
            cases={humanCases}
            loading={casesLoading}
            error={casesError}
            selectedId={selected?.case_id}
            onSelect={setSelected}
            onRetry={() => void loadCases("human")}
            mode="human"
          />
        </section>
      )}
    </div>
  );
}

function MetricTable({ title, data }: { title: string; data?: any }) {
  const rows = Object.entries(data?.per_class || {}) as Array<[string, any]>;
  return <div className="glass rounded-[1.4rem] p-6"><h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">{title}</h3>{rows.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[420px] text-sm"><thead><tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-white/40"><th className="py-2">Class</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead><tbody>{rows.map(([label, m]) => <tr key={label} className="border-b border-white/5"><td className="py-2 text-white/75">{label.replace(/_/g, " ")}</td><td className="tabular-nums text-white/65">{m.precision ?? "Not available"}</td><td className="tabular-nums text-white/65">{m.recall ?? "Not available"}</td><td className="tabular-nums text-white/65">{m.f1 ?? "Not available"}</td></tr>)}</tbody></table></div> : <p className="mt-4 text-sm text-white/40">Per-class results are not available.</p>}<p className="mt-3 text-xs text-white/40">Macro-F1: {data?.macro_f1 ?? "Not available"} · Weighted-F1: {data?.weighted_f1 ?? "Not available"}</p></div>;
}

function ClassDistribution({ data }: { data?: Record<string, any> }) {
  const rows = Object.entries(data || {}).filter(([key, value]) => !["accuracy", "macro avg", "weighted avg"].includes(key) && value && typeof value === "object");
  if (!rows.length) return <p className="mt-3 text-sm text-white/40">Class distribution is not available.</p>;
  return <div className="mt-4 flex flex-wrap gap-2">{rows.map(([label, item]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/65">{label.replace(/_/g, " ")} <span className="ml-2 font-mono text-white/40">n={item.support ?? "Not available"}</span></div>)}</div>;
}

function RequirementBrowser({ rows, loading, error, query, onQuery, domain, onDomain, offset, total, onOffset, selected, onSelect, onRetry }: any) {
  return <div className="glass rounded-[1.4rem] p-4 sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"><Search className="h-4 w-4 shrink-0 text-white/35"/><span className="sr-only">Search requirements</span><input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search requirement, document, authority, source chunk" className="w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"/></label><label className="sr-only" htmlFor="requirement-domain">Filter by domain</label><input id="requirement-domain" value={domain} onChange={(e) => onDomain(e.target.value)} placeholder="Filter domain" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none sm:w-48"/></div>
    {error && <div role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error} <button className="ml-2 underline" onClick={onRetry}>Retry</button></div>}
    {loading ? <div className="mt-4 h-56 animate-pulse rounded-xl bg-white/[0.04]" aria-label="Loading requirements"/> : !rows.length ? <p className="py-10 text-center text-sm text-white/45">{error ? "Requirements could not be loaded." : "No traceable requirements match this search."}</p> : <>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40"><th className="p-2">Requirement</th><th className="p-2">Domain</th><th className="p-2">Authority / document</th><th className="p-2">Source chunk</th><th className="p-2">Scenarios</th></tr></thead><tbody>{rows.map((r: any) => <tr key={r.requirement_id} className="border-b border-white/5 align-top"><td className="p-2"><button className="text-left text-accent hover:underline" onClick={() => onSelect(r)}>{r.requirement_id}</button><p className="mt-1 max-w-[380px] text-xs leading-5 text-white/50">{r.requirement_text}</p></td><td className="p-2 text-white/65">{r.domain || "Not available"}</td><td className="p-2 text-white/65">{r.authority || "Not available"}<p className="mt-1 text-xs text-white/40">{r.document_title || "Not available"}</p><p className="text-xs text-white/35">{r.section || ""}{r.page ? ` · p. ${r.page}` : ""}</p></td><td className="p-2 font-mono text-xs text-white/45">{r.source_chunk_id}</td><td className="p-2 tabular-nums text-white/65">{r.scenario_count}</td></tr>)}</tbody></table></div>
      <div className="mt-4 flex items-center justify-between text-xs text-white/45"><span>{total.toLocaleString()} requirements · showing {offset + 1}–{Math.min(offset + rows.length, total)}</span><div className="flex gap-2"><button aria-label="Previous requirements" disabled={offset === 0} onClick={() => onOffset(Math.max(0, offset - 25))} className="rounded-lg border border-white/10 p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4"/></button><button aria-label="Next requirements" disabled={offset + 25 >= total} onClick={() => onOffset(offset + 25)} className="rounded-lg border border-white/10 p-2 disabled:opacity-30"><RightIcon className="h-4 w-4"/></button></div></div>
    </>}
    {selected && <div className="mt-4 rounded-xl border border-accent/20 bg-accent/[0.05] p-4"><div className="flex justify-between gap-3"><h3 className="font-semibold text-white">{selected.requirement_id} · source metadata</h3><button onClick={() => onSelect(null)} aria-label="Close requirement details" className="text-white/45">×</button></div><p className="mt-2 text-sm leading-6 text-white/65">{selected.requirement_text}</p><p className="mt-3 text-xs text-white/40">{selected.authority} · {selected.document_title} · {selected.section}{selected.page ? ` · p. ${selected.page}` : ""} · chunk {selected.source_chunk_id}</p><p className="mt-1 text-xs text-white/40">Expected outcomes: {(selected.expected_outcomes || []).join(", ") || "Not available"} · bank review status: {selected.review_status || "Not available"}</p></div>}
  </div>;
}

function ArchCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent/80">{title}</p>
      <p className="mt-2 text-white/55 leading-6">{body}</p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function CaseBrowser({
  title,
  cases,
  loading,
  error,
  selectedId,
  onSelect,
  onRetry,
  mode,
}: {
  title: string;
  cases: any[];
  loading: boolean;
  error?: string | null;
  selectedId?: string;
  onSelect: (c: any) => void;
  onRetry?: () => void;
  mode: "grounding" | "robustness" | "comparison" | "human";
}) {
  const selected = cases.find((c) => c.case_id === selectedId) || cases[0] || null;

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="glass rounded-[1.4rem] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white/80">{title}</h3>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
        </div>
        {error && <p role="alert" className="mb-3 text-xs text-rose-200">{error} <button type="button" onClick={onRetry} className="underline">Retry</button></p>}
        <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
          {!loading && cases.length === 0 && (
            <p className="text-sm text-white/40">No cases available.</p>
          )}
          {cases.map((c) => {
            const on = c.case_id === selected?.case_id;
            return (
              <button
                key={c.case_id}
                type="button"
                onClick={() => onSelect(c)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                  on
                    ? "border-accent/30 bg-accent/10"
                    : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <p className="truncate text-[12px] font-medium text-white/80">{c.case_id}</p>
                <p className="mt-0.5 truncate text-[11px] text-white/40">
                  {c.domain || "—"} · {(c.expected_status || "—").replace(/_/g, " ")}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="glass rounded-[1.4rem] p-5">
        <CaseDetailPanel caseRow={selected} mode={mode} />
      </div>
    </div>
  );
}
