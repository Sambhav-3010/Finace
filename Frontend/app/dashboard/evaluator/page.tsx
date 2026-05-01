"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";

type StatusFilter = "" | "pending" | "verified" | "rejected";

export default function EvaluatorDashboard() {
  const { reports, isLoading, fetchReports, user } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const filteredReports = statusFilter ? reports.filter((r) => r.status === statusFilter) : reports;
  const tabs: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="glass rounded-[1.8rem] p-6">
        <h2 className="text-2xl font-semibold text-white">Evaluator Console</h2>
        <p className="mt-2 text-sm text-white/60">Review and approve AI-generated compliance reports.</p>
        {user?.role === "evaluator" && (
          <p className="mt-1 text-xs text-accent/70">Signed in as <span className="font-semibold text-accent">{user.name}</span></p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setStatusFilter(t.value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider border transition-all ${statusFilter === t.value ? "text-accent border-accent/30 bg-white/[0.06]" : "text-white/40 border-white/5 hover:text-white/60"}`}>
            {t.label} ({t.value === "" ? reports.length : reports.filter(r => r.status === t.value).length})
          </button>
        ))}
      </div>

      <div className="glass rounded-[1.8rem] p-6">
        {isLoading ? (<p className="text-white/50">Loading reports...</p>) : filteredReports.length === 0 ? (<p className="text-white/50">No reports found.</p>) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="border-b border-white/10 text-xs uppercase text-white/50">
                <tr>
                  <th className="py-3 pr-4 font-medium">Report ID</th>
                  <th className="py-3 px-4 font-medium">Risk</th>
                  <th className="py-3 px-4 font-medium">Score</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 pl-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.map((report: any) => (
                  <tr key={report.report_id} className="transition hover:bg-white/[0.02]">
                    <td className="py-4 pr-4 font-mono text-xs">{report.report_id}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${report.risk_level === "HIGH" ? "bg-red-500/10 text-red-400 border-red-500/20" : report.risk_level === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>{report.risk_level}</span>
                    </td>
                    <td className="py-4 px-4 font-medium">{report.compliance_score ?? "--"}/100</td>
                    <td className="py-4 px-4 capitalize text-white/60">{report.status}</td>
                    <td className="py-4 pl-4 text-right">
                      <Link href={`/dashboard/evaluator/${report.report_id}`} className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-white/20">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
