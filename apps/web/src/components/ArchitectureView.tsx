import React from 'react';
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
  Sparkles,
} from 'lucide-react';
import { MemoryBankStats } from '../types';

interface ArchitectureViewProps {
  memoryStats: MemoryBankStats;
  demoMode: boolean;
  modelUsed: string;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  memoryStats,
  demoMode,
  modelUsed,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800">
              Canonical System Map
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• Microsoft Hackathon 2026</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            RecallOps Architecture & Decision Pipeline
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Both the React Web UI and Electron desktop clients invoke the identical FastAPI backend with zero duplicated business logic.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            Memory Mode: <strong className="text-brand-600 dark:text-brand-400">{demoMode ? 'Local Adapter' : 'Hindsight Cloud'}</strong>
          </span>
        </div>
      </div>

      {/* Interactive Architecture Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tier 1: Clients */}
        <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Client Tier</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              React 19 web app deployable to Vercel and optional Electron desktop shell.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-mono space-y-1">
            <div>• apps/web (Vite + Tailwind)</div>
            <div>• apps/desktop (Electron)</div>
            <div>• Zero logic duplication</div>
          </div>
        </div>

        {/* Tier 2: FastAPI Backend */}
        <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. FastAPI Backend</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Stateless service handling normalization, ranking, and grounding guardrails.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-mono space-y-1">
            <div>• POST /api/alerts</div>
            <div>• POST /incidents/{`{id}`}/chat</div>
            <div>• POST /incidents/{`{id}`}/resolve</div>
          </div>
        </div>

        {/* Tier 3: Briefing Guard & Scoring */}
        <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Briefing Guard</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Strict allowlist validator. Only recalled incident IDs may be cited in AI briefings.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-mono space-y-1">
            <div>• Deterministic Scoring</div>
            <div>• Failed mitigation penalty</div>
            <div>• Rejects hallucinations</div>
          </div>
        </div>

        {/* Tier 4: Hindsight Memory & Groq */}
        <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">4. Memory & LLM</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              4 isolated Hindsight memory banks and Groq LLM with automatic failover.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-mono space-y-1">
            <div>• incidents ({memoryStats.incidents_count})</div>
            <div>• fix-outcomes ({memoryStats.fix_outcomes_count})</div>
            <div>• Groq primary: gpt-oss-120b</div>
          </div>
        </div>
      </div>

      {/* Memory Banks Inspector */}
      <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4 transition-colors">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Isolated Hindsight Memory Banks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 transition-colors">
            <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300 font-mono">Bank 1: incidents</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{memoryStats.incidents_count} records</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">Incident timelines, symptoms, confirmed root causes, postmortems.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 transition-colors">
            <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300 font-mono">Bank 2: fix-outcomes</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{memoryStats.fix_outcomes_count} records</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">Remediation actions, success/failure, runbook reliability, verification metrics.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 transition-colors">
            <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300 font-mono">Bank 3: team</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{memoryStats.team_count} records</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">Escalation policies, service ownership, approved operational constraints.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 transition-colors">
            <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300 font-mono">Bank 4: baseline</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{memoryStats.baseline_count} records</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">Intentionally unpolluted. Never populated with invented generic advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ArchitectureView;
