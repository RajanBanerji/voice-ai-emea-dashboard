import React, { useMemo } from 'react';
import { useTestResults } from '../context/TestResultsContext';
import { useHistory } from '../context/HistoryContext';
import { CATEGORIES, ALL_ENDPOINTS } from '../data/endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ReferenceLine } from 'recharts';

const RATING_COLORS: Record<string, string> = {
  fast: '#22C55E',
  acceptable: '#EAB308',
  slow: '#F97316',
  critical: '#EF4444',
};

function getLatencyRating(ms: number): string {
  if (ms < 200) return 'fast';
  if (ms < 500) return 'acceptable';
  if (ms < 1000) return 'slow';
  return 'critical';
}

const PerformancePage: React.FC = () => {
  const { results, globalSummary } = useTestResults();
  const { history } = useHistory();

  // Latency data per endpoint
  const latencyData = useMemo(() => {
    return ALL_ENDPOINTS
      .filter(ep => results[ep.id]?.latencyMs != null)
      .map(ep => ({
        name: ep.name.length > 25 ? ep.name.slice(0, 25) + '...' : ep.name,
        latency: results[ep.id].latencyMs!,
        rating: getLatencyRating(results[ep.id].latencyMs!),
      }))
      .sort((a, b) => b.latency - a.latency);
  }, [results]);

  // Category average latency
  const categoryLatency = useMemo(() => {
    return CATEGORIES.map(cat => {
      const tested = cat.endpoints.filter(ep => results[ep.id]?.latencyMs != null);
      if (tested.length === 0) return null;
      const avg = tested.reduce((sum, ep) => sum + (results[ep.id].latencyMs || 0), 0) / tested.length;
      return { name: cat.name, avg: Math.round(avg), count: tested.length };
    }).filter(Boolean) as { name: string; avg: number; count: number }[];
  }, [results]);

  // Distribution pie chart
  const ratingDistribution = useMemo(() => {
    const counts = { fast: 0, acceptable: 0, slow: 0, critical: 0 };
    for (const ep of ALL_ENDPOINTS) {
      const r = results[ep.id];
      if (r?.latencyMs != null) {
        counts[getLatencyRating(r.latencyMs) as keyof typeof counts]++;
      }
    }
    return [
      { name: 'Fast (<200ms)', value: counts.fast, color: RATING_COLORS.fast },
      { name: 'Acceptable (<500ms)', value: counts.acceptable, color: RATING_COLORS.acceptable },
      { name: 'Slow (<1000ms)', value: counts.slow, color: RATING_COLORS.slow },
      { name: 'Critical (>1000ms)', value: counts.critical, color: RATING_COLORS.critical },
    ].filter(d => d.value > 0);
  }, [results]);

  // Recent latency trend from history
  const latencyTrend = useMemo(() => {
    return history.slice(0, 50).reverse().map((entry, i) => ({
      index: i + 1,
      latency: entry.performance.latency_ms,
      name: entry.endpoint_name.slice(0, 20),
    }));
  }, [history]);

  const testedCount = latencyData.length;
  const avgLatency = testedCount > 0 ? Math.round(latencyData.reduce((s, d) => s + d.latency, 0) / testedCount) : 0;
  const maxLatency = testedCount > 0 ? Math.max(...latencyData.map(d => d.latency)) : 0;
  const minLatency = testedCount > 0 ? Math.min(...latencyData.map(d => d.latency)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Performance Dashboard</h2>
        <p className="text-sm text-gray-400 mt-1">API latency analysis and performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Endpoints Tested</p>
          <p className="text-2xl font-bold text-white">{testedCount}</p>
          <p className="text-xs text-gray-600 mt-1">of {ALL_ENDPOINTS.length} total</p>
        </div>
        <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Avg Latency</p>
          <p className={`text-2xl font-bold ${
            avgLatency < 200 ? 'text-green-400' :
            avgLatency < 500 ? 'text-yellow-400' :
            avgLatency < 1000 ? 'text-orange-400' : 'text-red-400'
          }`}>{avgLatency}ms</p>
          <p className="text-xs text-gray-600 mt-1">{getLatencyRating(avgLatency)}</p>
        </div>
        <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Pass Rate</p>
          <p className="text-2xl font-bold text-green-400">
            {globalSummary.passed + globalSummary.failed > 0
              ? Math.round((globalSummary.passed / (globalSummary.passed + globalSummary.failed)) * 100)
              : 0}%
          </p>
          <p className="text-xs text-gray-600 mt-1">{globalSummary.passed} pass / {globalSummary.failed} fail</p>
        </div>
        <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Total Time</p>
          <p className="text-2xl font-bold text-white">{(globalSummary.totalTime / 1000).toFixed(1)}s</p>
          <p className="text-xs text-gray-600 mt-1">Min: {minLatency}ms / Max: {maxLatency}ms</p>
        </div>
      </div>

      {/* Sendbird Benchmark Reference */}
      <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-gray-300">Sendbird API Latency Benchmarks</h3>
          <span className="text-xs text-gray-600 font-normal">— what the colors mean for your app</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              color: 'bg-green-500', border: 'border-green-700/30', textColor: 'text-green-400',
              label: 'Fast', range: '< 200ms',
              detail: 'Excellent. Real-time features (chat, presence) will feel instant to end users.',
            },
            {
              color: 'bg-yellow-500', border: 'border-yellow-700/30', textColor: 'text-yellow-400',
              label: 'Acceptable', range: '200 – 500ms',
              detail: 'Normal for complex queries (message history, analytics). Most users won\'t notice.',
            },
            {
              color: 'bg-orange-500', border: 'border-orange-700/30', textColor: 'text-orange-400',
              label: 'Slow', range: '500ms – 1s',
              detail: 'Users may perceive lag. Investigate payload size, network path, or plan limits.',
            },
            {
              color: 'bg-red-500', border: 'border-red-700/30', textColor: 'text-red-400',
              label: 'Critical', range: '> 1 000ms',
              detail: 'Unacceptable for production. Check for rate limits, oversized payloads, or region mismatch.',
            },
          ].map(b => (
            <div key={b.label} className={`bg-[#0D0A1C] border ${b.border} rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${b.color}`} />
                <span className={`text-sm font-semibold ${b.textColor}`}>{b.label}</span>
                <span className="text-xs text-gray-500 ml-auto">{b.range}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{b.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Reference lines on the chart below mark the 200ms and 500ms thresholds. Sendbird's typical production latency is under 200ms for most REST endpoints.
        </p>
      </div>

      {testedCount === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No performance data yet</p>
          <p className="text-sm">Run some API tests to see performance metrics here</p>
        </div>
      ) : (
        <>
          {/* Latency by Endpoint */}
          <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Latency by Endpoint (ms)</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-6 border-t border-dashed border-green-500" />
                  200ms target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-6 border-t border-dashed border-yellow-500" />
                  500ms warning
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(300, latencyData.length * 28)}>
              <BarChart data={latencyData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2A52" />
                <XAxis type="number" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={180}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  stroke="#2E2A52"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16132D', border: '1px solid #2E2A52', borderRadius: '8px' }}
                  labelStyle={{ color: '#E6EDF3' }}
                  itemStyle={{ color: '#9CA3AF' }}
                  formatter={(value: number | undefined) => value !== undefined ? [`${value}ms`, 'Latency'] : ['', 'Latency']}
                />
                <ReferenceLine x={200} stroke="#22C55E" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: '200ms', fill: '#22C55E', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={500} stroke="#EAB308" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: '500ms', fill: '#EAB308', fontSize: 10, position: 'top' }} />
                <Bar dataKey="latency" radius={[0, 4, 4, 0]}>
                  {latencyData.map((entry, i) => (
                    <Cell key={i} fill={RATING_COLORS[entry.rating]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Average Latency */}
            {categoryLatency.length > 0 && (
              <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Average Latency by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryLatency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2E2A52" />
                    <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#16132D', border: '1px solid #2E2A52', borderRadius: '8px' }}
                      labelStyle={{ color: '#E6EDF3' }}
                    />
                    <Bar dataKey="avg" fill="#742DDD" radius={[4, 4, 0, 0]}>
                      {categoryLatency.map((entry, i) => (
                        <Cell key={i} fill={RATING_COLORS[getLatencyRating(entry.avg)]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Rating Distribution */}
            {ratingDistribution.length > 0 && (
              <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Latency Rating Distribution</h3>
                <div className="flex items-center">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={ratingDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        stroke="#0D0A1C"
                        strokeWidth={2}
                      >
                        {ratingDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#16132D', border: '1px solid #2E2A52', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {ratingDistribution.map(d => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-gray-400">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Latency Trend */}
          {latencyTrend.length > 0 && (
            <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Recent Latency Trend (last 50 calls)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={latencyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2A52" />
                  <XAxis dataKey="index" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16132D', border: '1px solid #2E2A52', borderRadius: '8px' }}
                    labelStyle={{ color: '#E6EDF3' }}
                    formatter={(value) => [`${value}ms`, 'Latency']}
                  />
                  <Bar dataKey="latency" radius={[2, 2, 0, 0]}>
                    {latencyTrend.map((entry, i) => (
                      <Cell key={i} fill={RATING_COLORS[getLatencyRating(entry.latency)]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformancePage;
