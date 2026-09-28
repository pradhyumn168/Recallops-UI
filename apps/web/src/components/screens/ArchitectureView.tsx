import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Database,
  Cpu,
  Terminal,
  Activity,
  CheckCircle2,
  Server,
  Monitor,
  Laptop,
  Lock,
  GitFork,
  Radio,
} from 'lucide-react';
import { MemoryBankStats } from '../../types';

interface ArchitectureViewProps {
  memoryStats: MemoryBankStats;
  modelUsed: string;
  fallbackUsed: boolean;
  demoMode: boolean;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  memoryStats,
  modelUsed,
  fallbackUsed,
  demoMode,
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('guard');

  const nodes = [
    {
      id: 'clients',
      title: 'Clients Tier',
      subtitle: 'React Web UI & Electron Shell',
      icon: Monitor,
      type: 'client',
      color: 'border-blue-400/40 text-blue-300 bg-blue-500/10',
      description:
        'Unified frontend clients. React Web UI deployable to Vercel, paired with a lightweight Electron desktop app for dedicated incident control rooms. Both consume the identical FastAPI contracts with zero duplicated reasoning logic.',
      details: [
        'Vite + React 19 + TypeScript + Tailwind CSS',
        'Framer Motion for restrained operational motion',
        'Recharts for real-time telemetry visualizations',
        'Electron preload IPC with context isolation',
      ],
    },
    {
      id: 'fastapi',
      title: 'FastAPI Backend',
      subtitle: 'services/api (Port 8000)',
      icon: Server,
      type: 'gateway',
      color: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
      description:
        'High-performance asynchronous Python FastAPI backend. Houses the domain repositories, Pydantic schemas, and orchestration pipelines for alert briefings, grounded chat, and resolution recording.',
      details: [
        'FastAPI 0.115+ with Pydantic v2 validation',
        'CORS configured for localhost web and Electron clients',
        'Stateless API architecture with clean service boundaries',
      ],
    },
    {
      id: 'routes',
      title: 'Explicit API Routes',
      subtitle: '/api/alerts, /chat, /resolve',
      icon: Terminal,
      type: 'routes',
      color: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
      description:
        'Canonical REST endpoints enforcing the incident response lifecycle: 1) POST /api/alerts (symptom normalization & briefing), 2) POST /api/incidents/{id}/chat (grounded Q&A), 3) POST /api/incidents/{id}/resolve (outcome retention).',
      details: [
        'POST /api/alerts: Generates evidence-grounded briefing',
        'POST /api/incidents/{id}/chat: Grounded in recalled evidence',
        'POST /api/incidents/{id}/resolve: Retains verified outcomes',
        'GET /api/health: Capability & memory stats inspector',
      ],
    },
    {
      id: 'scoring',
      title: 'Outcome-Ranked Scoring',
      subtitle: 'Deterministic Ranking Engine',
      icon: Activity,
      type: 'engine',
      color: 'border-purple-400/40 text-purple-300 bg-purple-500/10',
      description:
        'Deterministic, explainable scoring engine. Does not rank on semantic similarity alone; fuses service similarity (0.15), symptom overlap (0.20), dependency match (0.10), deployment context (0.15), historical success rate (0.20), verification quality (0.10), and severe penalties (-0.80) for historical failed mitigations.',
      details: [
        'Formula: 8 weighted dimensions summing to 1.00',
        'Severe -0.80 penalty flags dangerous failed mitigations',
        'Human-in-the-loop: Every operational action requires human approval',
      ],
    },
    {
      id: 'guard',
      title: 'Briefing Guard',
      subtitle: 'Mandatory Grounding Validator',
      icon: ShieldCheck,
      type: 'safety',
      color: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10 shadow-glow-cyan',
      description:
        'The primary safety feature of RecallOps. Collects exact recalled incident IDs and fix IDs from Hindsight, builds an isolated evidence packet, passes only this allowlist to Groq, and strictly validates all citations in model output. Hallucinations are actively rejected or redacted.',
      details: [
        'Allowlist constraint: Only recalled IDs may be cited',
        'Regex and schema checks on model JSON output',
        'Tri-state output distinction: Recalled vs Inferred vs Unknown',
      ],
    },
    {
      id: 'hindsight',
      title: 'Hindsight Cloud Memory',
      subtitle: '4 Isolated Memory Banks',
      icon: Database,
      type: 'memory',
      color: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
      description:
        'Persistent memory repository interface providing retain(), recall(), and reflect(). Operates across 4 segregated banks: 1) incidents, 2) fix-outcomes, 3) team constraints, and 4) baseline (which starts intentionally empty to prevent hallucinated baseline rules).',
      details: [
        `incidents bank: ${memoryStats.incidents_count} records`,
        `fix-outcomes bank: ${memoryStats.fix_outcomes_count} records`,
        `team bank: ${memoryStats.team_count} policies`,
        `baseline bank: ${memoryStats.baseline_count} records (never invented)`,
      ],
    },
    {
      id: 'groq',
      title: 'Groq LLM Engine',
      subtitle: 'GPT-OSS 120B & Qwen 3.8 27B',
      icon: Cpu,
      type: 'llm',
      color: 'border-amber-400/40 text-amber-300 bg-amber-500/10',
      description:
        'Ultra-fast inference provider with automatic retryable failover. Primary model is openai/gpt-oss-120b for complex reasoning, with seamless automatic fallback to qwen/qwen3.8-27b on rate-limits, timeouts, or service unavailability. Transparently reports latency and fallback status.',
      details: [
        'Primary Model: openai/gpt-oss-120b (Structured JSON)',
        'Fallback Model: qwen/qwen3.8-27b (Automatic failover)',
        'Provider latency displayed on every briefing & chat response',
      ],
    },
  ];

