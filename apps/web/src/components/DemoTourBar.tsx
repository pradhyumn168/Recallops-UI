import React, { useState } from 'react';
import { Compass, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

interface DemoTourBarProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  onInvestigate: () => void;
  onApproveAll: () => void;
  onGoToResolve: () => void;
  onResetDemo: () => void;
  isInvestigating: boolean;
}

export const DemoTourBar: React.FC<DemoTourBarProps> = ({
  currentStep,
  onSetStep,
  onInvestigate,
  onApproveAll,
  onGoToResolve,
  onResetDemo,
  isInvestigating,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Active P1 Alert',
      summary: 'Inspect active checkout-api p95 latency spike (8.4s) & 18.6% error rate after v4.18.2 deploy.',
      actionText: 'Investigate with Memory →',
      action: onInvestigate,
      tab: 'command-center',
    },
    {
      num: 2,
      title: 'Retrieve & Rank Memory',
      summary: 'Hindsight memory recall triggers deterministic outcome scoring and strict Briefing Guard validation.',
      actionText: isInvestigating ? 'Recalling Memory...' : 'View Grounded Briefing →',
      action: () => onSetStep(3),
      tab: 'investigation',
    },
    {
      num: 3,
      title: 'Inspect 92% Match (INC-2025-0417)',
      summary: 'Inspect identical cache eviction outage from 2025 and why the scoring engine ranked it 0.92.',
      actionText: 'View Evidence Breakdown →',
      action: () => onSetStep(4),
      tab: 'evidence',
    },
    {
      num: 4,
      title: 'Failed Mitigation Warning',
      summary: 'CRITICAL HAZARD: Restarting Checkout API pods failed in 2025 and caused cold-cache stampedes.',
      actionText: 'Return to Investigation →',
      action: () => onSetStep(5),
      tab: 'investigation',
    },
    {
      num: 5,
      title: 'Approve Safer Plan',
      summary: 'Human-in-the-loop: Approve cache config rollback (RB-REDIS-01) and temporary capacity scale-up.',
      actionText: 'Approve & Go to Resolution →',
      action: onGoToResolve,
      tab: 'investigation',
    },
    {
      num: 6,
      title: 'Resolve & Retain Outcome',
      summary: 'Record post-mortem. Retain vetted outcomes in incidents & fix-outcomes bank, boosting runbook reliability.',
      actionText: 'Reset Demo Flow',
      action: onResetDemo,
      tab: 'resolution',
    },
  ];

  const activeStepObj = steps.find((s) => s.num === currentStep) || steps[0];

  if (collapsed) {
    return (
      <div className="bg-space-900 border-b border-border-subtle py-1.5 px-4 text-xs flex justify-between items-center text-slate-400">
        <div className="flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium">3-Minute Hackathon Demo Journey</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300">
            Step {currentStep} of {steps.length}: {activeStepObj.title}
          </span>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
        >
          Expand Guide
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Hackathon Demo Tour Guide" className="bg-gradient-to-r from-space-900 via-space-850 to-space-900 border-b border-border-highlight px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Step indicator and summary */}
        <div className="flex items-start md:items-center space-x-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs shrink-0">
            {currentStep}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center">
                <Compass className="w-3.5 h-3.5 mr-1 text-cyan-400 inline" /> Hackathon Judge Journey
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300 font-medium">{activeStepObj.title}</span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5 max-w-2xl">{activeStepObj.summary}</p>
          </div>
        </div>

        {/* Step Navigation & Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
          {/* Step Pill Indicators */}
          <div className="hidden sm:flex items-center space-x-1 mr-2">
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => onSetStep(s.num)}
                title={s.title}
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                  s.num === currentStep
                    ? 'bg-cyan-500 text-space-950 shadow-glow-cyan'
                    : s.num < currentStep
                    ? 'bg-space-700 text-cyan-400 border border-cyan-500/30'
                    : 'bg-space-800 text-slate-500 border border-border-subtle hover:text-slate-300'
                }`}
              >
                {s.num}
              </button>
            ))}
          </div>

          {/* Primary Next Action */}
          <button
            onClick={activeStepObj.action}
            disabled={isInvestigating}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-space-950 font-semibold text-xs transition-all shadow-glow-cyan disabled:opacity-50"
          >
            <span>{activeStepObj.actionText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-500 hover:text-slate-300 px-2 py-1 text-[11px]"
            title="Minimize guide"
          >
            Hide
          </button>
        </div>
      </div>
    </aside>
  );
};
