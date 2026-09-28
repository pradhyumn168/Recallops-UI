import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Database,
  Layers,
  Activity,
  Terminal,
  Clock,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { MemoryBankStats, IncidentStatus } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  incidentId: string;
  incidentStatus: IncidentStatus;
  memoryStats: MemoryBankStats;
  modelUsed: string;
  fallbackUsed: boolean;
  demoMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  incidentId,
  incidentStatus,
  memoryStats,
  modelUsed,
  fallbackUsed,
  demoMode,
}) => {
  const tabs = [
    { id: 'command-center', label: 'Command Center', icon: Activity },
    { id: 'investigation', label: 'Investigation Workspace', icon: Terminal },
    { id: 'evidence', label: 'Evidence & Memory', icon: Database },
    { id: 'resolution', label: 'Resolution Workspace', icon: ShieldAlert },
    { id: 'architecture', label: 'System Architecture', icon: Layers },
  ];

  return (
    <header className="border-b border-border-subtle bg-space-900/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar: Operational Status & System Telemetry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shadow-glow-cyan">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-base">RecallOps</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                MS Hackathon 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Incident Memory Agent</p>
          </div>
        </div>

        {/* Active Outage Live Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-space-850 border border-border-subtle">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                incidentStatus === 'Resolved' ? 'bg-health-ok' : 'bg-severity-p1'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                incidentStatus === 'Resolved' ? 'bg-health-ok' : 'bg-severity-p1'
              }`}
            />
          </span>
          <span className="font-metric font-semibold text-slate-200">{incidentId}</span>
          <span className="text-slate-500">|</span>
          <span
            className={`font-semibold ${
              incidentStatus === 'Resolved' ? 'text-health-ok' : 'text-severity-p1Light'
            }`}
          >
            {incidentStatus === 'Resolved' ? 'RESOLVED' : 'P1 CRITICAL'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 flex items-center font-metric">
            <Clock className="w-3 h-3 mr-1 inline" /> 19m elapsed
          </span>
        </div>

        {/* LLM & Cloud Memory Badges */}
        <div className="flex items-center space-x-3">
          {/* Groq LLM Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-space-850 border border-border-subtle text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">LLM:</span>
            <span className="font-metric font-medium text-cyan-300 truncate max-w-[130px]">
              {fallbackUsed ? 'qwen/qwen3.8-27b' : modelUsed || 'gpt-oss-120b'}
            </span>
            {fallbackUsed && (
              <span className="px-1 text-[9px] bg-amber-500/20 text-amber-300 rounded font-semibold">
                FALLBACK
              </span>
            )}
          </div>

          {/* Hindsight Memory Mode */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium ${
              demoMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{demoMode ? 'DEMO MODE (Local In-Memory)' : 'HINDSIGHT CLOUD'}</span>
          </div>

          {/* Isolated Memory Bank Counters */}
          <div className="hidden lg:flex items-center space-x-2 text-[11px] font-metric text-slate-400 bg-space-950 px-2 py-1 rounded border border-border-subtle">
            <span title="Past incident timelines & post-mortems">
              incidents:<span className="text-slate-200 font-semibold ml-0.5">{memoryStats.incidents_count}</span>
            </span>
            <span>•</span>
            <span title="Verified remediation outcomes & failed mitigation warnings">
              fixes:<span className="text-slate-200 font-semibold ml-0.5">{memoryStats.fix_outcomes_count}</span>
            </span>
            <span>•</span>
            <span title="Team escalation policies & constraints">
              team:<span className="text-slate-200 font-semibold ml-0.5">{memoryStats.team_count}</span>
            </span>
            <span>•</span>
            <span title="Baseline bank (intentionally empty)">
              baseline:<span className="text-slate-200 font-semibold ml-0.5">{memoryStats.baseline_count}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto scrollbar-none" aria-label="Main Navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-space-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'resolution' && incidentStatus === 'Resolved' && (
                <span className="ml-1 w-2 h-2 rounded-full bg-health-ok inline-block" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
