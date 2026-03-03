import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import type { Vendor } from '../types/vendor';
import { DIMENSIONS, DIMENSION_LABELS } from '../types/vendor';
import type { Feature, CSATData, RoadmapItem } from '../types/vendorProfile';
import {
  features,
  csatData,
  fundingData,
  roadmapItems,
  pricingData,
} from '../data/vendorProfileData';
import { useCompare } from '../context/CompareContext';
// ScoreBadge available if needed
// import ScoreBadge from '../components/ScoreBadge';

interface ComparePageProps {
  vendors: Vendor[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePriceToNumber(price: string): number {
  if (!price) return 0;
  const lower = price.toLowerCase();
  if (lower === 'custom') return 0;
  const match = price.match(/[\d,.]+/);
  if (!match) return 0;
  const num = parseFloat(match[0].replace(/,/g, ''));
  if (lower.includes('+')) return num;
  return num;
}

function parseFundingToNumber(funding: string): number {
  if (!funding) return 0;
  const match = funding.match(/([\d,.]+)\s*(B|M|K)?/i);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(/,/g, ''));
  const unit = (match[2] || '').toUpperCase();
  if (unit === 'B') return num * 1000;
  if (unit === 'K') return num / 1000;
  return num; // M is default
}

function getScoreColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.8) return '#10B981';
  if (ratio >= 0.6) return '#F59E0B';
  return '#EF4444';
}

function getLatencyColor(ms: number): string {
  if (ms === 0) return '#6B7280';
  if (ms <= 300) return '#10B981';
  if (ms <= 500) return '#F59E0B';
  return '#EF4444';
}

// ─── Quarter utilities for Gantt ──────────────────────────────────────────────

const GANTT_QUARTERS = [
  'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026',
  'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027',
];

function getQuarterIndex(quarter: string): number {
  return GANTT_QUARTERS.indexOf(quarter);
}

