export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-[1.8rem] p-6">
        <p className="text-sm text-accent">Legal Document Studio</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Generate, preview, and export</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
          This page is the UI shell for policy generation, clause-aware editing, and final export.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-[1.8rem] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Generated Drafts</p>
          <div className="mt-5 space-y-4">
            {[
              "Privacy Policy",
              "Terms of Service",
              "AML Disclosure Addendum",
            ].map((item, index) => (
              <div key={item} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{item}</h3>
                  <span className="text-xs text-white/45">v0.{index + 2}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-white/60">
                  Drafted from workflow inputs and regulation references.
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-[#0f1917] to-[#0a0f10] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Preview</p>
          <h3 className="mt-4 text-2xl font-semibold text-white">Privacy Policy</h3>
          <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm leading-8 text-white/65">
              We collect identity, transaction, and operational data to provide regulated
              financial services, perform fraud monitoring, meet legal obligations, and maintain
              audit-ready records...
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink">
              Export PDF
            </button>
            <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">
              Open Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
