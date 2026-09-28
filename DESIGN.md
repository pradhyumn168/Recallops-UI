# RecallOps — Visual Design System & Specification (DESIGN.md)

Derived from the visual source of truth for **RecallOps — Incident Memory Agent**, tailored for mission-critical Microsoft Azure SRE & Incident Response operations.

---

## 1. Design Philosophy: Mission-Control Precision

When high-severity incidents occur, cognitive load is at maximum. Incident responders need instant clarity, unambiguous status signals, and zero visual clutter. RecallOps embodies a **Tier-1 Mission Control** aesthetic:

- **High-Density, Low-Fatigue Dark Mode**: Deep navy-black foundations with slate depth layers keep eyes focused during grueling 3 AM outages.
- **Surgical Color Encoding**:
  - **P1 Crimson (`#EF4444` / `#DC2626`)**: Reserved exclusively for active critical alerts, breached thresholds, and dangerous failed mitigations responders must avoid.
  - **Electric Cyan (`#00F2FE` / `#38BDF8`)**: Highlights AI memory recall, active agent reasoning, and cited evidence.
  - **Teal / Emerald (`#10B981` / `#14B8A6`)**: Signals verified healthy components, successful past resolutions, and stabilized telemetry.
  - **Amber (`#F59E0B` / `#FBBF24`)**: Signals degradation, human approval gates, and active investigations.
- **Monospace Telemetry Anchors**: JetBrains Mono / SF Mono for incident IDs (`INC-2026-0928`), latencies (`8.4s`), commit hashes (`v4.18.2`), and error percentages (`18.6%`).
- **Restrained Micro-Motion**: Clean state transitions and pulsing badges that never distract from operational decision-making. Supports `prefers-reduced-motion`.

---

## 2. Color Palette & Design Tokens

### Background & Surface Hierarchy
```css
--bg-root: #070B14;          /* Deepest space navy base */
--bg-surface-1: #0D1527;     /* Background for dashboard cards and sidebars */
--bg-surface-2: #131F37;     /* Hover states and secondary nested containers */
--bg-surface-3: #1A2B4C;     /* High-elevation modals, popovers, and elevated tabs */
--border-subtle: #1E2D4A;    /* Default card borders */
--border-highlight: #2A4374; /* Focused card borders */
--border-accent: #0284C7;    /* Active Cyan border */
```

### Semantic Status Colors
```css
/* P1 Incident & Failed Mitigation Hazard */
--severity-p1-bg: rgba(239, 68, 68, 0.12);
--severity-p1-border: rgba(239, 68, 68, 0.4);
--severity-p1-text: #F87171;

/* Agent Memory & AI Grounding Accent */
--accent-cyan-bg: rgba(56, 189, 248, 0.1);
--accent-cyan-border: rgba(56, 189, 248, 0.4);
--accent-cyan-text: #38BDF8;
--accent-cyan-glow: 0 0 20px rgba(56, 189, 248, 0.25);

/* Health & Verified Recovery */
--health-ok-bg: rgba(16, 185, 129, 0.12);
--health-ok-border: rgba(16, 185, 129, 0.4);
--health-ok-text: #34D399;

/* Warning & Pending Human Approval */
--warn-bg: rgba(245, 158, 11, 0.12);
--warn-border: rgba(245, 158, 11, 0.4);
--warn-text: #FBBF24;
```

---

## 3. Typography Hierarchy

- **System UI Font**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - High legibility at small sizes (11px–13px) for dense metadata.
- **Code & Metric Font**: `ui-monospace, "JetBrains Mono", "Cascadia Code", Menlo, monospace`
  - Used for IDs (`INC-2025-0417`), metrics (`8.4s p95`), runbook names, and JSON evidence blocks.
- **Scale**:
  - `Display / Header`: 20px–24px, Semi-Bold (700)
  - `Section Title`: 14px–16px, Medium (600), Uppercase Tracking (`tracking-wider`)
  - `Body Text`: 13px–14px, Regular (400), High Contrast (`text-slate-200`)
  - `Secondary Caption`: 11px–12px, Regular (400), Muted (`text-slate-400`)

---

## 4. Key UI Screens & Components

### 1. Global Navigation & Header
- **App Title**: `RecallOps` with Microsoft Hackathon badge and glowing pulse.
- **Active Incident Tracker**: Instant visual anchor on `INC-2026-0928` with live duration clock.
- **System Mode Pill**: Clear indicator: `DEMO MODE (Local In-Memory Adapter)` vs `HINDSIGHT CLOUD ACTIVE`.
- **Groq LLM Status Pill**: `PRIMARY: GPT-OSS 120B` / `FALLBACK: QWEN 3.8 27B` with latency readout.
- **Memory Bank Counters**: Live counts for `incidents`, `fix-outcomes`, `team`, `baseline`.
- **Navigation Tabs**:
  1. `Command Center`
  2. `Investigation Workspace`
  3. `Evidence & Memory`
  4. `Resolution Workspace`
  5. `System Architecture`

