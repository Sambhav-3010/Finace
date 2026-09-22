"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BrainCircuit, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";

type XaiFeature = {
  feature?: string;
  label?: string;
  weight?: number;
  shap_value?: number;
  direction?: string;
  active?: boolean;
};

type XaiPayload = {
  method?: string;
  observed_score?: number;
  baseline_score?: number;
  surrogate_score?: number;
  observed_risk?: string;
  top_drivers?: string[];
  notes?: string[];
  lime?: { summary?: string; features?: XaiFeature[] };
  shap?: { summary?: string; features?: XaiFeature[] };
  semantic_evaluation?: Array<{
    category?: string;
    display_name?: string;
    status?: string;
    confidence?: number;
    penalty_points?: number;
    max_penalty_points?: number;
    credit_points?: number;
    model_source?: string;
  }>;
  score_calculation?: {
    baseline_score?: number;
    rule_penalty?: number;
    semantic_penalty?: number;
    retrieval_top_score?: number;
    retrieval_weight?: number;
    retrieval_bonus?: number;
    deterministic_score?: number;
    llm_score?: number;
    deterministic_weight?: number;
    llm_weight?: number;
    final_score?: number;
    score_improvement_adjustment?: number;
  };
  score_breakdown?: Array<{
    feature?: string;
    contribution?: number;
    shap_value?: number;
  }>;
};

type ImpactLevel = "LOW" | "MEDIUM" | "HIGH";

function impactLevel(value: number, maximum: number): ImpactLevel {
  const share = maximum > 0 ? Math.abs(value) / maximum : 0;
  if (share >= 0.66) return "HIGH";
  if (share >= 0.33) return "MEDIUM";
  return "LOW";
}

function impactTone(level: ImpactLevel) {
  if (level === "HIGH") return "border-red-400/30 bg-red-500/10 text-red-200";
  if (level === "MEDIUM") return "border-yellow-400/30 bg-yellow-500/10 text-yellow-200";
  return "border-green-400/30 bg-green-500/10 text-green-200";
}

function chartColor(value: number) {
  if (value > 0) return "#34d399";
  if (value < 0) return "#f87171";
  return "#facc15";
}

function driverExplanation(label: string, value: number, drivers: string[]) {
  const match = drivers.find((driver) => driver.toLowerCase().includes(label.toLowerCase()));
  if (match) return match.replace(/\s*\([+-]?\d+(?:\.\d+)?\)\.?\s*$/, ".");
  return value >= 0
    ? "This factor supports the compliance score."
    : "This factor increases the identified compliance exposure.";
}

function formatContribution(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)} score units (0-100 score scale)`;
}

function formatChartValue(value: unknown) {
  const numeric = Number(value ?? 0);
  return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(2)}`;
}

function semanticExplanation(status?: string) {
  const normalized = (status || "").toUpperCase();
  if (normalized === "COMPLIANT") return "The model found evidence that this control is implemented.";
  if (normalized === "MISSING") return "The model found no sufficient evidence that this control is implemented.";
  if (normalized === "PARTIAL") return "The model found evidence of this control, but coverage appears incomplete.";
  if (normalized === "NO_STATEMENT") return "The prompt did not provide an implementation statement for this control.";
  return "The model could not establish the control status with the available evidence.";
}

function confidenceMeaning(confidence?: number) {
  if (confidence == null || Number.isNaN(Number(confidence))) return "Confidence was not returned.";
  const percent = Math.round(Number(confidence) * 100);
  if (percent < 50) return `Model confidence: ${percent}% (low certainty; treat this status as inconclusive).`;
  if (percent < 75) return `Model confidence: ${percent}% (moderate certainty; validate with additional evidence).`;
  return `Model confidence: ${percent}% (strong certainty based on the available text and evidence).`;
}

function scoreComparison(score?: number, baseline?: number) {
  if (score == null || baseline == null || baseline <= 0) return null;
  const delta = Number(score) - Number(baseline);
  const relative = (delta / Number(baseline)) * 100;
  return {
    score: Number(score),
    baseline: Number(baseline),
    delta,
    relative,
  };
}

