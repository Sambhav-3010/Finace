import { motion } from "framer-motion";
import { ShieldAlert, User as UserIcon } from "lucide-react";
import { AnalysisResultStack } from "@/components/analysis/AnalysisResultStack";
import type { WorkflowMessage } from "@/lib/workflow/types";

function formatMessageHtml(content: string) {
  return content
    .replace(/<h[1-6]>/gi, "<br/><br/><strong class='text-accent uppercase tracking-wider block mb-2 text-[12px]'>")
    .replace(/<\/h[1-6]>/gi, "</strong>")
    .replace(/<p>/gi, "<div class='mb-2'>")
    .replace(/<\/p>/gi, "</div>");
}

interface Props {
  messages: WorkflowMessage[];
  loading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function WorkflowMessageList({ messages, loading, scrollRef }: Props) {
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-3 pb-4 pt-16"
      style={{ scrollbarWidth: "thin" }}
    >
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {messages.map((m, i) => (
          <motion.div
            key={`${m.role}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
          >
            {m.role === "ai" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15">
                <ShieldAlert className="h-3.5 w-3.5 text-accent" />
              </div>
            )}
            <div className={`max-w-[92%] space-y-3 ${m.role === "user" ? "" : "min-w-0 flex-1"}`}>
              {m.role === "user" ? (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.06] backdrop-blur-sm px-4 py-3 text-[15px] leading-7 text-white/90">
                  <div dangerouslySetInnerHTML={{ __html: formatMessageHtml(m.content) }} />
                </div>
              ) : (
                <AnalysisResultStack
                  compact
                  riskLevel={m.data?.risk_level}
                  complianceScore={m.data?.compliance_score}
                  riskFlags={m.data?.risk_flags}
                  ruleAssessments={m.data?.rule_assessments}
                  evidenceScope={m.data?.evidence_scope}
                  sources={m.sources}
                  recommendations={
                    m.data?.recommendations || m.data?.analysis?.recommendations || []
                  }
                  mlValidation={m.data?.ml_validation}
                  mlRisk={m.data?.ml_risk}
                  xai={m.data?.xai}
                  narrative={
                    m.content ? (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-[15px] leading-7 text-white/75">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                          Assessment narrative
                        </p>
                        <div dangerouslySetInnerHTML={{ __html: formatMessageHtml(m.content) }} />
                      </div>
                    ) : null
                  }
                />
              )}
            </div>
            {m.role === "user" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                <UserIcon className="h-3.5 w-3.5 text-white/50" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && <TypingIndicator />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15">
        <ShieldAlert className="h-3.5 w-3.5 animate-pulse text-accent" />
      </div>
      <div className="flex items-center gap-1.5 py-2">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:0.3s]" />
      </div>
    </div>
  );
}
