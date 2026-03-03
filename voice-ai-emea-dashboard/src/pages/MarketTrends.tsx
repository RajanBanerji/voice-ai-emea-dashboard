import React from 'react';
import type { Vendor, MarketGrowth, MarketShare, VerticalAdoption } from '../types/vendor';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceDot,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface MarketTrendsProps {
  vendors: Vendor[];
  marketGrowth: MarketGrowth[];
  emeaMarketShare: MarketShare[];
  verticalAdoption: VerticalAdoption[];
}

/* ------------------------------------------------------------------ */
/*  Innovation bubble chart data                                       */
/* ------------------------------------------------------------------ */
interface BubbleDataPoint {
  name: string;
  maturity: number;
  innovation: number;
  customers: number;
  color: string;
}

const INNOVATION_DATA: Omit<BubbleDataPoint, 'color'>[] = [
  { name: 'Cognigy', maturity: 9, innovation: 7, customers: 280 },
  { name: 'PolyAI', maturity: 7, innovation: 8, customers: 150 },
  { name: 'Synthflow', maturity: 5, innovation: 9, customers: 100 },
  { name: 'Parloa', maturity: 7, innovation: 6, customers: 180 },
  { name: 'ElevenLabs', maturity: 6, innovation: 10, customers: 90 },
  { name: 'Microsoft Nuance', maturity: 10, innovation: 4, customers: 140 },
  { name: 'Sendbird', maturity: 4, innovation: 8, customers: 60 },
];

/* ------------------------------------------------------------------ */
/*  Stacked bar vendor keys                                            */
/* ------------------------------------------------------------------ */
const VERTICAL_VENDOR_KEYS = ['Cognigy', 'PolyAI', 'Parloa', 'Synthflow', 'Sendbird'] as const;

/* ------------------------------------------------------------------ */
/*  Shared dark tooltip wrapper                                        */
/* ------------------------------------------------------------------ */
const tooltipStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  border: '1px solid #475569',
  color: '#f8fafc',
};

/* ------------------------------------------------------------------ */
/*  Custom Tooltips                                                    */
/* ------------------------------------------------------------------ */
interface LineTooltipPayload {
  payload?: { year?: number; value?: number };
}

interface LineTooltipProps {
  active?: boolean;
  payload?: LineTooltipPayload[];
}

const MarketGrowthTooltip: React.FC<LineTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg px-4 py-3 shadow-xl text-sm" style={tooltipStyle}>
      <p className="text-slate-300">
        Year: <span className="font-semibold text-white">{data.year}</span>
      </p>
      <p className="text-slate-300">
        Market Size: <span className="font-semibold text-cyan-400">${data.value}B</span>
      </p>
    </div>
  );
};

interface PieTooltipPayload {
  name?: string;
  value?: number;
  payload?: { name?: string; value?: number };
}

interface PieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayload[];
}

const PieChartTooltip: React.FC<PieTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];

  return (
    <div className="rounded-lg px-4 py-3 shadow-xl text-sm" style={tooltipStyle}>
      <p className="font-semibold text-white mb-1">{data.name}</p>
      <p className="text-slate-300">
        Market Share: <span className="font-semibold text-white">{data.value}%</span>
      </p>
    </div>
  );
};

interface StackedBarTooltipPayload {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
}

interface StackedBarTooltipProps {
  active?: boolean;
  payload?: StackedBarTooltipPayload[];
  label?: string;
}

const StackedBarTooltip: React.FC<StackedBarTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg px-4 py-3 shadow-xl text-sm" style={tooltipStyle}>
      {label && <p className="font-semibold mb-1 text-slate-200">{label}</p>}
      {payload.map((entry, idx) => (
        <p key={idx} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name ?? entry.dataKey}:</span>
          <span className="font-semibold text-white">{entry.value}%</span>
        </p>
      ))}
    </div>
  );
};

interface ScatterTooltipPayload {
  payload?: {
    name?: string;
    maturity?: number;
    innovation?: number;
    customers?: number;
  };
}

interface ScatterTooltipProps {
  active?: boolean;
  payload?: ScatterTooltipPayload[];
}

