import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Layers,
  Users,
  Clock,
  ChevronRight,
  Shield,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { IncidentContext, IncidentStatus, SeverityLevel } from '../types';

interface IncidentsViewProps {
  incidents: IncidentContext[];
  onSelectIncident: (incidentId: string) => void;
  onOpenNewIncident: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenNewIncident,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity' | 'impact'>('newest');

  // Extract distinct services and owners
  const distinctServices = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((inc) => {
      if (inc.service) set.add(inc.service);
    });
    return Array.from(set).sort();
  }, [incidents]);

  const distinctOwners = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((inc) => {
      if (inc.owner?.name) set.add(inc.owner.name);
    });
    return Array.from(set).sort();
  }, [incidents]);

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts = {
      all: incidents.length,
      open: 0,
      investigating: 0,
      resolving: 0,
      resolved: 0,
    };
    incidents.forEach((inc) => {
      const s = inc.status?.toLowerCase();
      if (s === 'open') counts.open++;
      else if (s === 'investigating') counts.investigating++;
      else if (s === 'resolving') counts.resolving++;
      else if (s === 'resolved') counts.resolved++;
    });
    return counts;
  }, [incidents]);

  // Filtered and sorted incidents
  const filteredIncidents = useMemo(() => {
    let result = incidents.filter((inc) => {
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        inc.incident_id.toLowerCase().includes(term) ||
        inc.title.toLowerCase().includes(term) ||
        inc.service.toLowerCase().includes(term) ||
        (inc.owner?.name || '').toLowerCase().includes(term) ||
        String(inc.impactedUsers || inc.metrics?.affected_checkout_attempts || '').includes(term);

      const matchesStatus =
        statusFilter === 'all' ||
        inc.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesSeverity =
        severityFilter === 'all' || inc.severity === severityFilter;

      const matchesService =
        serviceFilter === 'all' || inc.service === serviceFilter;

      const matchesOwner =
        ownerFilter === 'all' || inc.owner?.name === ownerFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity &&
        matchesService &&
        matchesOwner
      );
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === 'severity') {
        const order: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
        return (order[a.severity] || 5) - (order[b.severity] || 5);
      }
      if (sortBy === 'impact') {
        const aUsers = a.impactedUsers || a.metrics?.affected_checkout_attempts || 0;
        const bUsers = b.impactedUsers || b.metrics?.affected_checkout_attempts || 0;
        return bUsers - aUsers;
      }
      return 0;
    });

    return result;
  }, [
    incidents,
    searchQuery,
    statusFilter,
    severityFilter,
    serviceFilter,
    ownerFilter,
    sortBy,
  ]);

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'P1':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'P2':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'P3':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Resolving':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Open':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Investigating':
      default:
        return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Incidents Directory">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Incidents
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Complete incident register across Open, Investigating, Resolving, and Resolved lifecycle stages
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewIncident}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Incident</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Incidents</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{incidents.length}</div>
          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">Tracked in memory</span>
        </div>

        <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Active (Open / In Progress)</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {statusCounts.open + statusCounts.investigating + statusCounts.resolving}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold">Requiring triage</span>
        </div>

        <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Impacted Users</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {incidents
              .reduce((sum, inc) => sum + (inc.impactedUsers || inc.metrics?.affected_checkout_attempts || 0), 0)
              .toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Cumulative affected</span>
        </div>

        <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Resolved</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {statusCounts.resolved}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Retained in bank</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4">
        {/* Row 1: Search and Status Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 text-xs no-scrollbar" role="tablist">
            {[
              { id: 'all', label: 'All', count: statusCounts.all },
              { id: 'open', label: 'Open', count: statusCounts.open },
              { id: 'investigating', label: 'Investigating', count: statusCounts.investigating },
              { id: 'resolving', label: 'Resolving', count: statusCounts.resolving },
              { id: 'resolved', label: 'Resolved', count: statusCounts.resolved },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      active ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ID, title, service, owner..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
            />
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters and Sort */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          {/* Severity */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium text-xs focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - Major</option>
              <option value="P3">P3 - Minor</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>

          {/* Service */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Service:</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium text-xs focus:outline-none"
            >
              <option value="all">All Services</option>
              {distinctServices.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Owner:</span>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium text-xs focus:outline-none"
            >
              <option value="all">All Owners</option>
              {distinctOwners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">Severity (P1 → P4)</option>
              <option value="impact">Highest Impact</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List Cards */}
      <div className="bg-white dark:bg-[#161F36] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              No incidents match your selected filters
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your status, severity, or search term to view other incidents.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSeverityFilter('all');
                setServiceFilter('all');
                setOwnerFilter('all');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            const userCount = inc.impactedUsers || inc.metrics?.affected_checkout_attempts || 0;
            return (
              <div
                key={inc.incident_id}
                onClick={() => onSelectIncident(inc.incident_id)}
                className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-4">
                  {/* Status indicator dot */}
                  <span
                    className={`w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-xs ${
                      inc.status === 'Resolved'
                        ? 'bg-emerald-500'
                        : inc.status === 'Open'
                        ? 'bg-amber-500'
                        : inc.status === 'Resolving'
                        ? 'bg-blue-500'
                        : 'bg-rose-500'
                    }`}
                  />

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400">
                        {inc.incident_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getSeverityBadgeClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(inc.status)}`}>
                        {inc.status}
                      </span>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{inc.service}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {inc.title}
                    </h3>

                    {inc.symptoms && inc.symptoms.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {inc.symptoms.join(' • ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Meta details: Owner, Impact, Date, Action */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 text-xs">
                  {/* Owner */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 min-w-[28px] min-h-[28px] aspect-square rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-2xs select-none ${
                        inc.owner?.avatar_color || 'bg-brand-600'
                      }`}
                    >
                      {inc.owner?.initials || 'AR'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-tight">
                        {inc.owner?.name || 'Alex Rivera'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {inc.owner?.role || 'Lead Commander'}
                      </span>
                    </div>
                  </div>

                  {/* Impacted Users */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1 font-bold text-slate-900 dark:text-white text-xs">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{userCount.toLocaleString()} users</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Impacted
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="hidden lg:flex flex-col items-end font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(inc.timestamp)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">Created</span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default IncidentsView;
