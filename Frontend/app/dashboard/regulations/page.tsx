import { regulations } from "@/lib/data";

export default function RegulationsPage() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-[1.8rem] p-6">
        <p className="text-sm text-accent">Regulation Explorer</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Source updates and versions</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
          This screen is structured for searchable regulation cards, version tracking, and plain
          summaries tied to the compliance engine.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {regulations.map((item) => (
          <article key={item.title} className="glass rounded-[1.7rem] p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/55">
                {item.authority}
              </span>
              <span className="text-xs text-white/45">{item.version}</span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-white">{item.title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/65">{item.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Effective now", "Summarized", "Linked to risks"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/55"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
