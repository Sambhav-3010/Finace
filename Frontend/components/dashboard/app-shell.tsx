"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { ComplianceQueryPanel } from "@/components/dashboard/compliance-query-panel";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Activity, ShieldAlert, FileText, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function OverviewPanel() {
  const { reports, auditLogs, isLoading, error, fetchReports } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchReports();
  }, [fetchReports]);

  // Derived metrics
  const totalReports = reports.length;
  const verifiedProofs = auditLogs.length;
  
  // Calculate average score
  const avgScore = totalReports > 0 
    ? Math.round(reports.reduce((acc, curr) => acc + (curr.compliance_score || 0), 0) / totalReports)
    : 0;

  const data = [{ name: "Score", value: avgScore, fill: "rgba(var(--accent-rgb), 1)" }];

  // Calculate active risks (across all pending reports)
  let activeRisks = 0;
  let recentWorkflow = reports[0] || null;

  reports.forEach(r => {
    if (r.status !== "verified") {
      activeRisks += (r.risk_flags || []).length;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
        <p>Loading compliance data from API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-[1.8rem] p-8 border-rose-500/20 bg-rose-500/5 text-rose-200">
        <h3 className="text-lg font-semibold mb-2">API Connection Error</h3>
        <p className="text-sm opacity-80 mb-4">{error}</p>
        <button onClick={() => fetchReports()} className="px-4 py-2 bg-rose-500/20 rounded-lg text-sm hover:bg-rose-500/30 transition">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass rounded-[1.6rem] p-5 flex items-center justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-sm text-white/55 flex items-center gap-2"><Activity className="w-4 h-4 text-accent"/> Avg Compliance</p>
            <p className="mt-4 text-4xl font-semibold text-white">{avgScore}<span className="text-xl text-white/40">/100</span></p>
            <p className="mt-2 text-xs leading-6 text-white/50">Across {totalReports} reports</p>
          </div>
          <div className="w-24 h-24 absolute right-2 -bottom-2 opacity-80">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={data} startAngle={180} endAngle={0}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass rounded-[1.6rem] p-5">
          <p className="text-sm text-white/55 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-400"/> Active Risks</p>
          <p className="mt-4 text-4xl font-semibold text-white">{activeRisks}</p>
          <p className="mt-2 text-xs leading-6 text-white/60">Identified in pending workflows</p>
        </div>

        <div className="glass rounded-[1.6rem] p-5">
          <p className="text-sm text-white/55 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400"/> Total Reports</p>
          <p className="mt-4 text-4xl font-semibold text-white">{totalReports}</p>
          <p className="mt-2 text-xs leading-6 text-white/60">Generated via API</p>
        </div>

        <div className="glass rounded-[1.6rem] p-5">
          <p className="text-sm text-white/55 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Blockchain Proofs</p>
          <p className="mt-4 text-4xl font-semibold text-white">{verifiedProofs}</p>
          <p className="mt-2 text-xs leading-6 text-white/60">Anchored to Base Sepolia</p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="glass rounded-[1.8rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-accent">Latest Workflow Submission</p>
                <h2 className="mt-3 text-2xl font-semibold text-white truncate max-w-sm">
                  {recentWorkflow ? (recentWorkflow.workflow_input?.text || recentWorkflow.workflow_text || "Unnamed Workflow").substring(0, 40) + "..." : "No Workflows Yet"}
                </h2>
              </div>
              {recentWorkflow && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                  recentWorkflow.status === "verified" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {recentWorkflow.status}
                </span>
              )}
            </div>
            
            {recentWorkflow ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Report ID</p>
                  <p className="mt-3 text-sm font-mono text-white/85 truncate">{recentWorkflow.report_id}</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Target Regulator</p>
                  <p className="mt-3 text-sm text-white/85">{recentWorkflow.workflow_input?.regulator || recentWorkflow.regulator || "RBI"}</p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.2rem] border border-white/8 bg-white/[0.02] p-8 text-center flex flex-col items-center">
                <FileText className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-white/60 text-sm">No workflow scans have been submitted yet.</p>
                <Link href="/dashboard/workflow" className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent hover:text-white transition flex items-center gap-1">
                  Start New Scan <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="glass rounded-[1.8rem] p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-accent">Recent Risks</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Latest AI findings</h2>
              </div>
              {recentWorkflow && (
                <Link href={`/dashboard/evaluator/${recentWorkflow.report_id}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5 transition">
                  View Full Report
                </Link>
              )}
            </div>
            
            <div className="space-y-4">
              {!recentWorkflow || !recentWorkflow.risk_flags || recentWorkflow.risk_flags.length === 0 ? (
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.02] p-8 text-center">
                  <ShieldAlert className="w-8 h-8 text-white/20 mb-3 mx-auto" />
                  <p className="text-white/50 text-sm">No risks detected or no active reports.</p>
                </div>
              ) : (
                recentWorkflow.risk_flags.slice(0, 3).map((risk: string, i: number) => (
                  <div key={i} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                        recentWorkflow.risk_level === "HIGH" ? "bg-rose-500/20 text-rose-300" :
                        recentWorkflow.risk_level === "MEDIUM" ? "bg-amber-500/20 text-amber-300" :
                        "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {recentWorkflow.risk_level || "Unknown"}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-white/65">{risk}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-[1.8rem] p-6">
            <p className="text-sm text-accent mb-2">Audit Trail</p>
            <h2 className="text-2xl font-semibold text-white mb-6">Recent Proofs</h2>
            
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-white/40">No blockchain records found.</p>
                </div>
              ) : (
                auditLogs.slice(0, 3).map((entry, index) => (
                  <div key={entry.report_id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      {index < Math.min(auditLogs.length, 3) - 1 && (
                        <div className="mt-2 h-full w-px bg-white/10" />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className="text-sm text-white/80">Report Verified & Anchored</p>
                      <p className="mt-1 text-xs font-mono text-white/40 truncate w-48">
                        {entry.tx_hash}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {auditLogs.length > 0 && (
                <Link href="/dashboard/audit" className="text-xs font-semibold text-accent mt-2 block hover:underline">
                  View Full Ledger &rarr;
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-accent/20 bg-gradient-to-br from-accent/20 via-white/[0.04] to-white/[0.02] p-6">
            <p className="text-sm text-ink/80">Document Studio</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Generate Legal Docs</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Convert your active workflows into structured Privacy Policies and Terms of Service.
            </p>
            <Link href="/dashboard/documents" className="mt-6 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink">
              Open Studio
            </Link>
          </div>
        </div>
      </section>

      <ComplianceQueryPanel />
    </>
  );
}
