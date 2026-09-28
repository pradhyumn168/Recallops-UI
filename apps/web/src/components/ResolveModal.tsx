import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Database,
  Check,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import {
  IncidentContext,
  ResolveRequest,
  ResolveResponse,
  TeamMember,
  RemediationProgress,
} from '../types';

export interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToIncident?: (incidentId: string) => void;
  incident: IncidentContext;
  teamMembers?: TeamMember[];
  onConfirmResolve: (payload: ResolveRequest) => Promise<ResolveResponse>;
  onSaveProgress?: (incidentId: string, progress: RemediationProgress) => void;
  isResolving: boolean;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  isOpen,
  onClose,
  onBackToIncident,
  incident,
  teamMembers = [],
  onConfirmResolve,
  onSaveProgress,
  isResolving,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  // Default initial values
  const defaultChecks = incident.remediationData?.checklist ?? [true, true, false];
  const defaultNote =
    incident.remediationData?.resolutionNote ??
    'Cache configuration v4.18.2 rolled back to v4.18.1 baseline. Redis eviction rate normalized to 0 ops/sec. p95 latency stabilized at 0.22s.';
  const defaultOwner: TeamMember =
    incident.remediationData?.assignedOwner ||
    incident.owner ||
    teamMembers[0] || {
      id: 'usr-alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@recallops.internal',
      role: 'Platform operations lead',
      team_service: 'Platform Ops',
      on_call_status: 'Primary On-Call',
      initials: 'AR',
      avatar_color: 'bg-indigo-600',
    };

  // Editable local state
  const [checks, setChecks] = useState<boolean[]>(defaultChecks);
  const [resolutionNote, setResolutionNote] = useState<string>(defaultNote);
  const [currentOwner, setCurrentOwner] = useState<TeamMember>(defaultOwner);
  const [isReassigning, setIsReassigning] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Saved baseline to compare for unsaved changes
  const [savedBaseline, setSavedBaseline] = useState({
    checks: defaultChecks,
    resolutionNote: defaultNote,
    ownerId: defaultOwner.id,
  });

  // Confirmation modal state
  const [showConfirmLeave, setShowConfirmLeave] = useState<boolean>(false);

  // Sync state whenever modal opens or active incident changes
  useEffect(() => {
    if (isOpen) {
      const initChecks = incident.remediationData?.checklist ?? [true, true, false];
      const initNote =
        incident.remediationData?.resolutionNote ??
        'Cache configuration v4.18.2 rolled back to v4.18.1 baseline. Redis eviction rate normalized to 0 ops/sec. p95 latency stabilized at 0.22s.';
      const initOwner: TeamMember =
        incident.remediationData?.assignedOwner ||
        incident.owner ||
        teamMembers[0] || {
          id: 'usr-alex',
          name: 'Alex Rivera',
          email: 'alex.rivera@recallops.internal',
          role: 'Platform operations lead',
          team_service: 'Platform Ops',
          on_call_status: 'Primary On-Call',
          initials: 'AR',
          avatar_color: 'bg-indigo-600',
        };

      setChecks([...initChecks]);
      setResolutionNote(initNote);
      setCurrentOwner(initOwner);
      setIsReassigning(false);
      setShowConfirmLeave(false);
      setSavedToast(false);
      setSavedBaseline({
        checks: [...initChecks],
        resolutionNote: initNote,
        ownerId: initOwner.id,
      });

      // Capture currently active element to restore focus on exit
      lastFocusedElementRef.current = document.activeElement as HTMLElement | null;

      // Focus back button on modal open
      setTimeout(() => {
        backButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen, incident.incident_id]);

  // Compute if unsaved changes exist
  const hasUnsavedChanges = useMemo(() => {
    const checksChanged =
      checks.length !== savedBaseline.checks.length ||
      checks.some((c, i) => c !== savedBaseline.checks[i]);
    const noteChanged = resolutionNote.trim() !== savedBaseline.resolutionNote.trim();
    const ownerChanged = currentOwner.id !== savedBaseline.ownerId;
    return checksChanged || noteChanged || ownerChanged;
  }, [checks, resolutionNote, currentOwner, savedBaseline]);

  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Perform return to incident
  const executeReturnToIncident = () => {
    setShowConfirmLeave(false);
    // Replace URL hash back to incident detail
    try {
      window.location.hash = `#/incidents/${incident.incident_id}`;
    } catch {}

    if (onBackToIncident) {
      onBackToIncident(incident.incident_id);
    } else {
      onClose();
    }
  };

  const executeReturnToIncidentRef = useRef(executeReturnToIncident);
  useEffect(() => {
    executeReturnToIncidentRef.current = executeReturnToIncident;
  });

  // Browser History & Popstate navigation integration
  useEffect(() => {
    if (!isOpen) return;

    // Push history entry for remediation workspace
    window.history.pushState(
      { modal: 'remediation', incidentId: incident.incident_id },
      '',
      `#/incidents/${incident.incident_id}/remediation`
    );

    const handlePopState = () => {
      // Browser back button pressed
      if (hasUnsavedChangesRef.current) {
        // Re-push history entry so back button doesn't jump past page while modal asks confirmation
        window.history.pushState(
          { modal: 'remediation', incidentId: incident.incident_id },
          '',
          `#/incidents/${incident.incident_id}/remediation`
        );
        setShowConfirmLeave(true);
      } else {
        executeReturnToIncidentRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Restore focus to opening element
      if (lastFocusedElementRef.current && typeof lastFocusedElementRef.current.focus === 'function') {
        lastFocusedElementRef.current.focus();
        lastFocusedElementRef.current = null;
      }
    };
  }, [isOpen, incident.incident_id]);

  // Keyboard navigation & focus trapping
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (showConfirmLeave) {
        setShowConfirmLeave(false);
      } else {
        handleAttemptClose();
      }
      return;
    }

    if (e.key === 'Tab') {
      const container = modalRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  const handleToggleCheck = (index: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Attempt close check: prompt if unsaved changes exist
  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmLeave(true);
    } else {
      executeReturnToIncident();
    }
  };

  // User confirmed "Leave without saving"
  const handleConfirmDiscard = () => {
    // Revert local state to baseline
    setChecks([...savedBaseline.checks]);
    setResolutionNote(savedBaseline.resolutionNote);
    setShowConfirmLeave(false);
    executeReturnToIncident();
  };

  // Save Progress draft
  const handleSaveProgress = () => {
    onSaveProgress?.(incident.incident_id, {
      checklist: [...checks],
      resolutionNote,
      assignedOwner: currentOwner,
    });
    setSavedBaseline({
      checks: [...checks],
      resolutionNote,
      ownerId: currentOwner.id,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  // Confirm Resolve Incident
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

    // Save final state before resolving
    onSaveProgress?.(incident.incident_id, {
      checklist: [...checks],
      resolutionNote,
      assignedOwner: currentOwner,
    });

    await onConfirmResolve(payload);
    executeReturnToIncident();
  };

  if (!isOpen) return null;

  const checksCompleted = checks.filter(Boolean).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="remediation-title"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-[#161F36] rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-150 transition-colors focus:outline-none max-h-[90vh] overflow-y-auto"
      >
        {/* 1 & 2. Modal Header Row: Prominent Back to Incident on top-left, Title in center, Close X on top-right */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3 gap-3">
          {/* 1. Visible Back action above Workspace Access */}
          <button
            ref={backButtonRef}
            type="button"
            onClick={handleAttemptClose}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-bold text-xs transition-all shadow-2xs group cursor-pointer shrink-0"
            aria-label={`Back to incident ${incident.incident_id}`}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 group-hover:-translate-x-0.5 transition-all" />
            <span>← Back to Incident</span>
          </button>

          {/* Center Title & Incident Badge */}
          <div className="flex items-center space-x-2 truncate">
            <h3 id="remediation-title" className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              Remediation Workspace
            </h3>
            <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800 shrink-0">
              {incident.incident_id}
            </span>
          </div>

          {/* 2. Accessible Close action */}
          <button
            type="button"
            onClick={handleAttemptClose}
            aria-label="Close remediation workspace"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
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
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {incident.title}
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-2 mt-0.5">
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {incident.incident_id}
                  </span>
                  <span>•</span>
                  <span>{incident.service}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {(incident.impactedUsers || incident.metrics?.affected_checkout_attempts || 0).toLocaleString()} users
                  </span>
                </div>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold shrink-0 border ${
                incident.severity === 'P1'
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}
            >
              {incident.severity}
            </span>
          </div>
        </div>

        {/* Owner Row with Interactive Reassignment */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Owner
            </label>
            {isReassigning ? (
              <button
                type="button"
                onClick={() => setIsReassigning(false)}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                Done
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsReassigning(true)}
                className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reassign
              </button>
            )}
          </div>

          {!isReassigning ? (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs select-none ${
                    currentOwner.avatar_color || 'bg-brand-600'
                  }`}
                >
                  {currentOwner.initials}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentOwner.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {currentOwner.role} • {currentOwner.team_service}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] text-slate-400 font-semibold block">Assign Lead Owner:</span>
              <select
                value={currentOwner.id}
                onChange={(e) => {
                  const selected = teamMembers.find((m) => m.id === e.target.value);
                  if (selected) {
                    setCurrentOwner(selected);
                    setIsReassigning(false);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role} • {member.team_service})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Resolution Checklist */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Resolution checklist
          </label>
          <div className="space-y-2 text-xs">
            <div
              onClick={() => handleToggleCheck(0)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  checks[0]
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {checks[0] && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Traffic rerouted / Cache rollback executed
              </span>
            </div>

            <div
              onClick={() => handleToggleCheck(1)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  checks[1]
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {checks[1] && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Error rate stable (&lt;0.1% target)
              </span>
            </div>

            <div
              onClick={() => handleToggleCheck(2)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  checks[2]
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {checks[2] && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Postmortem scheduled
              </span>
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
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {checksCompleted} of 3 checks complete
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {checks[2] ? 'Ready for memory retention' : 'Postmortem can be scheduled later'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSaveProgress}
              disabled={!hasUnsavedChanges || isResolving}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                savedToast
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : hasUnsavedChanges
                  ? 'bg-slate-100 dark:bg-slate-800 border-brand-400 text-brand-600 dark:text-brand-400 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-40'
              }`}
            >
              {savedToast ? 'Saved!' : 'Save Progress'}
            </button>

            <button
              type="button"
              onClick={handleResolve}
              disabled={isResolving}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isResolving ? 'Resolving...' : 'Resolve Incident'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Confirmation Dialog for Unsaved Changes */}
      {showConfirmLeave && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-leave-title"
          aria-describedby="confirm-leave-desc"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-100"
        >
          <div className="bg-white dark:bg-[#161F36] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95 duration-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 id="confirm-leave-title" className="text-base font-extrabold text-slate-900 dark:text-white">
                Leave remediation workspace?
              </h4>
              <p id="confirm-leave-desc" className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your unsaved changes will be lost.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmLeave(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolveModal;