  const activeNodeObj = nodes.find((n) => n.id === selectedNode) || nodes[4];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-xl bg-space-900 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center">
            <Layers className="w-4 h-4 mr-2 text-cyan-400" /> RecallOps Canonical Architecture Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Interactive system topology rendering the exact client, backend, safety guard, Hindsight memory, and Groq LLM pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-space-850 border border-border-subtle text-slate-300">
            Runtime Mode: <strong className="text-cyan-300">{demoMode ? 'Local Demo Adapter' : 'Cloud Production'}</strong>
          </span>
        </div>
      </div>

      {/* Visual System Topology Map */}
      <div className="p-6 rounded-xl bg-space-900 border border-border-subtle space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Column 1: Clients & Ingress */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              1. Client Layer
            </span>

            <div
              onClick={() => setSelectedNode('clients')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedNode === 'clients'
                  ? 'bg-space-850 border-blue-400 shadow-glow-cyan'
                  : 'bg-space-950 border-border-subtle hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center">
                  <Monitor className="w-4 h-4 mr-1.5 text-blue-400" /> React Web UI (Vercel)
                </span>
                <span className="w-2 h-2 rounded-full bg-health-ok" />
              </div>
              <p className="text-[11px] text-slate-400">
                Tailwind CSS, Framer Motion, Recharts mission-control interface.
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">Optional Electron Shell</div>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowRight className="w-5 h-5 transform rotate-90 md:rotate-0" />
            </div>

            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              2. API Gateway
            </span>

            <div
              onClick={() => setSelectedNode('fastapi')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedNode === 'fastapi'
                  ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                  : 'bg-space-950 border-border-subtle hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center">
                  <Server className="w-4 h-4 mr-1.5 text-cyan-400" /> FastAPI Backend Service
                </span>
                <span className="w-2 h-2 rounded-full bg-health-ok" />
              </div>
              <p className="text-[11px] text-slate-400">
                Asynchronous Python backend on port 8000. Shared contracts.
              </p>
            </div>
          </div>

          {/* Column 2: Decision Pipeline & Safety Guard */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              3. Execution Routes & Scoring
            </span>

            <div
              onClick={() => setSelectedNode('routes')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedNode === 'routes'
                  ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                  : 'bg-space-950 border-border-subtle hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center">
                  <Terminal className="w-4 h-4 mr-1.5 text-cyan-400" /> API Routes
                </span>
                <span className="font-mono text-[10px] text-cyan-300">/alerts, /chat, /resolve</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pydantic validation, lifecycle handlers, memory dispatchers.
              </p>
            </div>

            <div
              onClick={() => setSelectedNode('scoring')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedNode === 'scoring'
                  ? 'bg-space-850 border-purple-400 shadow-glow-cyan'
                  : 'bg-space-950 border-border-subtle hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center">
                  <Activity className="w-4 h-4 mr-1.5 text-purple-400" /> Outcome-Ranked Scoring
                </span>
                <span className="font-mono text-[10px] text-purple-300">8 Dimensions</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Empirical success rates, verification signals, failed mitigation penalty.
              </p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowRight className="w-5 h-5 transform rotate-90 md:rotate-0" />
            </div>

            {/* Crucial Safety Guard Node */}
            <div
              onClick={() => setSelectedNode('guard')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedNode === 'guard'
                  ? 'bg-emerald-950/40 border-emerald-400 shadow-glow-cyan'
                  : 'bg-space-950 border-emerald-500/40 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-emerald-300 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" /> Briefing Guard (Safety Guard)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  Enforced
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Only recalled IDs allowed in LLM briefings. Hallucinations rejected or redacted.
              </p>
            </div>
          </div>

          {/* Column 3: Persistent Memory & LLM Inference */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              4. External Foundations
            </span>

            {/* Hindsight Memory */}
            <div
              onClick={() => setSelectedNode('hindsight')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedNode === 'hindsight'
                  ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                  : 'bg-space-950 border-border-subtle hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center">
                  <Database className="w-4 h-4 mr-1.5 text-cyan-400" /> Hindsight Cloud Memory
                </span>
                <span className="font-mono text-[10px] text-cyan-300">retain • recall • reflect</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Isolated banks: <span className="text-slate-300 font-mono">incidents</span>, <span className="text-slate-300 font-mono">fix-outcomes</span>, <span className="text-slate-300 font-mono">team</span>, <span className="text-slate-300 font-mono">baseline</span>.
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                Baseline is intentionally empty to prevent generic hallucinations.
              </div>
            </div>

            {/* Groq LLM with Failover */}
            <div
              onClick={() => setSelectedNode('groq')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedNode === 'groq'
                  ? 'bg-space-850 border-amber-400 shadow-glow-cyan'
                  : 'bg-space-950 border-border-subtle hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center">
                  <Cpu className="w-4 h-4 mr-1.5 text-amber-400" /> Groq LLM Failover Engine
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                  Primary / Fallback
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Primary: <span className="text-slate-200 font-mono">gpt-oss-120b</span>
                <br />
                Automatic Fallback: <span className="text-amber-300 font-mono">qwen3.8-27b</span>
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                Strict structured JSON output format.
              </div>
            </div>
          </div>
        </div>

        {/* Selected Component Deep Inspector */}
        <div className="p-5 rounded-xl bg-space-850 border border-border-highlight space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded bg-space-800 text-cyan-400">
                <activeNodeObj.icon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">{activeNodeObj.title}</h3>
                <p className="text-[11px] text-slate-400">{activeNodeObj.subtitle}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-space-800 text-slate-300 font-mono text-xs">
              Component: {activeNodeObj.id}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{activeNodeObj.description}</p>

          <div className="space-y-1 pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Architectural Invariants & Specs
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {activeNodeObj.details.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 bg-space-950 p-2 rounded border border-border-subtle">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
