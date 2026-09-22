import Link from "next/link";
import { LandingBackground } from "@/components/marketing/LandingBackground";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  FileCheck2,
  FileSearch,
  Fingerprint,
  Gauge,
  GitBranch,
  MessageSquarePlus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

const stages = [
  {
    number: "01",
    icon: MessageSquarePlus,
    title: "Configure a new chat",
    text: "Start a conversation and choose what you are trying to do. General Query is for regulatory Q&A. New Compliance Report starts a formal assessment. Update Existing Report continues a remediation cycle.",
    detail: "The selected mode controls whether the Generate Report action appears later.",
    tone: "border-green-400/25 bg-green-500/[0.06] text-green-300",
  },
  {
    number: "02",
    icon: WalletCards,
    title: "Select payment topics and models",
    text: "Choose UPI, IMPS, AePS, KYC, FEMA, Crypto/VDA, or other relevant topics. Enable SHAP and Semantic ML when you want transparent score drivers and control checks.",
    detail: "Categories focus retrieval and semantic checks; they do not replace the evidence gate.",
    tone: "border-yellow-400/25 bg-yellow-500/[0.06] text-yellow-300",
  },
  {
    number: "03",
    icon: MessageSquarePlus,
    title: "Describe the workflow",
    text: "Ask a question or describe the product flow, controls, jurisdiction, customers, transactions, and incident facts. The conversation context is carried into later turns.",
    detail: "Questions can receive answers without being treated as missing implementation controls.",
    tone: "border-green-400/25 bg-green-500/[0.06] text-green-300",
  },
  {
    number: "04",
    icon: Search,
    title: "RAG retrieves evidence",
    text: "The Python RAG engine searches the indexed regulatory corpus, reranks relevant chunks, annotates applicability, and returns the source PDF path with the response.",
    detail: "Similarity finds candidate context; the evidence gate decides what can be presented as a direct legal basis.",
    tone: "border-yellow-400/25 bg-yellow-500/[0.06] text-yellow-300",
  },
  {
    number: "05",
    icon: Gauge,
    title: "The score is calculated",
    text: "The score starts from a calibrated baseline, then applies deterministic rule penalties, Semantic ML penalties or credits, and the RAG retrieval bonus. The final score blends that deterministic result with the LLM score and stays on a 0-100 scale.",
    detail: "Every response exposes the arithmetic behind the final score through the information button.",
    tone: "border-green-400/25 bg-green-500/[0.06] text-green-300",
  },
  {
    number: "06",
    icon: BrainCircuit,
    title: "SHAP and Semantic ML explain it",
    text: "SHAP shows which score factors raised or lowered the result. Semantic ML evaluates category controls as Compliant, Partial, Missing, or No Statement with confidence and justification.",
    detail: "Confidence means model certainty about the status, not percentage implementation.",
    tone: "border-red-400/25 bg-red-500/[0.06] text-red-300",
  },
  {
    number: "07",
    icon: BarChart3,
    title: "Analyze makes the journey inspectable",
    text: "The Analyze tab presents score trajectory, requirements, semantic checks, retrieval evidence, rule impact, waterfall drivers, and what-if remediation views in one place.",
    detail: "This is the comparison and investigation surface for repeated turns and score movement.",
    tone: "border-yellow-400/25 bg-yellow-500/[0.06] text-yellow-300",
  },
  {
    number: "08",
    icon: FileCheck2,
    title: "Report, evaluator, and proof",
    text: "New Compliance Report and Update Existing Report modes can generate a formal report. An evaluator reviews and amends it, verifies it, signs the final PDF, uploads it to IPFS, and anchors its hash on Base Sepolia.",
    detail: "General Query remains a Q&A flow and does not show Generate Report.",
    tone: "border-green-400/25 bg-green-500/[0.06] text-green-300",
  },
];

