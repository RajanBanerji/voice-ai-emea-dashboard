import React from 'react';
import { CATEGORIES } from '../data/endpoints';
import { useTestResults } from '../context/TestResultsContext';

interface HealthSummaryPanelProps {
  onNavigateToCategory: (category: string) => void;
  onDismiss: () => void;
}

function getHealthLabel(passed: number, total: number): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dot: string;
} {
  if (total === 0) return { label: 'Not tested', color: 'text-gray-400', bgColor: 'bg-gray-800/40', borderColor: 'border-gray-700/40', dot: 'bg-gray-500' };
  const pct = passed / total;
  if (pct === 1) return { label: 'Healthy', color: 'text-green-400', bgColor: 'bg-green-900/20', borderColor: 'border-green-700/30', dot: 'bg-green-400' };
  if (pct >= 0.75) return { label: 'Mostly OK', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20', borderColor: 'border-yellow-700/30', dot: 'bg-yellow-400' };
  if (pct > 0) return { label: 'Degraded', color: 'text-orange-400', bgColor: 'bg-orange-900/20', borderColor: 'border-orange-700/30', dot: 'bg-orange-400' };
  return { label: 'Failing', color: 'text-red-400', bgColor: 'bg-red-900/20', borderColor: 'border-red-700/30', dot: 'bg-red-500' };
}

function _formatAvgLatency(ms: number): string {
  if (ms < 200) return `${ms}ms — fast`;
  if (ms < 500) return `${ms}ms — acceptable`;
  if (ms < 1000) return `${ms}ms — slow`;
  return `${ms}ms — very slow`;
}
void _formatAvgLatency;

const HealthSummaryPanel: React.FC<HealthSummaryPanelProps> = ({ onNavigateToCategory, onDismiss }) => {
  const { results, globalSummary } = useTestResults();

  const total = globalSummary.passed + globalSummary.failed + globalSummary.skipped;
  const testedCount = globalSummary.passed + globalSummary.failed;
  const avgLatency = testedCount > 0 ? Math.round(globalSummary.totalTime / testedCount) : 0;

  const overallHealth = getHealthLabel(globalSummary.passed, testedCount);

  const overallMessage = (() => {
    if (testedCount === 0) return 'No tests have been run yet.';
    if (globalSummary.failed === 0)
      return `All ${globalSummary.passed} APIs are responding correctly.`;
    if (globalSummary.passed === 0)
      return `All ${globalSummary.failed} tested APIs are failing. Check your credentials or Sendbird app status.`;
    return `${globalSummary.passed} of ${testedCount} APIs passed. ${globalSummary.failed} need attention.`;
  })();

  const categoryRows = CATEGORIES.map(cat => {
    const epIds = cat.endpoints.map(e => e.id);
    let passed = 0, failed = 0, skipped = 0, latencySum = 0, latencyCount = 0;
    for (const id of epIds) {
      const r = results[id];
      if (!r || r.status === 'pending') continue;
      if (r.status === 'pass') { passed++; if (r.latencyMs) { latencySum += r.latencyMs; latencyCount++; } }
      else if (r.status === 'fail') failed++;
      else if (r.status === 'skipped') skipped++;
    }
    const tested = passed + failed;
    const avgMs = latencyCount > 0 ? Math.round(latencySum / latencyCount) : null;
    return { cat, passed, failed, skipped, tested, total: epIds.length, avgMs };
  }).filter(row => row.tested > 0 || row.skipped > 0);

  if (total === 0) return null;

  return (
    <div className="bg-[#16132D] border border-[#2E2A52] rounded-xl overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-[#2E2A52] ${overallHealth.bgColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${overallHealth.dot}`} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">API Health Summary</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${overallHealth.bgColor} ${overallHealth.borderColor} ${overallHealth.color}`}>
                  {overallHealth.label}
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{overallMessage}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-600 hover:text-gray-400 text-lg leading-none shrink-0 ml-4 mt-0.5"
            title="Dismiss"
          >
            ×
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-3 pl-5">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-green-400 font-semibold">{globalSummary.passed}</span>
            <span className="text-gray-500">passed</span>
          </div>
          {globalSummary.failed > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-red-400 font-semibold">{globalSummary.failed}</span>
              <span className="text-gray-500">failed</span>
            </div>
          )}
          {globalSummary.skipped > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-yellow-400 font-semibold">{globalSummary.skipped}</span>
              <span className="text-gray-500">skipped</span>
            </div>
          )}
          {avgLatency > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-300 font-semibold">{avgLatency}ms</span>
              <span className="text-gray-500">avg response</span>
            </div>
          )}
        </div>
      </div>

      {/* Per-category breakdown */}
      {categoryRows.length > 0 && (
        <div className="divide-y divide-[#2E2A52]/60">
          {categoryRows.map(({ cat, passed, failed, tested, total: catTotal, avgMs }) => {
            const health = getHealthLabel(passed, tested);
            const hasFailures = failed > 0;
            return (
              <button
                key={cat.name}
                onClick={() => onNavigateToCategory(cat.name)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#1E1A3A] transition-colors text-left group"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${health.dot}`} />

                <span className="text-sm text-gray-300 w-36 shrink-0">
                  {cat.icon} {cat.name}
                </span>

                {/* Progress bar */}
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#0D0A1C] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        failed === 0 ? 'bg-green-500' : passed === 0 ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${tested > 0 ? (passed / tested) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 w-12 text-right">
                    {passed}/{catTotal}
                  </span>
                </div>

                {avgMs !== null && (
                  <span className={`text-xs shrink-0 w-16 text-right ${
                    avgMs < 200 ? 'text-green-400' :
                    avgMs < 500 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {avgMs}ms
                  </span>
                )}

                <span className={`text-xs font-medium shrink-0 w-20 text-right ${health.color}`}>
                  {health.label}
                </span>

                {hasFailures && (
                  <span className="text-xs text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <div className="px-5 py-3 border-t border-[#2E2A52]/60 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          Click any row to view individual test results and error details
        </p>
        {globalSummary.failed > 0 && (
          <p className="text-xs text-amber-500">
            Test data created during this run may still exist in your Sendbird app
          </p>
        )}
      </div>
    </div>
  );
};

export default HealthSummaryPanel;