function ScoreCalculation({ calculation, xai }: { calculation?: XaiPayload["score_calculation"]; xai: XaiPayload }) {
  const hasExactCalculation = Boolean(calculation);
  const rows = (xai.score_breakdown || []).map((row) => ({
    feature: row.feature || "",
    value: Number(row.contribution ?? row.shap_value ?? 0),
  }));
  const fallback: NonNullable<XaiPayload["score_calculation"]> = {
    baseline_score: xai.baseline_score,
    rule_penalty: rows.filter((row) => row.feature.startsWith("rule:")).reduce((sum, row) => sum + Math.abs(row.value), 0),
    semantic_penalty: rows.filter((row) => row.feature.startsWith("semantic:")).reduce((sum, row) => sum + Math.abs(row.value), 0),
    retrieval_bonus: rows.find((row) => row.feature === "retrieval_top_score")?.value || 0,
    retrieval_top_score: (rows.find((row) => row.feature === "retrieval_top_score")?.value || 0) / 4,
    retrieval_weight: 4,
    deterministic_score: Number(xai.baseline_score || 0) + rows.filter((row) => row.feature !== "llm_score_blend").reduce((sum, row) => sum + row.value, 0),
    llm_score: xai.observed_score,
    deterministic_weight: 0.7,
    llm_weight: 0.3,
    score_improvement_adjustment: 0,
    final_score: xai.observed_score,
  };
  const resolved = calculation || fallback;
  const baseline = Number(resolved.baseline_score ?? 0);
  const rulePenalty = Number(resolved.rule_penalty ?? 0);
  const semanticPenalty = Number(resolved.semantic_penalty ?? 0);
  const retrievalBonus = Number(resolved.retrieval_bonus ?? 0);
  const deterministic = Number(resolved.deterministic_score ?? 0);
  const llmScore = Number(resolved.llm_score ?? 0);
  const deterministicWeight = Number(resolved.deterministic_weight ?? 0.7);
  const llmWeight = Number(resolved.llm_weight ?? 0.3);
  const finalScore = Number(resolved.final_score ?? 0);
  const improvementAdjustment = Number(resolved.score_improvement_adjustment ?? 0);
  const blendedScore = deterministic * deterministicWeight + llmScore * llmWeight;
  return (
    <div className="mt-2 space-y-2 rounded-lg border border-green-400/15 bg-black/20 p-3 text-[11px] text-white/65">
      <p className="font-semibold uppercase tracking-[0.14em] text-green-200/75">Actual score calculation</p>
      <p className="font-mono text-white/75">
        {baseline.toFixed(2)} - {rulePenalty.toFixed(2)} rule penalties - {semanticPenalty.toFixed(2)} semantic penalties + {retrievalBonus.toFixed(2)} RAG bonus = {deterministic.toFixed(2)} deterministic score
      </p>
      {hasExactCalculation ? (
        <p className="font-mono text-white/75">
          ({deterministic.toFixed(2)} x {deterministicWeight.toFixed(1)}) + ({llmScore.toFixed(2)} x {llmWeight.toFixed(1)}) = {blendedScore.toFixed(2)} blended score
        </p>
      ) : (
        <p className="font-mono text-yellow-200/75">
          Exact LLM blend details were not included in this cached response. Inferred final-score adjustment: {finalScore.toFixed(0)} - {deterministic.toFixed(2)} = {(finalScore - deterministic).toFixed(2)} score units.
        </p>
      )}
      {improvementAdjustment > 0 && (
        <p className="font-mono text-yellow-200/75">{blendedScore.toFixed(2)} + {improvementAdjustment.toFixed(2)} score-improvement adjustment = {finalScore.toFixed(0)} final score.</p>
      )}
      {improvementAdjustment <= 0 && <p className="font-mono text-white/75">Rounded and clamped to 0-100 = {finalScore.toFixed(0)} final score.</p>}
      <p className="text-white/45">
        RAG bonus = top retrieval score ({Number(resolved.retrieval_top_score ?? (retrievalBonus / Number(resolved.retrieval_weight || 4))).toFixed(4)}) x retrieval weight ({Number(resolved.retrieval_weight ?? 4).toFixed(1)}) = {retrievalBonus.toFixed(2)} score units.
      </p>
    </div>
  );
}

