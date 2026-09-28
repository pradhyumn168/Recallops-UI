import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Database,
  ArrowRight,
  TrendingDown,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  IncidentContext,
  RankedAction,
  ResolveRequest,
  ResolveResponse,
} from '../../types';

interface ResolutionWorkspaceProps {
  incident: IncidentContext;
  rankedFixes: RankedAction[];
  onResolve: (payload: ResolveRequest) => Promise<ResolveResponse>;
  isResolving: boolean;
  resolveResult: ResolveResponse | null;
  onResetDemo: () => void;
}

export const ResolutionWorkspace: React.FC<ResolutionWorkspaceProps> = ({
  incident,
  rankedFixes,
  onResolve,
  isResolving,
  resolveResult,
  onResetDemo,
}) => {
  // Action execution states
  const [actionStates, setActionStates] = useState<Record<string, 'completed' | 'skipped' | 'ineffective'>>({
    'FIX-2025-0417-1': 'completed',
    'FIX-2025-0417-3': 'completed',
    'FIX-2025-0417-4': 'completed',
  });

  const [confirmedRootCause, setConfirmedRootCause] = useState(
    'Redis maxmemory-policy allkeys-lru regression in v4.18.2 caused session eviction cascade and downstream database pool starvation.'
  );
  const [lessonsLearned, setLessonsLearned] = useState(
    'Enforce mandatory 5% canary deployment on all Redis configuration changes. Pod restarts during eviction cascades are permanently prohibited.'
  );
  const [followUpActions, setFollowUpActions] = useState(
    '1. Implement automated CI guard for Redis maxmemory syntax\n2. Add Redis client queue gauge to Azure Monitor dashboard'
  );
  const [elapsedMinutes, setElapsedMinutes] = useState(18);

  const [metricP95, setMetricP95] = useState(0.22);
  const [metricErrorRate, setMetricErrorRate] = useState(0.04);
  const [metricEvictions, setMetricEvictions] = useState(0);

  const toggleActionState = (actionId: string, state: 'completed' | 'skipped' | 'ineffective') => {
    setActionStates((prev) => ({ ...prev, [actionId]: state }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const actionsTaken: string[] = [];
    const actionsSkipped: string[] = [];
    const actionsFailed: string[] = [];

    rankedFixes.forEach((act) => {
      const state = actionStates[act.action_id] || 'completed';
      if (state === 'completed') actionsTaken.push(act.title);
      else if (state === 'skipped') actionsSkipped.push(act.title);
      else actionsFailed.push(act.title);
    });

    const payload: ResolveRequest = {
      confirmed_root_cause: confirmedRootCause,
      actions_taken: actionsTaken,
      actions_skipped: actionsSkipped,
      actions_that_failed: actionsFailed,
      runbook_used: 'Redis Latency and Eviction Response (RB-REDIS-01)',
      success_or_failure: 'SUCCESS',
      verification_metrics: {
        p95_latency_seconds: metricP95,
        error_rate_percent: metricErrorRate,
        eviction_rate_ops: metricEvictions,
      },
      elapsed_resolution_minutes: elapsedMinutes,
      lessons_learned: lessonsLearned,
      follow_up_actions: followUpActions.split('\n').filter((l) => l.trim().length > 0),
    };

    await onResolve(payload);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Success State Callout */}
      {resolveResult ? (
        <div className="p-6 rounded-xl border-2 border-health-ok bg-gradient-to-r from-space-900 via-health-ok/10 to-space-900 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-health-ok/20 border border-health-ok flex items-center justify-center text-health-ok shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Outage Resolved & Memory Retained
                </h3>
                <p className="text-xs text-health-okLight font-medium">
                  Hindsight cloud memory banks updated with verified resolution outcomes.
                </p>
              </div>
            </div>

            <button
              onClick={onResetDemo}
              className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 border border-border-subtle text-xs font-semibold flex items-center space-x-2 transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>

          {/* Memory Update Summary Details */}
          <div className="p-4 rounded-lg bg-space-950/90 border border-health-ok/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="text-slate-400 text-[11px]">Incidents Bank:</div>
              <div className="text-white font-bold text-sm mt-0.5">+1 Retained</div>
              <div className="text-slate-500 text-[10px]">{resolveResult.incident_id}</div>
            </div>

            <div>
              <div className="text-slate-400 text-[11px]">Fix-Outcomes Bank:</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">
                +{resolveResult.memory_update_summary.retained_fixes_count} Verified Fixes
              </div>
              <div className="text-slate-500 text-[10px]">Indexed for future ranking</div>
            </div>

            <div>
              <div className="text-slate-400 text-[11px]">Runbook Reliability:</div>
              <div className="text-cyan-300 font-bold text-sm mt-0.5">+3.0% Delta</div>
              <div className="text-slate-500 text-[10px]">RB-REDIS-01 now at 97%</div>
            </div>

            <div>
              <div className="text-slate-400 text-[11px]">Resolution Time:</div>
              <div className="text-white font-bold text-sm mt-0.5">{elapsedMinutes} minutes</div>
              <div className="text-emerald-400 text-[10px]">Saved ~18 min vs baseline</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {resolveResult.memory_update_summary.summary_message}
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-space-900 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-health-ok" /> Operational Resolution & Memory Retention
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Mark executed actions, verify telemetry stabilization, and commit vetted outcomes into Hindsight memory.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-space-850 border border-border-subtle text-slate-300">
              Active Outage: <strong className="text-cyan-300">{incident.incident_id}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Resolution Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Action Checklist & Verification Signals (6 Cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Human Approved Action Checklist */}
            <div className="p-5 rounded-xl bg-space-900 border border-border-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Remediation Action Checklist
                </h3>
                <span className="text-[11px] text-slate-400">Select outcome for each step</span>
              </div>

              <div className="space-y-3">
                {rankedFixes.map((action, idx) => {
                  const state = actionStates[action.action_id] || 'completed';

                  return (
                    <div
                      key={action.action_id}
                      className="p-3.5 rounded-lg bg-space-850 border border-border-subtle space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs text-white">
                            {idx + 1}. {action.title}
                          </div>
                          <p className="text-[11px] text-slate-400">{action.rationale}</p>
                        </div>
                      </div>

                      {/* State Selector Buttons */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => toggleActionState(action.action_id, 'completed')}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                            state === 'completed'
                              ? 'bg-health-ok/20 text-health-ok border border-health-ok/40 font-semibold'
                              : 'bg-space-950 text-slate-400 border border-border-subtle hover:text-slate-200'
                          }`}
                        >
                          ✓ Completed
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActionState(action.action_id, 'skipped')}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                            state === 'skipped'
                              ? 'bg-space-700 text-slate-200 border border-slate-500 font-semibold'
                              : 'bg-space-950 text-slate-400 border border-border-subtle hover:text-slate-200'
                          }`}
                        >
                          Skipped
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActionState(action.action_id, 'ineffective')}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                            state === 'ineffective'
                              ? 'bg-severity-p1/20 text-severity-p1Light border border-severity-p1/40 font-semibold'
                              : 'bg-space-950 text-slate-400 border border-border-subtle hover:text-slate-200'
                          }`}
                        >
                          Ineffective / Failed
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Telemetry Gauges */}
            <div className="p-5 rounded-xl bg-space-900 border border-border-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-1.5 text-health-ok" /> Verified Telemetry Recovery
                </h3>
                <span className="text-[10px] font-mono text-health-ok bg-health-ok/10 px-2 py-0.5 rounded border border-health-ok/30">
                  ALL METRICS NORMALIZED
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-space-850 border border-health-ok/30 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">p95 Latency</span>
                  <div className="text-lg font-bold text-health-ok font-metric mt-1">{metricP95}s</div>
                  <span className="text-[10px] text-slate-500">Target &lt;0.25s</span>
                </div>

                <div className="p-3 rounded-lg bg-space-850 border border-health-ok/30 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">5xx Errors</span>
                  <div className="text-lg font-bold text-health-ok font-metric mt-1">{metricErrorRate}%</div>
                  <span className="text-[10px] text-slate-500">Target &lt;0.1%</span>
                </div>

                <div className="p-3 rounded-lg bg-space-850 border border-health-ok/30 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Evictions</span>
                  <div className="text-lg font-bold text-health-ok font-metric mt-1">{metricEvictions} ops/s</div>
                  <span className="text-[10px] text-slate-500">Target: 0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Post-Incident Learning & Memory Retention Form (6 Cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="p-5 rounded-xl bg-space-900 border border-border-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Post-Incident Learning Synthesis
                </h3>
                <span className="text-[10px] text-slate-400">Committed to Hindsight</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Confirmed Root Cause */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">Confirmed Root Cause</label>
                  <textarea
                    rows={3}
                    value={confirmedRootCause}
                    onChange={(e) => setConfirmedRootCause(e.target.value)}
                    className="w-full bg-space-950 border border-border-subtle rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Lessons Learned */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">Lessons Learned (Updates Team Policy)</label>
                  <textarea
                    rows={2}
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    className="w-full bg-space-950 border border-border-subtle rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Follow-up Actions */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">Follow-up Remediation Actions</label>
                  <textarea
                    rows={2}
                    value={followUpActions}
                    onChange={(e) => setFollowUpActions(e.target.value)}
                    className="w-full bg-space-950 border border-border-subtle rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Elapsed Time */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-space-850 border border-border-subtle">
                  <span className="font-semibold text-slate-300">Elapsed Outage Resolution Time:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={elapsedMinutes}
                      onChange={(e) => setElapsedMinutes(Number(e.target.value))}
                      className="w-16 bg-space-950 border border-border-subtle rounded p-1 text-center font-mono font-bold text-white"
                    />
                    <span className="text-slate-400">minutes</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isResolving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-health-ok to-teal-500 hover:from-health-okLight hover:to-teal-400 text-space-950 font-bold text-sm tracking-wide shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                <span>{isResolving ? 'Committing to Memory Banks...' : 'Resolve Incident & Retain Memory'}</span>
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Retains vetted records to <code className="text-cyan-300">incidents</code> and <code className="text-cyan-300">fix-outcomes</code> banks. Baseline remains unpolluted.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
