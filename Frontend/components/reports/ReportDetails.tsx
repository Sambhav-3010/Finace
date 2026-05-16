import { Info, ShieldAlert, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export function ReportDetails({ report }: { report: any }) {
  return (
    <>
      {/* Row 2: Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass rounded-[2rem] p-8 border-white/10"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Executive Summary</h3>
        </div>
        <div 
          className="text-white/80 leading-relaxed text-base prose-custom"
          dangerouslySetInnerHTML={{ __html: report.explanation }} 
        />
      </motion.div>

      {/* Row 3: Risk Flags + Recommendations side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Flags */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="glass rounded-[2rem] p-6 border-white/10 flex flex-col min-h-[220px]"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Risk Flags</h3>
          </div>
          <ul className="space-y-3 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(report.risk_flags || []).map((flag: string, i: number) => (
              <li key={i} className="flex gap-3 items-start text-sm text-white/70 leading-6">
                <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-rose-400 mt-2.5" />
                <span>{flag}</span>
              </li>
            ))}
            {(!report.risk_flags || report.risk_flags.length === 0) && (
              <p className="text-white/30 text-sm italic">No risk flags detected.</p>
            )}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass rounded-[2rem] p-6 border-white/10 flex flex-col min-h-[220px]"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Recommendations</h3>
          </div>
          <ul className="space-y-3 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(report.recommendations || []).map((rec: string, i: number) => (
              <li key={i} className="flex gap-3 items-start text-sm text-white/70 leading-6">
                <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Row 4: Legal Citations — full width */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="glass rounded-[2rem] p-8 border-white/10"
      >
        <div className="flex items-center gap-2 mb-7">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Legal Citations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {(report.applicable_clauses || []).map((clause: any, i: number) => {
            const backendBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");
            
            const source = clause.source || "";
            // A source is considered a document link if it's not a generic placeholder
            // and it either ends with .pdf OR it looks like a slug (has hyphens/underscores and no spaces)
            const isGeneric = !source || source === "Regulation" || source === "N/A" || source.toLowerCase().includes("guidelines") || source.toLowerCase().includes("circular");
            const looksLikeSlug = !source.includes(" ") && (source.includes("-") || source.includes("_"));
            const isDoc = !isGeneric && (source.endsWith(".pdf") || looksLikeSlug);
            
            // The backend now handles recursive search and extension matching, so we just send the source name
            const docUrl = isDoc ? `${backendBase}/docs/${encodeURIComponent(source)}` : null;
            
            return (
              <div 
                key={i} 
                onClick={() => docUrl && window.open(docUrl, "_blank")}
                title={docUrl ? `View ${source}` : ""}
                className={`group relative border-l-2 border-accent/20 pl-5 py-3 transition-all duration-300 hover:border-accent hover:bg-white/[0.03] rounded-r-2xl ${docUrl ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-accent/60 group-hover:text-accent transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{source || "Legal Reference"}</span>
                  </div>
                  {docUrl && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-all">
                      VIEW PDF <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                <h4 className="text-white font-semibold text-sm mb-2 group-hover:text-accent transition-colors">
                  {clause.title || "Compliance Clause"}
                </h4>
                
                <div className="relative overflow-hidden transition-all duration-500 ease-in-out max-h-16 group-hover:max-h-[500px]">
                  <p className="text-xs text-white/45 leading-relaxed italic group-hover:text-white/70 transition-colors">
                    &quot;{clause.text}&quot;
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0d1413] to-transparent group-hover:opacity-0 transition-opacity duration-300" />
                </div>
              </div>
            );
          })}
          {(!report.applicable_clauses || report.applicable_clauses.length === 0) && (
            <div className="col-span-2 text-center py-10 opacity-30">
              <FileText className="w-10 h-10 mx-auto mb-2" />
              <p>No clauses linked.</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
