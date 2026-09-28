import React, { useState } from 'react';
import { X, AlertOctagon, Sparkles, User, Users, Plus, Shield } from 'lucide-react';
import { AlertRequest, TeamMember } from '../types';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AlertRequest) => Promise<void>;
  isLoading: boolean;
  teamMembers?: TeamMember[];
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  teamMembers = [],
}) => {
  const [title, setTitle] = useState('Increased error rate on checkout API');
  const [service, setService] = useState('checkout-api');
  const [severity, setSeverity] = useState<'P1' | 'P2' | 'P3'>('P1');
  const [symptoms, setSymptoms] = useState(
    'p95 latency spike to 8.4s, 5xx HTTP error rate surge to 18.6%, Redis memory max-eviction alerts'
  );

  // Fallback default team if none passed
  const defaultOwner = teamMembers.find((m) => m.name.includes('Rivera')) || teamMembers[0] || {
    id: 'usr-alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@recallops.internal',
    role: 'Incident Commander',
    team_service: 'Platform Ops',
    on_call_status: 'Primary On-Call' as const,
    initials: 'AR',
    avatar_color: 'bg-indigo-600',
    is_lead: true,
  };

  const defaultResponders = teamMembers.filter((m) => m.id !== defaultOwner.id).slice(0, 2);

  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(defaultOwner.id);
  const [selectedResponderIds, setSelectedResponderIds] = useState<string[]>(
    defaultResponders.map((m) => m.id)
  );

  if (!isOpen) return null;

  const currentOwner = teamMembers.find((m) => m.id === selectedOwnerId) || defaultOwner;
  const currentResponders = teamMembers.filter((m) => selectedResponderIds.includes(m.id));
  const unassignedMembers = teamMembers.filter(
    (m) => m.id !== selectedOwnerId && !selectedResponderIds.includes(m.id)
  );

  const handleAddResponder = (id: string) => {
    if (!selectedResponderIds.includes(id)) {
      setSelectedResponderIds((prev) => [...prev, id]);
    }
  };

  const handleRemoveResponder = (id: string) => {
    setSelectedResponderIds((prev) => prev.filter((item) => item !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AlertRequest = {
      title,
      service,
      severity,
      symptoms: symptoms.split(',').map((s) => s.trim()),
      metrics: {
        p95_latency_seconds: 8.4,
        error_rate_percent: 18.6,
        affected_checkout_attempts: 27400,
        redis_eviction_rate_ops: 1420,
      },
      affected_components: ['Checkout API', 'Redis Cache', 'Azure SQL'],
      recent_changes: [
        {
          component: 'checkout-api',
          version: 'v4.18.2',
          description: 'Cache configuration release updating Redis connection pool',
          deployed_ago_minutes: 19,
          author: 'pipeline-bot',
        },
      ],
      environment: 'production-eastus-az',
      owner: currentOwner,
      assigned_responders: currentResponders,
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#161F36] rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-150 transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Trigger Incident Alert</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Dispatch alert to Hindsight memory and assign response team</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">Incident Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              required
            />
          </div>

          {/* Service & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Service</label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold"
              >
                <option value="P1">P1 - Critical Outage</option>
                <option value="P2">P2 - Major Degradation</option>
                <option value="P3">P3 - Minor Issue</option>
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">Symptoms (comma separated)</label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none font-medium"
            />
          </div>

          {/* INCIDENT OWNER & LEAD COMMANDER */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-brand-500" />
                <span>Incident Owner (Lead Commander)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">Accountable Lead</span>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 min-w-[32px] min-h-[32px] aspect-square rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs select-none ${
                  currentOwner.avatar_color || 'bg-brand-600'
                }`}
              >
                {currentOwner.initials}
              </div>
              <select
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role} • {member.team_service})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RESPONSE TEAM / ASSIGNED RESPONDERS SECTION */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-brand-500" />
                <span>Response Team (Assigned Responders)</span>
              </label>
              <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-bold">
                {currentResponders.length} assigned
              </span>
            </div>

            {/* Selected Removable Avatar Chips */}
            <div className="flex flex-wrap gap-2 min-h-[34px] items-center">
              {currentResponders.length === 0 ? (
                <span className="text-slate-400 text-xs italic">No additional responders assigned yet.</span>
              ) : (
                currentResponders.map((responder) => (
                  <div
                    key={responder.id}
                    className="inline-flex items-center space-x-2 pl-1.5 pr-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-brand-400 transition-colors"
                  >
                    {/* Circular avatar: aspect-square, rounded-full */}
                    <div
                      className={`w-6 h-6 min-w-[24px] min-h-[24px] aspect-square rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                        responder.avatar_color || 'bg-brand-600'
                      }`}
                    >
                      {responder.initials}
                    </div>
                    <span className="font-semibold text-xs">{responder.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveResponder(responder.id)}
                      className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title={`Remove ${responder.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Unassigned Quick-Add Selector */}
            {unassignedMembers.length > 0 && (
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center space-x-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Add from roster:</span>
                <div className="flex flex-wrap gap-1.5">
                  {unassignedMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleAddResponder(member.id)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{member.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Dispatching...' : 'Dispatch Alert & Assign Team'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewIncidentModal;
