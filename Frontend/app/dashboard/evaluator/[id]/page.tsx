"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reportsApi } from "@/services/api";
import { 
  ShieldAlert, CheckCircle2, FileText, RefreshCw, Fingerprint, ExternalLink,
  Info, ChevronLeft, Loader2, Lock, Clock, XCircle
} from "lucide-react";
import { motion } from "framer-motion";

function StatusTimeline({ report }: { report: any }) {
  const steps = [
    { label: "Created", done: true, icon: FileText, time: report.created_at },
    { label: "Under Review", done: report.status !== "pending", icon: Clock, time: null },
    { 
      label: report.status === "rejected" ? "Rejected" : "Verified", 
      done: report.status === "verified" || report.status === "rejected",
      icon: report.status === "rejected" ? XCircle : CheckCircle2,
      time: report.evaluation_metadata?.evaluated_at,
      color: report.status === "rejected" ? "rose" : "emerald",
    },
    { label: "Proof Generated", done: !!(report.ipfs_cid && report.tx_hash), icon: Fingerprint, time: null },
  ];

  return (
    <div className="glass rounded-[2rem] p-6 border-white/10">
      <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-6">Report Lifecycle</h3>
      <div className="space-y-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = step.done;
          const clr = (step as any).color || "accent";
          return (
            <div key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? `bg-${clr === "rose" ? "rose" : clr === "emerald" ? "emerald" : "accent"}-500/20 border-${clr === "rose" ? "rose" : clr === "emerald" ? "emerald" : "accent"}-500/30` : "bg-white/5 border-white/10"}`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (clr === "rose" ? "text-rose-400" : clr === "emerald" ? "text-emerald-400" : "text-accent") : "text-white/30"}`} />
                </div>
                {i < steps.length - 1 && <div className={`w-px h-6 ${isActive ? "bg-white/20" : "bg-white/5"}`} />}
              </div>
              <div className="pb-4">
                <p className={`text-sm font-medium ${isActive ? "text-white" : "text-white/30"}`}>{step.label}</p>
                {step.time && <p className="text-[10px] text-white/30 mt-0.5">{new Date(step.time).toLocaleString()}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReportReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      const data: any = await reportsApi.getById(id);
      setReport(data.report);
      setRemarks(data.report?.evaluator_remarks || "");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [id]);

  const handleReview = async (status: "verified" | "rejected") => {
    setSubmitting(true);
    setActionType(status);
    try {
      await reportsApi.submitReview(id, { status, evaluator_remarks: remarks, remarks });
      await fetchReport();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to submit review");
    } finally { setSubmitting(false); setActionType(null); }
  };

  const handleUpdate = async () => {
    setSubmitting(true); setActionType("updating");
    try {
      await reportsApi.update(id);
      await fetchReport();
      alert("Report updated against latest regulations!");
    } catch (error) { console.error(error); alert("Failed to update report"); }
    finally { setSubmitting(false); setActionType(null); }
  };

  const handleGenerateProof = async () => {
    setSubmitting(true); setActionType("proofing");
    try {
      const orgName = prompt("Enter organization name for the report:", "Acme Fintech");
      if (!orgName) { setSubmitting(false); setActionType(null); return; }
      const result: any = await reportsApi.proof(id, orgName);
      await fetchReport();
      alert(`Proof generated successfully!\nTx Hash: ${result.tx_hash}`);
    } catch (error) { console.error(error); alert("Failed to generate proof."); }
    finally { setSubmitting(false); setActionType(null); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-white/50">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" /><p>Loading report...</p>
    </div>
  );

  if (!report) return (
    <div className="glass rounded-[1.8rem] p-12 text-center border-white/10">
      <ShieldAlert className="w-12 h-12 text-white/20 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white">Report Not Found</h3>
      <p className="text-white/50 mt-2 mb-6">The requested analysis doesn&apos;t exist.</p>
      <Link href="/dashboard/evaluator" className="bg-accent text-ink px-6 py-2.5 rounded-full font-semibold">Back</Link>
    </div>
  );

  const isFinalized = report.ipfs_cid && report.tx_hash;

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/evaluator" className="p-2 rounded-full hover:bg-white/5 text-white/60 transition"><ChevronLeft className="w-5 h-5" /></Link>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Compliance Review</p>
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              Workflow Analysis {isFinalized && <span title="Anchored on-chain"><Lock className="w-4 h-4 text-emerald-400" /></span>}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleUpdate} disabled={submitting} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5 transition disabled:opacity-50">
            {actionType === "updating" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh Analysis
          </button>
          {!isFinalized && report.status === "verified" && (
            <button onClick={handleGenerateProof} disabled={submitting} className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-bold text-ink hover:bg-white transition disabled:opacity-50">
              {actionType === "proofing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />} Generate Proof
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-8 border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"><Info className="w-5 h-5 text-blue-400" /></div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">Executive Summary</h3>
            </div>
            <p className="text-white/80 leading-relaxed text-lg whitespace-pre-wrap">{report.explanation}</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-[2rem] p-6 border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20"><ShieldAlert className="w-5 h-5 text-rose-400" /></div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">Risk Flags</h3>
              </div>
              <ul className="space-y-4">
                {(report.risk_flags || []).map((flag: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70 leading-6"><span className="shrink-0 h-1.5 w-1.5 rounded-full bg-rose-400 mt-2.5" />{flag}</li>
                ))}
                {(!report.risk_flags || report.risk_flags.length === 0) && <p className="text-white/30 text-sm italic">No risk flags detected.</p>}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-[2rem] p-6 border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">Recommendations</h3>
              </div>
              <ul className="space-y-4">
                {(report.recommendations || []).map((rec: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70 leading-6"><span className="shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2.5" />{rec}</li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-[2rem] p-8 border-white/10">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20"><FileText className="w-5 h-5 text-accent" /></div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">Legal Citations</h3>
            </div>
            <div className="space-y-6">
              {(report.applicable_clauses || []).map((clause: any, i: number) => (
                <div key={i} className="border-l-2 border-accent/20 pl-6 py-1">
                  <p className="text-xs font-mono text-accent mb-2">{clause.source || "Regulation"}</p>
                  <h4 className="text-white font-semibold mb-2">{clause.title || "Untitled Clause"}</h4>
                  <p className="text-sm text-white/50 leading-relaxed italic line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">&quot;{clause.text}&quot;</p>
                </div>
              ))}
              {(!report.applicable_clauses || report.applicable_clauses.length === 0) && (
                <div className="text-center py-10 opacity-30"><FileText className="w-10 h-10 mx-auto mb-2" /><p>No clauses linked.</p></div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-[2rem] p-6 border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-6">Report Health</h3>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="block text-xs text-white/40 mb-1">Score</span>
                <span className="text-4xl font-bold text-white">{report.compliance_score ?? "--"}</span>
                <span className="text-white/40 text-sm ml-1">/ 100</span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-white/40 mb-1">Risk Level</span>
                <span className={`inline-flex rounded-full px-4 py-1 text-sm font-bold border ${report.risk_level === "HIGH" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : report.risk_level === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>{report.risk_level}</span>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between text-sm"><span className="text-white/40">Status</span><span className={`capitalize font-semibold ${report.status === "verified" ? "text-emerald-400" : report.status === "rejected" ? "text-rose-400" : "text-amber-400"}`}>{report.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">Regulator</span><span className="text-white/80">{report.workflow_input?.regulator || "RBI"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">Created</span><span className="text-white/80">{new Date(report.created_at).toLocaleDateString()}</span></div>
              {report.evaluation_metadata?.evaluator_name && (
                <div className="flex justify-between text-sm"><span className="text-white/40">Reviewed by</span><span className="text-white/80">{report.evaluation_metadata.evaluator_name}</span></div>
              )}
            </div>
          </div>

          <StatusTimeline report={report} />

          {report.status === "pending" && (
            <div className="glass rounded-[2rem] p-6 border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-6">Review Console</h3>
              <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/40 transition mb-4 min-h-[120px] placeholder:text-white/20" placeholder="Submit your expert remarks here..." value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={submitting} />
              <div className="flex gap-3">
                <button onClick={() => handleReview("verified")} disabled={submitting} className="flex-1 rounded-2xl bg-emerald-500 text-ink py-3 text-sm font-bold transition hover:bg-white disabled:opacity-50">{actionType === "verified" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Verify"}</button>
                <button onClick={() => handleReview("rejected")} disabled={submitting} className="flex-1 rounded-2xl bg-white/5 border border-white/10 py-3 text-sm font-bold text-white hover:bg-rose-500/20 hover:border-rose-500/30 transition disabled:opacity-50">{actionType === "rejected" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Reject"}</button>
              </div>
            </div>
          )}

          {isFinalized && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[2rem] p-6 border-emerald-500/20 bg-emerald-500/[0.02]">
              <div className="flex items-center gap-2 mb-6"><div className="p-1.5 rounded-lg bg-emerald-500/10"><Fingerprint className="w-4 h-4 text-emerald-400" /></div><h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">On-Chain Evidence</h3></div>
              <div className="space-y-4">
                <div><p className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">IPFS CID</p><div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5"><p className="text-[10px] font-mono text-white/60 truncate flex-1">{report.ipfs_cid}</p><a href={`https://gateway.pinata.cloud/ipfs/${report.ipfs_cid}`} target="_blank" className="text-accent hover:text-white"><ExternalLink className="w-3 h-3" /></a></div></div>
                <div><p className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Base Sepolia Proof</p><div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5"><p className="text-[10px] font-mono text-white/60 truncate flex-1">{report.tx_hash}</p><a href={`https://base-sepolia.blockscout.com/tx/${report.tx_hash}`} target="_blank" className="text-accent hover:text-white"><ExternalLink className="w-3 h-3" /></a></div></div>
                <div className="pt-2 text-center"><p className="text-[10px] text-white/30 italic">Immutable and verified by Base Sepolia validators.</p></div>
              </div>
            </motion.div>
          )}

          {report.status !== "pending" && !isFinalized && report.evaluator_remarks && (
            <div className="glass rounded-[2rem] p-6 border-white/5 italic text-white/50 text-sm">&quot;{report.evaluator_remarks}&quot;</div>
          )}
        </div>
      </div>
    </div>
  );
}
