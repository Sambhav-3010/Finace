# Finace — AI-Powered Compliance Engine

An autonomous compliance decision engine that uses RAG (Retrieval-Augmented Generation) to interpret fintech regulations, detect compliance risks, generate audit-ready reports, explain scores with SHAP/LIME, anchor cryptographic proofs to the blockchain, and produce **digitally signed PDFs** with persisted trust analytics.

## Architecture

| Layer | Tech |
|-------|------|
| Frontend | Next.js + Tailwind + Framer Motion + **Redux Toolkit** |
| Node API | Express (gateway, JWT, chat history, report lifecycle) |
| Python RAG | FastAPI + sentence-transformers + **Gemini 2.5 Flash** |
| Database | **MongoDB Atlas** (`compliance_engine`) |
| Vector Store | MongoDB Atlas Vector Search |
| XAI | SHAP + LIME over a local surrogate of rules/controls/retrieval |
| Trust analytics | Per-chat `trust_stats` + Analyze dashboard charts |
| Storage | IPFS (Pinata) |
| Blockchain | Solidity / Hardhat — **Base Sepolia** |

## Quick Start

See [setup.md](./setup.md) for full instructions.

```bash
# 1. Python RAG service
cd python-rag && python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.app:app --host 127.0.0.1 --port 8000 --reload

# 2. Node API gateway
cd backend && npm install && npm run dev

# 3. Frontend
cd Frontend && npm install && npm run dev
```

## Analyze tab (model trust)

In Compliance Studio, switch **Chat → Analyze** to open the trust dashboard. It charts this session’s compliance scores, risk mix, SHAP drivers, control coverage, retrieval strength, and a composite **trust index** (evidence + fidelity + controls + XAI transparency + progress). Built for demos / faculty review that the hybrid AI path is explainable and trustworthy — not a black box.

**Trust stats are persisted** on each `chat_sessions` document (`trust_stats`) and snapshotted onto reports when you click **Generate report**.

## Report lifecycle (signed PDF + on-chain)

1. **Chat** — multi-turn compliance analysis with XAI per turn  
2. **Analyze** — trust charts from session data (also stored in DB)  
3. **Generate report** — creates a `reports` record linked via `chat_id`, including `trust_stats` + conversation snapshots  
4. **Evaluator verifies** — PDF is generated with trust analytics section + **digitally signed** (SHA-256 certificate page)  
5. **Generate proof** — signed PDF uploaded to IPFS; **PDF SHA-256 hash** anchored on Base Sepolia  
6. **Download anytime** — `GET /api/v1/reports/:id/pdf` after verification (also via evaluator UI)

## What is SHAP here?

**SHAP** (SHapley Additive exPlanations) attributes a model prediction to input features using game-theory Shapley values. In Finace, the hybrid engine (rules + RAG + LLM) produces a compliance score. We fit a **local linear surrogate** over interpretable features (triggered rules, KYC/AML/FEMA controls, retrieval strength, etc.), then use SHAP to show which features pushed the score up or down. That powers the “Why this score” panel (drivers + bar chart) in Compliance Studio.

LIME is computed alongside SHAP as a second local explanation for the same surrogate.

## Project structure (refactored)

| Area | Layout |
|------|--------|
| Frontend workflow | `lib/workflow/`, `hooks/useWorkflowChat.ts`, `components/workflow/` |
| Trust analytics | `lib/trust/`, `components/reports/analyze/` |
| Backend reports | `controllers/reportController.js`, `utils/`, thin `routes/` |
| Python PDF | `reports/sections/`, `reports/pdf_styles.py` |
| Python XAI | `xai/explainer.py` (+ feature helpers) |

Files are kept under ~300 lines each for maintainability.

## Project Status

Core pipeline, XAI, Atlas, Base Sepolia, chat history, Redux auth, Analyze trust dashboard, signed PDF reports, and on-chain hash anchoring are in place.

- Full session reference: [SESSION_HISTORY.md](./SESSION_HISTORY.md)
- Roadmap checklist: [rag_implementation_roadmap.md](./rag_implementation_roadmap.md)
- Setup: [setup.md](./setup.md)

## Deployed Contract

- Network: Base Sepolia (84532)
- Address: `0xF1FB4e26CdeF0927dD8AC9e6633fFdFe42EFc150`
