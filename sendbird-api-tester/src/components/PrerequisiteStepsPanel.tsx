import React, { useState } from 'react';
import type { PrerequisiteStep } from '../context/TestResultsContext';

interface PrerequisiteStepsPanelProps {
  steps: PrerequisiteStep[];
}

const KIND_LABELS: Record<string, { label: string; color: string }> = {
  'static': { label: 'Static', color: 'bg-gray-600' },
  'api-fetch': { label: 'API Fetch', color: 'bg-blue-600' },
  'api-create': { label: 'API Create', color: 'bg-green-600' },
  'chained-fetch': { label: 'Chained Fetch', color: 'bg-purple-600' },
  'chained-create': { label: 'Chained Create', color: 'bg-amber-600' },
  'body-resolve': { label: 'Body Resolve', color: 'bg-cyan-600' },
};

const METHOD_COLORS: Record<string, string> = {
  GET: '#3B82F6',
  POST: '#22C55E',
  PUT: '#F59E0B',
  DELETE: '#EF4444',
};

const PrerequisiteStepsPanel: React.FC<PrerequisiteStepsPanelProps> = ({ steps }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-[#0D0A1C] border border-[#2E2A52] rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#2E2A52] flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <h4 className="text-sm font-medium text-amber-400">
          Prerequisite Steps ({steps.length})
        </h4>
        <span className="text-xs text-gray-500 ml-auto">
          Dependencies resolved before running this test
        </span>
      </div>

      <div className="divide-y divide-[#252145]">
        {steps.map((step, idx) => {
          const kindCfg = KIND_LABELS[step.kind] || { label: step.kind, color: 'bg-gray-600' };
          const isExpanded = expandedIdx === idx;
          const hasApiDetails = step.apiCall != null;

          return (
            <div key={idx} className="group">
              {/* Step summary row */}
              <div
                className={`flex items-center gap-3 px-4 py-2.5 ${hasApiDetails ? 'cursor-pointer hover:bg-[#16132D]' : ''} transition-colors`}
                onClick={() => hasApiDetails && setExpandedIdx(isExpanded ? null : idx)}
              >
                {/* Step number */}
                <span className="w-5 h-5 rounded-full bg-[#252145] flex items-center justify-center text-[10px] text-gray-400 font-mono flex-shrink-0">
                  {idx + 1}
                </span>

                {/* Status icon */}
                {step.error ? (
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}

                {/* Kind badge */}
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white flex-shrink-0 ${kindCfg.color}`}>
                  {kindCfg.label}
                </span>

                {/* Param name */}
                <code className="text-sm text-gray-300 font-mono flex-shrink-0">
                  {step.paramName}
                </code>

                {/* Description */}
                <span className="text-xs text-gray-500 truncate flex-1">
                  {step.description}
                </span>

                {/* Resolved value */}
                {step.resolvedValue && (
                  <code className="text-xs text-green-400 font-mono flex-shrink-0 max-w-[200px] truncate">
                    = {step.resolvedValue}
                  </code>
                )}

                {/* Duration */}
                {step.durationMs != null && (
                  <span className="text-[10px] text-gray-600 flex-shrink-0">
                    {step.durationMs}ms
                  </span>
                )}

                {/* Expand chevron */}
                {hasApiDetails && (
                  <svg
                    className={`w-3.5 h-3.5 text-gray-600 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>

              {/* Expanded API call details */}
              {isExpanded && step.apiCall && (
                <div className="px-4 pb-3 pt-0 ml-8 space-y-2">
                  {/* Method + Path */}
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: METHOD_COLORS[step.apiCall.method] || '#6B7280' }}
                    >
                      {step.apiCall.method}
                    </span>
                    <code className="text-xs text-gray-400 font-mono">{step.apiCall.path}</code>
                    {step.apiCall.responseStatus && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ml-auto ${
                        step.apiCall.responseStatus >= 200 && step.apiCall.responseStatus < 300
                          ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {step.apiCall.responseStatus}
                      </span>
                    )}
                  </div>

                  {/* Request params */}
                  {step.apiCall.params && Object.keys(step.apiCall.params).length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Query Params</p>
                      <pre className="text-xs text-gray-400 font-mono bg-[#16132D] rounded px-2 py-1.5 border border-[#252145] overflow-x-auto max-h-24">
                        {JSON.stringify(step.apiCall.params, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Request body */}
                  {step.apiCall.body && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Request Body</p>
                      <pre className="text-xs text-gray-400 font-mono bg-[#16132D] rounded px-2 py-1.5 border border-[#252145] overflow-x-auto max-h-32">
                        {JSON.stringify(step.apiCall.body, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Response body (truncated) */}
                  {step.apiCall.responseBody && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Response Body</p>
                      <pre className="text-xs text-gray-400 font-mono bg-[#16132D] rounded px-2 py-1.5 border border-[#252145] overflow-x-auto max-h-40">
                        {JSON.stringify(step.apiCall.responseBody, null, 2).slice(0, 2000)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrerequisiteStepsPanel;
