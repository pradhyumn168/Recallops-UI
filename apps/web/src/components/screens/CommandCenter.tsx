import React from 'react';
import {
  AlertOctagon,
  Sparkles,
  Clock,
  CheckCircle2,
  TrendingUp,
  Server,
  Database,
  ArrowRight,
  GitCommit,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { IncidentContext } from '../../types';

interface CommandCenterProps {
  incident: IncidentContext;
  onInvestigate: () => void;
  isInvestigating: boolean;
  hasBriefing: boolean;
}

// Seeded realistic telemetry time-series
const telemetryData = [
  { time: '13:50', p95: 0.18, errorRate: 0.02, evictions: 0 },
  { time: '13:55', p95: 0.19, errorRate: 0.03, evictions: 0 },
  { time: '14:00', p95: 0.18, errorRate: 0.02, evictions: 0 },
  { time: '14:05', p95: 0.22, errorRate: 0.04, evictions: 15, event: 'Deploy v4.18.2' },
  { time: '14:08', p95: 0.85, errorRate: 1.2, evictions: 450 },
  { time: '14:12', p95: 3.40, errorRate: 6.8, evictions: 1100 },
  { time: '14:15', p95: 6.80, errorRate: 14.2, evictions: 1380 },
  { time: '14:19', p95: 8.40, errorRate: 18.6, evictions: 1420, event: 'P1 Outage Alert' },
  { time: '14:24', p95: 8.42, errorRate: 18.5, evictions: 1410 },
];

export const CommandCenter: React.FC<CommandCenterProps> = ({
  incident,
  onInvestigate,
  isInvestigating,
  hasBriefing,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Hero Outage Banner */}
      <div className="relative overflow-hidden rounded-xl border border-severity-p1/40 bg-gradient-to-r from-space-900 via-severity-p1/10 to-space-900 p-6 shadow-glow-red">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded bg-severity-p1 text-white font-bold text-xs tracking-wider uppercase flex items-center shadow-sm">
                <AlertOctagon className="w-3.5 h-3.5 mr-1" /> Active P1 Outage
              </span>
              <span className="font-metric text-xs font-semibold text-slate-300 bg-space-850 px-2 py-1 rounded border border-border-subtle">
                ID: {incident.incident_id}
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-300 text-xs font-medium">Service: <span className="text-cyan-300 font-mono font-semibold">{incident.service}</span></span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-400 text-xs">Environment: <span className="text-slate-200 font-mono">{incident.environment}</span></span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                {incident.title}
              </h1>
              <p className="text-sm text-slate-300 max-w-3xl">
                Catastrophic checkout latency spike affecting <strong className="text-white font-semibold">{incident.metrics.affected_checkout_attempts.toLocaleString()}</strong> shoppers. 
                Triggered by Redis cache memory evictions cascading into connection exhaustion 19 minutes after release <code className="text-cyan-300 bg-space-850 px-1.5 py-0.5 rounded border border-border-subtle">v4.18.2</code>.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-metric pt-1">
              <div className="bg-space-950/80 px-3 py-1.5 rounded border border-border-subtle flex items-center space-x-2">
                <span className="text-slate-400">p95 Latency:</span>
                <span className="text-severity-p1Light font-bold text-sm">{incident.metrics.p95_latency_seconds}s</span>
                <span className="text-slate-500">(Target: &lt;0.25s)</span>
              </div>
              <div className="bg-space-950/80 px-3 py-1.5 rounded border border-border-subtle flex items-center space-x-2">
                <span className="text-slate-400">5xx Error Rate:</span>
                <span className="text-severity-p1Light font-bold text-sm">{incident.metrics.error_rate_percent}%</span>
                <span className="text-slate-500">(Target: &lt;0.1%)</span>
              </div>
              <div className="bg-space-950/80 px-3 py-1.5 rounded border border-border-subtle flex items-center space-x-2">
                <span className="text-slate-400">Redis Evictions:</span>
                <span className="text-amber-400 font-bold text-sm">{incident.metrics.redis_eviction_rate_ops} ops/s</span>
                <span className="text-slate-500">(Target: 0 ops/s)</span>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="shrink-0 flex flex-col items-end justify-center">
            <button
              onClick={onInvestigate}
              disabled={isInvestigating}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-bold text-sm tracking-wide shadow-glow-cyan flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-5 h-5 text-space-950 animate-pulse" />
              <span>{isInvestigating ? 'Recalling Memory...' : 'Investigate with Memory'}</span>
              <ArrowRight className="w-4 h-4 text-space-950" />
            </button>
            <span className="text-[11px] text-cyan-300/80 mt-2 font-mono flex items-center">
              <Zap className="w-3 h-3 mr-1 text-cyan-400 inline" /> Hindsight Recall + Groq Briefing Guard
            </span>
          </div>
        </div>
      </div>

      {/* 2. Executive Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Prominent Memory Impact Metric */}
        <div className="p-4 rounded-xl bg-space-900 border-2 border-cyan-400/50 shadow-glow-cyan relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold text-cyan-400 flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Memory Impact
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
              INC-2025-0417
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-metric tracking-tight">
            18 min
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Estimated time saved using prior verified Redis eviction runbook.
          </p>
        </div>

        {/* Active Outage Duration */}
        <div className="p-4 rounded-xl bg-space-900 border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold flex items-center text-slate-300">
              <Clock className="w-3.5 h-3.5 mr-1 text-severity-p1" /> Outage Elapsed
            </span>
            <span className="text-severity-p1Light font-mono">P1 SLA Active</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-100 font-metric tracking-tight">
            19m 24s
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Triggered 14:05 UTC. MTTD was 7 minutes.
          </p>
        </div>

        {/* Recalled Memory Match */}
        <div className="p-4 rounded-xl bg-space-900 border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold flex items-center text-slate-300">
              <Database className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Match Score
            </span>
            <span className="text-emerald-400 font-mono font-semibold">Strong Match</span>
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 font-metric tracking-tight">
            92%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Confidence match against <span className="font-mono text-slate-300">INC-2025-0417</span> post-mortem.
          </p>
        </div>

        {/* Runbook Reliability */}
        <div className="p-4 rounded-xl bg-space-900 border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold flex items-center text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-health-ok" /> Runbook Success
            </span>
            <span className="text-health-ok font-mono font-semibold">14 Historical Uses</span>
          </div>
          <div className="text-3xl font-extrabold text-health-ok font-metric tracking-tight">
            94%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Procedure: <span className="text-slate-300 font-mono">RB-REDIS-01</span>
          </p>
        </div>
      </div>

      {/* 3. Live Telemetry Charts (p95 Latency & 5xx Error Rate) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <div className="p-5 rounded-xl bg-space-900 border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-cyan-400" /> p95 Response Latency (Seconds)
              </h2>
              <p className="text-xs text-slate-400">Checkout API downstream response time trajectory</p>
            </div>
            <span className="text-xs font-metric font-semibold px-2 py-0.5 rounded bg-severity-p1/20 text-severity-p1Light border border-severity-p1/40">
              Current: 8.4s
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#2a4374', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val: any) => [`${val}s`, 'p95 Latency']}
                />
                <ReferenceLine y={0.25} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target: 0.25s', fill: '#10b981', fontSize: 10 }} />
                <Area type="monotone" dataKey="p95" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#latencyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-border-subtle">
            <span className="flex items-center text-amber-300">
              <GitCommit className="w-3.5 h-3.5 mr-1" /> 14:05 UTC: v4.18.2 deployment applied
            </span>
            <span className="text-severity-p1Light font-mono font-semibold">+4,100% latency surge</span>
          </div>
        </div>

        {/* Error Rate & Eviction Chart */}
        <div className="p-5 rounded-xl bg-space-900 border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
                <Activity className="w-4 h-4 mr-2 text-severity-p1Light" /> 5xx HTTP Error Rate (%)
              </h2>
              <p className="text-xs text-slate-400">Failed checkout requests & Redis key evictions</p>
            </div>
            <span className="text-xs font-metric font-semibold px-2 py-0.5 rounded bg-severity-p1/20 text-severity-p1Light border border-severity-p1/40">
              Current: 18.6%
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 25]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#2a4374', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val: any) => [`${val}%`, 'Error Rate']}
                />
                <ReferenceLine y={0.1} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target: <0.1%', fill: '#10b981', fontSize: 10 }} />
                <Area type="monotone" dataKey="errorRate" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#errorGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-border-subtle">
            <span className="flex items-center text-cyan-300">
              <Database className="w-3.5 h-3.5 mr-1" /> Eviction spike: 1,420 ops/sec
            </span>
            <span className="text-amber-400 font-mono font-semibold">27,400 checkout attempts failed</span>
          </div>
        </div>
      </div>

      {/* 4. Dependency Topology Map & Live Incident Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dependency Map */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-space-900 border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
                <Layers className="w-4 h-4 mr-2 text-cyan-400" /> Service Dependency Health Map
              </h2>
              <p className="text-xs text-slate-400">Real-time status across the checkout call chain</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">East US Region</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Ingress */}
            <div className="p-3.5 rounded-lg bg-space-850 border border-health-ok/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Azure Front Door</span>
                <span className="w-2 h-2 rounded-full bg-health-ok shadow-sm" />
              </div>
              <div className="my-2">
                <div className="text-[11px] text-slate-400">Ingress Traffic</div>
                <div className="font-metric font-semibold text-white">4,800 req/s</div>
              </div>
              <div className="text-[10px] text-health-ok font-medium">Healthy (0.01% error)</div>
            </div>

            {/* Checkout API (P1 Critical) */}
            <div className="p-3.5 rounded-lg bg-severity-p1/10 border-2 border-severity-p1/60 flex flex-col justify-between shadow-glow-red">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Checkout API</span>
                <span className="w-2.5 h-2.5 rounded-full bg-severity-p1 animate-ping" />
              </div>
              <div className="my-2">
                <div className="text-[11px] text-severity-p1Light font-medium">Degraded by Cache</div>
                <div className="font-metric font-bold text-white">p95: 8.4s | 5xx: 18.6%</div>
              </div>
              <div className="text-[10px] text-severity-p1Light font-semibold flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1 inline" /> Outage Root Source
              </div>
            </div>

            {/* Redis Cache (Critical Eviction Cascade) */}
            <div className="p-3.5 rounded-lg bg-severity-p1/10 border-2 border-severity-p1/60 flex flex-col justify-between shadow-glow-red">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Redis Cache (P2 SKU)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-severity-p1 animate-pulse" />
              </div>
              <div className="my-2">
                <div className="text-[11px] text-severity-p1Light font-medium">Eviction Storm Active</div>
                <div className="font-metric font-bold text-amber-300">1,420 evictions/s</div>
              </div>
              <div className="text-[10px] text-amber-400 font-medium">Maxmemory policy breached</div>
            </div>

            {/* Azure SQL (Degraded via Connection Cascade) */}
            <div className="p-3.5 rounded-lg bg-space-850 border border-amber-500/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Azure SQL Database</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="my-2">
                <div className="text-[11px] text-slate-400">Connection Pool</div>
                <div className="font-metric font-semibold text-amber-300">92% Pool Capacity</div>
              </div>
              <div className="text-[10px] text-amber-400 font-medium">Connection queue pressure</div>
            </div>

            {/* Kubernetes Cluster */}
            <div className="p-3.5 rounded-lg bg-space-850 border border-border-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">AKS Cluster EastUS</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="my-2">
                <div className="text-[11px] text-slate-400">Pod Replicas</div>
                <div className="font-metric font-semibold text-slate-200">32 Pods Active (74% CPU)</div>
              </div>
              <div className="text-[10px] text-slate-400">Avoid pod restarts</div>
            </div>

            {/* Payment Auth Service */}
            <div className="p-3.5 rounded-lg bg-space-850 border border-health-ok/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Payment Auth Service</span>
                <span className="w-2 h-2 rounded-full bg-health-ok" />
              </div>
              <div className="my-2">
                <div className="text-[11px] text-slate-400">Consumer Queue</div>
                <div className="font-metric font-semibold text-white">Lag: 4 ms</div>
              </div>
              <div className="text-[10px] text-health-ok font-medium">Healthy & standing by</div>
            </div>
          </div>
        </div>

        {/* Live Incident Timeline */}
        <div className="p-5 rounded-xl bg-space-900 border border-border-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
              <Clock className="w-4 h-4 mr-2 text-cyan-400" /> Incident Timeline
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-space-800 text-slate-400 font-mono">
              Live Stream
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-80 pr-1 text-xs">
            <div className="flex items-start space-x-3">
              <span className="font-metric text-[11px] text-slate-400 shrink-0 mt-0.5">14:05:12</span>
              <div className="border-l-2 border-cyan-500/40 pl-3">
                <span className="font-semibold text-white">v4.18.2 Deployed</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Cache connection-pool and memory max-limit updated by pipeline-bot.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="font-metric text-[11px] text-slate-400 shrink-0 mt-0.5">14:08:44</span>
              <div className="border-l-2 border-amber-500/40 pl-3">
                <span className="font-semibold text-amber-300">Redis Eviction Alert</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Eviction threshold breached (&gt;450 ops/sec). Session cache invalidating.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="font-metric text-[11px] text-slate-400 shrink-0 mt-0.5">14:15:30</span>
              <div className="border-l-2 border-severity-p1/60 pl-3">
                <span className="font-semibold text-severity-p1Light">p95 Latency Breached</span>
                <p className="text-slate-400 text-[11px] mt-0.5">p95 surged to 6.8s; error rate surpassed 10% SLA threshold.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="font-metric text-[11px] text-slate-400 shrink-0 mt-0.5">14:19:00</span>
              <div className="border-l-2 border-severity-p1 pl-3">
                <span className="font-bold text-severity-p1Light">P1 Outage Declared</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Bridge channel #incident-checkout-p1 initialized. On-call paged.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="font-metric text-[11px] text-cyan-400 shrink-0 mt-0.5">Now</span>
              <div className="border-l-2 border-cyan-400 pl-3">
                <span className="font-semibold text-cyan-300">Memory Agent Ready</span>
                <p className="text-slate-300 text-[11px] mt-0.5">Historical memory banks ready for grounding and outcome-ranked remediation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
