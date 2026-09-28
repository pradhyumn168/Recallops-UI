import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { IncidentsView } from './components/IncidentsView';
import { IncidentDetailView } from './components/IncidentDetailView';
import { ActivityView } from './components/ActivityView';
import { TeamView } from './components/TeamView';
import { ResolveModal } from './components/ResolveModal';
import { NewIncidentModal } from './components/NewIncidentModal';
import { api } from './services/api';
import {
  IncidentContext,
  IncidentStatus,
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
import { Bot, Brain, Database, Shield, Zap } from 'lucide-react';

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

const INITIAL_INCIDENTS: IncidentContext[] = [
  {
    incident_id: 'INC-2026-0928',
    title: 'Increased error rate on checkout API',
    service: 'checkout-service',
    severity: 'P1',
    status: 'Investigating',
    impactedUsers: 27400,
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
  },
  {
    incident_id: 'INC-2026-0929',
    title: 'Primary Azure SQL failover connection pool exhaustion',
    service: 'azure-sql-primary',
    severity: 'P1',
    status: 'Open',
    impactedUsers: 14850,
    symptoms: [
      'Connection pool exhausted on azure-sql-primary',
      'Database handshake timeout > 15s',
      'Order placement deadlock alarms triggered',
    ],
    metrics: {
      p95_latency_seconds: 6.2,
      error_rate_percent: 12.4,
      affected_checkout_attempts: 14850,
      cpu_utilization_percent: 88.5,
    },
    affected_components: ['Azure SQL', 'Order Processing Service', 'Event Hub'],
    recent_changes: [
      {
        component: 'azure-sql-primary',
        version: 'v2.1.0',
        description: 'Automated database geo-replication failover test',
        deployed_ago_minutes: 42,
        author: 'db-admin-bot',
      },
    ],
    environment: 'eastus2-az',
    timestamp: '2026-09-28T15:20:00Z',
    owner: INITIAL_TEAM_MEMBERS[1], // Bob Martinez
    assigned_responders: [INITIAL_TEAM_MEMBERS[0], INITIAL_TEAM_MEMBERS[3]], // Alice Chen, Sarah Chen
  },
  {
    incident_id: 'INC-2026-0927',
    title: 'High TLS handshake failure rate on EU gateway',
    service: 'edge-gateway-eu',
    severity: 'P2',
    status: 'Resolving',
    impactedUsers: 8200,
    symptoms: [
      'TLS 1.3 handshake renegotiation failures on edge nodes',
      'Certificate validation drop on frankfurt-ingress-02',
      'Client session termination spikes',
    ],
    metrics: {
      p95_latency_seconds: 3.1,
      error_rate_percent: 6.8,
      affected_checkout_attempts: 8200,
      cpu_utilization_percent: 61.0,
    },
    affected_components: ['Edge Gateway EU', 'Ingress Controller', 'Cert Manager'],
    recent_changes: [
      {
        component: 'edge-gateway-eu',
        version: 'v3.9.0',
        description: 'TLS certificate renewal and cipher suite rotation',
        deployed_ago_minutes: 85,
        author: 'sec-ops-bot',
      },
    ],
    environment: 'westeurope-az',
    timestamp: '2026-09-27T18:45:00Z',
    owner: INITIAL_TEAM_MEMBERS[0], // Alice Chen
    assigned_responders: [INITIAL_TEAM_MEMBERS[4]], // Mike Ross
  },
  {
    incident_id: 'INC-2026-0925',
    title: 'Duplicate payment authorization webhook retries',
    service: 'payment-auth',
    severity: 'P3',
    status: 'Resolved',
    impactedUsers: 1075,
    symptoms: [
      'Webhook idempotency key collision in Redis',
      'Stripe retry storm causing queue backpressure',
    ],
    metrics: {
      p95_latency_seconds: 1.2,
      error_rate_percent: 2.1,
      affected_checkout_attempts: 1075,
      cpu_utilization_percent: 45.2,
    },
    affected_components: ['Payment Auth', 'Webhook Ingress', 'Stripe Connector'],
    recent_changes: [],
    environment: 'eastus-az',
    timestamp: '2026-09-25T09:12:00Z',
    owner: INITIAL_TEAM_MEMBERS[4], // Mike Ross
    assigned_responders: [INITIAL_TEAM_MEMBERS[3]], // Sarah Chen
  },
  {
    incident_id: 'INC-2026-0922',
    title: 'Search index replication lag on catalog service',
    service: 'catalog-service',
    severity: 'P2',
    status: 'Resolved',
    impactedUsers: 3420,
    symptoms: [
      'Elasticsearch replica sync lag exceeding 45 minutes',
      'Stale search results served to product category pages',
    ],
    metrics: {
      p95_latency_seconds: 2.4,
      error_rate_percent: 4.5,
      affected_checkout_attempts: 3420,
      cpu_utilization_percent: 68.3,
    },
    affected_components: ['Catalog Service', 'Elasticsearch Cluster'],
    recent_changes: [],
    environment: 'centralus-az',
    timestamp: '2026-09-22T11:30:00Z',
    owner: INITIAL_TEAM_MEMBERS[3], // Sarah Chen
    assigned_responders: [INITIAL_TEAM_MEMBERS[2]], // Alex Rivera
  },
  {
    incident_id: 'INC-2025-0417',
    title: 'Redis maxmemory eviction cascade and connection saturation',
    service: 'redis-cache-cluster',
    severity: 'P1',
    status: 'Resolved',
    impactedUsers: 18500,
    symptoms: [
      'Redis maxmemory-policy allkeys-lru eviction surge',
      'Connection pool exhaustion across all checkout worker pods',
      'Cold cache stampede after premature pod restart',
    ],
    metrics: {
      p95_latency_seconds: 7.8,
      error_rate_percent: 16.4,
      affected_checkout_attempts: 18500,
      redis_eviction_rate_ops: 2100,
      cpu_utilization_percent: 82.0,
    },
    affected_components: ['Redis Cache', 'Checkout API', 'Kubernetes Ingress'],
    recent_changes: [],
    environment: 'eastus-az',
    timestamp: '2025-04-17T08:15:00Z',
    owner: INITIAL_TEAM_MEMBERS[2], // Alex Rivera
    assigned_responders: [INITIAL_TEAM_MEMBERS[0], INITIAL_TEAM_MEMBERS[1]], // Alice Chen, Bob Martinez
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
    incidents_count: 6,
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

  // Incidents state with localStorage persistence (Single Source of Truth)
  const [incidents, setIncidents] = useState<IncidentContext[]>(() => {
    try {
      const saved = localStorage.getItem('recallops_incidents');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((inc: any) => ({
            ...inc,
            impactedUsers:
              typeof inc.impactedUsers === 'number' && inc.impactedUsers > 0
                ? inc.impactedUsers
                : inc.metrics?.affected_checkout_attempts || 1000,
          }));
        }
      }
    } catch (e) {
      console.warn('Error reading saved incidents from localStorage:', e);
    }
    return INITIAL_INCIDENTS;
  });

  // Selected incident ID for incident-detail view
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-2026-0928');

  // Currently viewed incident context derived from incidents source of truth
  const activeIncident = useMemo(() => {
    return (
      incidents.find((inc) => inc.incident_id === selectedIncidentId) ||
      incidents[0] ||
      INITIAL_INCIDENTS[0]
    );
  }, [incidents, selectedIncidentId]);

  // Activity state with localStorage persistence
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem('recallops_activities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading saved activities from localStorage:', e);
    }
    return INITIAL_ACTIVITIES;
  });

  const [briefing, setBriefing] = useState<GroundedBriefing | null>(null);
  const [rankedFixes, setRankedFixes] = useState<RankedAction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Initialize from backend API if available
  useEffect(() => {
    async function loadInitial() {
      try {
        const [health, stats] = await Promise.all([
          api.getHealth(),
          api.getMemoryStats(),
        ]);
        setDemoMode(health.demo_mode);
        setModelUsed(health.llm_primary_model);
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
    setActivities((prev) => {
      const actsUpdated = [newActivity, ...prev];
      try {
        localStorage.setItem('recallops_activities', JSON.stringify(actsUpdated));
      } catch (e) {}
      return actsUpdated;
    });
  };

  // Select incident and open its detail view
  const handleSelectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    const target = incidents.find((i) => i.incident_id === incidentId);
    if (target && !briefing) {
      handleInvestigateMemory(target);
    }
    setCurrentView('incident-detail');
  };

  // Trigger Investigation Flow: POST /api/alerts
  const handleInvestigateMemory = async (targetInc?: IncidentContext) => {
    const target = targetInc || activeIncident;
    setIsInvestigating(true);
    try {
      const res = await api.submitAlert({
        incident_id: target.incident_id,
        title: target.title,
        service: target.service,
        severity: target.severity,
        impactedUsers: target.impactedUsers,
        symptoms: target.symptoms,
        metrics: target.metrics,
        affected_components: target.affected_components,
        recent_changes: target.recent_changes,
        environment: target.environment,
      });

      setBriefing(res.briefing);
      setRankedFixes(res.ranked_fixes);
      setModelUsed(res.model_used);
      setFallbackUsed(res.fallback_used);

      setChatMessages([
        {
          id: `init-brief-${Date.now()}`,
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
      const res = await api.sendChat(activeIncident.incident_id, query);
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

  // Update Incident Lifecycle Status: Open -> Investigating -> Resolving -> Resolved
  const handleUpdateIncidentStatus = (incidentId: string, newStatus: IncidentStatus) => {
    setIncidents((prev) => {
      const target = prev.find((inc) => inc.incident_id === incidentId);
      if (!target || target.status === newStatus) return prev;

      const oldStatus = target.status;
      const updated = prev.map((inc) =>
        inc.incident_id === incidentId ? { ...inc, status: newStatus } : inc
      );

      try {
        localStorage.setItem('recallops_incidents', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error updating incidents in localStorage:', e);
      }

      // Append single timestamped activity event without duplicate
      const statusTitle = `Incident ${incidentId} status changed to ${newStatus}`;
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}-status-${incidentId}`,
        timestamp: 'Just now',
        category: newStatus === 'Resolved' ? 'resolution' : 'incident',
        title: statusTitle,
        detail: `Status updated from ${oldStatus} to ${newStatus} for ${target.service}. Impacted users: ${(target.impactedUsers || target.metrics?.affected_checkout_attempts || 0).toLocaleString()}.`,
        actor: 'Mike Taylor',
        actor_role: 'Platform SRE Admin',
        incident_id: incidentId,
        service: target.service,
        severity: target.severity,
      };

      setActivities((prevActs) => {
        // Prevent duplicate status change event for the same status transition
        const exists = prevActs.some(
          (a) => a.incident_id === incidentId && a.title === statusTitle
        );
        if (exists) return prevActs;
        const actsUpdated = [newActivity, ...prevActs];
        try {
          localStorage.setItem('recallops_activities', JSON.stringify(actsUpdated));
        } catch (e) {}
        return actsUpdated;
      });

      return updated;
    });
  };

  // Resolution Commit: POST /api/incidents/{id}/resolve
  const handleConfirmResolve = async (payload: ResolveRequest): Promise<ResolveResponse> => {
    setIsResolving(true);
    try {
      const res = await api.resolveIncident(activeIncident.incident_id, payload);
      
      // Update incident status to 'Resolved'
      setIncidents((prev) => {
        const updated = prev.map((inc) =>
          inc.incident_id === activeIncident.incident_id
            ? { ...inc, status: 'Resolved' as IncidentStatus }
            : inc
        );
        try {
          localStorage.setItem('recallops_incidents', JSON.stringify(updated));
        } catch (e) {
          console.warn('Error saving resolved incident to localStorage:', e);
        }
        return updated;
      });

      const newStats = await api.getMemoryStats();
      setMemoryStats(newStats);

      const userCount =
        activeIncident.impactedUsers ||
        activeIncident.metrics?.affected_checkout_attempts ||
        0;

      // Append resolution & post-mortem events to activity log
      const resEvent: ActivityItem = {
        id: `act-${Date.now()}-res`,
        timestamp: 'Just now',
        category: 'resolution',
        title: `Incident ${activeIncident.incident_id} marked Resolved`,
        detail: `Confirmed root cause: ${payload.confirmed_root_cause}. Runbook used: ${payload.runbook_used}. System metrics normalized for ${userCount.toLocaleString()} impacted users.`,
        actor: 'Mike Taylor',
        actor_role: 'Platform SRE Admin',
        incident_id: activeIncident.incident_id,
        service: activeIncident.service,
        severity: activeIncident.severity,
      };

      const retentionEvent: ActivityItem = {
        id: `act-${Date.now()}-retention`,
        timestamp: 'Just now',
        category: 'postmortem',
        title: `Resolution retained in Hindsight fix_outcomes memory bank`,
        detail: `Retained fixes: ${res.memory_update_summary?.retained_fixes_count || 1}. Runbook reliability delta: +${res.memory_update_summary?.runbook_reliability_delta || 0.15}. Estimated ${res.memory_update_summary?.estimated_minutes_saved || 54} minutes saved for future occurrences.`,
        actor: 'Hindsight Memory System',
        is_agent: true,
        incident_id: activeIncident.incident_id,
        service: activeIncident.service,
      };

      setActivities((prev) => {
        const updated = [resEvent, retentionEvent, ...prev];
        try {
          localStorage.setItem('recallops_activities', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

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
    const usersCount =
      typeof data.impactedUsers === 'number' && data.impactedUsers > 0
        ? data.impactedUsers
        : data.impacted_users || 5000;
    const newIncidentId =
      data.incident_id || `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newContext: IncidentContext = {
      incident_id: newIncidentId,
      title: data.title,
      service: data.service,
      severity: data.severity,
      status: 'Open',
      impactedUsers: usersCount,
      symptoms: data.symptoms,
      metrics: {
        p95_latency_seconds: data.metrics?.p95_latency_seconds ?? 8.4,
        error_rate_percent: data.metrics?.error_rate_percent ?? 18.6,
        affected_checkout_attempts: usersCount,
        redis_eviction_rate_ops: data.metrics?.redis_eviction_rate_ops ?? 1420,
        cpu_utilization_percent: data.metrics?.cpu_utilization_percent ?? 74.2,
      },
      affected_components: data.affected_components || [data.service, 'Cache', 'Database'],
      recent_changes: data.recent_changes || [],
      environment: data.environment || 'eastus-az',
      timestamp: new Date().toISOString(),
      owner: data.owner || teamMembers[2],
      assigned_responders: data.assigned_responders || [teamMembers[0], teamMembers[1]],
    };

    // If connected to API, persist via FastAPI
    if (!demoMode) {
      try {
        await api.submitAlert({
          incident_id: newIncidentId,
          title: data.title,
          service: data.service,
          severity: data.severity,
          impactedUsers: usersCount,
          symptoms: data.symptoms,
          metrics: newContext.metrics,
          affected_components: newContext.affected_components,
          recent_changes: newContext.recent_changes,
          environment: newContext.environment,
          owner: newContext.owner,
          assigned_responders: newContext.assigned_responders,
        });
      } catch (e) {
        console.warn('API alert submission fallback to local persistence:', e);
      }
    }

    // Prepend to incidents list & save to localStorage
    setIncidents((prev) => {
      const updated = [newContext, ...prev.filter((i) => i.incident_id !== newIncidentId)];
      try {
        localStorage.setItem('recallops_incidents', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving incidents to localStorage:', e);
      }
      return updated;
    });

    // Append to Activity feed: Incident Created & Response Team Assigned
    const responderNames =
      (data.assigned_responders || []).map((r) => r.name).join(', ') ||
      'Alice Chen, Bob Martinez';
    const ownerName = data.owner?.name || 'Alex Rivera';

    const createdEvent: ActivityItem = {
      id: `act-${Date.now()}-created`,
      timestamp: 'Just now',
      category: 'incident',
      title: `Incident created: ${data.title}`,
      detail: `Incident ${newIncidentId} opened for ${data.service} (${data.severity}). Impacting ${usersCount.toLocaleString()} users. Symptoms: ${data.symptoms.join(', ')}`,
      actor: 'Metrics Agent',
      is_agent: true,
      incident_id: newIncidentId,
      service: data.service,
      severity: data.severity,
    };

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

    setActivities((prev) => {
      const updated = [createdEvent, assignmentEvent, ...prev];
      try {
        localStorage.setItem('recallops_activities', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving activities to localStorage:', e);
      }
      return updated;
    });

    setSelectedIncidentId(newIncidentId);
    setCurrentView('incident-detail');
    await handleInvestigateMemory(newContext);
  };

  // Compute active incident count for sidebar badge
  const activeIncidentsCount = useMemo(() => {
    return incidents.filter(
      (inc) => inc.status !== 'Resolved' && inc.status !== 'Closed'
    ).length;
  }, [incidents]);

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      {/* 1. Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        activeIncidentsCount={activeIncidentsCount}
      />

      {/* 2. Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar with Global Incident Search */}
        <TopNav
          demoMode={demoMode}
          modelUsed={modelUsed}
          fallbackUsed={fallbackUsed}
          incidents={incidents}
          onSelectIncident={handleSelectIncident}
        />

        {/* Page Content */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <DashboardView
              incidents={incidents}
              activities={activities}
              onSelectIncident={handleSelectIncident}
              onOpenNewIncident={() => setIsNewIncidentModalOpen(true)}
              onViewAllIncidents={() => setCurrentView('incidents')}
              onViewAllActivity={() => setCurrentView('activity')}
              memoryStats={memoryStats}
            />
          )}

          {/* DEDICATED INCIDENTS DIRECTORY VIEW */}
          {currentView === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onSelectIncident={handleSelectIncident}
              onOpenNewIncident={() => setIsNewIncidentModalOpen(true)}
            />
          )}

          {/* DEDICATED ACTIVITY VIEW */}
          {currentView === 'activity' && (
            <ActivityView
              activities={activities}
              onSelectIncident={handleSelectIncident}
              onOpenNewIncident={() => setIsNewIncidentModalOpen(true)}
            />
          )}

          {/* INCIDENT DETAIL VIEW */}
          {currentView === 'incident-detail' && (
            <IncidentDetailView
              incident={activeIncident}
              briefing={briefing}
              rankedFixes={rankedFixes}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              isSendingChat={isSendingChat}
              onOpenResolveModal={() => setIsResolveModalOpen(true)}
              onBackToDashboard={() => setCurrentView('dashboard')}
              onBackToIncidents={() => setCurrentView('incidents')}
              onInvestigateMemory={() => handleInvestigateMemory(activeIncident)}
              isInvestigating={isInvestigating}
              onUpdateIncidentStatus={handleUpdateIncidentStatus}
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
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Services Directory
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Managed microservices, health status, and Hindsight memory bank linkages
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => handleSelectIncident('INC-2026-0928')}
                    className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/40 cursor-pointer hover:border-rose-400 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>checkout-service</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        {activeIncident.status === 'Resolved' ? 'Resolved' : 'P1 Outage'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      {activeIncident.status === 'Resolved'
                        ? 'p95: 140ms • Nominal'
                        : 'p95: 8.4s • Error rate: 18.6%'}
                    </p>
                  </div>

                  <div
                    onClick={() => handleSelectIncident('INC-2026-0925')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 cursor-pointer hover:border-brand-400 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>payment-auth</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Healthy
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      p95: 120ms • Consumer queue normal
                    </p>
                  </div>

                  <div
                    onClick={() => handleSelectIncident('INC-2025-0417')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 cursor-pointer hover:border-brand-400 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>redis-cache-cluster</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Historical Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      0 evictions/s • Retained in fix_outcomes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AGENTS & MEMORY VIEW */}
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
                      {incidents.length}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Historical Outages
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Fix Outcomes Bank</span>
                      <Brain className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {memoryStats.fix_outcomes_count}
                    </div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                      Ranked Mitigations
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Team Memory Bank</span>
                      <Shield className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {teamMembers.length}
                    </div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      Responders & Policies
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Briefing Guard</span>
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      Strict
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Anti-hallucination ON
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {currentView === 'settings' && (
            <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4 transition-colors">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Settings & API Configuration
              </h1>
              <div className="space-y-3 text-xs max-w-xl">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    FastAPI Backend Endpoint
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="http://localhost:8000"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-mono text-slate-800 dark:text-slate-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Groq Primary Model
                  </label>
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
        incident={activeIncident}
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
