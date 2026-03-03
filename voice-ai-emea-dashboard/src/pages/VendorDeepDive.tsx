import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Vendor, DimensionKey } from '../types/vendor';
import { DIMENSIONS, DIMENSION_LABELS } from '../types/vendor';
import ScoreBadge from '../components/ScoreBadge';
import ComplianceChecklist from '../components/ComplianceChecklist';
import AddToCompareButton from '../components/AddToCompareButton';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface VendorDeepDiveProps {
  vendors: Vendor[];
}

const TIER_COLORS: Record<string, string> = {
  Enterprise: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
  'Mid-Market': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  SMB: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  'Infra Layer': 'bg-pink-500/20 text-pink-400 border-pink-500/40',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const VendorDeepDive: React.FC<VendorDeepDiveProps> = ({ vendors }) => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor>(vendors[0]);

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendor = vendors.find((v) => v.name === e.target.value);
    if (vendor) setSelectedVendor(vendor);
  };

  // Radar chart data
  const radarData = DIMENSIONS.map((dim: DimensionKey) => ({
    dimension: DIMENSION_LABELS[dim],
    score: selectedVendor[dim],
    fullMark: 10,
  }));

  // Sentiment gauge data (half-donut)
  const sentimentPercent = (selectedVendor.market_sentiment / 10) * 100;
  const sentimentData = [
    { name: 'filled', value: sentimentPercent },
    { name: 'remaining', value: 100 - sentimentPercent },
  ];

  const tierClass =
    TIER_COLORS[selectedVendor.tier] ||
    'bg-slate-500/20 text-slate-400 border-slate-500/40';

  return (
    <div className="pt-20 p-6 max-w-7xl mx-auto min-h-screen bg-slate-900">
      {/* Vendor Selector */}
      <div className="mb-8">
        <label
          htmlFor="vendor-select"
          className="block text-sm font-medium text-slate-400 mb-2"
        >
          Select Vendor
        </label>
        <select
          id="vendor-select"
          value={selectedVendor.name}
          onChange={handleVendorChange}
          className="bg-slate-800 border border-slate-600 rounded-lg text-white px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        >
          {vendors.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* 1. Vendor Header */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Colored initials circle */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
            style={{
              backgroundColor: `${selectedVendor.color}25`,
              color: selectedVendor.color,
              border: `3px solid ${selectedVendor.color}`,
            }}
          >
            {getInitials(selectedVendor.name)}
          </div>

          {/* Vendor info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                <Link
                  to={`/vendor/${selectedVendor.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {selectedVendor.name}
                </Link>
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${tierClass}`}
              >
                {selectedVendor.tier}
              </span>
              <AddToCompareButton vendorName={selectedVendor.name} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-3">
              <span>HQ: {selectedVendor.hq}</span>
              <span>Founded: {selectedVendor.founded}</span>
            </div>
            <p className="text-slate-300 text-base">
              {selectedVendor.one_line_summary}
            </p>
          </div>

          {/* Overall score */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
              Overall Score
            </span>
            <ScoreBadge score={selectedVendor.overallScore} size="lg" />
          </div>
        </div>
      </section>

      {/* 2. Strengths vs Weaknesses */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strength card */}
        <div className="bg-slate-800 rounded-lg p-5 border-l-4 border-green-500">
          <h3 className="text-green-400 text-sm font-semibold uppercase tracking-wider mb-2">
            Key Strength
          </h3>
          <p className="text-white text-base leading-relaxed">
            {selectedVendor.top_strength}
          </p>
        </div>

        {/* Weakness card */}
        <div className="bg-slate-800 rounded-lg p-5 border-l-4 border-red-500">
          <h3 className="text-red-400 text-sm font-semibold uppercase tracking-wider mb-2">
            Key Weakness
          </h3>
          <p className="text-white text-base leading-relaxed">
            {selectedVendor.top_weakness}
          </p>
        </div>
      </section>

      {/* 3. Radar Chart of 7 Dimension Scores */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Dimension Scores
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name={selectedVendor.name}
              dataKey="score"
              stroke={selectedVendor.color}
              fill={selectedVendor.color}
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </section>

      {/* 4. Sentiment Gauge (Half-donut) */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          EMEA Market Sentiment
        </h2>
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: 300, height: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={selectedVendor.color} />
                  <Cell fill="#334155" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center score text */}
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span
                className="text-3xl font-bold"
                style={{ color: selectedVendor.color }}
              >
                {selectedVendor.market_sentiment.toFixed(1)}
                <span className="text-lg text-slate-400">/10</span>
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mt-2">
            EMEA Market Sentiment
          </p>
        </div>
      </section>

      {/* 5. Compliance Checklist */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Compliance &amp; Certifications
        </h2>
        <ComplianceChecklist compliance={selectedVendor.compliance} />
      </section>

      {/* 6. Pricing Tier Badge */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Pricing Tier</h2>
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center px-6 py-3 rounded-xl text-xl font-bold border-2 ${tierClass}`}
          >
            {selectedVendor.tier}
          </span>
        </div>
      </section>
    </div>
  );
};

export default VendorDeepDive;
