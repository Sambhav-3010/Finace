# Finace Frontend

Next.js 15 UI for the Finace compliance platform (landing + dashboard).

## Stack

- Next.js App Router, Tailwind, Framer Motion, Recharts  
- **Redux Toolkit** (`auth`, `reports`)  
- Auth cookies: `finace_token`, `finace_user`  
- API base: `NEXT_PUBLIC_API_BASE_URL` → Node gateway (`/api/v1`)

## Main routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing (auth-aware nav) |
| `/login` | Company / evaluator sign-in |
| `/dashboard/workflow` | Compliance Studio (chat + SHAP + recents) |
| `/dashboard/evaluator` | Evaluator console |
| Report detail pages | Health header + explainability panel |

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Requires Node API (`:5000`) and Python RAG (`:8000`) for full chat/analysis.

## Notes

- Compliance Studio sends **full conversation context** on every follow-up.  
- Chat sessions persist via `/api/v1/chats` (sidebar Recents).  
- XAI UI: `components/reports/ExplainabilityPanel.tsx`.  
- **Analyze** tab: `components/reports/AnalyzeTrustDashboard.tsx` — trust index + charts from session scores/XAI.

See repo root [SESSION_HISTORY.md](../SESSION_HISTORY.md) for the full system reference.