### 2. Command Center
- **Incident Summary Hero**: Critical P1 Banner showing `Checkout API Latency Spike` (27,400 checkouts impacted, 8.4s p95, 18.6% 5xx rate).
- **Executive Metric Cards**:
  - **Memory Impact**: `18 min estimated saved` (based on prior INC-2025-0417 resolution).
  - **Active Outage Duration**: Live elapsed counter.
  - **Recalled Confidence**: 92% match found in Hindsight cloud memory.
  - **Runbook Reliability**: 94% success rate for `Redis Latency and Eviction Response`.
- **Telemetry Charts**:
  - Recharts timeline of p95 latency spike following `checkout-api v4.18.2` deployment.
  - Concurrent error rate trajectory.
- **Service Dependency Map**:
  - Visual topology of `Kubernetes Ingress` → `Checkout API (Degraded)` → `Redis Cache (Evicting)` & `Azure SQL (Saturated)`.
- **Incident Action CTA**: Prominent `Investigate with Memory →` button triggering agent retrieval.

### 3. Investigation Workspace (Three-Column Layout)
- **Left Column: Alert Context & Real-Time Telemetry**
  - Affected components, recent deployments (`checkout-api v4.18.2`), error distribution.
  - Live incident timeline with millisecond stamps.
- **Center Column: Incident Memory Agent Briefing & Chat**
  - AI Executive Briefing badge: `Grounding Guard: 100% Verified against Recalled IDs`.
  - Root cause analysis with inline citation pills: `[INC-2025-0417]`, `[FIX-2025-0417-1]`.
  - Interactive Q&A chat grounded exclusively in recalled memory banks.
  - Distinction tags: `Recalled Evidence`, `AI Inference`, `Unknown / Gap`.
- **Right Column: Ranked, Human-Approved Response Plan**
  - Deterministic outcome score breakdown (Match: 92%, Historical Success: 95%, Risk Penalty: 0%).
  - Action steps with **Human Approval Toggles**:
    - Step 1: Rollback Redis cache config (Approved ✓)
    - Step 2: Temporarily scale cache capacity (Approved ✓)
    - Step 3: Verify eviction rate & restore traffic (Pending)
  - **CRITICAL HAZARD WARNING**:
    - "Failed Mitigation Alert: In INC-2025-0417, restarting Checkout API pods was ineffective and delayed recovery by 14 minutes. Do not restart pods."

### 4. Evidence and Memory View
- Recalled Incident Cards with deep post-mortem analysis.
- Recalled Fix-Outcome cards with verification metrics.
- Mathematical Scoring Breakdown:
  - `Similarity (0.35) + Success Rate (0.30) + Verification (0.15) + Recency (0.10) + Evidence (0.10) - Risk Penalty`.
- Source Runbook Viewer (`Redis Latency and Eviction Response`).
- Transparent "Why this was recalled" natural language explanation.

### 5. Resolution Workspace
- Operational verification checklist.
- Post-incident learning form:
  - Confirmed root cause
  - Actions taken vs skipped vs failed
  - Lessons learned & follow-up actions
- "Resolve Incident & Retain Memory" button.
- Live memory update summary:
  - Retained in `incidents` bank: `INC-2026-0928`
  - Retained in `fix-outcomes` bank: 3 verified fixes
  - Updated Runbook Reliability score (+3.2%).

### 6. Interactive Architecture View
- Visual system flow diagram representing:
  - `React Web UI / Electron Desktop`
  - `FastAPI Backend Service`
  - `API Routes (Alert, Chat, Resolve)`
  - `Deterministic Outcome-Ranked Scoring Engine`
  - `Briefing Guard (Allowlist Validator)`
  - `Hindsight Cloud Memory (4 isolated banks)`
  - `Groq LLM Engine (GPT-OSS 120B with Qwen 3.8 27B Failover)`

---

## 5. Accessibility & Motion Guidelines

- **Contrast Ratio**: Meets WCAG 2.1 AA (minimum 4.5:1 for body copy, 3:1 for large headers).
- **Reduced Motion**: All animations wrapped in `@media (prefers-reduced-motion: reduce)` fallbacks.
- **Keyboard Navigation**: Full `Tab` / `Shift+Tab` ring support with high-contrast electric blue outline (`ring-2 ring-cyan-400`).
- **Screen Readers**: Accessible ARIA roles (`role="alert"`, `aria-live="polite"`, `aria-describedby`).