function getStatusStyle(status: RoadmapItem['status']): React.CSSProperties {
  switch (status) {
    case 'GA':
      return {};
    case 'In Beta':
      return {
        backgroundImage:
          'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 6px)',
      };
    case 'Announced':
      return {
        backgroundColor: 'transparent',
        border: '2px solid',
      };
    case 'Rumored':
      return {
        backgroundImage:
          'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.2) 4px, rgba(0,0,0,0.2) 8px)',
        opacity: 0.7,
      };
    default:
      return {};
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const ComparePage: React.FC<ComparePageProps> = ({ vendors }) => {
  const { compareList } = useCompare();

  const comparedVendors = useMemo(
    () =>
      compareList
        .map((name) => vendors.find((v) => v.name === name))
        .filter((v): v is Vendor => v !== undefined),
    [compareList, vendors]
  );

  // AI Recommendation state
  const [useCase, setUseCase] = useState(
    'Enterprise contact center in DACH region'
  );
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);

  // ── Guard: need at least 2 vendors ───────────────────────────────────────
  if (comparedVendors.length < 2) {
    return (
      <div className="pt-20 p-6 max-w-7xl mx-auto min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center max-w-md">
          <p className="text-slate-300 text-lg mb-4">
            Select at least 2 vendors to compare. Go back to the dashboard to add
            vendors.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────

  const vendorNames = comparedVendors.map((v) => v.name);

  // Group features by category
  const categories = Array.from(new Set(features.map((f) => f.category)));
  const featuresByCategory: Record<string, Feature[]> = {};
  for (const cat of categories) {
    featuresByCategory[cat] = features.filter((f) => f.category === cat);
  }

  // Feature completeness score per vendor
  const featureCompleteness: Record<string, number> = {};
  for (const name of vendorNames) {
    const total = features.length;
    const supported = features.filter(
      (f) => f.vendors[name] === '\u2705'
    ).length;
    const partial = features.filter(
      (f) => f.vendors[name] === '\uD83D\uDD04'
    ).length;
    featureCompleteness[name] = Math.round(
      ((supported + partial * 0.5) / total) * 100
    );
  }

  // Radar chart data
  const radarData = DIMENSIONS.map((dim) => {
    const entry: Record<string, string | number> = {
      dimension: DIMENSION_LABELS[dim],
    };
    for (const v of comparedVendors) {
      entry[v.name] = v[dim as keyof Vendor] as number;
    }
    return entry;
  });

  // Pricing chart data
  const pricingChartData = (['entry', 'mid', 'enterprise'] as const).map(
    (tier) => {
      const label =
        tier === 'entry' ? 'Entry' : tier === 'mid' ? 'Mid' : 'Enterprise';
      const entry: Record<string, string | number> = { tier: label };
      for (const name of vendorNames) {
        const pd = pricingData.find((p) => p.vendor === name);
        if (pd) {
          entry[name] = parsePriceToNumber(pd[tier].price);
        } else {
          entry[name] = 0;
        }
      }
      return entry;
    }
  );

  // CSAT data for compared vendors
  const comparedCSAT: CSATData[] = vendorNames
    .map((name) => csatData.find((c) => c.vendor === name))
    .filter((c): c is CSATData => c !== undefined);

  // Funding chart data
  const fundingChartData = vendorNames
    .map((name) => {
      const fd = fundingData.find((f) => f.vendor === name);
      if (!fd) return null;
      return {
        name,
        amount: parseFundingToNumber(fd.totalFunding),
        valuation: fd.valuation,
        color:
          comparedVendors.find((v) => v.name === name)?.color || '#6B7280',
      };
    })
    .filter(
      (d): d is { name: string; amount: number; valuation: string; color: string } =>
        d !== null
    );

  // Roadmap items for compared vendors
  const comparedRoadmap = roadmapItems.filter((r) =>
    vendorNames.includes(r.vendor)
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleGetRecommendation = async () => {
    setIsLoadingRec(true);
    setRecommendation(null);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

    if (!apiKey) {
      // Fallback static recommendation
      const sorted = [...comparedVendors].sort(
        (a, b) => b.overallScore - a.overallScore
      );
      const best = sorted[0];
      setRecommendation(
        `Based on the overall scores, ${best.name} leads with a score of ${best.overallScore.toFixed(1)}/10. ` +
          `Its top strength is "${best.top_strength}" while its main weakness is "${best.top_weakness}". ` +
          `For the use case "${useCase}", consider ${best.name} as the primary option due to its strong ${best.enterprise_fit >= 8 ? 'enterprise fit' : best.emea_compliance >= 8 ? 'EMEA compliance' : 'overall capabilities'}. ` +
          `${sorted.length > 1 ? `${sorted[1].name} (${sorted[1].overallScore.toFixed(1)}/10) is a solid runner-up with strength in "${sorted[1].top_strength}".` : ''} ` +
          `Note: Connect an API key (VITE_ANTHROPIC_API_KEY) for AI-powered recommendations.`
      );
      setIsLoadingRec(false);
      return;
    }

    try {
      const vendorSummaries = comparedVendors
        .map(
          (v) =>
            `${v.name}: Overall ${v.overallScore}/10, EMEA Compliance ${v.emea_compliance}/10, ` +
            `Language ${v.language_coverage}/10, Latency ${v.latency}/10, Voice Quality ${v.voice_quality}/10, ` +
            `Ease of Use ${v.ease_of_use}/10, Enterprise Fit ${v.enterprise_fit}/10, ` +
            `Pricing Transparency ${v.pricing_transparency}/10. ` +
            `Strength: ${v.top_strength}. Weakness: ${v.top_weakness}.`
        )
        .join('\n');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are a voice AI platform analyst. Compare these vendors for the EMEA market:\n${vendorSummaries}\nUse case: ${useCase}. Give a direct, opinionated verdict: which vendor is best for this use case and why. Be specific about strengths and weaknesses. Max 200 words. No markdown formatting.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text =
        data.content?.[0]?.text || 'No recommendation generated.';
      setRecommendation(text);
    } catch (err) {
      setRecommendation(
        `Error fetching recommendation: ${err instanceof Error ? err.message : 'Unknown error'}. ` +
          `Falling back to score-based analysis: ${comparedVendors.sort((a, b) => b.overallScore - a.overallScore)[0].name} ` +
          `has the highest overall score at ${comparedVendors.sort((a, b) => b.overallScore - a.overallScore)[0].overallScore.toFixed(1)}/10.`
      );
    } finally {
      setIsLoadingRec(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="pt-20 p-6 max-w-7xl mx-auto min-h-screen bg-slate-900">
      {/* ─── 1. Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Vendor Comparison
          </h1>
          <div className="flex flex-wrap gap-2">
            {comparedVendors.map((v) => (
              <span
                key={v.name}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-200"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: v.color }}
                />
                {v.name}
              </span>
            ))}
          </div>
        </div>
        <Link
          to="/"
          className="mt-4 sm:mt-0 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* ─── 2. Feature Matrix ────────────────────────────────────────────── */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Feature Matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Feature
                </th>
                {comparedVendors.map((v) => (
                  <th
                    key={v.name}
                    className="text-center py-3 px-4 font-medium"
                    style={{ color: v.color }}
                  >
                    {v.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <React.Fragment key={cat}>
                  <tr>
                    <td
                      colSpan={comparedVendors.length + 1}
                      className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-800/80"
                    >
                      {cat}
                    </td>
                  </tr>
                  {featuresByCategory[cat].map((feature) => {
                    const statuses = vendorNames.map(
                      (name) => feature.vendors[name]
                    );
                    const isDifferentiator = !statuses.every(
                      (s) => s === statuses[0]
                    );
                    return (
                      <tr
                        key={feature.name}
                        className={
                          isDifferentiator
                            ? 'border-l-2 border-amber-500 bg-amber-900/10'
                            : 'border-l-2 border-transparent'
                        }
                      >
                        <td className="py-2 px-4 text-slate-300">
                          {feature.name}
                          {isDifferentiator && (
                            <span className="ml-2 text-xs text-amber-400">
                              differentiator
                            </span>
                          )}
                        </td>
                        {vendorNames.map((name) => (
                          <td
                            key={name}
                            className="py-2 px-4 text-center text-lg"
                          >
                            {feature.vendors[name] || '\u2014'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Feature Completeness Score */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-3">
            Feature Completeness Score
          </h3>
          <div className="flex flex-col gap-3">
            {comparedVendors.map((v) => (
              <div key={v.name} className="flex items-center gap-3">
                <span
                  className="text-sm w-36 truncate"
                  style={{ color: v.color }}
                >
                  {v.name}
                </span>
                <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${featureCompleteness[v.name]}%`,
                      backgroundColor: v.color,
                    }}
                  />
                </div>
                <span className="text-sm text-slate-300 w-12 text-right">
                  {featureCompleteness[v.name]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Overlaid Radar Chart ──────────────────────────────────────── */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Dimension Radar Comparison
        </h2>
        <ResponsiveContainer width="100%" height={450}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <PolarRadiusAxis
              domain={[0, 10]}
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={false}
            />
            {comparedVendors.map((v) => (
              <Radar
                key={v.name}
                name={v.name}
                dataKey={v.name}
                stroke={v.color}
                fill={v.color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ color: '#CBD5E1', paddingTop: 16 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </section>

      {/* ─── 4. Grouped Cost Bars ─────────────────────────────────────────── */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Pricing Comparison by Tier
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={pricingChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="tier"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(val: number) =>
                val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#E2E8F0',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number, name: string) => [
                value === 0 ? 'Custom' : `$${value.toLocaleString()}/mo`,
                name,
              ]) as any}
            />
            <Legend wrapperStyle={{ color: '#CBD5E1' }} />
            {comparedVendors.map((v) => (
              <Bar
                key={v.name}
                dataKey={v.name}
                fill={v.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ─── 5. CSAT Side-by-Side ─────────────────────────────────────────── */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Customer Satisfaction & Performance
        </h2>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${comparedVendors.length}, minmax(0, 1fr))`,
          }}
        >
          {comparedCSAT.map((csat) => {
            const vendor = comparedVendors.find(
              (v) => v.name === csat.vendor
            );
            if (!vendor) return null;
            return (
              <div
                key={csat.vendor}
                className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50"
              >
                <h3
                  className="text-lg font-semibold mb-4 text-center"
                  style={{ color: vendor.color }}
                >
                  {csat.vendor}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">G2 Rating</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: getScoreColor(csat.g2Rating, 5) }}
                    >
                      {csat.g2Rating}/5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">
                      Capterra Rating
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: getScoreColor(csat.capterraRating, 5),
                      }}
                    >
                      {csat.capterraRating}/5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">
                      Containment Rate
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: getScoreColor(csat.containmentRate, 100),
                      }}
                    >
                      {csat.containmentRate > 0
                        ? `${csat.containmentRate}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">
                      Avg Latency
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: getLatencyColor(csat.avgLatencyMs) }}
                    >
                      {csat.avgLatencyMs > 0
                        ? `${csat.avgLatencyMs}ms`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">CSAT Score</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: getScoreColor(csat.csat, 100) }}
                    >
                      {csat.csat}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 6. Funding Bar Chart ─────────────────────────────────────────── */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Total Funding Comparison
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={fundingChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(val: number) =>
                val >= 1000
                  ? `$${(val / 1000).toFixed(1)}B`
                  : `$${val}M`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#E2E8F0',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number, name: string) => {
                const label =
                  value >= 1000
                    ? `$${(value / 1000).toFixed(1)}B`
                    : `$${value}M`;
                return [label, name];
              }) as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={((label: string) => {
                const item = fundingChartData.find(
                  (d) => d.name === label
                );
                return item
                  ? `${label} (Valuation: ${item.valuation})`
                  : label;
              }) as any}
            />
            <Bar
              dataKey="amount"
              name="Total Funding"
              radius={[4, 4, 0, 0]}
              label={{
                position: 'top' as const,
                fill: '#94A3B8',
                fontSize: 11,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter: ((_value: any, entry: any) => {
                  const idx =
                    typeof entry === 'object' && entry !== null && 'index' in entry
                      ? (entry as { index: number }).index
                      : -1;
                  return idx >= 0 && idx < fundingChartData.length
                    ? fundingChartData[idx].valuation
                    : '';
                }) as any,
              }}
            >
              {fundingChartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ─── 7. Gantt-style Roadmap Timeline ──────────────────────────────── */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Roadmap Timeline
        </h2>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-6 h-3 rounded bg-slate-500" />
            GA (Solid)
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-6 h-3 rounded bg-slate-500"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)',
              }}
            />
            In Beta (Striped)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-6 h-3 rounded border-2 border-slate-500 bg-transparent" />
            Announced (Outlined)
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-6 h-3 rounded bg-slate-500"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)',
                opacity: 0.7,
              }}
            />
            Rumored (Dashed)
          </span>
        </div>

        <div className="overflow-x-auto">
          {/* Quarter headers */}
          <div className="flex min-w-[800px]">
            <div className="w-36 shrink-0" />
            {GANTT_QUARTERS.map((q) => (
              <div
                key={q}
                className="flex-1 text-center text-xs text-slate-500 py-2 border-l border-slate-700"
              >
                {q}
              </div>
            ))}
          </div>

          {/* Vendor rows */}
          {comparedVendors.map((vendor) => {
            const items = comparedRoadmap.filter(
              (r) => r.vendor === vendor.name
            );
            return (
              <div
                key={vendor.name}
                className="flex min-w-[800px] border-t border-slate-700"
              >
                <div
                  className="w-36 shrink-0 py-2 px-2 text-sm font-medium truncate"
                  style={{ color: vendor.color }}
                >
                  {vendor.name}
                </div>
                <div className="flex-1 relative h-auto min-h-[3rem] flex">
                  {GANTT_QUARTERS.map((q) => (
                    <div
                      key={q}
                      className="flex-1 border-l border-slate-700/50"
                    />
                  ))}
                  {/* Roadmap items */}
                  {items.map((item) => {
                    const qIdx = getQuarterIndex(item.quarter);
                    if (qIdx < 0) return null;
                    const leftPct = (qIdx / GANTT_QUARTERS.length) * 100;
                    const widthPct = (1 / GANTT_QUARTERS.length) * 100;
                    const statusStyle = getStatusStyle(item.status);
                    const isOutlined = item.status === 'Announced';
                    return (
                      <div
                        key={item.id}
                        className="absolute top-1 rounded h-8 flex items-center px-2 text-xs text-white overflow-hidden whitespace-nowrap"
                        style={{
                          left: `${leftPct + 1}%`,
                          width: `${widthPct - 2}%`,
                          backgroundColor: isOutlined
                            ? 'transparent'
                            : vendor.color,
                          borderColor: vendor.color,
                          ...statusStyle,
                        }}
                        title={`${item.item} (${item.status}) - ${item.quarter}`}
                      >
                        <span
                          className="truncate"
                          style={{
                            color: isOutlined ? vendor.color : '#fff',
                          }}
                        >
                          {item.item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 8. AI Recommendation Engine ──────────────────────────────────── */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          AI Recommendation
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="use-case-input"
              className="block text-sm text-slate-400 mb-1"
            >
              Describe your use case
            </label>
            <textarea
              id="use-case-input"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="e.g. Enterprise contact center in DACH region"
            />
          </div>
          <button
            onClick={handleGetRecommendation}
            disabled={isLoadingRec}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            {isLoadingRec ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              'Get Recommendation'
            )}
          </button>

          {recommendation && (
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm font-bold">
                  AI
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ComparePage;
