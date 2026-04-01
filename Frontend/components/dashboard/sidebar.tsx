import type { Route } from "next";
import Link from "next/link";

const items = [
  { href: "/dashboard" as Route, label: "Overview" },
  { href: "/dashboard/regulations" as Route, label: "Regulations" },
  { href: "/dashboard/documents" as Route, label: "Documents" },
  { href: "/dashboard/audit" as Route, label: "Audit Trail" },
];

export function DashboardSidebar() {
  return (
    <aside className="glass h-fit rounded-[1.8rem] p-5 lg:sticky lg:top-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">Workspace</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Finace Console</h2>
      <div className="mt-6 flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-white/8 px-4 py-3 text-sm text-white/70 transition hover:border-accent/30 hover:bg-white/[0.04] hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-8 rounded-[1.5rem] border border-accent/15 bg-accent/10 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Review State</p>
        <p className="mt-3 text-lg font-semibold text-white">2 audits pending</p>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Auditor comments and document exports are ready for the next backend phase.
        </p>
      </div>
    </aside>
  );
}
