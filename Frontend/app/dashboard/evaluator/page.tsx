"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";

export default function EvaluatorDashboard() {
  const { reports, isLoading, fetchReports } = useAppStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      <div className="glass rounded-[1.8rem] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Evaluator Console</h2>
            <p className="mt-2 text-sm text-white/60">
              Review and approve AI-generated compliance reports before finalizing.
            </p>
          </div>
        </div>
      </div>

      <div className="glass rounded-[1.8rem] p-6">
        <h3 className="text-lg font-medium text-white mb-4">Pending Reviews</h3>
        
        {isLoading ? (
          <p className="text-white/50">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-white/50">No reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="border-b border-white/10 text-xs uppercase text-white/50">
                <tr>
                  <th className="py-3 pr-4 font-medium">Report ID</th>
                  <th className="py-3 px-4 font-medium">Risk Level</th>
                  <th className="py-3 px-4 font-medium">Score</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 pl-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((report) => (
                  <tr key={report.report_id} className="transition hover:bg-white/[0.02]">
                    <td className="py-4 pr-4 font-mono text-xs">{report.report_id}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        report.risk_level === "HIGH" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        report.risk_level === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}>
                        {report.risk_level}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">{report.compliance_score ?? "--"} / 100</td>
                    <td className="py-4 px-4 capitalize text-white/60">{report.status}</td>
                    <td className="py-4 pl-4 text-right">
                      <Link 
                        href={`/dashboard/evaluator/${report.report_id}`}
                        className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                      >
                        Review
                      </Link>
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
