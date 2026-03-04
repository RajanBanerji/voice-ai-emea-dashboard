import type { TestResult } from '../context/TestResultsContext';
import type { HistoryEntry } from '../context/HistoryContext';
import type { EndpointDef } from '../data/endpoints';

export function exportTestResults(
  results: Record<string, TestResult>,
  endpoints: EndpointDef[],
  appId: string,
  region: string
) {
  const entries = endpoints
    .map(ep => {
      const r = results[ep.id];
      return {
        category: ep.category,
        endpoint: `${ep.method} ${ep.path}`,
        name: ep.name,
        status: r?.status || 'pending',
        http_status: r?.httpStatus || null,
        latency_ms: r?.latencyMs || null,
        request: r?.request || null,
        response: r?.response || null,
        error: r?.error || null,
      };
    })
    .filter(e => e.status !== 'pending');

  const summary = {
    passed: entries.filter(e => e.status === 'pass').length,
    failed: entries.filter(e => e.status === 'fail').length,
    skipped: entries.filter(e => e.status === 'skipped').length,
  };

  const report = {
    app_id: appId.slice(0, 8) + '...',
    region,
    tested_at: new Date().toISOString(),
    summary,
    results: entries,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sendbird-api-test-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportHistory(entries: HistoryEntry[]) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sendbird-history-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
