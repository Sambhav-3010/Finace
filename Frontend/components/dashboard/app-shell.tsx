import { auditTimeline, dashboardMetrics, regulations, riskCards } from "@/lib/data";

export function OverviewPanel() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <div key={metric.label} className="glass rounded-[1.6rem] p-5">
            <p className="text-sm text-white/55">{metric.label}</p>
            <p className="mt-4 text-4xl font-semibold text-white">{metric.value}</p>
            <p className="mt-3 text-sm leading-6 text-white/60">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="glass rounded-[1.8rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-accent">Workflow Submission</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Cross-border wallet onboarding</h2>
              </div>
              <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
                1 High Risk
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Business Type", "Crypto wallet"],
                ["Jurisdiction", "India + UAE"],
                ["Review Mode", "Automated RAG scan"],
                ["Latest Sync", "Today, 10:42 AM"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
                  <p className="mt-3 text-base text-white/85">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[1.8rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-accent">Risk Results</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Explainable findings</h2>
              </div>
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">
                Export Report
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {riskCards.map((risk) => (
                <div key={risk.title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{risk.title}</h3>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
                      {risk.level}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-accent">{risk.clause}</p>
                  <p className="mt-4 text-sm leading-7 text-white/65">{risk.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-[1.8rem] p-6">
            <p className="text-sm text-accent">Regulation Explorer</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Tracked updates</h2>
            <div className="mt-5 space-y-4">
              {regulations.map((item) => (
                <div key={item.title} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/55">
                      {item.authority}
                    </span>
                    <span className="text-xs text-white/45">{item.version}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/60">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[1.8rem] p-6">
            <p className="text-sm text-accent">Audit Trail</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Proof timeline</h2>
            <div className="mt-6 space-y-4">
              {auditTimeline.map((entry, index) => (
                <div key={entry} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-accent" />
                    {index < auditTimeline.length - 1 ? (
                      <div className="mt-2 h-full w-px bg-white/10" />
                    ) : null}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm text-white/80">{entry}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                      Timestamped event
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-accent/20 bg-gradient-to-br from-accent/20 via-white/[0.04] to-white/[0.02] p-6">
            <p className="text-sm text-ink/80">Document Generator</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Privacy Policy draft ready</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Product metadata and regulatory references have been merged into a first-pass
              document for review.
            </p>
            <button className="mt-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink">
              Preview Document
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
