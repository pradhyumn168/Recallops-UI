import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bot,
  Plus,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { IncidentContext, MemoryBankStats } from '../types';

interface DashboardViewProps {
  activeIncident: IncidentContext;
  onSelectIncident: (incidentId: string) => void;
  onOpenNewIncident: () => void;
  memoryStats: MemoryBankStats;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeIncident,
  onSelectIncident,
  onOpenNewIncident,
  memoryStats,
}) => {
  const incidents = [
    {
      id: 'INC-2026-0928',
      title: 'Increased error rate on checkout API',
      timestamp: '12/05/2026, 04:30:00',
      severity: 'P1',
      severityBadge: 'bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      status: activeIncident.status || 'Investigating',
      statusBadge:
        activeIncident.status === 'Resolved'
          ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
          : 'bg-indigo-100 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    },
    {
      id: 'INC-2025-042',
      title: 'Elevated latency in EU cluster',
      timestamp: '12/05/2026, 05:15:00',
      severity: 'P2',
      severityBadge: 'bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      status: 'Open',
      statusBadge: 'bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    },
    {
      id: 'INC-2025-043',
      title: 'Database connection timeouts in US region',
      timestamp: '12/05/2026, 06:00:00',
      severity: 'P1',
      severityBadge: 'bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      status: 'Open',
      statusBadge: 'bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    },
    {
      id: 'INC-2025-044',
      title: 'Network packet drop in APAC backbone',
      timestamp: '12/05/2026, 07:30:00',
      severity: 'P2',
      severityBadge: 'bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      status: 'Investigating',
      statusBadge: 'bg-indigo-100 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    },
    {
      id: 'INC-2025-045',
      title: 'User authentication gateway retry spike',
      timestamp: '12/05/2026, 08:45:00',
      severity: 'P3',
      severityBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      status: 'Resolved',
      statusBadge: 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    },
    {
      id: 'INC-2025-046',
      title: 'Slow response times in NA catalog service',
      timestamp: '12/05/2026, 09:15:00',
      severity: 'P2',
      severityBadge: 'bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      status: 'Monitoring',
      statusBadge: 'bg-blue-100 dark:bg-blue-950/90 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    },
  ];

  const activityFeed = [
    {
      actor: 'Alex Rivera',
      action: 'performed Update',
      detail: 'Changed checkout-service status to Investigating',
      time: '05:20:00',
    },
    {
      actor: 'RecallOps Agent',
      action: 'recalled Memory',
      detail: 'Found 92% match with INC-2025-0417 cache outage',
      time: '05:18:22',
      isAgent: true,
    },
    {
      actor: 'System',
      action: 'performed Create',
      detail: 'Automated alert trigger: High Latency > 8.4s',
      time: '05:15:00',
    },
    {
      actor: 'Sarah Chen',
      action: 'performed Deploy',
      detail: 'checkout-api v4.18.2 configuration change',
      time: '04:45:00',
    },
    {
      actor: 'Mike Ross',
      action: 'performed Login',
      detail: 'Logged in from 192.168.1.5',
      time: '04:30:00',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time incident response and memory decision support cockpit
          </p>
        </div>

        <button
          onClick={onOpenNewIncident}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Incident</span>
        </button>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Incidents */}
        <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/80 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              Action Required
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">3</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Active Incidents</div>
          </div>
        </div>

        {/* Card 2: Service Health */}
        <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              +2.4%
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">60%</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Service Health</div>
          </div>
        </div>

        {/* Card 3: Mean Time to Resolve */}
        <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900/80 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Last 7 days
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight flex items-baseline gap-2">
              <span>45m</span>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">(-18m saved)</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Mean Time to Resolve</div>
          </div>
        </div>

        {/* Card 4: AI Agents Running */}
        <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-900/80 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Bot className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800">
              Active
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
              {memoryStats.incidents_count + 1}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">AI Agents Running</div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Recent Incidents & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Incidents (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#161F36] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Incidents</h3>
            <button
              onClick={() => onSelectIncident('INC-2026-0928')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline transition-colors"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-3.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1.5 shrink-0 shadow-xs" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {inc.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {inc.id} • {inc.timestamp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${inc.severityBadge}`}>
                    {inc.severity}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${inc.statusBadge}`}>
                    {inc.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Activity Feed (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#161F36] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg overflow-hidden flex flex-col transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Activity Feed</h3>
            <button
              onClick={() => onSelectIncident('INC-2026-0928')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline transition-colors"
            >
              View all
            </button>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[460px]">
            {activityFeed.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 relative">
                {idx !== activityFeed.length - 1 && (
                  <div className="absolute left-[7px] top-4 w-0.5 h-full bg-slate-200 dark:bg-slate-700" />
                )}
                <span
                  className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 z-10 border-2 border-white dark:border-[#161F36] shadow-xs ${
                    item.isAgent ? 'bg-brand-600' : 'bg-slate-400 dark:bg-slate-500'
                  }`}
                />
                <div className="text-xs space-y-0.5">
                  <div className="text-slate-900 dark:text-slate-100">
                    <strong className="font-bold text-slate-900 dark:text-white">{item.actor}</strong>{' '}
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.action}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">{item.detail}</div>
                  <div className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardView;
