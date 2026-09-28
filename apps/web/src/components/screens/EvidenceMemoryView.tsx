import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Code2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Runbook } from '../../types';

interface EvidenceMemoryViewProps {
  runbooks: Runbook[];
}

export const EvidenceMemoryView: React.FC<EvidenceMemoryViewProps> = ({ runbooks }) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-2025-0417');
  const [selectedRunbookId, setSelectedRunbookId] = useState<string>('RB-REDIS-01');

  const historicalIncidents = [
    {
      id: 'INC-2025-0417',
      title: 'Checkout service latency after cache configuration deployment',
      service: 'checkout-api',
      severity: 'P1',
      matchScore: 92,
      date: 'April 17, 2025',
      resolutionTime: '18 minutes',
      runbookUsed: 'Redis Latency and Eviction Response (RB-REDIS-01)',
      symptoms: [
        'latency spike',
        'elevated 5xx errors',
        'Redis evictions after a configuration release',
        'downstream saturation',
      ],
      confirmedRootCause:
        'Redis max-memory policy and connection-pool configuration caused cache churn and downstream saturation.',
      successfulResolution: [
        'Roll back the cache configuration',
        'Temporarily scale cache capacity from P2 to P3',
        'Validate eviction rate drops to 0 ops/sec',
        'Gradually restore checkout traffic',
      ],
      failedMitigation:
        'Restarting Checkout API pods did not resolve the issue and caused a cold-cache stampede (+14 min delay).',
      whyRecalled:
        'Exact service match (checkout-api), identical deployment trigger (cache config update), and matching symptom pattern (>8s latency, 5xx surge, Redis evictions). Highest outcome-ranked anchor in memory.',
    },
    {
      id: 'INC-2025-0812',
      title: 'Payment authorization delays caused by queue-consumer saturation',
      service: 'payment-auth',
      severity: 'P2',
      matchScore: 68,
      date: 'August 12, 2025',
      resolutionTime: '32 minutes',
      runbookUsed: 'Queue Consumer Lag Mitigation Runbook (RB-QUEUE-03)',
      symptoms: ['payment processing delays', 'Kafka queue consumer lag spike', 'worker thread pool starvation'],
      confirmedRootCause: 'Consumer thread pool contention during high throughput authorization batch.',
      successfulResolution: [
        'Scale out consumer deployment replicas',
        'Partition queue traffic across secondary topic',
      ],
      failedMitigation: 'Purging dead-letter queue caused data inconsistency.',
      whyRecalled:
        'Downstream payment dependency shared, but root cause was queue worker concurrency rather than Redis cache evictions.',
    },
    {
      id: 'INC-2024-1105',
      title: 'Azure SQL connection exhaustion caused by a pool leak and aggressive retry policy',
      service: 'checkout-api',
      severity: 'P1',
      matchScore: 74,
      date: 'November 5, 2024',
      resolutionTime: '45 minutes',
      runbookUsed: 'Azure SQL Connection Pool Exhaustion Procedure (RB-SQL-02)',
      symptoms: ['database connection timeouts', 'SQL pool exhaustion', 'cascading 504 gateway timeouts'],
      confirmedRootCause:
        'Unclosed connections in unhandled checkout exception path combined with exponential retry storms.',
      successfulResolution: [
        'Apply connection pool clamp and circuit breaker',
        'Kill leaked idle backend sessions',
      ],
      failedMitigation: 'Increasing max pool size to 500 overwhelmed database CPU.',
      whyRecalled:
        'Shared checkout-api service and database saturation symptoms, but caused by connection leak rather than cache eviction storm.',
    },
  ];

  const fixOutcomes = [
    {
      id: 'FIX-2025-0417-1',
      incidentId: 'INC-2025-0417',
      title: 'Roll back cache configuration release',
      status: 'Verified',
      success: true,
      time: '6 min',
      rate: '95%',
      signal: 'Eviction ops drop below 10/sec',
      weight: 0.94,
    },
    {
      id: 'FIX-2025-0417-2',
      incidentId: 'INC-2025-0417',
      title: 'Restart Checkout API pods (FAILED MITIGATION)',
      status: 'Failed Hazard',
      success: false,
      time: '14 min wasted',
      rate: '8%',
      signal: 'Ineffective: Induced cold-cache stampede',
      weight: 0.12,
    },
    {
      id: 'FIX-2025-0417-3',
      incidentId: 'INC-2025-0417',
      title: 'Temporarily scale Redis cluster capacity',
      status: 'Verified',
      success: true,
      time: '5 min',
      rate: '88%',
      signal: 'Memory utilization drops under 70%',
      weight: 0.89,
    },
    {
      id: 'FIX-2025-0417-4',
      incidentId: 'INC-2025-0417',
      title: 'Validate eviction rate & restore normal traffic',
      status: 'Verified',
      success: true,
      time: '7 min',
      rate: '92%',
      signal: 'p95 latency returns under 250ms',
      weight: 0.91,
    },
  ];

  const activeInc = historicalIncidents.find((i) => i.id === selectedIncidentId) || historicalIncidents[0];
  const activeRunbook = runbooks.find((r) => r.runbook_id === selectedRunbookId) || runbooks[0];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-space-900 border border-border-subtle">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center">
            <Database className="w-4 h-4 mr-2 text-cyan-400" /> Hindsight Cloud Memory Evidence Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse recalled historical incidents, verified fix outcomes, deterministic scoring breakdowns, and proven runbooks.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-space-850 border border-border-subtle text-slate-300">
            Isolated Banks: <strong className="text-cyan-300">4</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-space-850 border border-border-subtle text-slate-300">
            Total Retained Outcomes: <strong className="text-emerald-400">10</strong>
          </span>
        </div>
      </div>

      {/* Grid: Recalled Incidents & Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recalled Incident Card List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400">
            Recalled Incidents ({historicalIncidents.length})
          </h2>

          {historicalIncidents.map((inc) => {
            const isSelected = inc.id === selectedIncidentId;
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan'
                    : 'bg-space-900 border-border-subtle hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-slate-200">{inc.id}</span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      inc.matchScore >= 90
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                        : 'bg-space-800 text-slate-400'
                    }`}
                  >
                    {inc.matchScore}% Match
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                  {inc.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-border-subtle">
                  <span>Resolved in {inc.resolutionTime}</span>
                  <span className="font-mono text-slate-500">{inc.service}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Incident Deep Inspector (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-space-900 border border-border-subtle space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white font-mono">{activeInc.id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  {activeInc.matchScore}% Pattern Match
                </span>
                <span className="text-xs text-slate-400">• {activeInc.date}</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-1">{activeInc.title}</h3>
            </div>

            <div className="text-right text-xs font-mono text-slate-400">
              <div>MTTR: <span className="text-health-ok font-bold">{activeInc.resolutionTime}</span></div>
            </div>
          </div>

          {/* "Why This Was Recalled" Explainability Callout */}
          <div className="p-3.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-xs space-y-1">
            <span className="font-semibold uppercase tracking-wider text-cyan-300 flex items-center text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Why this was recalled by Hindsight
            </span>
            <p className="text-slate-200 leading-relaxed">{activeInc.whyRecalled}</p>
          </div>

          {/* Root Cause & Resolution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-space-850 border border-border-subtle space-y-1.5">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                Confirmed Root Cause
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {activeInc.confirmedRootCause}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-space-850 border border-border-subtle space-y-1.5">
              <span className="text-health-ok uppercase tracking-wider font-semibold text-[11px]">
                Successful Resolution Steps
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {activeInc.successfulResolution.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prominent Failed Mitigation Alert */}
          <div className="p-4 rounded-lg bg-severity-p1/10 border border-severity-p1/40 text-xs space-y-1">
            <span className="text-severity-p1Light uppercase tracking-wider font-bold flex items-center text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Known Ineffective Mitigation in this Incident
            </span>
            <p className="text-slate-200 font-medium">{activeInc.failedMitigation}</p>
          </div>

          {/* Associated Runbook Link */}
          <div className="p-3.5 rounded-lg bg-space-850 border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-mono">Runbook: {activeInc.runbookUsed}</span>
            </div>
            <button
              onClick={() => setSelectedRunbookId('RB-REDIS-01')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center text-xs"
            >
              Inspect Runbook Steps <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recalled Fix-Outcomes Bank Table */}
      <div className="p-5 rounded-xl bg-space-900 border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-cyan-400" /> Recalled Fix-Outcomes Bank Records
            </h2>
            <p className="text-xs text-slate-400">
              Each fix outcome is stored with empirical success rates, verification signals, and failed-mitigation penalties.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-space-850 px-2 py-1 rounded border border-border-subtle">
            Bank: fix-outcomes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-space-850 text-slate-400 font-mono uppercase text-[10px] border-b border-border-subtle">
              <tr>
                <th className="py-2.5 px-3">Fix ID</th>
                <th className="py-2.5 px-3">Action Title</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Success Rate</th>
                <th className="py-2.5 px-3">Avg Time</th>
                <th className="py-2.5 px-3">Verification Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-slate-200">
              {fixOutcomes.map((fix) => (
                <tr key={fix.id} className={fix.success ? 'hover:bg-space-850/50' : 'bg-severity-p1/5'}>
                  <td className="py-2.5 px-3 font-mono font-semibold text-cyan-300">{fix.id}</td>
                  <td className="py-2.5 px-3 font-medium">{fix.title}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fix.success
                          ? 'bg-health-ok/20 text-health-ok border border-health-ok/40'
                          : 'bg-severity-p1/20 text-severity-p1Light border border-severity-p1/40'
                      }`}
                    >
                      {fix.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{fix.rate}</td>
                  <td className="py-2.5 px-3 font-mono">{fix.time}</td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">{fix.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Runbook Viewer */}
      {activeRunbook && (
        <div className="p-5 rounded-xl bg-space-900 border border-border-subtle space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-cyan-300 font-bold text-sm">{activeRunbook.runbook_id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-health-ok/20 text-health-ok font-mono font-semibold">
                  {Math.round(activeRunbook.historical_success_rate * 100)}% Success Rate
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{activeRunbook.title}</h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Avg Time: <strong className="text-slate-200">{activeRunbook.avg_mitigation_time_minutes} min</strong> ({activeRunbook.historical_uses} uses)
            </div>
          </div>

          <p className="text-xs text-slate-300">{activeRunbook.summary}</p>

          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Executable Operating Steps
            </h4>

            {activeRunbook.steps.map((st) => (
              <div key={st.step_number} className="p-3.5 rounded-lg bg-space-850 border border-border-subtle space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    Step {st.step_number}: {st.name}
                  </span>
                  <span className="text-slate-400 text-[11px]">{st.intent}</span>
                </div>
                <div className="p-2 rounded bg-space-950 font-mono text-[11px] text-cyan-300 flex items-center justify-between border border-border-subtle">
                  <code>{st.command}</code>
                  <span className="text-[10px] text-slate-500 font-sans uppercase">Azure CLI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
