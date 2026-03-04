import React from 'react';
import type { ResolveStep } from '../hooks/useDependencyResolver';

interface PrerequisitesPanelProps {
  steps: ResolveStep[];
  isResolving: boolean;
  onResolveAndRun: () => void;
  onResolveOnly: () => void;
}

function StatusIcon({ status }: { status: ResolveStep['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'resolving':
      return (
        <svg className="w-4 h-4 text-[#8B5CF6] animate-spin flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    case 'resolved':
      return (
        <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
  }
}

const PrerequisitesPanel: React.FC<PrerequisitesPanelProps> = ({
  steps,
  isResolving,
  onResolveAndRun,
  onResolveOnly,
}) => {
  if (steps.length === 0) return null;

  return (
    <div className="bg-[#0D0A1C] border border-amber-800/40 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-amber-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Prerequisites Required
        </h4>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-xs font-medium text-gray-300 bg-[#252145] hover:bg-[#2E2A52] border border-[#2E2A52] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onResolveOnly}
            disabled={isResolving}
          >
            Resolve Only
          </button>
          <button
            className="px-3 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            onClick={onResolveAndRun}
            disabled={isResolving}
          >
            {isResolving ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resolving...
              </>
            ) : (
              'Auto-Resolve & Run'
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map(step => (
          <div key={step.paramName} className="flex items-start gap-3 py-1.5 px-2 rounded bg-[#16132D]/50">
            <StatusIcon status={step.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-sm text-gray-200 font-mono">{step.paramName}</code>
                <span className="text-xs text-gray-500">{step.label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              {step.status === 'resolved' && step.resolvedValue && (
                <p className="text-xs text-green-400 font-mono mt-1">
                  = {step.resolvedValue}
                </p>
              )}
              {step.status === 'error' && step.error && (
                <p className="text-xs text-red-400 mt-1">{step.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrerequisitesPanel;
