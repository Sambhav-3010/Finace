import type { StudioMode } from "@/lib/workflow/types";
import { BarChart3, BrainCircuit, MessageSquare } from "lucide-react";

interface Props {
  mode: StudioMode;
  onChange: (mode: StudioMode) => void;
}

export function WorkflowModeToggle({ mode, onChange }: Props) {
  return (
    <div className="absolute left-1/2 top-3 z-10 max-w-[calc(100%-1rem)] -translate-x-1/2 overflow-x-auto rounded-full scrollbar-hide">
      <div role="tablist" aria-label="Workflow views" className="inline-flex items-center rounded-full border border-emerald-100/10 bg-[#14231c]/95 p-0.5 text-xs shadow-lg shadow-black/20 backdrop-blur-xl">
        {([
          { id: "chat", label: "Chat", icon: MessageSquare },
          { id: "analyze", label: "Analyze", icon: BarChart3 },
          { id: "ml-validation", label: "ML Validation", icon: BrainCircuit },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
              mode === tab.id
                ? "bg-accent/15 font-semibold text-[#75b99a] shadow-sm shadow-black/10"
                : "text-white/60 hover:bg-white/[0.04] hover:text-white/90"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        );})}
      </div>
    </div>
  );
}