function SectionTitle({ icon: Icon, eyebrow, title, text }: { icon: typeof ShieldCheck; eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        <Icon className="h-4 w-4" /> {eyebrow}
      </div>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">{title}</h1>
      <p className="mt-5 text-base leading-8 text-white/60">{text}</p>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#090d0d] text-white">
      <LandingBackground />
      <div className="relative z-10">
        <header className="shell flex items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-white/90">
            <ShieldCheck className="h-5 w-5 text-accent" /> Finace
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/workflow?new=1" className="hidden rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 transition hover:border-accent/40 hover:text-white sm:inline-flex">
              Open workspace
            </Link>
            <Link href="/login" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white">
              Sign in
            </Link>
          </div>
        </header>

        <section className="shell pb-20 pt-12 lg:pb-28 lg:pt-20">
          <SectionTitle
            icon={GitBranch}
            eyebrow="Product flow"
            title="From first prompt to reviewable proof."
            text="Finace is a staged compliance workflow. Configure the conversation, retrieve regulatory evidence, calculate a calibrated score, inspect the drivers, and only then move a report into evaluator review and testnet proof storage."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: MessageSquarePlus, label: "Configure", value: "Mode + topics" },
              { icon: Search, label: "Reason", value: "RAG + rules + ML" },
              { icon: Fingerprint, label: "Prove", value: "IPFS + Base Sepolia" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-2xl p-5">
                <Icon className="h-5 w-5 text-accent" />
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
                <p className="mt-1 text-lg font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative border-y border-white/8 py-20">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.07]" aria-hidden />
          <div className="shell relative z-10">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The journey</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">What happens after you click New chat</h2>
              </div>
              <Sparkles className="hidden h-8 w-8 text-yellow-300/80 sm:block" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {stages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <article
                    key={stage.number}
                    className="glass group rounded-[1.6rem] p-6 transition hover:border-accent/25 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex shrink-0 flex-col items-center gap-3">
                        <div
                          className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-xl font-bold tracking-tight text-accent shadow-[0_0_24px_rgba(74,222,128,0.12)] transition group-hover:border-accent/50 group-hover:bg-accent group-hover:text-ink"
                        >
                          {stage.number}
                        </div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${stage.tone}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white sm:text-xl">{stage.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/60">{stage.text}</p>
                        <p className="mt-4 flex gap-2 text-xs leading-5 text-white/35"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />{stage.detail}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative shell py-20">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.05]" aria-hidden />
          <div className="relative z-10">
          <SectionTitle
            icon={Scale}
            eyebrow="Score mechanics"
            title="The final score is a 0-100 compliance measure."
            text="The score is not the LLM answer, not an ML probability, and not a rating out of five or ten. It is a calibrated engine result whose visible contributions reconcile to the final rounded value."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass rounded-2xl border-green-400/20 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-200/75">Core formula</p>
              <div className="mt-5 space-y-3 font-mono text-sm leading-7 text-white/75">
                <p>Calibrated baseline</p>
                <p className="text-red-200">- deterministic rule penalties</p>
                <p className="text-red-200">- Semantic ML penalties</p>
                <p className="text-green-200">+ compliant-control credits</p>
                <p className="text-green-200">+ RAG retrieval bonus</p>
                <div className="border-t border-white/10 pt-3 text-white">= deterministic score</div>
                <p className="pt-2 text-yellow-200">Then blend deterministic score and LLM score using the displayed weights.</p>
                <p className="text-white">= final score, rounded and clamped to 0-100</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200/75">What the explanation means</p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-white/60">
                <p><span className="font-semibold text-green-300">Positive SHAP contribution:</span> this factor supported the score.</p>
                <p><span className="font-semibold text-red-300">Negative SHAP contribution:</span> this factor increased identified exposure.</p>
                <p><span className="font-semibold text-yellow-300">Semantic confidence:</span> how certain the model is about a control status, not how much of the control is implemented.</p>
                <p><span className="font-semibold text-white">Global baseline:</span> the calibrated reference average used to compare the current workflow.</p>
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="relative border-y border-white/8 py-20">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.07]" aria-hidden />
          <div className="shell relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <BookOpen className="h-4 w-4" /> Behind the response
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">What happens inside the application</h2>
              <p className="mt-4 text-sm leading-7 text-white/60">Each response crosses several boundaries. The output from one layer becomes the input to the next, which is why the UI can show both the answer and the evidence behind it.</p>
            </div>

            <div className="mt-10 grid gap-3 lg:grid-cols-5">
              {[
                ["Browser", "Next.js workspace", "Captures mode, categories, prompt, toggles, and conversation state."],
                ["Gateway", "Node + Express", "Authenticates the request, preserves chat context, and maps the response for the UI."],
                ["RAG engine", "FastAPI + Python", "Builds the retrieval query, runs rules, calls the LLM, and returns structured analysis."],
                ["Evidence", "Mongo + embeddings", "Stores regulatory chunks, metadata, document paths, and retrieval scores."],
                ["Proof", "IPFS + Base Sepolia", "Stores the signed PDF and anchors its document hash on the testnet."],
              ].map(([label, title, text], index) => (
                <div key={label} className="glass relative rounded-2xl p-5">
                  <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 px-2 font-mono text-sm font-bold text-accent">
                    0{index + 1}
                  </span>
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-yellow-200/70">{label}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-xs leading-6 text-white/50">{text}</p>
                  {index < 4 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-accent lg:block" />}
                </div>
              ))}
            </div>

            <div className="mt-8 glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <FileSearch className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-semibold text-white">Response artifacts returned to the frontend</h3>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Answer", "The structured explanation and recommendations."],
                  ["Sources", "PDF paths, sections, excerpts, and applicability notes."],
                  ["Score data", "Baseline, breakdown, semantic checks, and final score."],
                  ["Review data", "Flags, rule assessments, evidence scope, and reasoning steps."],
                ].map(([label, text]) => (
                  <div key={label} className="border-l-2 border-green-400/40 pl-3">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-white/45">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="shell py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <Scale className="h-4 w-4" /> Evaluator lifecycle
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">The AI result is not the final record.</h2>
              <p className="mt-4 text-sm leading-7 text-white/60">The evaluator role provides the human control point between an automated assessment and an externally shareable proof.</p>
            </div>
            <div className="space-y-3">
              {[
                ["01", "Open Reports & Review", "The evaluator opens a generated report and sees the summary, score, risk level, sources, XAI, ML predictions, evidence scope, and rule impact."],
                ["02", "Amend with justification", "The evaluator can correct the score, risk level, explanation, flags, recommendations, and add a regulatory reference. Changes require a validation comment and are audited."],
                ["03", "Verify the report", "The evaluator reviews the amended record and marks it verified or rejected. Signing is only available after verification."],
                ["04", "Finalize and sign", "The system generates the final report PDF, applies the evaluator signature metadata, calculates the document hash, and marks the record signed."],
                ["05", "Upload and anchor", "The signed PDF is uploaded to IPFS. MetaMask is forced onto Base Sepolia before the report ID, IPFS CID, document hash, organization, and risk level are written to the ComplianceAudit contract."],
                ["06", "Verify later", "The Proof Ledger and report page can show the IPFS document, transaction hash, document hash, timestamp, and on-chain verifier address."],
              ].map(([number, title, text]) => (
                <div key={number} className="glass flex gap-4 rounded-2xl p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 font-mono text-base font-bold text-accent">
                    {number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-y border-white/8 py-20">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.07]" aria-hidden />
          <div className="shell relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <FileCheck2 className="h-4 w-4" /> Where to find each stage
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">Four surfaces, one continuous record.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                ["Chat", "Start the conversation, choose categories, ask the prompt, read the answer, inspect sources, and see compact SHAP/ML explanations."],
                ["Analyze", "Compare turns and score movement. Inspect retrieval strength, score trajectory, semantic controls, rule impact, waterfall contributions, and what-if changes."],
                ["Reports & Review", "Generate a formal report only from New or Update modes. Evaluators amend, cite sources, verify, sign, and prepare proof."],
                ["Proof Ledger", "Inspect finalized records and the chain-facing evidence: IPFS CID, signed PDF, document hash, Base Sepolia transaction, and verification status."],
              ].map(([title, text], index) => (
                <div key={title} className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 px-2 font-mono text-sm font-bold text-accent">
                      0{index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/8 py-16">
          <div className="shell relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Ready to trace a workflow?</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Open the workspace and follow the evidence.</h2>
            </div>
            <Link href="/dashboard/workflow?new=1" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-white">
              Start a new chat <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
