import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Database, Check } from 'lucide-react';
import { IncidentContext, ResolveRequest, ResolveResponse } from '../types';

interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentContext;
  onConfirmResolve: (payload: ResolveRequest) => Promise<ResolveResponse>;
  isResolving: boolean;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  isOpen,
  onClose,
  incident,
  onConfirmResolve,
  isResolving,
}) => {
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);
  const [check3, setCheck3] = useState(false);
  const [resolutionNote, setResolutionNote] = useState(
    'Cache configuration v4.18.2 rolled back to v4.18.1 baseline. Redis eviction rate normalized to 0 ops/sec. p95 latency stabilized at 0.22s.'
  );

  if (!isOpen) return null;

  const checksCompleted = [check1, check2, check3].filter(Boolean).length;

  const handleResolve = async () => {
    const payload: ResolveRequest = {
      confirmed_root_cause:
        'Redis maxmemory-policy allkeys-lru configuration change in v4.18.2 induced eviction storm and pool exhaustion.',
      actions_taken: [
        'Roll back cache configuration release',
        'Temporarily scale Redis cluster capacity',
        'Validate eviction rate dropped to 0 ops/sec',
      ],
      actions_skipped: [],
      actions_that_failed: ['Restart Checkout API pods (avoided per hazard warning)'],
      runbook_used: 'Redis Latency and Eviction Response (RB-REDIS-01)',
      success_or_failure: 'SUCCESS',
      verification_metrics: {
        p95_latency_seconds: 0.22,
        error_rate_percent: 0.04,
        eviction_rate_ops: 0.0,
      },
      elapsed_resolution_minutes: 18,
      lessons_learned:
        'Enforce mandatory 5% canary on all Redis pool size adjustments. Pod restarts during eviction cascades are permanently prohibited.',
      follow_up_actions: [
        'Implement automated CI guard for Redis maxmemory syntax',
        'Add Redis client queue gauge to Azure Monitor dashboard',
      ],
      responder_feedback: resolutionNote,
    };

    await onConfirmResolve(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#161F36] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-150 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Resolve incident</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Access Card */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Workspace access
          </label>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{incident.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Open for 19 minutes</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              SEV 1
            </span>
          </div>
        </div>

        {/* Owner Row */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Owner
          </label>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                AR
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Alex Rivera</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Platform operations lead</div>
              </div>
            </div>
            <button
              onClick={() => alert('Assigned to Alex Rivera')}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Reassign
            </button>
          </div>
        </div>

        {/* Resolution Checklist */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Resolution checklist
          </label>
          <div className="space-y-2 text-xs">
            <div
              onClick={() => setCheck1(!check1)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  check1 ? 'bg-brand-600 text-white shadow-xs' : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {check1 && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Traffic rerouted / Cache rollback executed</span>
            </div>

            <div
              onClick={() => setCheck2(!check2)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  check2 ? 'bg-brand-600 text-white shadow-xs' : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {check2 && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Error rate stable (&lt;0.1% target)</span>
            </div>

            <div
              onClick={() => setCheck3(!check3)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  check3 ? 'bg-brand-600 text-white shadow-xs' : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {check3 && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Postmortem scheduled</span>
            </div>
          </div>
        </div>

        {/* Resolution Note */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Resolution note
          </label>
          <textarea
            rows={3}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none font-medium"
            placeholder="Document remediation steps and verification..."
          />
        </div>

        {/* Modal Footer Bar */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {checksCompleted} of 3 checks complete
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {check3 ? 'Ready for memory retention' : 'Postmortem can be scheduled later'}
              </div>
            </div>
          </div>

          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isResolving ? 'Resolving...' : 'Resolve Incident'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ResolveModal;
