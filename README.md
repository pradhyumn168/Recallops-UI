# RecallOps — Incident Memory Agent

> **Microsoft Hackathon 2026** | Outage Decision Support Agent powered by **Hindsight Cloud Memory**, **FastAPI**, and **Groq LLM Engine**.

RecallOps helps site reliability engineers (SREs) and incident responders resolve critical production outages faster by recalling prior incidents, confirmed root causes, resolution outcomes, proven runbooks, and dangerous historical failed mitigations.

When production is down, every minute costs trust and revenue. RecallOps provides explainable decision support—not autonomous remediation. Every operational action requires human confirmation.

---

## ⚡ Key Highlights & Principles

1. **Deterministic Outcome-Ranked Scoring**: Candidate remediations are scored across 8 deterministic dimensions (service match, symptom overlap, dependency context, deployment similarity, historical success rate, verification quality, recency, and evidence completeness).
2. **Briefing Guard (Safety Feature #1)**: Strict allowlist enforcement ensures the AI briefing cites and reasons upon **only** evidence actually recalled from Hindsight memory banks. Unrecalled IDs or invented actions are actively rejected or redacted.
3. **Failed Historical Mitigation Warnings**: Explicitly flags actions that failed in past incidents (e.g. restarting Checkout API pods during cache eviction storms) to prevent responders from repeating costly mistakes.
4. **Isolated Memory Banks**: Segregated Hindsight banks (`incidents`, `fix-outcomes`, `team`, and an unpolluted `baseline`).
5. **Groq Model Failover**: Primary `openai/gpt-oss-120b` with transparent failover to `qwen/qwen3.8-27b` on rate-limits or timeouts.
6. **Graceful Demo Mode**: Operates out-of-the-box with a local in-memory adapter and realistic seeded P1 outage telemetry when cloud credentials are not supplied.

---

## 🏗️ Canonical Architecture

```
                          ┌───────────────────────────┐
                          │ React Web UI (Vercel) /   │
                          │ Optional Electron Desktop │
                          └─────────────┬─────────────┘
                                        │ HTTP (REST)
                                        ▼
                          ┌───────────────────────────┐
                          │      FastAPI Backend      │
                          │      (services/api)       │
                          └──────┬─────────────┬──────┘
                                 │             │
                ┌────────────────┴───┐     ┌───┴────────────────┐
                │   POST /api/alerts │     │ Outcome-Ranked     │
                │   POST /chat       │     │ Scoring Engine     │
                │   POST /resolve    │     └────────────────────┘
                └────────────────┬───┘
                                 ▼
                     ┌───────────────────────┐
                     │    Briefing Guard     │
                     │  (Allowlist Sentinel) │
                     └───────┬───────┬───────┘
                             │       │
      ┌──────────────────────┴┐     ┌┴───────────────────────┐
      │ Hindsight Cloud Memory│     │    Groq LLM Engine     │
      │ ├─ incidents bank     │     │ ├─ Primary:            │
      │ ├─ fix-outcomes bank  │     │ │  openai/gpt-oss-120b │
      │ ├─ team bank          │     │ └─ Fallback:           │
      │ └─ baseline (clean)   │     │    qwen/qwen3.8-27b    │
      └───────────────────────┘     └────────────────────────┘
```

Both the React web UI and Electron desktop client call the same FastAPI backend and share the exact same API contracts. No incident reasoning logic is duplicated in the client layer.

---

## 📂 Monorepo Structure

```
recallops/
├── apps/
│   ├── web/                  # React 19 + TypeScript + Vite + Tailwind CSS + Recharts
│   │   ├── src/
│   │   │   ├── components/   # Header, DemoTourBar, Screen views
│   │   │   ├── services/     # Typed API client
│   │   │   └── types/        # Shared frontend types
│   │   └── dist/             # Production build output
│   └── desktop/              # Electron desktop application shell
│       ├── main.cjs          # Electron main process
│       └── preload.cjs       # Isolated preload script
├── services/
│   └── api/                  # Python FastAPI Backend
│       ├── app/
│       │   ├── guards/       # Briefing Guard allowlist enforcement
│       │   ├── memory/       # Hindsight Cloud & Local memory adapter
│       │   ├── models/       # Pydantic request/response schemas
│       │   ├── providers/    # Groq provider with automatic failover
│       │   ├── routes/       # /api/alerts, /incidents, /memory, /runbooks
│       │   └── scoring/      # Deterministic outcome-ranked scoring
│       └── tests/            # pytest suite (12 passed tests)
├── shared/                   # Seeded demo incidents, fixes, runbooks, schemas
│   ├── demo_data.json
│   └── types.ts
├── DESIGN.md                 # Visual design system specification (Stitch-aligned)
├── .env.example              # Environment variables template
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ (v24 recommended)
- **Python**: 3.10+ (tested on Python 3.14)

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*If keys are left empty, RecallOps automatically activates **Demo Mode** using its local in-memory memory adapter.*

### 3. Start FastAPI Backend
```bash
python -m uvicorn app.main:app --app-dir services/api --port 8000 --reload
```
API Documentation is available at `http://localhost:8000/docs`.

### 4. Start React Web Client
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. (Optional) Launch Electron Desktop App
```bash
cd apps/desktop
npm install
npm run dev
```

---

## 🧪 Running Automated Tests

Run the full pytest suite for scoring, briefing-guard allowlist validation, Groq failover, and API routes:
```bash
python -m pytest services/api/tests -v
```
All 12 unit and route integration tests pass with 100% verification.

---

## ⏱️ 3-Minute Hackathon Judge Demo Journey

Judges can complete the full incident response journey in under 3 minutes using the built-in top **Hackathon Judge Journey** guide:

1. **Step 1: Open Active P1 Alert**:
   - Inspect active incident `INC-2026-0928` (`checkout-api` latency spike to 8.4s, 18.6% 5xx errors after `v4.18.2` deployment).
   - View telemetry charts and service dependency health map.
2. **Step 2: Investigate with Memory**:
   - Click **Investigate with Memory**.
   - Watch Hindsight recall historical incident `INC-2025-0417` (92% pattern match) and verified fix outcomes.
   - The Briefing Guard validates that all cited IDs strictly match the recalled allowlist.
3. **Step 3: Inspect 92% Match (INC-2025-0417)**:
   - Navigate to **Evidence & Memory View**.
   - Review why the scoring engine matched the incident (service match, cache config deployment, eviction cascade).
4. **Step 4: Failed Mitigation Warning**:
   - Review the prominent **Critical Hazard** alert:
     > *"In INC-2025-0417, restarting Checkout API pods did NOT resolve the issue and delayed recovery by 14 minutes due to cold cache stampedes."*
5. **Step 5: Approve Safer Plan**:
   - In the **Investigation Workspace**, check off human approvals for:
     1. Roll back cache configuration release (RB-REDIS-01, 6 min MTTR).
     2. Temporarily scale Redis cluster capacity (5 min MTTR).
     3. Validate eviction rate drops to zero.
6. **Step 6: Resolve & Retain Memory**:
   - In the **Resolution Workspace**, verify normalized metrics (p95 drops to 0.22s, errors drop to 0.04%).
   - Click **Resolve Incident & Retain Memory**.
   - Observe the live memory update: `incidents` bank +1, `fix-outcomes` bank +3, runbook reliability score increases to 97%.

---

## 🔒 Security & Safety Principles

- **Decision Support Only**: RecallOps never autonomously modifies cloud infrastructure. Human confirmation is mandatory for all operational actions.
- **Strict Grounding Allowlist**: The Briefing Guard sanitizes the prompt and enforces allowlist compliance on model output, preventing hallucinated incidents or phantom runbooks.
- **Unpolluted Baseline**: The `baseline` memory bank is intentionally kept empty unless explicitly vetted by platform leadership. Generic advice is never invented.
- **Zero Frontend Credential Exposure**: All Groq and Hindsight API keys are held exclusively in the FastAPI backend service.

---

## 📄 License
MIT © 2026 RecallOps Team. Built for the Microsoft Hackathon.
