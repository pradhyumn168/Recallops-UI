import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Brain,
  Users,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Bot,
  User,
  Clock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { ActivityItem } from '../types';

interface ActivityViewProps {
  activities: ActivityItem[];
  onSelectIncident?: (incidentId: string) => void;
  onOpenNewIncident?: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  activities,
  onSelectIncident,
  onOpenNewIncident,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category === selectedCategory ||
        (selectedCategory === 'resolution' && (item.category === 'resolution' || item.category === 'postmortem'));

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.incident_id && item.incident_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.service && item.service.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activities, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activities.length,
      incident: 0,
      memory: 0,
      assignment: 0,
      mitigation: 0,
      approval: 0,
      resolution: 0,
    };
    activities.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      }
      if (a.category === 'postmortem') {
        counts.resolution++;
      }
    });
    return counts;
  }, [activities]);

  const getCategoryConfig = (category: ActivityItem['category']) => {
    switch (category) {
      case 'memory':
        return {
          icon: Brain,
          badgeClass: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
          dotClass: 'bg-purple-500',
          label: 'Memory Recall',
        };
      case 'assignment':
        return {
          icon: Users,
          badgeClass: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          dotClass: 'bg-blue-500',
          label: 'Team Assignment',
        };
      case 'approval':
        return {
          icon: ShieldCheck,
          badgeClass: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          dotClass: 'bg-emerald-500',
          label: 'Human Approval',
        };
      case 'mitigation':
        return {
          icon: Terminal,
          badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          dotClass: 'bg-amber-500',
          label: 'Mitigation Executed',
        };
      case 'resolution':
        return {
          icon: CheckCircle2,
          badgeClass: 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800',
          dotClass: 'bg-green-500',
          label: 'Incident Resolved',
        };
      case 'postmortem':
        return {
          icon: BookOpen,
          badgeClass: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
          dotClass: 'bg-indigo-500',
          label: 'Post-Mortem & Retention',
        };
      case 'incident':
      default:
        return {
          icon: AlertTriangle,
          badgeClass: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          dotClass: 'bg-rose-500',
          label: 'Incident Event',
        };
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Incident and Memory Activity Feed">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Activity Feed
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Chronological audit log of incident alerts, memory recalls, responder assignments, approvals, and resolutions
          </p>
        </div>

        {onOpenNewIncident && (
          <button
            type="button"
            onClick={onOpenNewIncident}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Trigger New Incident</span>
          </button>
        )}
      </div>

      {/* Metrics Quick Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Events</span>
            <Activity className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {activities.length}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active telemetry</span>
        </div>

        <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Memory Recalls</span>
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {categoryCounts.memory || 3}
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">92% match confidence</span>
        </div>

        <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Assigned Responders</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            4
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">On-call coverage 100%</span>
        </div>

        <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Human Approvals</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {categoryCounts.approval || 2}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Briefing Guard passed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#161F36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 text-xs no-scrollbar" role="tablist" aria-label="Activity Categories">
          {[
            { id: 'all', label: 'All Events', count: categoryCounts.all },
            { id: 'incident', label: 'Incidents', count: categoryCounts.incident },
            { id: 'memory', label: 'Memory Recalls', count: categoryCounts.memory },
            { id: 'assignment', label: 'Assignments', count: categoryCounts.assignment },
            { id: 'mitigation', label: 'Mitigations', count: categoryCounts.mitigation },
            { id: 'approval', label: 'Approvals', count: categoryCounts.approval },
            { id: 'resolution', label: 'Resolutions', count: categoryCounts.resolution },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feed or incident ID..."
            aria-label="Filter activity feed"
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Chronological Timeline Feed */}
      <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">No activity events match your filter</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting "All Events" or clearing your search term to see the complete audit history.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 space-y-8">
            {filteredActivities.map((activity, idx) => {
              const config = getCategoryConfig(activity.category);
              const CategoryIcon = config.icon;

              return (
                <div key={activity.id || idx} className="relative group">
                  {/* Timeline Node Icon */}
                  <div
                    className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-[#161F36] flex items-center justify-center shadow-xs ${config.badgeClass}`}
                    title={config.label}
                  >
                    <CategoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  {/* Card Content */}
                  <div className="bg-slate-50/70 dark:bg-[#11172A] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-brand-500/40 transition-all space-y-3 shadow-2xs">
                    {/* Header Row: Category Badge, Actor, Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeClass}`}>
                          {config.label}
                        </span>

                        {activity.severity && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              activity.severity === 'P1'
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {activity.severity}
                          </span>
                        )}

                        {activity.service && (
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {activity.service}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-slate-400 text-xs">
                        <div className="flex items-center space-x-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">
                        {activity.detail}
                      </p>
                    </div>

                    {/* Footer Row: Actor & Incident link */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200 shrink-0">
                          {activity.is_agent ? <Bot className="w-3 h-3 text-brand-500" /> : <User className="w-3 h-3 text-slate-500" />}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {activity.actor}
                        </span>
                        {activity.actor_role && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {activity.actor_role}
                          </span>
                        )}
                      </div>

                      {activity.incident_id && onSelectIncident && (
                        <button
                          type="button"
                          onClick={() => onSelectIncident(activity.incident_id!)}
                          className="flex items-center space-x-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-mono text-[11px] font-bold group-hover:underline cursor-pointer"
                        >
                          <span>{activity.incident_id}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityView;
