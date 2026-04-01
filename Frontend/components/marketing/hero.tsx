import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-10">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0f0f] px-6 py-10 shadow-glow sm:px-10 lg:px-14 lg:py-16">
          <div className="absolute inset-0 grid-lines opacity-20" />
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute right-0 top-8 h-80 w-80 rounded-full bg-emerald/20 blur-3xl" />
          <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="section-label">Autonomous Compliance Engine</span>
              <h1 className="headline mt-6 max-w-3xl">
                Compliance intelligence for fintech and crypto startups.
              </h1>
              <p className="subcopy mt-6">
                Track regulations, analyze product workflows, explain legal risks, and preserve
                audit-ready proofs through a premium interface designed for trust.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/dashboard" label="View Dashboard" />
                <Button href="#capabilities" label="Explore Features" variant="secondary" />
              </div>
              <div className="mt-16 grid gap-6 text-sm text-white/60 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-semibold text-white">RBI</p>
                  <p>Policy tracking and clause search</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">FATF</p>
                  <p>Travel rule and AML review</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">IPFS + Chain</p>
                  <p>Immutable audit references</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="mx-auto max-w-md rounded-[2rem] border border-white/12 bg-white/[0.04] p-5 shadow-glow backdrop-blur-xl">
                <div className="rounded-[1.7rem] border border-white/12 bg-[#060909] p-4">
                  <div className="mb-4 flex items-center justify-between text-xs text-white/50">
                    <span>Risk Snapshot</span>
                    <span>Live Analysis</span>
                  </div>
                  <div className="rounded-[1.2rem] bg-gradient-to-br from-[#16362f] via-[#0e1716] to-[#0a1010] p-5">
                    <p className="text-sm text-accent">Compliance score</p>
                    <p className="mt-2 text-5xl font-semibold text-white">87%</p>
                    <div className="mt-6 grid gap-3">
                      {[
                        "Workflow: Wallet onboarding",
                        "Severity: 1 high-risk issue",
                        "Evidence: 4 clauses linked",
                        "Proof: Hash generated",
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3 text-sm text-white/75"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="dot-fade absolute -bottom-12 -left-10 h-40 w-48 opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
