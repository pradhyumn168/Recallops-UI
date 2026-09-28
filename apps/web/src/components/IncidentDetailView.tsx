import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  Layers,
  Filter,
  Bot,
  User,
  Terminal,
  Activity,
  Zap,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  IncidentContext,
  GroundedBriefing,
  RankedAction,
  ChatMessage,
} from '../types';

interface IncidentDetailViewProps {
  incident: IncidentContext;
  briefing: GroundedBriefing | null;
  rankedFixes: RankedAction[];
  chatMessages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isSendingChat: boolean;
  onOpenResolveModal: () => void;
  onBackToDashboard: () => void;
  onInvestigateMemory: () => void;
  isInvestigating: boolean;
}

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incident,
  briefing,
  rankedFixes,
  chatMessages,
  onSendMessage,
  isSendingChat,
  onOpenResolveModal,
  onBackToDashboard,
  onInvestigateMemory,
  isInvestigating,
}) => {
  const [selectedRemediations, setSelectedRemediations] = useState<string[]>([
    'rem-rollback',
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showChatBox, setShowChatBox] = useState(false);

  const toggleRemediation = (id: string) => {
    setSelectedRemediations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <button
          onClick={onBackToDashboard}
          className="flex items-center space-x-1 text-brand-600 dark:text-brand-400 hover:underline font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <span>/</span>
        <span>Incidents</span>
        <span>/</span>
        <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{incident.incident_id}</span>
      </div>

      {/* Incident Detail Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {incident.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              {incident.severity}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 font-medium">
            ID: {incident.incident_id} • Created: 12/05/2026, 04:30:00 • Region: {incident.environment}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert('Bridge channel initialized: #incident-checkout-p1')}
            className="flex items-center space-x-2 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#161F36] hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Slack Channel</span>
          </button>

          <button
            onClick={onOpenResolveModal}
            className="flex items-center space-x-2 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-[#161F36] hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                incident.status === 'Resolved' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span>{incident.status}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Metadata Context Row */}
      <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg grid grid-cols-2 md:grid-cols-4 gap-6 transition-colors">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-1.5">
            Status
          </span>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
              incident.status === 'Resolved'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
            }`}
          >
            {incident.status}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-1.5">
            Service
          </span>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>{incident.service}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-1.5">
            Assignee
          </span>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              AR
            </div>
            <span>Alex Rivera</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-1.5">
            Impact
          </span>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            User facing <span className="text-slate-500 dark:text-slate-400 font-normal">({incident.metrics.affected_checkout_attempts.toLocaleString()} checkouts)</span>
          </div>
        </div>
      </div>

      {/* Two Column Main Investigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#161F36] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Timeline</h3>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline Feed */}
          <div className="space-y-6 relative pl-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
            {/* Event 1: Metrics Agent */}
            <div className="relative flex items-start space-x-4">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-2 border-white dark:border-[#161F36] flex items-center justify-center shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <strong className="font-bold text-slate-900 dark:text-white">Metrics Agent</strong>
                    <span className="text-[10px] font-mono text-rose-700 dark:text-rose-300 font-bold bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                      METRICSPIKE
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">04:30:00</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Detected Error Rate &gt; 18.6% & p95 latency spike to 8.4s for checkout-service over 5m window.
                </p>
              </div>
            </div>

            {/* Event 2: System */}
            <div className="relative flex items-start space-x-4">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-white dark:border-[#161F36] flex items-center justify-center shadow-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <strong className="font-bold text-slate-900 dark:text-white">System</strong>
                    <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                      STATUSCHANGE
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">04:31:00</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Incident created. Status: Open. Paged on-call Alice Chen.
                </p>
              </div>
            </div>

            {/* Event 3: Alex Rivera */}
            <div className="relative flex items-start space-x-4">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-white dark:border-[#161F36] flex items-center justify-center shadow-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <strong className="font-bold text-slate-900 dark:text-white">Alex Rivera</strong>
                    <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                      STATUSCHANGE
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">04:35:00</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Changed status to Investigating. SRE Bridge joined.
                </p>
              </div>
            </div>

            {/* Event 4: Log Analyzer Agent */}
            <div className="relative flex items-start space-x-4">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-2 border-white dark:border-[#161F36] flex items-center justify-center shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <strong className="font-bold text-slate-900 dark:text-white">Log Analyzer Agent</strong>
                    <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-300 dark:border-indigo-800">
                      LOGANALYSIS
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">04:36:00</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Found 400+ occurrences of "Redis maxmemory-policy allkeys-lru eviction" and connection pool timeout exceptions.
                </p>
              </div>
            </div>

            {/* Event 5: RecallOps Memory Agent */}
            <div className="relative flex items-start space-x-4 bg-brand-50/70 dark:bg-brand-950/50 p-4 rounded-xl border border-brand-200 dark:border-brand-800 -ml-3 shadow-xs">
              <div className="absolute -left-3 w-6 h-6 rounded-full bg-brand-600 text-white border-2 border-white dark:border-[#161F36] flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-1.5 pl-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <strong className="font-bold text-slate-900 dark:text-white">RecallOps Memory Agent</strong>
                    <span className="text-[10px] font-mono text-brand-700 dark:text-brand-300 font-extrabold bg-brand-100 dark:bg-brand-900/80 px-2 py-0.5 rounded border border-brand-300 dark:border-brand-700">
                      HINDSIGHT RECALL
                    </span>
                  </div>
                  <span className="text-[11px] text-brand-700 dark:text-brand-300 font-mono font-semibold">04:36:30</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                  {briefing?.evidence_summary ||
                    'Recalled historical incident INC-2025-0417 with 92% match. Root cause: Redis max-memory policy caused cache churn and downstream saturation. Proven Runbook: RB-REDIS-01.'}
                </p>
                <div className="text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>WARNING: In 2025, restarting pods was ineffective and lengthened recovery by 14m.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agent Actions & Remediation (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Agent Actions */}
          <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-3 transition-colors">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Agent Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => alert('Log Analyzer executed: 1,420 Redis eviction logs / second confirmed.')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Run Log Analyzer</span>
              </button>

              <button
                onClick={() => alert('Service Metrics checked: p95 latency is 8.4s, 5xx error rate is 18.6%.')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
              >
                <Activity className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Check Service Metrics</span>
              </button>

              <button
                onClick={onInvestigateMemory}
                disabled={isInvestigating}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-50 dark:bg-brand-950/70 hover:bg-brand-100 dark:hover:bg-brand-900/80 border border-brand-300 dark:border-brand-700 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-300 transition-colors shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>{isInvestigating ? 'Recalling Memory...' : 'Recall Incident Memory'}</span>
              </button>
            </div>

            {/* Follow-up Q&A Toggle */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowChatBox(!showChatBox)}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-bold flex items-center space-x-1"
              >
                <span>{showChatBox ? 'Hide Grounded Q&A' : 'Ask Agent Follow-up →'}</span>
              </button>

              {showChatBox && (
                <div className="mt-3 space-y-2">
                  <div className="max-h-36 overflow-y-auto space-y-2 text-xs">
                    {chatMessages.slice(-2).map((m) => (
                      <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        <strong className="font-bold text-slate-900 dark:text-white">{m.role === 'user' ? 'You' : 'Agent'}:</strong> {m.content}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendChat} className="flex gap-1.5">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="e.g. Should we restart pods?"
                      className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={isSendingChat}
                      className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-brand-700"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Remediation Plan */}
          <div className="bg-white dark:bg-[#161F36] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-4 transition-colors">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Remediation</h3>

            <div className="space-y-3">
              {/* Option 1: Selected & Highlighted */}
              <div
                onClick={() => toggleRemediation('rem-rollback')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRemediations.includes('rem-rollback')
                    ? 'bg-brand-50 dark:bg-brand-950/70 border-brand-400 dark:border-brand-600 ring-2 ring-brand-400/40'
                    : 'bg-white dark:bg-[#161F36] border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 text-brand-600 dark:text-brand-400">
                    {selectedRemediations.includes('rem-rollback') ? (
                      <CheckSquare className="w-4 h-4 fill-brand-100 dark:fill-brand-900 text-brand-600 dark:text-brand-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rollback to v4.18.1</h4>
                    <p className="text-[11px] text-brand-700 dark:text-brand-300 font-semibold mt-0.5">
                      Suggested by Remediation Agent (92% confidence)
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Temporarily Scale Cache */}
              <div
                onClick={() => toggleRemediation('rem-scale')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRemediations.includes('rem-scale')
                    ? 'bg-brand-50 dark:bg-brand-950/70 border-brand-400 dark:border-brand-600 ring-2 ring-brand-400/40'
                    : 'bg-white dark:bg-[#161F36] border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 text-slate-600 dark:text-slate-400">
                    {selectedRemediations.includes('rem-scale') ? (
                      <CheckSquare className="w-4 h-4 fill-brand-100 dark:fill-brand-900 text-brand-600 dark:text-brand-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Scale Redis cluster to P3</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Runbook RB-REDIS-01 Step 3</p>
                  </div>
                </div>
              </div>

              {/* Ineffective Action Warning */}
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-rose-800 dark:text-rose-300 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Failed Mitigation Warning</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-snug font-medium">
                  Restarting Checkout API pods was ineffective in INC-2025-0417 and caused a cold-cache stampede (+14m delay).
                </p>
              </div>
            </div>

            {/* Execute Selected Button */}
            <button
              onClick={onOpenResolveModal}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all"
            >
              Execute Selected Remediation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default IncidentDetailView;
