"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { LogOut, User as UserIcon } from "lucide-react";

const items = [
  { href: "/dashboard" as Route, label: "Overview" },
  { href: "/dashboard/regulations" as Route, label: "Regulations" },
  { href: "/dashboard/documents" as Route, label: "Documents" },
  { href: "/dashboard/evaluator" as Route, label: "Evaluator Console" },
  { href: "/dashboard/audit" as Route, label: "Audit Trail" },
];

export function DashboardSidebar() {
  const { reports, user, logout } = useAppStore();
  const router = useRouter();
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="glass h-fit rounded-[1.8rem] p-5 lg:sticky lg:top-6">
      {/* User Info */}
      {user && (
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/40">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

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
