import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Vendor, DimensionKey } from '../types/vendor';
import { DIMENSIONS, DIMENSION_LABELS } from '../types/vendor';
import VendorCard from '../components/VendorCard';
// ScoreBadge available via: import ScoreBadge from '../components/ScoreBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from 'recharts';

interface OverviewProps {
  vendors: Vendor[];
  previousVendors: Vendor[] | null;
}

/* ------------------------------------------------------------------ */
/*  Custom dark-theme tooltip for Recharts                            */
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
/*  Bar chart tooltip (vendor-specific)                               */
/* ------------------------------------------------------------------ */
const BarTooltip: React.FC<DarkTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  const vendorName = data.payload?.name as string | undefined;
  const score = data.value;

  return (
    <div
      className="rounded-lg px-4 py-3 shadow-xl text-sm"
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid #475569',
        color: '#f8fafc',
      }}
    >
      <p className="font-semibold mb-1 text-white">{vendorName}</p>
      <p className="text-slate-300">
        Score:{' '}
        <span className="font-bold text-white">
          {typeof score === 'number' ? score.toFixed(1) : score}
        </span>
        <span className="text-slate-400"> / 10</span>
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Overview Page                                                     */
/* ------------------------------------------------------------------ */
const Overview: React.FC<OverviewProps> = ({ vendors, previousVendors }) => {
  const navigate = useNavigate();

  /* ---------- animated progress bar on mount ---------- */
  const [progressWidth, setProgressWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setProgressWidth(100), 100);
    return () => clearTimeout(timer);
  }, []);

  /* ---------- data for horizontal bar chart ---------- */
  const barData = [...vendors]
    .sort((a, b) => a.overallScore - b.overallScore)
    .map((v) => ({
      name: v.name,
      score: v.overallScore,
      fill: v.color,
      isSendbird: v.name === 'Sendbird',
    }));

  /* ---------- data for radar chart ---------- */
  const radarData = DIMENSIONS.map((dim: DimensionKey) => {
    const point: Record<string, string | number> = {
      dimension: DIMENSION_LABELS[dim],
    };
    vendors.forEach((v) => {
      point[v.name] = v[dim];
    });
    return point;
  });

  /* ---------- helper: find previous score ---------- */
  const getPreviousScore = (vendorName: string): number | undefined => {
    if (!previousVendors) return undefined;
    const prev = previousVendors.find((pv) => pv.name === vendorName);
    return prev?.overallScore;
  };

  return (
    <div className="pt-20 p-6 max-w-7xl mx-auto space-y-8">
      {/* ============================================================ */}
      {/* 1. Hero Scorecard Row                                        */}
      {/* ============================================================ */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.name}
              vendor={vendor}
              previousScore={getPreviousScore(vendor.name)}
            />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. Horizontal Bar Chart - Overall EMEA Scores                */}
      {/* ============================================================ */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Overall EMEA Score Comparison
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            layout="vertical"
            data={barData}
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(state: any) => {
              if (state?.activePayload?.[0]?.payload?.name) {
                const vendorName = state.activePayload[0].payload.name as string;
                const vendorId = vendorName.toLowerCase().replace(/\s+/g, '-');
                navigate(`/vendor/${vendorId}`);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              type="number"
              domain={[0, 10]}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#e2e8f0', fontSize: 13 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
              width={95}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
            <Bar
              dataKey="score"
              radius={[0, 6, 6, 0]}
              animationDuration={1500}
              animationBegin={300}
            >
              {barData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  fillOpacity={entry.isSendbird ? 1 : 0.75}
                  stroke={entry.isSendbird ? '#ffffff' : 'none'}
                  strokeWidth={entry.isSendbird ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ============================================================ */}
      {/* 3. Radar / Spider Chart - 7 Dimensions                       */}
      {/* ============================================================ */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Multi-Dimensional Comparison
        </h2>
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
            />
            {vendors.map((vendor) => (
              <Radar
                key={vendor.name}
                name={vendor.name}
                dataKey={vendor.name}
                stroke={vendor.color}
                fill={vendor.color}
                fillOpacity={0.1}
                strokeWidth={2}
                animationDuration={1500}
              />
            ))}
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 20, color: '#e2e8f0' }}
            />
            <Tooltip content={<DarkTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </section>

      {/* ============================================================ */}
      {/* 4. Market Context Banner                                     */}
      {/* ============================================================ */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Global Voice AI Market */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Global Voice AI Market
            </h3>
            <p className="text-white text-lg font-semibold">
              $2.4B <span className="text-slate-400 text-base font-normal">(2024)</span>
              <span className="text-slate-500 mx-2">&rarr;</span>
              $47.5B <span className="text-slate-400 text-base font-normal">(2034)</span>
            </p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{
                  width: `${progressWidth}%`,
                  transition: 'width 2s ease-in-out',
                }}
              />
            </div>
          </div>

          {/* CAGR */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              CAGR
            </h3>
            <span className="inline-flex items-center px-6 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-3xl font-bold">
              34.8%
            </span>
          </div>

          {/* Key EMEA Regulations */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Key EMEA Regulations
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">
                GDPR
              </span>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-semibold">
                EU AI Act
              </span>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-semibold">
                EAA
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Overview;
