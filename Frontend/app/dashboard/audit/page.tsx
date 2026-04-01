import { auditTimeline } from "@/lib/data";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-[1.8rem] p-6">
        <p className="text-sm text-accent">Auditor Interface</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Verification and traceability</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
          This screen holds the audit timeline, blockchain proof references, and reviewer actions.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass rounded-[1.8rem] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Audit History</p>
          <div className="mt-6 space-y-4">
            {auditTimeline.map((entry, index) => (
              <div key={entry} className="flex gap-4 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-ink">
                  {index + 1}
                </div>
                <div>
                  <p className="text-base text-white/85">{entry}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/40">
                    Hash anchored and timestamped
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="glass rounded-[1.8rem] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Proof Details</p>
            <div className="mt-5 space-y-4">
              {[
                ["Transaction Ref", "0x89c4...f23b"],
                ["Storage Ref", "ipfs://Qm-example-proof"],
                ["Reviewer", "Pending external auditor"],
                ["Certificate State", "Ready to export"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
                  <p className="mt-2 text-sm text-white/80">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-accent/20 bg-accent/10 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Auditor Action</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Awaiting final validation</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              The final version can support approve, reject, and comment actions from authorized
              reviewers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink">
                Approve
              </button>
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
