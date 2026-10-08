"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";

import { queryCompliance, type RagQueryResponse } from "@/services/api";
import { AnalysisResultStack } from "@/components/analysis/AnalysisResultStack";

const starterPrompt =
  "We are launching a cross-border crypto wallet for users in India and the UAE without KYC. What compliance risks should we address first?";

export function ComplianceQueryPanel() {
  const [prompt, setPrompt] = useState(starterPrompt);
  const [result, setResult] = useState<RagQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await queryCompliance({ prompt, topK: 5 });
      setResult(response);
    } catch (submitError) {
      setResult(null);
      setError(submitError instanceof Error ? submitError.message : "Unable to fetch analysis");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="glass rounded-[1.8rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-accent">Live Query Flow</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Ask · Retrieve · Explain</h2>
            <p className="mt-2 text-sm text-white/50 leading-6 max-w-lg">
              Queries run through Node → FastAPI RAG. Finace assessment remains primary; independent ML
              validation is shown separately and never overrides regulatory evidence.
            </p>
          </div>
          <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-accent">
            XAI enabled
          </span>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
            <label htmlFor="compliance-prompt" className="text-xs uppercase tracking-[0.18em] text-white/45">
              Compliance Prompt
            </label>
            <textarea
              id="compliance-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={7}
              className="mt-3 w-full resize-none rounded-[1rem] border border-white/10 bg-[#0d1414] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-accent/40"
              placeholder="Describe the product workflow, jurisdictions, and risk concerns."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Analyzing..." : "Run Compliance Query"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setPrompt(starterPrompt);
                setError(null);
              }}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset Prompt
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-[1.8rem] p-6">
          <p className="text-sm text-accent">Response Surface</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Compliance result</h2>

          {isSubmitting ? (
            <div className="mt-6 space-y-4">
              <LoadingCard />
              <LoadingCard />
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[1.4rem] border border-rose-300/20 bg-rose-400/10 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-rose-200/80">Request Failed</p>
              <p className="mt-3 text-sm leading-7 text-rose-50/85">{error}</p>
            </div>
          ) : result ? (
            <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AnalysisResultStack
                compact
                riskLevel={result.riskLevel}
                complianceScore={result.complianceScore}
                riskFlags={result.riskFlags}
                ruleAssessments={result.rule_assessments}
                evidenceScope={result.evidence_scope}
                sources={result.sources || result.citations}
                recommendations={result.recommendations}
                mlValidation={result.ml_validation}
                mlRisk={result.ml_risk}
                xai={result.xai}
                narrative={
                  result.answer ? (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm leading-7 text-white/75">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                        Assessment narrative
                      </p>
                      {result.answer}
                    </div>
                  ) : null
                }
              />
            </motion.div>
          ) : (
            <div className="mt-6 rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm leading-7 text-white/60">
                Submit a query to render the Finace assessment, regulatory evidence, and independent ML
                validation here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
      <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
      <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}
