"use client";

import { FormEvent, useState } from "react";

import { queryCompliance, type RagQueryResponse } from "@/services/api";

const starterPrompt =
  "We are launching a cross-border crypto wallet for users in India and the UAE. What compliance risks should we address first?";

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
            <h2 className="mt-3 text-2xl font-semibold text-white">Frontend to Node to FastAPI</h2>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/60">
            Production wiring
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
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Frontend", "Collects the user query and sends a typed request."],
            ["Node API", "Validates input and routes the call through the gateway."],
            ["FastAPI", "Executes the Python RAG pipeline and returns structured output."],
          ].map(([label, detail]) => (
            <div key={label} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-[1.8rem] p-6">
          <p className="text-sm text-accent">Response Surface</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">RAG result summary</h2>

          {isSubmitting ? (
            <div className="mt-6 space-y-4">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[1.4rem] border border-rose-300/20 bg-rose-400/10 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-rose-200/80">Request Failed</p>
              <p className="mt-3 text-sm leading-7 text-rose-50/85">{error}</p>
            </div>
          ) : result ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
                    {result.riskLevel} Risk
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Confidence {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/78">{result.answer}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">Risk Flags</p>
                  <div className="mt-4 space-y-3">
                    {result.riskFlags.length > 0 ? (
                      result.riskFlags.slice(0, 4).map((flag) => (
                        <p key={flag} className="text-sm leading-6 text-white/72">
                          {flag}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-white/55">No explicit risk flags returned.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">Recommendations</p>
                  <div className="mt-4 space-y-3">
                    {result.recommendations.length > 0 ? (
                      result.recommendations.slice(0, 4).map((recommendation) => (
                        <p key={recommendation} className="text-sm leading-6 text-white/72">
                          {recommendation}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-white/55">No recommendations returned.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm leading-7 text-white/60">
                Submit a query to see the Node gateway call the FastAPI wrapper and render the
                structured compliance response here.
              </p>
            </div>
          )}
        </div>

        <div className="glass rounded-[1.8rem] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Citations</p>
          <div className="mt-5 space-y-4">
            {result?.citations?.length ? (
              result.citations.slice(0, 3).map((citation, index) => (
                <article key={`${citation.source}-${index}`} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                    {citation.source || "Source"}
                  </p>
                  <h3 className="mt-3 text-base font-semibold text-white">
                    {citation.title || "Applicable Clause"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">{citation.text}</p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-7 text-white/58">
                Citation cards will populate here from the RAG response.
              </p>
            )}
          </div>
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
