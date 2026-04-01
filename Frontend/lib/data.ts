export const navItems = ["Home", "Solutions", "Regulations", "Workflow", "Company"];

export const capabilities = [
  {
    title: "Live Regulatory Tracking",
    description:
      "Monitor RBI, FATF, SEBI, and policy notices in one place with visible version history.",
  },
  {
    title: "Workflow Risk Detection",
    description:
      "Submit product flows and surface likely compliance issues before launch or audit review.",
  },
  {
    title: "Explainable Compliance",
    description:
      "Every risk includes the legal clause, plain-language explanation, and why it matters.",
  },
  {
    title: "Legal Document Studio",
    description:
      "Generate first-pass Privacy Policy and Terms of Service drafts from product details.",
  },
  {
    title: "Immutable Audit Trail",
    description:
      "Record compliance checks, timestamps, and blockchain proofs for future verification.",
  },
  {
    title: "Regulator Review Layer",
    description:
      "Give auditors a separate review surface to validate AI findings and leave comments.",
  },
];

export const workflowSteps = [
  "Ingest and update regulatory sources",
  "Embed and organize the knowledge base",
  "Analyze startup workflows with RAG",
  "Explain risks with clause references",
  "Store proofs and export compliance reports",
];

export const dashboardMetrics = [
  { label: "Compliance Score", value: "87%", detail: "Stable across 3 active products" },
  { label: "Open Risks", value: "06", detail: "2 high, 1 medium, 3 low" },
  { label: "Updates This Week", value: "14", detail: "RBI and FATF notices synced" },
  { label: "Audit Proofs", value: "128", detail: "All timestamped and traceable" },
];

export const riskCards = [
  {
    level: "High",
    title: "Cross-border wallet onboarding flow",
    clause: "RBI KYC Direction 2024 / FATF Rec. 10",
    detail: "Missing enhanced due diligence steps for higher-risk user segments.",
  },
  {
    level: "Medium",
    title: "Crypto rewards campaign",
    clause: "Consumer disclosure and AML monitoring",
    detail: "Reward terms are visible, but monitoring triggers need stronger definition.",
  },
  {
    level: "Low",
    title: "Policy retention wording",
    clause: "Privacy and record retention notice",
    detail: "The current language is compliant in spirit but too vague for audit review.",
  },
];

export const regulations = [
  {
    authority: "RBI",
    title: "Digital Lending Risk Controls",
    version: "v2.4",
    summary: "Updated disclosure and borrower communication requirements.",
  },
  {
    authority: "FATF",
    title: "Virtual Asset Guidance",
    version: "v5.1",
    summary: "Travel rule and risk-based monitoring updates for VASPs.",
  },
  {
    authority: "SEBI",
    title: "Platform Governance Advisory",
    version: "v1.8",
    summary: "Operational transparency and investor communication checkpoints.",
  },
];

export const auditTimeline = [
  "Workflow submitted by Product Team",
  "RAG compliance scan completed",
  "3 risk items mapped to legal clauses",
  "Hash stored for audit verification",
  "Auditor review pending comments",
];
