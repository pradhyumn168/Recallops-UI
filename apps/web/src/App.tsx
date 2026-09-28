import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { IncidentDetailView } from './components/IncidentDetailView';
import { ActivityView } from './components/ActivityView';
import { TeamView } from './components/TeamView';
import { ResolveModal } from './components/ResolveModal';
import { NewIncidentModal } from './components/NewIncidentModal';
import { api } from './services/api';
import {
  IncidentContext,
  GroundedBriefing,
  RankedAction,
  ChatMessage,
  MemoryBankStats,
  ResolveRequest,
  ResolveResponse,
  AlertRequest,
  TeamMember,
  ActivityItem,
} from './types';
import { Bot, Brain, Database, Shield, Zap, Sparkles, Layers, CheckCircle2 } from 'lucide-react';

const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'usr-alice',
    name: 'Alice Chen',
    email: 'alice.chen@recallops.internal',
    role: 'Lead SRE',
    team_service: 'checkout-service',
    on_call_status: 'Primary On-Call',
    initials: 'AC',
    avatar_color: 'bg-purple-600',
    is_lead: true,
  },
  {
    id: 'usr-bob',
    name: 'Bob Martinez',
    email: 'bob.martinez@recallops.internal',
    role: 'Secondary SRE',
    team_service: 'Data Platform',
    on_call_status: 'Secondary On-Call',
    initials: 'BM',
    avatar_color: 'bg-teal-600',
    is_lead: false,
  },
  {
    id: 'usr-alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@recallops.internal',
    role: 'Incident Commander',
    team_service: 'Platform Ops',
    on_call_status: 'Primary On-Call',
    initials: 'AR',
    avatar_color: 'bg-indigo-600',
    is_lead: true,
  },
  {
    id: 'usr-sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@recallops.internal',
    role: 'Platform Engineer',
    team_service: 'Core Infrastructure',
    on_call_status: 'Available',
    initials: 'SC',
    avatar_color: 'bg-emerald-600',
    is_lead: false,
  },
  {
    id: 'usr-mike',
    name: 'Mike Ross',
    email: 'mike.ross@recallops.internal',
    role: 'Security Responder',
    team_service: 'Payment Gateway',
    on_call_status: 'Off-Duty',
    initials: 'MR',
    avatar_color: 'bg-amber-600',
    is_lead: false,
  },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '10 min ago',
    category: 'incident',
    title: 'P1 Outage alert triggered on checkout-service',
    detail: 'p95 latency spike to 8.4s and 5xx HTTP error rate surge to 18.6% across 27,400 checkout attempts.',
    actor: 'Metrics Agent',
    is_agent: true,
    incident_id: 'INC-2026-0928',
    service: 'checkout-service',
    severity: 'P1',
  },
  {
    id: 'act-2',
    timestamp: '9 min ago',
    category: 'assignment',
    title: 'Response team assigned to INC-2026-0928',
    detail: 'Alex Rivera assigned as Lead Incident Commander. Alice Chen (Primary SRE) and Bob Martinez (Secondary SRE) dispatched.',
    actor: 'Team Dispatcher',
    actor_role: 'Operations',
    incident_id: 'INC-2026-0928',
    service: 'checkout-service',
    severity: 'P1',
  },
  {
    id: 'act-3',
    timestamp: '7 min ago',
    category: 'memory',
    title: 'Hindsight Memory Bank matched historical incident INC-2025-0417',
    detail: 'RecallOps pattern match (92% confidence) recalled root cause: Redis max-memory eviction cascade. Retrieved 3 ranked mitigations.',
    actor: 'RecallOps Agent',
    is_agent: true,
    incident_id: 'INC-2026-0928',
    service: 'checkout-service',
  },
  {
    id: 'act-4',
    timestamp: '4 min ago',
    category: 'approval',
    title: 'Lead human approved rollback of checkout-api v4.18.2',
    detail: 'Alex Rivera authorized remediation action #rem-rollback. Briefing Guard verified citation integrity against recalled INC-2025-0417 evidence.',
    actor: 'Alex Rivera',
    actor_role: 'Incident Commander',
    incident_id: 'INC-2026-0928',
    service: 'checkout-service',
  },
  {
    id: 'act-5',
    timestamp: '3 min ago',
    category: 'mitigation',
    title: 'Briefing Guard enforced historical hazard constraint',
    detail: 'Historical failure notice enforced: Pod restart mitigation was prohibited due to active eviction cascades causing node blackout in 2025.',
    actor: 'Briefing Guard',
    is_agent: true,
    incident_id: 'INC-2026-0928',
    service: 'checkout-service',
  },
  {
    id: 'act-6',
    timestamp: '2 days ago',
    category: 'postmortem',
    title: 'Incident INC-2025-0417 post-mortem retained in memory bank',
    detail: 'Knowledge successfully committed to fix_outcomes bank. Runbook cache-saturation-recovery updated (+0.12 reliability delta).',
    actor: 'Hindsight Memory System',
    is_agent: true,
    incident_id: 'INC-2025-0417',
    service: 'redis-cache-cluster',
  },
];

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false);
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState<boolean>(false);

  // System & Model state
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [modelUsed, setModelUsed] = useState<string>('openai/gpt-oss-120b');
  const [fallbackUsed, setFallbackUsed] = useState<boolean>(false);
  const [memoryStats, setMemoryStats] = useState<MemoryBankStats>({
    incidents_count: 3,
    fix_outcomes_count: 6,
    team_count: 5,
    baseline_count: 0,
    mode: 'DEMO_LOCAL',
  });

  // Team state with localStorage persistence
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('recallops_team_members');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading saved team members:', e);
    }
    return INITIAL_TEAM_MEMBERS;
  });

  // Activity state with live updates
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // Incident state
  const [incident, setIncident] = useState<IncidentContext>({
    incident_id: 'INC-2026-0928',
    title: 'Increased error rate on checkout API',
    service: 'checkout-service',
    severity: 'P1',
    status: 'Investigating',
    symptoms: [
      'p95 latency spike to 8.4s',
      '5xx HTTP error rate surge to 18.6%',
      'Redis memory max-eviction threshold alerts',
      'Connection timeouts between Checkout API and downstream cache',
    ],
    metrics: {
      p95_latency_seconds: 8.4,
      error_rate_percent: 18.6,
      affected_checkout_attempts: 27400,
      redis_eviction_rate_ops: 1420,
      cpu_utilization_percent: 74.2,
    },
    affected_components: ['Checkout API', 'Redis Cache', 'Azure SQL', 'Kubernetes Cluster'],
    recent_changes: [
      {
        component: 'checkout-api',
        version: 'v4.18.2',
        description: 'Cache configuration release updating Redis connection pool and memory max-limit',
        deployed_ago_minutes: 19,
        author: 'pipeline-bot',
      },
    ],
    environment: 'eastus-az',
    timestamp: '2026-09-28T14:05:00Z',
    owner: INITIAL_TEAM_MEMBERS[2], // Alex Rivera
    assigned_responders: [INITIAL_TEAM_MEMBERS[0], INITIAL_TEAM_MEMBERS[1]], // Alice Chen, Bob Martinez
  });

  const [briefing, setBriefing] = useState<GroundedBriefing | null>(null);
  const [rankedFixes, setRankedFixes] = useState<RankedAction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Initialize
  useEffect(() => {
    async function loadInitial() {
      try {
        const [health, activeInc, stats] = await Promise.all([
          api.getHealth(),
          api.getActiveIncident(),
          api.getMemoryStats(),
        ]);
        setDemoMode(health.demo_mode);
        setModelUsed(health.llm_primary_model);
        setIncident((prev) => ({
          ...activeInc,
          owner: prev.owner,
          assigned_responders: prev.assigned_responders,
        }));
        setMemoryStats(stats);
      } catch (e) {
        console.warn('Initial backend load fallback:', e);
      }
    }
    loadInitial();
  }, []);

  // Handle Add Team Member
  const handleAddTeamMember = (member: TeamMember) => {
    const updated = [member, ...teamMembers];
    setTeamMembers(updated);
    try {
      localStorage.setItem('recallops_team_members', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving team members to localStorage:', e);
    }

    // Append to activity log
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}-team`,
      timestamp: 'Just now',
      category: 'assignment',
      title: `New team responder onboarded: ${member.name}`,
      detail: `${member.name} (${member.role}) joined ${member.team_service} with availability status "${member.on_call_status}".`,
      actor: 'Mike Taylor',
      actor_role: 'Platform SRE Admin',
      service: member.team_service,
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Trigger Investigation Flow: POST /api/alerts
  const handleInvestigateMemory = async () => {
    setIsInvestigating(true);
    try {
      const res = await api.submitAlert({
        title: incident.title,
        service: incident.service,
        severity: incident.severity,
        symptoms: incident.symptoms,
        metrics: incident.metrics,
        affected_components: incident.affected_components,
        recent_changes: incident.recent_changes,
        environment: incident.environment,
      });

      setBriefing(res.briefing);
      setRankedFixes(res.ranked_fixes);
      setModelUsed(res.model_used);
      setFallbackUsed(res.fallback_used);

      setChatMessages([
        {
          id: 'init-brief',
          role: 'assistant',
          content: `Recalled historical match INC-2025-0417 (92% pattern match). Root cause: Redis max-memory eviction cascade caused downstream saturation. Recommended: Roll back cache configuration release and scale Redis capacity. Warning: Pod restart mitigation was ineffective in 2025.`,
          timestamp: new Date().toISOString(),
          cited_incident_ids: res.recalled_incident_ids,
          cited_fix_ids: res.recalled_fix_ids.slice(0, 3),
        },
      ]);
    } catch (err) {
      console.error('Investigation error:', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  // Follow-up Grounded Chat: POST /api/incidents/{id}/chat
  const handleSendMessage = async (query: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsSendingChat(true);

    try {
      const res = await api.sendChat(incident.incident_id, query);
      const agentMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toISOString(),
        cited_incident_ids: res.cited_incident_ids,
        cited_fix_ids: res.cited_fix_ids,
        confidence: res.confidence,
      };
      setChatMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Resolution Commit: POST /api/incidents/{id}/resolve
  const handleConfirmResolve = async (payload: ResolveRequest): Promise<ResolveResponse> => {
    setIsResolving(true);
    try {
      const res = await api.resolveIncident(incident.incident_id, payload);
      setIncident((prev) => ({ ...prev, status: 'Resolved' }));
      const newStats = await api.getMemoryStats();
      setMemoryStats(newStats);

      // Append resolution & post-mortem events to activity log
      const resEvent: ActivityItem = {
        id: `act-${Date.now()}-res`,
        timestamp: 'Just now',
        category: 'resolution',
        title: `Incident ${incident.incident_id} marked Resolved`,
        detail: `Confirmed root cause: ${payload.confirmed_root_cause}. Runbook used: ${payload.runbook_used}. System metrics normalized.`,
        actor: 'Mike Taylor',
        actor_role: 'Platform SRE Admin',
        incident_id: incident.incident_id,
        service: incident.service,
      };

      const retentionEvent: ActivityItem = {
        id: `act-${Date.now()}-retention`,
        timestamp: 'Just now',
        category: 'postmortem',
        title: `Resolution retained in Hindsight fix_outcomes memory bank`,
        detail: `Retained fixes: ${res.memory_update_summary?.retained_fixes_count || 1}. Runbook reliability delta: +${res.memory_update_summary?.runbook_reliability_delta || 0.15}. Estimated ${res.memory_update_summary?.estimated_minutes_saved || 54} minutes saved for future occurrences.`,
        actor: 'Hindsight Memory System',
        is_agent: true,
        incident_id: incident.incident_id,
        service: incident.service,
      };

      setActivities((prev) => [resEvent, retentionEvent, ...prev]);
      return res;
    } catch (err) {
      console.error('Resolve error:', err);
      throw err;
    } finally {
      setIsResolving(false);
    }
  };

  // Create new incident
  const handleNewIncidentSubmit = async (data: AlertRequest) => {
    const newIncidentId = `INC-2026-0928`;
    const newContext: IncidentContext = {
      incident_id: newIncidentId,
      title: data.title,
      service: data.service,
      severity: data.severity,
      status: 'Investigating',
      symptoms: data.symptoms,
      metrics: data.metrics,
      affected_components: data.affected_components,
      recent_changes: data.recent_changes,
      environment: data.environment,
      timestamp: new Date().toISOString(),
      owner: data.owner,
      assigned_responders: data.assigned_responders,
    };
    setIncident(newContext);

    // Append to Activity feed: Response team assigned to INC-2026-XXXX
    const responderNames = (data.assigned_responders || []).map((r) => r.name).join(', ') || 'Alice Chen, Bob Martinez';
    const ownerName = data.owner?.name || 'Alex Rivera';

    const assignmentEvent: ActivityItem = {
      id: `act-${Date.now()}-assign`,
      timestamp: 'Just now',
      category: 'assignment',
      title: `Response team assigned to ${newIncidentId}`,
      detail: `Incident Commander ${ownerName} assigned as Lead Owner. Dispatched response team: ${responderNames}.`,
      actor: 'Team Dispatcher',
      actor_role: 'Operations',
      incident_id: newIncidentId,
      service: data.service,
      severity: data.severity,
    };

    const alertEvent: ActivityItem = {
      id: `act-${Date.now()}-alert`,
      timestamp: 'Just now',
      category: 'incident',
      title: `Incident alert triggered on ${data.service}`,
      detail: `${data.title} • Severity: ${data.severity} • Symptoms: ${data.symptoms.join(', ')}`,
      actor: 'Metrics Agent',
      is_agent: true,
      incident_id: newIncidentId,
      service: data.service,
      severity: data.severity,
    };

    setActivities((prev) => [assignmentEvent, alertEvent, ...prev]);

    await handleInvestigateMemory();
    setCurrentView('incident-detail');
  };

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      {/* 1. Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        activeIncidentsCount={incident.status === 'Resolved' ? 2 : 3}
      />

      {/* 2. Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNav
          demoMode={demoMode}
          modelUsed={modelUsed}
          fallbackUsed={fallbackUsed}
          onSearch={(q) => {
            if (q.toLowerCase().includes('checkout') || q.toLowerCase().includes('inc')) {
              setCurrentView('incident-detail');
            } else if (q.toLowerCase().includes('team') || q.toLowerCase().includes('alice') || q.toLowerCase().includes('alex')) {
              setCurrentView('team');
            } else if (q.toLowerCase().includes('activity') || q.toLowerCase().includes('log')) {
              setCurrentView('activity');
            }
          }}
        />

        {/* Page Content */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <DashboardView
              activeIncident={incident}
              onSelectIncident={() => {
                if (!briefing) handleInvestigateMemory();
                setCurrentView('incident-detail');
              }}
              onOpenNewIncident={() => setIsNewIncidentModalOpen(true)}
              memoryStats={memoryStats}
            />
          )}

          {/* DEDICATED ACTIVITY VIEW */}
          {currentView === 'activity' && (
            <ActivityView
              activities={activities}
              onSelectIncident={(id) => {
                if (!briefing) handleInvestigateMemory();
                setCurrentView('incident-detail');
              }}
              onOpenNewIncident={() => setIsNewIncidentModalOpen(true)}
            />
          )}

          {/* INCIDENT DETAIL VIEW */}
          {currentView === 'incident-detail' && (
            <IncidentDetailView
              incident={incident}
              briefing={briefing}
              rankedFixes={rankedFixes}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              isSendingChat={isSendingChat}
              onOpenResolveModal={() => setIsResolveModalOpen(true)}
              onBackToDashboard={() => setCurrentView('dashboard')}
              onInvestigateMemory={handleInvestigateMemory}
              isInvestigating={isInvestigating}
            />
          )}

          {/* DEDICATED TEAM MANAGEMENT VIEW */}
          {currentView === 'team' && (
            <TeamView
              teamMembers={teamMembers}
              onAddTeamMember={handleAddTeamMember}
            />
          )}

          {/* SERVICES DIRECTORY VIEW */}
          {currentView === 'services' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Services Directory</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Managed microservices, health status, and Hindsight memory bank linkages</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => setCurrentView('incident-detail')}
                    className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/40 cursor-pointer hover:border-rose-400 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>checkout-service</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        {incident.status === 'Resolved' ? 'Resolved' : 'P1 Outage'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      {incident.status === 'Resolved' ? 'p95: 140ms • Nominal' : 'p95: 8.4s • Error rate: 18.6%'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 transition-colors shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>payment-auth</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Healthy</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">p95: 120ms • Consumer queue normal</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 transition-colors shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>redis-cache-cluster</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        {incident.status === 'Resolved' ? 'Recovered' : 'Evicting'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      {incident.status === 'Resolved' ? '0 evictions/s • Normal' : '1,420 evictions/s • P2 tier'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AGENTS & MEMORY VIEW (NO ARCHITECTURE SCREEN) */}
          {currentView === 'agents' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-900">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      RecallOps Agent & Memory Banks
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Autonomous decision support agents and Hindsight memory bank telemetry
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Incidents Bank</span>
                      <Database className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {memoryStats.incidents_count}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Historical Outages</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Fix Outcomes Bank</span>
                      <Brain className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {memoryStats.fix_outcomes_count}
                    </div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Ranked Mitigations</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Team Memory Bank</span>
                      <Shield className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {teamMembers.length}
                    </div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Responders & Policies</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Briefing Guard</span>
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      Strict
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Anti-hallucination ON</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {currentView === 'settings' && (
            <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4 transition-colors">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings & API Configuration</h1>
              <div className="space-y-3 text-xs max-w-xl">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">FastAPI Backend Endpoint</label>
                  <input
                    type="text"
                    readOnly
                    value="http://localhost:8000"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-mono text-slate-800 dark:text-slate-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Groq Primary Model</label>
                  <input
                    type="text"
                    readOnly
                    value="openai/gpt-oss-120b (Fallback: qwen/qwen3.8-27b)"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-mono text-slate-800 dark:text-slate-200 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. Modal Dialogs */}
      <ResolveModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        incident={incident}
        onConfirmResolve={handleConfirmResolve}
        isResolving={isResolving}
      />

      <NewIncidentModal
        isOpen={isNewIncidentModalOpen}
        onClose={() => setIsNewIncidentModalOpen(false)}
        onSubmit={handleNewIncidentSubmit}
        isLoading={isInvestigating}
        teamMembers={teamMembers}
      />
    </div>
  );
};

export default App;