const BubbleTooltip: React.FC<ScatterTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg px-4 py-3 shadow-xl text-sm" style={tooltipStyle}>
      <p className="font-semibold text-white mb-1">{data.name}</p>
      <p className="text-slate-300">
        Market Maturity: <span className="font-semibold text-white">{data.maturity}</span>
      </p>
      <p className="text-slate-300">
        Innovation Speed: <span className="font-semibold text-white">{data.innovation}</span>
      </p>
      <p className="text-slate-300">
        Customers: <span className="font-semibold text-white">{data.customers}</span>
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Custom Pie label renderer                                          */
/* ------------------------------------------------------------------ */
const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderPieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
  };
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ------------------------------------------------------------------ */
/*  MarketTrends Page                                                  */
/* ------------------------------------------------------------------ */
const MarketTrends: React.FC<MarketTrendsProps> = ({
  vendors,
  marketGrowth,
  emeaMarketShare,
  verticalAdoption,
}) => {
  /* ---------- helper: look up vendor color by name ---------- */
  const getVendorColor = (name: string): string => {
    const vendor = vendors.find(
      (v) => v.name.toLowerCase() === name.toLowerCase()
    );
    return vendor?.color ?? '#64748b';
  };

  /* ---------- build bubble chart data with colors ---------- */
  const bubbleData: BubbleDataPoint[] = INNOVATION_DATA.map((d) => ({
    ...d,
    color: getVendorColor(d.name),
  }));

  /* ---------- annotated reference points for line chart ---------- */
  const annotations: { year: number; label: string }[] = [
    { year: 2024, label: 'Market: $2.4B' },
    { year: 2028, label: '$8B' },
    { year: 2034, label: '$47.5B' },
  ];

  const getValueForYear = (year: number): number => {
    const point = marketGrowth.find((d) => d.year === year);
    return point?.value ?? 0;
  };

  return (
    <div className="pt-20 p-6 max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============================================================ */}
        {/* 1. Voice AI Market Growth Line Chart (2024-2034)             */}
        {/* ============================================================ */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Global Voice AI Market Growth (2024-2034)
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={marketGrowth}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
                tickFormatter={(val: number) => `$${val}B`}
              />
              <Tooltip content={<MarketGrowthTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#06B6D4"
                strokeWidth={3}
                dot={{ r: 5, fill: '#06B6D4', stroke: '#0e7490', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#06B6D4', stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={2000}
              />
              {annotations.map((a) => (
                <ReferenceDot
                  key={a.year}
                  x={a.year}
                  y={getValueForYear(a.year)}
                  r={0}
                  label={{
                    value: a.label,
                    position: 'top',
                    fill: '#e2e8f0',
                    fontSize: 11,
                    fontWeight: 600,
                    offset: 12,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* ============================================================ */}
        {/* 2. EMEA Market Share Pie Chart                               */}
        {/* ============================================================ */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            EMEA Market Share by Vendor
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={emeaMarketShare}
                cx="45%"
                cy="50%"
                innerRadius={60}
                outerRadius={140}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={renderPieLabel}
                labelLine={false}
                animationDuration={1500}
              >
                {emeaMarketShare.map((entry, index) => {
                  const isSendbird = entry.name.toLowerCase() === 'sendbird';
                  return (
                    <Cell
                      key={`pie-cell-${index}`}
                      fill={getVendorColor(entry.name)}
                      stroke={isSendbird ? '#ffffff' : '#1e293b'}
                      strokeWidth={isSendbird ? 3 : 1}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<PieChartTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ color: '#e2e8f0', fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </section>

        {/* ============================================================ */}
        {/* 3. EMEA Adoption by Industry Vertical - Stacked Bar Chart    */}
        {/* ============================================================ */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            EMEA Adoption by Industry Vertical
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={verticalAdoption}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="vertical"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
              />
              <Tooltip content={<StackedBarTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: 10, color: '#e2e8f0' }}
              />
              {VERTICAL_VENDOR_KEYS.map((vendorKey) => (
                <Bar
                  key={vendorKey}
                  dataKey={vendorKey}
                  stackId="a"
                  fill={getVendorColor(vendorKey)}
                  animationDuration={1500}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* ============================================================ */}
        {/* 4. Innovation Bubble Chart                                   */}
        {/* ============================================================ */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Market Maturity vs Innovation Speed
          </h2>
          <ResponsiveContainer width="100%" height={450}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                dataKey="maturity"
                name="Market Maturity"
                domain={[0, 10]}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
                label={{
                  value: 'Market Maturity',
                  position: 'bottom',
                  fill: '#94a3b8',
                  fontSize: 13,
                  offset: 0,
                }}
              />
              <YAxis
                type="number"
                dataKey="innovation"
                name="Innovation Speed"
                domain={[0, 10]}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
                label={{
                  value: 'Innovation Speed',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 13,
                  offset: -5,
                }}
              />
              <ZAxis
                type="number"
                dataKey="customers"
                range={[80, 400]}
                name="Customers"
              />
              <Tooltip content={<BubbleTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: 10, color: '#e2e8f0' }}
              />
              {bubbleData.map((vendor) => (
                <Scatter
                  key={vendor.name}
                  name={vendor.name}
                  data={[vendor]}
                  fill={vendor.color}
                  animationDuration={1500}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
};

export default MarketTrends;
