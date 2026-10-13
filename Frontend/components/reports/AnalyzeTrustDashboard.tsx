"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BrainCircuit, Info } from "lucide-react";
import type { TrustChatMessage } from "@/lib/trust/types";
import { ChartTip } from "./analyze/ChartTip";

const RISK_ORDER = ["HIGH", "MEDIUM", "LOW"] as const;
const RISK_COLORS: Record<(typeof RISK_ORDER)[number], string> = {
  HIGH: "#fb7185",
  MEDIUM: "#fbbf24",
  LOW: "#34d399",
};

function inferMostCommonRisk(counts: Record<string, number>) {
  const max = Math.max(...RISK_ORDER.map((risk) => counts[risk]));
  if (max === 0) return "No clear risk summary is available for this chat yet.";
  const leading = RISK_ORDER.filter((risk) => counts[risk] === max);
  if (leading.length > 1) {
    return `${leading.map((risk) => risk.toLowerCase()).join(" and ")} risk are tied as the most common assessment.`;
  }
  if (max === 1) return `The only assessment in this chat was labeled ${leading[0].toLowerCase()} risk.`;
  return `Most assessments in this chat were labeled ${leading[0].toLowerCase()} risk.`;
}

function RiskChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return <ChartTip><p className="text-xs font-medium text-white">{row?.label} risk</p><p className="text-xs text-white/65">{row?.count} {row?.count === 1 ? "assessment" : "assessments"}</p></ChartTip>;
}

export function AnalyzeTrustDashboard({ messages }: { messages: TrustChatMessage[] }) {
  const [showMethod, setShowMethod] = useState(false);
  const { rows, total } = useMemo(() => {
    const counts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const message of messages) {
      if (message.role !== "ai" || !message.data) continue;
      const risk = String(message.data.risk_level || "").toUpperCase();
      if (RISK_ORDER.includes(risk as (typeof RISK_ORDER)[number])) counts[risk] += 1;
    }
    return {
      rows: RISK_ORDER.map((risk) => ({ risk, label: risk[0] + risk.slice(1).toLowerCase(), count: counts[risk], fill: RISK_COLORS[risk] })),
      total: counts.HIGH + counts.MEDIUM + counts.LOW,
    };
  }, [messages]);

  const inference = inferMostCommonRisk(Object.fromEntries(rows.map((row) => [row.risk, row.count])));

  if (total === 0) {
    return <div className="flex flex-1 flex-col items-center justify-center px-6 pt-16 text-center"><BrainCircuit className="mb-4 h-10 w-10 text-accent/70" /><h2 className="text-xl font-medium text-white">No risk summary yet</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/50">Ask a question in Chat to get a compliance assessment. Its risk label will appear here.</p></div>;
  }

  return <div className="flex-1 overflow-y-auto px-3 pb-8 pt-16" style={{ scrollbarWidth: "thin" }}>
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <section className="glass rounded-[1.5rem] p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10"><BrainCircuit className="h-4 w-4 text-accent" /></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent/75">Chat overview</p><h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Risk across your assessments</h1><p className="mt-1 text-sm text-white/45">A simple count of the risk labels returned in this conversation.</p></div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-black/15 p-3 sm:p-5">
          <div className="h-[210px] sm:h-[250px]" role="img" aria-label={`Risk labels across this chat: ${rows.map((row) => `${row.label} ${row.count}`).join(", ")}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ top: 6, right: 36, bottom: 4, left: 4 }} barCategoryGap="28%">
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="label" width={78} axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 13 }} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.035)" }} content={<RiskChartTooltip />} />
                <Bar dataKey="count" name="Assessments" radius={[0, 7, 7, 0]}>
                  {rows.map((row) => <Cell key={row.risk} fill={row.fill} />)}
                  <LabelList dataKey="count" position="right" fill="rgba(255,255,255,0.78)" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.06] pt-3 text-[11px] text-white/45">
            {rows.map((row) => <span key={row.risk} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: row.fill }} />{row.label}</span>)}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-accent/15 bg-accent/[0.05] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent/75">What this suggests</p><p className="mt-1.5 text-base font-medium leading-6 text-white sm:text-lg">{inference}</p><p className="mt-1 text-xs leading-5 text-white/45">This describes the assessments in this chat; it is not a legal conclusion or a prediction of future risk.</p></div>
            <button type="button" onClick={() => setShowMethod((open) => !open)} aria-label="How this inference was made" aria-expanded={showMethod} aria-controls="analyze-inference-method" title="How this inference was made" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Info className="h-4 w-4" /></button>
          </div>
          {showMethod && <div id="analyze-inference-method" className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/55"><p className="font-semibold text-white/75">How the takeaway is made</p><p className="mt-1">The chart counts each assistant assessment whose returned risk label is High, Medium, or Low. The takeaway names the label with the largest count; if labels tie, it says they are tied. Assessments with a missing or unrecognized label are left out. This is a summary of labels returned by Finace, not an independent legal review.</p></div>}
        </div>
      </section>
    </div>
  </div>;
}
