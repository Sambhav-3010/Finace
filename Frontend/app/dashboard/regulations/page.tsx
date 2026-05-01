"use client";

import { useState, useEffect } from "react";
import { regulationsApi } from "@/services/api";
import { Search, BookOpen, Database, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegulationsPage() {
  const [query, setQuery] = useState("");
  const [regulations, setRegulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const fetchRegs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: any = await regulationsApi.search(query);
        setRegulations(response.data || []);
      } catch (err: any) {
        console.error("Regulation search failed:", err);
        setError("Regulatory database connection is currently unavailable.");
        setRegulations([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRegs();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="glass rounded-[1.8rem] p-6">
        <p className="text-sm text-accent flex items-center gap-2"><BookOpen className="w-4 h-4"/> Regulation Explorer</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Source Updates & Versions</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
          Search across live regulatory databases. The Autonomous Compliance Engine automatically parses these texts for compliance checks.
        </p>

        <div className="mt-8 relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
            placeholder="Search regulations e.g. 'KYC', 'RBI', 'Payment'"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="glass rounded-[1.7rem] p-10 flex flex-col items-center justify-center text-white/50">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
            <p>Querying regulatory vector database...</p>
          </div>
        ) : error || regulations.length === 0 ? (
          <div className="glass rounded-[1.7rem] p-12 text-center flex flex-col items-center border border-white/5 bg-black/20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Database className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Regulatory Data Found</h3>
            <p className="text-white/50 max-w-md">
              {error || "Your search did not match any regulations in the connected database."}
            </p>
            {error && (
              <p className="mt-4 text-xs font-mono text-rose-400 bg-rose-400/10 px-3 py-1 rounded-md">
                API Endpoint Missing: GET /api/v1/regulations/search
              </p>
            )}
          </div>
        ) : (
          regulations.map((item) => (
            <motion.article 
              layout
              key={item.id || item.title} 
              className="glass rounded-[1.7rem] overflow-hidden"
            >
              <div 
                className="p-6 cursor-pointer hover:bg-white/[0.02] transition"
                onClick={() => setExpandedId(expandedId === item.title ? null : item.title)}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/60">
                    {item.authority}
                  </span>
                  <span className="text-xs text-white/45 bg-black/20 px-2 py-1 rounded-md">{item.version}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
              </div>

              <AnimatePresence>
                {expandedId === item.title && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="border-t border-white/10 pt-4 mt-2">
                      <p className="text-sm uppercase tracking-wider text-accent/60 mb-2 font-medium">Simplified Explanation</p>
                      <p className="text-sm leading-7 text-white/80">{item.summary}</p>
                      
                      <div className="mt-6 flex flex-wrap gap-2">
                        {["Effective now", "Indexed in Vector DB", "Tracked for Risks"].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
}