function SemanticMLSection({
  rows,
}: {
  rows: NonNullable<XaiPayload["semantic_evaluation"]>;
}) {
  if (!rows.length) return null;
  const maximum = Math.max(
    ...rows.map((row) => Math.abs(Number(row.credit_points || row.penalty_points || 0))),
    0,
  );
  return (
    <section className="space-y-3 rounded-xl border border-yellow-400/15 bg-yellow-500/[0.04] p-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-yellow-200/70">Semantic ML checks</p>
        <p className="mt-1 text-[11px] leading-4 text-white/45">
          Confidence describes how certain the model is about the status. It does not mean the control is that percentage implemented.
        </p>
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => {
          const points = Number(row.credit_points || row.penalty_points || 0);
          const maximumPoints = Number(row.max_penalty_points || 0);
          const level = impactLevel(points, maximum);
          return (
            <div key={`${row.category || "category"}-${index}`} className="border-t border-white/8 pt-2 first:border-t-0 first:pt-0">
              <div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-center">
                <span className="text-[11px] text-white/75">{row.display_name || row.category || "Control check"}</span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/55">
                  <span className={`border px-1.5 py-0.5 ${impactTone(level)}`}>{level} impact</span>
                  <span>{row.status || "--"}</span>
                  <span>{row.credit_points ? "+" : "-"}{points.toFixed(1)} {row.credit_points ? "credit" : "penalty"} points{maximumPoints > 0 && !row.credit_points ? ` (max ${maximumPoints.toFixed(1)})` : ""}</span>
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-4 text-white/50">{semanticExplanation(row.status)}</p>
              <p className="mt-0.5 text-[10px] leading-4 text-yellow-100/55">{confidenceMeaning(row.confidence)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function XaiTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="pointer-events-none rounded-lg border border-white/15 bg-[#101816] px-3 py-2 shadow-xl">
      <p className="text-[11px] font-semibold text-white/90">{row?.full || row?.name || "Factor"}</p>
      <p className="mt-1 font-mono text-[10px] text-white/65">{formatContribution(value)}</p>
      <p className="mt-1 text-[10px] text-white/50">
        {value >= 0 ? "Supports the compliance score" : "Raises compliance exposure"} · {row?.level} impact
      </p>
    </div>
  );
}

function riskTone(risk?: string) {
  const r = (risk || "").toUpperCase();
  if (r === "HIGH") return "text-rose-300 border-rose-400/30 bg-rose-500/10";
  if (r === "MEDIUM") return "text-amber-300 border-amber-400/30 bg-amber-500/10";
  return "text-emerald-300 border-emerald-400/30 bg-emerald-500/10";
}

function toChartRows(features: XaiFeature[] | undefined, valueKey: "weight" | "shap_value") {
  const selected = (features || []).slice(0, 6);
  const maximum = Math.max(...selected.map((item) => Math.abs(Number(item[valueKey] ?? 0))), 0);
  return selected
    .slice(0, 6)
    .map((item) => {
      const value = Number(item[valueKey] ?? 0);
      const label = item.label || item.feature || "feature";
      return {
        name: label,
        full: label,
        value,
        active: !!item.active,
        level: impactLevel(value, maximum),
        fill: chartColor(value),
      };
    })
    .reverse();
}

export function ExplainabilityPanel({
  xai,
  compact = false,
}: {
  xai?: XaiPayload | null;
  compact?: boolean;
}) {
  // The old xai payload is a rule-engine surrogate. It is retained for API and
  // historical report compatibility, but it must not be presented as SHAP for
  // the ML model. The ML Risk Prediction panel is the user-facing explanation.
  if (
    !xai ||
    xai.method === "hybrid_surrogate_shap_lime" ||
    (!xai.shap?.features?.length && !xai.lime?.features?.length)
  ) {
    return null;
  }

  const shapRows = toChartRows(xai.shap?.features, "shap_value");
  const drivers = xai.top_drivers || [];
  const semanticRows = xai.semantic_evaluation || [];
  const driverRows = shapRows.slice().reverse();
  const comparison = scoreComparison(xai.observed_score, xai.baseline_score);
  const [showCalculation, setShowCalculation] = useState(false);

  if (compact) {
    return (
      <div className="border border-white/10 bg-[#2a2a2a] p-4 space-y-3 rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-accent" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Why this score</p>
              <p className="text-xs text-white/55">Surrogate SHAP drivers of the rule-engine score</p>
            </div>
          </div>
          <div className={`border px-3 py-1.5 text-right ${riskTone(xai.observed_risk)}`}>
            <span className="block text-[9px] font-semibold uppercase tracking-wider opacity-70">Final score</span>
            <span className="block text-lg font-black leading-5">{xai.observed_score ?? "--"}<span className="ml-1 text-[9px] font-semibold">/100</span></span>
          </div>
        </div>
        {comparison && (
          <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] text-white/60">
            <div className="flex items-start justify-between gap-2">
              <span>Score <span className="font-semibold text-white">{comparison.score}</span> vs calibrated global baseline <span className="font-semibold text-white">{comparison.baseline}</span>: <span className={comparison.delta >= 0 ? "text-emerald-300" : "text-rose-300"}>{comparison.delta >= 0 ? "+" : ""}{comparison.relative.toFixed(1)}% {comparison.delta >= 0 ? "above" : "below"} the global average</span>.</span>
              <button type="button" title="Show score calculation" aria-label="Show score calculation" onClick={() => setShowCalculation((visible) => !visible)} className="shrink-0 rounded-full border border-green-400/30 p-1 text-green-200 hover:bg-green-400/10">
                <Info className="h-3 w-3" />
              </button>
            </div>
            <span className="mt-1 block text-[10px] text-white/35">The baseline is the average reference produced from predefined baseline workflows.</span>
            {showCalculation && <ScoreCalculation calculation={xai.score_calculation} xai={xai} />}
          </div>
        )}

        <div className="space-y-1.5">
          {driverRows.slice(0, 4).map((row, index) => {
            const up = row.value >= 0;
            return (
              <div key={`${row.full}-${index}`} className="flex gap-2 items-start border border-white/5 px-2.5 py-2">
                {up ? (
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                ) : (
                  <ArrowDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
                )}
                <div className="min-w-0 text-xs leading-5 text-white/70">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${impactTone(row.level)}`}>
                      {row.level} impact
                    </span>
                    <span className="text-white/85">{row.full}</span>
                  </div>
                  <p className="mt-0.5 text-white/50">
                    {driverExplanation(row.full, row.value, drivers)}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-white/35">Contribution: {formatContribution(row.value)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-y border-white/5 py-2 text-[10px] uppercase tracking-wider text-white/45">
          <span>Impact level</span>
          {(["LOW", "MEDIUM", "HIGH"] as ImpactLevel[]).map((level) => (
            <span key={level} className={`border px-1.5 py-0.5 ${impactTone(level)}`}>{level}</span>
          ))}
          <span className="normal-case tracking-normal text-white/30">Relative importance among these factors</span>
        </div>

        <div className="h-56 border border-white/5 bg-black/20 p-3">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
            <BarChart data={shapRows} layout="vertical" margin={{ left: 4, right: 36, top: 8, bottom: 8 }} barCategoryGap="28%">
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.35)" />
              <YAxis
                type="category"
                dataKey="name"
                width={168}
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} offset={18} wrapperStyle={{ outline: "none", zIndex: 50 }} content={<XaiTooltip />} />
              <Bar dataKey="value" radius={[3, 3, 3, 3]} barSize={16}>
                {shapRows.map((row) => (
                  <Cell key={row.name} fill={row.fill} />
                ))}
                <LabelList dataKey="value" position="right" formatter={formatChartValue} fill="rgba(255,255,255,0.7)" fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[10px] leading-4 text-white/35">
          Bars show direct contributions to the 0-100 compliance score, not ratings out of 5 or 10 and not confidence. The separate ML Risk Prediction panel shows probability-space SHAP for HIGH-risk probability.
        </p>
        <SemanticMLSection rows={semanticRows} />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 bg-[#0c1211] p-6 md:p-8 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-accent" />
          <div>
            <h3 className="text-sm font-semibold text-white">Explainable AI</h3>
            <p className="text-xs text-white/45">
              Surrogate SHAP/LIME drivers behind the hybrid rule-engine score (does not explain the ML risk model)
            </p>
          </div>
        </div>
        <div className={`border px-4 py-2 text-right ${riskTone(xai.observed_risk)}`}>
          <span className="block text-[9px] font-semibold uppercase tracking-wider opacity-70">Final score</span>
          <span className="block text-2xl font-black leading-6">{xai.observed_score ?? "--"}<span className="ml-1 text-[10px] font-semibold">/100</span></span>
        </div>
      </div>
      {comparison && (
        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
          <div className="flex items-start justify-between gap-2">
            <span>Score <span className="font-semibold text-white">{comparison.score}</span> vs calibrated global baseline <span className="font-semibold text-white">{comparison.baseline}</span>: <span className={comparison.delta >= 0 ? "text-emerald-300" : "text-rose-300"}>{comparison.delta >= 0 ? "+" : ""}{comparison.relative.toFixed(1)}% {comparison.delta >= 0 ? "above" : "below"} the global average</span>.</span>
            <button type="button" title="Show score calculation" aria-label="Show score calculation" onClick={() => setShowCalculation((visible) => !visible)} className="shrink-0 rounded-full border border-green-400/30 p-1.5 text-green-200 hover:bg-green-400/10">
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="mt-1 block text-[10px] text-white/35">The baseline is the average reference produced from predefined baseline workflows.</span>
          {showCalculation && <ScoreCalculation calculation={xai.score_calculation} xai={xai} />}
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        {driverRows.slice(0, 6).map((row, index) => (
          <div key={`${row.full}-${index}`} className="border border-white/8 bg-white/[0.02] px-4 py-3 text-sm leading-6 text-white/70">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${impactTone(row.level)}`}>
                {row.level} impact
              </span>
              <span className="text-white/90">{row.full}</span>
            </div>
            <p className="mt-1 text-xs text-white/50">
              {driverExplanation(row.full, row.value, drivers)}
            </p>
            <p className="mt-1 font-mono text-[10px] text-white/35">Contribution: {formatContribution(row.value)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-y border-white/5 py-2 text-[10px] uppercase tracking-wider text-white/45">
        <span>Impact level</span>
        {(["LOW", "MEDIUM", "HIGH"] as ImpactLevel[]).map((level) => (
          <span key={level} className={`border px-1.5 py-0.5 ${impactTone(level)}`}>{level}</span>
        ))}
        <span className="normal-case tracking-normal text-white/30">Relative importance among these factors</span>
      </div>

      <div className="h-96 border border-white/8 bg-[#0b1211] p-4">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
          <BarChart data={shapRows} layout="vertical" margin={{ left: 8, right: 46, top: 10, bottom: 10 }} barCategoryGap="30%">
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }} />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.35)" />
            <YAxis type="category" dataKey="name" width={190} tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }} />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} offset={18} wrapperStyle={{ outline: "none", zIndex: 50 }} content={<XaiTooltip />} />
            <Bar dataKey="value" radius={[3, 3, 3, 3]} barSize={18}>
              {shapRows.map((row) => (
                <Cell key={row.name} fill={row.fill} />
              ))}
              <LabelList dataKey="value" position="right" formatter={formatChartValue} fill="rgba(255,255,255,0.75)" fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SemanticMLSection rows={semanticRows} />

      <details className="group">
        <summary className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40 hover:text-white/70">
          Technical notes &amp; units
        </summary>
        <div className="mt-2 space-y-1.5 border-l border-white/10 pl-3">
          {(xai.notes || []).map((note) => (
            <p key={note} className="text-[11px] leading-5 text-white/50">
              {note}
            </p>
          ))}
          <p className="text-[11px] leading-5 text-white/50">
            These attributions describe the hybrid rule-engine score. They are not probabilities or model confidence; the ML model's probability-SHAP is shown separately.
          </p>
        </div>
      </details>
    </motion.section>
  );
}
