import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { IncidentDetailView } from './components/IncidentDetailView';
import { ArchitectureView } from './components/ArchitectureView';
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
} from './types';

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
    team_count: 1,
    baseline_count: 0,
    mode: 'DEMO_LOCAL',
  });

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
        setIncident(activeInc);
        setMemoryStats(stats);
      } catch (e) {
        console.warn('Initial backend load fallback:', e);
      }
    }
    loadInitial();
  }, []);

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
    const newContext: IncidentContext = {
      incident_id: 'INC-2026-0928',
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
    };
    setIncident(newContext);
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
            }
          }}
          onOpenArchitecture={() => setCurrentView('architecture')}
        />

        {/* Page Content */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              activeIncident={incident}
              onSelectIncident={(id) => {
                if (!briefing) handleInvestigateMemory();
                setCurrentView('incident-detail');
              }}
              onOpenNewIncident={() => setIsNewIncidentModalOpen(true)}
              memoryStats={memoryStats}
            />
          )}

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

          {currentView === 'architecture' && (
            <ArchitectureView
              memoryStats={memoryStats}
              demoMode={demoMode}
              modelUsed={modelUsed}
            />
          )}

          {currentView === 'activity' && (
            <DashboardView
              activeIncident={incident}
              onSelectIncident={() => setCurrentView('incident-detail')}
              onOpenNewIncident={() => setIsNewIncidentModalOpen(true)}
              memoryStats={memoryStats}
            />
          )}

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
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">P1 Outage</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">p95: 8.4s • Error rate: 18.6%</p>
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">Evicting</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">1,420 evictions/s • P2 tier</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'agents' && (
            <ArchitectureView
              memoryStats={memoryStats}
              demoMode={demoMode}
              modelUsed={modelUsed}
            />
          )}

          {currentView === 'team' && (
            <div className="bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4 transition-colors">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Platform SRE Team & Policies</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Escalation policies recalled from Hindsight team memory bank</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 transition-colors">
                  <h4 className="font-bold text-slate-900 dark:text-white">Primary On-Call Rotation</h4>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">• Alice Chen (Primary Lead) - #incident-checkout-p1</p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">• Bob Martinez (Secondary SRE)</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 transition-colors">
                  <h4 className="font-bold text-slate-900 dark:text-white">Mandatory Operational Constraints</h4>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">• Cache configuration releases require 5% canary deployment.</p>
                  <p className="text-rose-600 dark:text-rose-400 font-bold">• Pod restarts under active eviction cascades are strictly prohibited.</p>
                </div>
              </div>
            </div>
          )}

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

      {/* 3. Modal Dialogs matching Screenshot 4 */}
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
      />
    </div>
  );
};

export default App;
