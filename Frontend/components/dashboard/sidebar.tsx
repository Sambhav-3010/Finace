"use client";

import type { Route } from "next";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";

const items = [
  { href: "/dashboard" as Route, label: "Overview" },
  { href: "/dashboard/regulations" as Route, label: "Regulations" },
  { href: "/dashboard/documents" as Route, label: "Documents" },
  { href: "/dashboard/evaluator" as Route, label: "Evaluator Console" },
  { href: "/dashboard/audit" as Route, label: "Audit Trail" },
];

export function DashboardSidebar() {
  const { reports } = useAppStore();
  const pendingCount = reports.filter((r) => r.status === "pending").length;

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
        <p className="mt-3 text-lg font-semibold text-white">
          {pendingCount > 0 ? `${pendingCount} audit${pendingCount > 1 ? "s" : ""} pending` : "No pending audits"}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/65">
          {pendingCount > 0
            ? "Reports awaiting evaluator review."
            : "All reports have been reviewed."}
        </p>
      </div>
    </aside>
  );
}
