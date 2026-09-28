import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Terminal,
  Database,
  ArrowRight,
  GitCommit,
  Cpu,
  Layers,
  ChevronDown,
  Info,
  Check,
} from 'lucide-react';
import {
  IncidentContext,
  GroundedBriefing,
  RankedAction,
  ChatMessage,
} from '../../types';

interface InvestigationWorkspaceProps {
  incident: IncidentContext;
  briefing: GroundedBriefing | null;
  rankedFixes: RankedAction[];
  modelUsed: string;
  fallbackUsed: boolean;
  providerLatencyMs: number;
  groundingStatus: string;
  chatMessages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isSendingChat: boolean;
  onToggleActionApproval: (actionId: string) => void;
  onGoToResolution: () => void;
  onSelectIncidentCitation: (incId: string) => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  incident,
  briefing,
  rankedFixes,
  modelUsed,
  fallbackUsed,
  providerLatencyMs,
  groundingStatus,
  chatMessages,
  onSendMessage,
  isSendingChat,
  onToggleActionApproval,
  onGoToResolution,
  onSelectIncidentCitation,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'Situation' | 'Similar Incidents' | 'Recommended Plan' | 'Evidence' | 'Timeline'>('Situation');
  const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isSendingChat) return;
    onSendMessage(inputQuery);
    setInputQuery('');
  };

  const quickQuestions = [
    'Should we restart the Checkout API pods?',
    'What worked in INC-2025-0417?',
    'What is the recommended rollback runbook?',
  ];

  return (
    <div className="space-y-4">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex space-x-2">
          {(['Situation', 'Similar Incidents', 'Recommended Plan', 'Evidence', 'Timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeSubTab === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-space-850 text-slate-400 border border-border-subtle hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Grounding Status:</span>
          <span
            className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px] ${
              groundingStatus === 'PASSED'
                ? 'bg-health-ok/20 text-health-ok border border-health-ok/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {groundingStatus === 'PASSED' ? '100% RECALLED IDs ONLY' : 'FILTERED & REDACTED'}
          </span>
        </div>
      </div>

      {/* Three Column Investigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Alert Context, Telemetry, Deployment Diff (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Alert Overview Card */}
          <div className="p-4 rounded-xl bg-space-900 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Alert Telemetry
              </span>
              <span className="text-xs font-mono font-semibold text-severity-p1Light">
                {incident.severity} CRITICAL
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-space-850 border border-border-subtle">
                <div className="text-slate-400 text-[11px]">Primary Service</div>
                <div className="font-mono font-semibold text-white mt-0.5">{incident.service}</div>
              </div>

              <div className="p-2 rounded bg-space-850 border border-border-subtle">
                <div className="text-slate-400 text-[11px]">Affected Systems</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {incident.affected_components.map((comp) => (
                    <span
                      key={comp}
                      className="px-1.5 py-0.5 rounded bg-space-800 text-[10px] font-mono text-slate-300 border border-border-subtle"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2 rounded bg-space-850 border border-border-subtle">
                <div className="text-slate-400 text-[11px]">Observed Symptoms</div>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300 text-[11px]">
                  {incident.symptoms.map((s, idx) => (
                    <li key={idx} className="truncate" title={s}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Deployment Diff Card */}
          <div className="p-4 rounded-xl bg-space-900 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 flex items-center">
                <GitCommit className="w-3.5 h-3.5 mr-1" /> Recent Change
              </span>
              <span className="text-[10px] text-slate-400 font-mono">19 min ago</span>
            </div>

            {incident.recent_changes.map((change, idx) => (
              <div key={idx} className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-white font-semibold">{change.component}</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                    {change.version}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {change.description}
                </p>

                {/* Simulated configuration diff */}
                <div className="p-2 rounded bg-space-950 border border-border-subtle font-mono text-[10px] space-y-0.5 overflow-x-auto">
                  <div className="text-slate-500"># config/redis.conf diff</div>
                  <div className="text-severity-p1Light">- maxmemory-policy noeviction</div>
                  <div className="text-health-ok">+ maxmemory-policy allkeys-lru</div>
                  <div className="text-health-ok">+ max-pool-connections: 200</div>
                </div>
              </div>
            ))}
          </div>

          {/* SRE Team Policy & Constraints */}
          <div className="p-4 rounded-xl bg-space-900 border border-border-subtle space-y-2 text-xs">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Team Constraints (from memory)
            </span>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <p>• <strong>Primary On-call:</strong> Alice Chen (SRE Lead)</p>
              <p>• <strong>Constraint:</strong> Cache config releases require 5% canary.</p>
              <p className="text-amber-300 font-medium">
                • <strong>Notice:</strong> Pod restarts under active eviction storms are prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: AI Incident Briefing & Interactive Grounded Chat (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Grounded AI Briefing Card */}
          <div className="p-5 rounded-xl bg-space-900 border border-cyan-500/30 shadow-card-dark relative space-y-4">
            {/* Header with Guard Status */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Incident Memory Agent Briefing
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Grounded in Hindsight memory banks via Groq ({modelUsed})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {Math.round((briefing?.confidence || 0.92) * 100)}% Match
                </span>
                <div className="text-[10px] text-slate-400 font-mono">{providerLatencyMs}ms</div>
              </div>
            </div>

            {/* Probable Root Cause */}
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1 flex items-center">
                <Info className="w-3 h-3 mr-1" /> Probable Root Cause
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {briefing?.probable_root_cause ||
                  'Redis max-memory eviction cascade triggered by checkout-api v4.18.2 configuration change.'}
              </p>
            </div>

            {/* Evidence Summary with Citations */}
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                Recalled Evidence Citations
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {briefing?.evidence_summary ||
                  '92% historical pattern match with incident INC-2025-0417.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {briefing?.cited_incident_ids.map((id) => (
                  <button
                    key={id}
                    onClick={() => onSelectIncidentCitation(id)}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-mono hover:bg-cyan-500/30 transition-colors"
                  >
                    <Database className="w-3 h-3" />
                    <span>[{id}]</span>
                  </button>
                ))}
                {briefing?.cited_fix_ids.map((fixId) => (
                  <span
                    key={fixId}
                    className="px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-border-subtle text-[11px] font-mono"
                  >
                    [{fixId}]
                  </span>
                ))}
              </div>
            </div>

            {/* Clear Grounding Distinction Box */}
            <div className="p-3 rounded-lg bg-space-950/90 border border-border-subtle space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Grounding Transparency Breakdown
              </span>

              <div className="space-y-1">
                <div className="flex items-start space-x-2 text-[11px]">
                  <span className="px-1.5 py-0.2 rounded bg-health-ok/20 text-health-ok text-[10px] font-mono shrink-0">
                    RECALLED EVIDENCE
                  </span>
                  <span className="text-slate-300">
                    {briefing?.distinction.recalled_evidence[0] ||
                      'INC-2025-0417 resolved in 18 minutes via config rollback and cache scaling.'}
                  </span>
                </div>

                <div className="flex items-start space-x-2 text-[11px]">
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono shrink-0">
                    AI INFERENCE
                  </span>
                  <span className="text-slate-300">
                    {briefing?.distinction.ai_inference[0] ||
                      'Correlated recent deployment with 1,420 ops/sec Redis eviction surge.'}
                  </span>
                </div>

                <div className="flex items-start space-x-2 text-[11px]">
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono shrink-0">
                    EVIDENCE GAPS
                  </span>
                  <span className="text-slate-400">
                    {briefing?.evidence_gaps[0] ||
                      'Client connection queue depth per pod is not streaming metrics.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Grounded Chat with Memory */}
          <div className="p-4 rounded-xl bg-space-900 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center">
                <Terminal className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Grounded Q&A with Memory
              </span>
              <span className="text-[10px] text-slate-500">Briefing Guard enforced</span>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(q)}
                  disabled={isSendingChat}
                  className="px-2 py-1 rounded bg-space-850 hover:bg-space-800 text-[11px] text-cyan-300 border border-border-subtle hover:border-cyan-500/40 transition-colors disabled:opacity-50 text-left"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat History Stream */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Ask any question about similar prior incidents, runbooks, or mitigation risks.
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg text-xs ${
                      msg.role === 'user'
                        ? 'bg-space-800 border border-border-subtle text-slate-200 ml-6'
                        : 'bg-space-950 border border-cyan-500/30 text-slate-200 mr-2 space-y-1.5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold uppercase tracking-wider">
                        {msg.role === 'user' ? 'Responder' : 'RecallOps Memory Agent'}
                      </span>
                      <span className="font-mono">{msg.timestamp.slice(11, 16)}</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {msg.cited_incident_ids && msg.cited_incident_ids.length > 0 && (
                      <div className="flex items-center space-x-1.5 pt-1 text-[10px] text-slate-400 border-t border-border-subtle">
                        <span>Citations:</span>
                        {msg.cited_incident_ids.map((id) => (
                          <span key={id} className="font-mono text-cyan-300 bg-space-850 px-1 rounded">
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSend} className="flex gap-2 pt-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about runbooks, prior root causes, or failed actions..."
                disabled={isSendingChat}
                className="flex-1 bg-space-950 border border-border-subtle rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isSendingChat}
                className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs disabled:opacity-50 transition-colors flex items-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Ranked, Human-Approved Response Plan (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* CRITICAL HAZARD WARNING: Failed Historical Mitigation */}
          {briefing?.failed_actions_to_avoid && briefing.failed_actions_to_avoid.length > 0 && (
            <div className="p-4 rounded-xl bg-severity-p1/15 border-2 border-severity-p1 shadow-glow-red space-y-2">
              <div className="flex items-center space-x-2 text-severity-p1Light font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0 text-severity-p1Light" />
                <span>CRITICAL HAZARD: INEFFECTIVE MITIGATION</span>
              </div>
              {briefing.failed_actions_to_avoid.map((failed, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="font-semibold text-white">
                    {failed.action_title}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {failed.hazard_description}
                  </p>
                  <div className="text-[10px] text-severity-p1Light font-mono mt-1">
                    Historical Failure in {failed.source_incident_id}: {failed.historical_failure_reason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ranked Response Plan Header */}
          <div className="p-4 rounded-xl bg-space-900 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div>
                <h2 className="text-xs uppercase tracking-wider font-bold text-white flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-health-ok" /> Recommended Response Plan
                </h2>
                <p className="text-[11px] text-slate-400">
                  Deterministic outcome-ranked scoring with human approval gate
                </p>
              </div>
            </div>

            {/* List of Recommended Actions */}
            <div className="space-y-3">
              {rankedFixes.map((action, index) => {
                const isApproved = action.approved !== false;
                const isExpanded = expandedBreakdown === action.action_id;

                return (
                  <div
                    key={action.action_id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isApproved
                        ? 'bg-space-850/90 border-cyan-500/40'
                        : 'bg-space-950/60 border-border-subtle opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-space-800 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0 border border-border-subtle">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-white leading-tight">
                            {action.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            {action.rationale}
                          </p>
                        </div>
                      </div>

                      {/* Human Approval Checkbox / Toggle */}
                      <button
                        onClick={() => onToggleActionApproval(action.action_id)}
                        className={`shrink-0 flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                          isApproved
                            ? 'bg-health-ok/20 text-health-ok border border-health-ok/40'
                            : 'bg-space-800 text-slate-400 border border-border-subtle hover:text-white'
                        }`}
                        title="Click to approve or hold this operational step"
                      >
                        {isApproved ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Approved</span>
                          </>
                        ) : (
                          <span>Pending</span>
                        )}
                      </button>
                    </div>

                    {/* Action Meta & Verification */}
                    <div className="mt-2.5 pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                      <span className="font-mono text-cyan-300">
                        Success: {Math.round(action.historical_success_rate * 100)}% ({action.median_time_to_resolution_minutes}m)
                      </span>
                      <button
                        onClick={() => setExpandedBreakdown(isExpanded ? null : action.action_id)}
                        className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center"
                      >
                        Score: {action.confidence}
                        <ChevronDown className={`w-3 h-3 ml-0.5 transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Score Breakdown */}
                    {isExpanded && (
                      <div className="mt-2 p-2 rounded bg-space-950 text-[10px] font-mono text-slate-300 border border-border-subtle space-y-1">
                        <div>Service match: {action.score_breakdown.service_similarity}</div>
                        <div>Symptom similarity: {action.score_breakdown.symptom_similarity}</div>
                        <div>Historical success: {action.score_breakdown.historical_success_rate}</div>
                        <div>Verification quality: {action.score_breakdown.verification_quality}</div>
                        <div className="text-slate-400 italic pt-1">{action.score_breakdown.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mandatory Human Confirmation Principle Callout */}
            <div className="p-2.5 rounded bg-space-950 border border-border-subtle text-[11px] text-slate-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Human-in-the-loop:</strong> Decision support only. Operational changes require explicit responder approval.
              </span>
            </div>

            {/* Forward to Resolution CTA */}
            <button
              onClick={onGoToResolution}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-health-ok to-teal-500 hover:from-health-okLight hover:to-teal-400 text-space-950 font-bold text-xs tracking-wide shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <span>Execute Plan in Resolution Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
