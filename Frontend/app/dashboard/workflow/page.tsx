"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, FileText, CheckCircle, ShieldAlert } from "lucide-react";
import { workflowApi } from "@/services/api";

export default function WorkflowInputPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [regulator, setRegulator] = useState("RBI");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = await workflowApi.analyze(description, regulator);
      
      if (data && data.report_id) {
        router.push(`/dashboard/evaluator/${data.report_id}`);
      } else {
        throw new Error("Failed to generate");
      }
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Ensure Python backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass rounded-[1.8rem] p-8">
        <h2 className="text-2xl font-semibold text-white">New Workflow Analysis</h2>
        <p className="mt-2 text-white/60 text-sm">
          Describe your fintech product or business workflow. The Autonomous Compliance Engine will map this to the relevant regulations and detect compliance risks instantly.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Target Regulator</label>
            <select 
              value={regulator}
              onChange={(e) => setRegulator(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-accent/50 outline-none transition appearance-none"
            >
              <option value="RBI">Reserve Bank of India (RBI)</option>
              <option value="NPCI">National Payments Corporation of India (NPCI)</option>
              <option value="SEBI">SEBI (Coming Soon)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">Workflow Description</label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-accent/50 outline-none transition resize-y"
              placeholder="e.g. We are building a cross-border crypto wallet that allows users in India to send funds to the UAE..."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading || description.length < 10}
              className="bg-accent text-ink px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
            >
              {loading ? (
                <>Analyzing Risks <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin ml-2"/></>
              ) : (
                <>Run Compliance Scan <ArrowRight className="w-4 h-4"/></>
              )}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[1.8rem] p-6 border-accent/20 border"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-5 h-5 text-accent"/>
            </div>
            <div>
              <p className="text-white font-medium">AI RAG Pipeline Active</p>
              <p className="text-sm text-white/50">Querying indexed regulations and extracting legal clauses...</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
