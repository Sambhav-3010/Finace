"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Copy, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AuditPage() {
  const { auditLogs, isLoading, fetchReports } = useAppStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-[1.8rem] p-6">
        <p className="text-sm text-accent flex items-center gap-2">
          <ShieldCheck className="w-4 h-4"/> Blockchain Audit Ledger
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Immutable Proofs</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
          All finalized compliance reports are hashed and anchored to the Base Sepolia blockchain for cryptographic traceability.
        </p>
      </div>

      <div className="glass rounded-[1.8rem] p-6">
        <h3 className="text-lg font-medium text-white mb-6">Anchored Reports</h3>

        {isLoading ? (
          <div className="flex items-center text-white/50"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Loading ledger...</div>
        ) : auditLogs.length === 0 ? (
          <p className="text-white/50">No blockchain proofs found yet.</p>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((report, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                key={report.report_id} 
                className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40 mb-1">Report ID</p>
                    <p className="text-sm font-mono text-white/85">{report.report_id}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                    Verified
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4 relative group">
                    <p className="text-xs uppercase tracking-[0.18em] text-accent/60 mb-2">IPFS CID</p>
                    <p className="text-sm font-mono text-white/80 truncate pr-8">{report.ipfs_cid || "Pending..."}</p>
                    {report.ipfs_cid && (
                      <button onClick={() => copyToClipboard(report.ipfs_cid)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition opacity-0 group-hover:opacity-100">
                        <Copy className="w-4 h-4"/>
                      </button>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/20 p-4 relative group">
                    <p className="text-xs uppercase tracking-[0.18em] text-accent/60 mb-2">Transaction Hash</p>
                    <p className="text-sm font-mono text-white/80 truncate pr-8">{report.tx_hash || "Pending..."}</p>
                    {report.tx_hash && (
                      <button onClick={() => copyToClipboard(report.tx_hash)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition opacity-0 group-hover:opacity-100">
                        <Copy className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                </div>

                {report.tx_hash && (
                  <div className="mt-4 flex justify-end">
                    <a 
                      href={`https://sepolia.basescan.org/tx/${report.tx_hash}`} 
                      target="_blank" rel="noreferrer"
                      className="text-xs flex items-center gap-1 text-accent hover:text-white transition"
                    >
                      View on Basescan <ExternalLink className="w-3 h-3"/>
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
