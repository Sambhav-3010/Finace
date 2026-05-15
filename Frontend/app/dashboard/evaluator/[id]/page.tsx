"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reportsApi } from "@/services/api";
import { ShieldAlert, RefreshCw, Fingerprint, ChevronLeft, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/appStore";

import { StatusTimeline } from "@/components/reports/StatusTimeline";
import { ReviewConsole } from "@/components/reports/ReviewConsole";
import { OnChainEvidence } from "@/components/reports/OnChainEvidence";
import { ReportHealthHeader } from "@/components/reports/ReportHealthHeader";
import { ReportDetails } from "@/components/reports/ReportDetails";

export default function ReportReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAppStore();
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
    <div className="space-y-6 max-w-7xl pb-20">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/evaluator" className="p-2 rounded-full hover:bg-white/5 text-white/60 transition">
            <ChevronLeft className="w-5 h-5" />
          </Link>
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

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">

          {report.status === "pending" && user?.role === "evaluator" && (
            <ReviewConsole 
              remarks={remarks} 
              setRemarks={setRemarks} 
              submitting={submitting} 
              actionType={actionType} 
              handleReview={handleReview} 
            />
          )}

          <OnChainEvidence report={report} />

          {/* Evaluator Remarks (non-pending, not finalized) */}
          {report.status !== "pending" && !isFinalized && report.evaluator_remarks && (
            <div className="glass rounded-[2rem] p-6 border-white/5 italic text-white/50 text-sm">
              &quot;{report.evaluator_remarks}&quot;
            </div>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[2rem] p-6 border-white/10"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-6">Report Lifecycle</h3>
          <StatusTimeline report={report} />

          {/* Evaluator remarks inline below the stepper */}
          {report.status !== "pending" && report.evaluator_remarks && (
            <div className="mt-5 pt-5 border-t border-white/5 italic text-white/50 text-sm">
              &quot;{report.evaluator_remarks}&quot;
            </div>
          )}
        </motion.div>

        <ReportHealthHeader report={report} />
        <ReportDetails report={report} />

      </div>
    </div>
  );
}