import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Vendor, DimensionKey } from '../types/vendor';
import { DIMENSIONS, DIMENSION_LABELS } from '../types/vendor';
import ScoreBadge from '../components/ScoreBadge';
import AddToCompareButton from '../components/AddToCompareButton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface HeadToHeadProps {
  vendors: Vendor[];
}

/* ------------------------------------------------------------------ */
/*  Custom dark-theme tooltip for the grouped bar chart               */
/* ------------------------------------------------------------------ */
interface DarkTooltipPayloadEntry {
  name?: string;
  value?: number;
  color?: string;
  payload?: Record<string, unknown>;
  dataKey?: string;
}

interface DarkTooltipProps {
  active?: boolean;
  payload?: DarkTooltipPayloadEntry[];
  label?: string;
}

const DarkTooltip: React.FC<DarkTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-lg px-4 py-3 shadow-xl text-sm"
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid #475569',
        color: '#f8fafc',
      }}
    >
      {label && <p className="font-semibold mb-1 text-slate-200">{label}</p>}
      {payload.map((entry, idx) => (
        <p key={idx} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name ?? entry.dataKey}:</span>
          <span className="font-semibold text-white">
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Head-to-Head Comparison Page                                      */
/* ------------------------------------------------------------------ */
const HeadToHead: React.FC<HeadToHeadProps> = ({ vendors }) => {
  const [vendorAIndex, setVendorAIndex] = useState(0);
  const [vendorBIndex, setVendorBIndex] = useState(6);

  const vendorA = vendors[vendorAIndex];
  const vendorB = vendors[vendorBIndex];

  /* ---------- chart data ---------- */
  const chartData = DIMENSIONS.map((dim: DimensionKey) => ({
    dimension: DIMENSION_LABELS[dim],
    [vendorA.name]: vendorA[dim],
    [vendorB.name]: vendorB[dim],
  }));

  /* ---------- delta analysis ---------- */
  const deltas = DIMENSIONS.map((dim: DimensionKey) => {
    const scoreA = vendorA[dim];
    const scoreB = vendorB[dim];
    const delta = Number((scoreA - scoreB).toFixed(1));
    let winner: string;
    if (delta > 0) winner = vendorA.name;
    else if (delta < 0) winner = vendorB.name;
    else winner = 'Tie';
    return {
      dim,
      label: DIMENSION_LABELS[dim],
      scoreA,
      scoreB,
      delta,
      winner,
    };
  });

  /* ---------- recommendation logic ---------- */
  const vendorAWins = deltas.filter((d) => d.winner === vendorA.name);
  const vendorBWins = deltas.filter((d) => d.winner === vendorB.name);
  const ties = deltas.filter((d) => d.winner === 'Tie');

  let overallWinner: Vendor;
  let winnerDims: typeof vendorAWins;
  let isTie = false;

  if (vendorAWins.length > vendorBWins.length) {
    overallWinner = vendorA;
    winnerDims = vendorAWins;
  } else if (vendorBWins.length > vendorAWins.length) {
    overallWinner = vendorB;
    winnerDims = vendorBWins;
  } else {
    isTie = true;
    overallWinner = vendorA;
    winnerDims = vendorAWins;
  }

  return (
    <div className="pt-20 p-6 max-w-7xl mx-auto">
      {/* ============================================================ */}
      {/* 1. Vendor Selection Row                                      */}
      {/* ============================================================ */}
      <section className="mb-8">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <select
              value={vendorAIndex}
              onChange={(e) => setVendorAIndex(Number(e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded-lg text-white p-3 text-lg min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vendors.map((v, i) => (
                <option key={v.name} value={i}>
                  {v.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Link
                to={`/vendor/${vendorA.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Profile &rarr;
              </Link>
              <AddToCompareButton vendorName={vendorA.name} />
            </div>
          </div>

          <span className="text-3xl font-bold text-slate-400">VS</span>

          <div className="flex flex-col items-center gap-2">
            <select
              value={vendorBIndex}
              onChange={(e) => setVendorBIndex(Number(e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded-lg text-white p-3 text-lg min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vendors.map((v, i) => (
                <option key={v.name} value={i}>
                  {v.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Link
                to={`/vendor/${vendorB.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Profile &rarr;
              </Link>
              <AddToCompareButton vendorName={vendorB.name} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. Side-by-Side Grouped Bar Chart                            */}
      {/* ============================================================ */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Dimension Comparison
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="dimension"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
            />
            <Tooltip
              content={<DarkTooltip />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 10, color: '#e2e8f0' }}
            />
            <Bar
              dataKey={vendorA.name}
              fill={vendorA.color}
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey={vendorB.name}
              fill={vendorB.color}
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ============================================================ */}
      {/* 3. Delta Indicator Table                                     */}
      {/* ============================================================ */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Score Delta Analysis
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 rounded-tl-lg">
                  Dimension
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 text-center">
                  <span style={{ color: vendorA.color }}>{vendorA.name}</span>
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 text-center">
                  <span style={{ color: vendorB.color }}>{vendorB.name}</span>
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 text-center">
                  Delta
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-300 text-center rounded-tr-lg">
                  Winner
                </th>
              </tr>
            </thead>
            <tbody>
              {deltas.map((d, idx) => (
                <tr
                  key={d.dim}
                  className={`border-t border-slate-700 ${
                    idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/60'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-slate-200 font-medium">
                    {d.label}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge score={d.scoreA} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge score={d.scoreB} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        d.delta > 0
                          ? 'text-emerald-400'
                          : d.delta < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {d.delta > 0 && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                      {d.delta < 0 && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                      {d.delta === 0 && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      )}
                      {d.delta > 0 ? '+' : ''}{d.delta.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold">
                    {d.winner === 'Tie' ? (
                      <span className="text-slate-400">Tie</span>
                    ) : (
                      <span
                        style={{
                          color:
                            d.winner === vendorA.name
                              ? vendorA.color
                              : vendorB.color,
                        }}
                      >
                        {d.winner}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. "Best For" Recommendation Card                            */}
      {/* ============================================================ */}
      <section
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8"
        style={{
          background: isTie
            ? undefined
            : `linear-gradient(135deg, ${overallWinner.color}1a 0%, transparent 60%)`,
        }}
      >
        <div className="flex items-start gap-4">
          {/* Trophy icon */}
          <div className="flex-shrink-0 mt-1">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke={isTie ? '#94a3b8' : overallWinner.color}
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875 3.375 3.375 0 0016.5 7.5h0V3.75m-9 15v-4.5A3.375 3.375 0 014.125 10.875 3.375 3.375 0 017.5 7.5h0V3.75m9 0H7.5m9 0h1.875A1.125 1.125 0 0119.5 4.875v1.5A1.125 1.125 0 0118.375 7.5H16.5m-9-3.75H5.625A1.125 1.125 0 004.5 4.875v1.5A1.125 1.125 0 005.625 7.5H7.5"
              />
            </svg>
          </div>

          <div className="flex-1">
            {isTie ? (
              <>
                <h3 className="text-xl font-bold text-white mb-2">
                  It's a Tie!
                </h3>
                <p className="text-slate-300 mb-4">
                  Both vendors win {vendorAWins.length} of 7 dimensions
                  {ties.length > 0 && ` with ${ties.length} tied`}.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-2">
                  <span style={{ color: overallWinner.color }}>
                    {overallWinner.name}
                  </span>{' '}
                  leads in {winnerDims.length} of 7 dimensions
                </h3>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Vendor A dimensions won */}
              <div>
                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: vendorA.color }}
                >
                  {vendorA.name} wins
                </h4>
                {vendorAWins.length > 0 ? (
                  <ul className="space-y-1">
                    {vendorAWins.map((d) => (
                      <li key={d.dim} className="text-sm text-slate-300 flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: vendorA.color }}
                        />
                        {d.label}
                        <span className="text-slate-500">
                          ({d.scoreA.toFixed(1)} vs {d.scoreB.toFixed(1)})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">No dimensions won</p>
                )}
              </div>

              {/* Vendor B dimensions won */}
              <div>
                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: vendorB.color }}
                >
                  {vendorB.name} wins
                </h4>
                {vendorBWins.length > 0 ? (
                  <ul className="space-y-1">
                    {vendorBWins.map((d) => (
                      <li key={d.dim} className="text-sm text-slate-300 flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: vendorB.color }}
                        />
                        {d.label}
                        <span className="text-slate-500">
                          ({d.scoreB.toFixed(1)} vs {d.scoreA.toFixed(1)})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">No dimensions won</p>
                )}
              </div>
            </div>

            {ties.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">
                  Tied dimensions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ties.map((d) => (
                    <span
                      key={d.dim}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-medium"
                    >
                      {d.label} ({d.scoreA.toFixed(1)})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeadToHead;
