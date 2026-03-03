import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Vendor } from '../types/vendor';
import type {
  Feature,
  RoadmapItem,
  PricingTier,
  FundingRound,
} from '../types/vendorProfile';
import {
  features,
  roadmapItems,
  pricingData,
  csatData,
  fundingData,
  emeaPresenceData,
} from '../data/vendorProfileData';
import ScoreBadge from '../components/ScoreBadge';
import AddToCompareButton from '../components/AddToCompareButton';

type TabKey = 'features' | 'roadmap' | 'pricing' | 'csat' | 'funding' | 'emea';

interface VendorProfileProps {
  vendors: Vendor[];
}

const TAB_LABELS: { key: TabKey; label: string }[] = [
  { key: 'features', label: 'Features' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'csat', label: 'CSAT & Performance' },
  { key: 'funding', label: 'Funding' },
  { key: 'emea', label: 'EMEA Presence' },
];

// Map for approximate European city SVG coordinates (on a 600x500 viewBox)
const CITY_COORDS: Record<string, { x: number; y: number }> = {
  London: { x: 210, y: 170 },
  Dublin: { x: 175, y: 150 },
  Berlin: { x: 340, y: 155 },
  Dusseldorf: { x: 290, y: 170 },
  Munich: { x: 325, y: 195 },
  Aachen: { x: 280, y: 175 },
  Amsterdam: { x: 275, y: 155 },
  Paris: { x: 250, y: 210 },
  Frankfurt: { x: 310, y: 185 },
};

const OFFICE_TYPE_COLORS: Record<string, string> = {
  HQ: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Regional HQ': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Office: 'bg-slate-600/30 text-slate-300 border-slate-600',
  'Data Center': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const COUNTRY_FLAGS: Record<string, string> = {
  Germany: '\uD83C\uDDE9\uD83C\uDDEA',
  UK: '\uD83C\uDDEC\uD83C\uDDE7',
  Ireland: '\uD83C\uDDEE\uD83C\uDDEA',
  Netherlands: '\uD83C\uDDF3\uD83C\uDDF1',
  France: '\uD83C\uDDEB\uD83C\uDDF7',
  Singapore: '\uD83C\uDDF8\uD83C\uDDEC',
  US: '\uD83C\uDDFA\uD83C\uDDF8',
  USA: '\uD83C\uDDFA\uD83C\uDDF8',
  UAE: '\uD83C\uDDE6\uD83C\uDDEA',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getTierBadgeClasses(tier: string): string {
  switch (tier) {
    case 'Leader':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Challenger':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'Niche':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Emerging':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export default function VendorProfile({ vendors }: VendorProfileProps) {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('features');

  // TCO Calculator state
  const [monthlyConversations, setMonthlyConversations] = useState<number>(10000);
  const [avgCallDuration, setAvgCallDuration] = useState<number>(3);
  const [numAgents, setNumAgents] = useState<number>(5);

  // Tooltip state for EMEA map
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const vendor = useMemo(() => {
    if (!vendorId) return undefined;
    return vendors.find(
      (v) => v.name.toLowerCase().replace(/\s+/g, '-') === vendorId
    );
  }, [vendorId, vendors]);

  const vendorFeatures = useMemo(() => {
    if (!vendor) return [];
    return features;
  }, [vendor]);

  const vendorRoadmap = useMemo(() => {
    if (!vendor) return [];
    return roadmapItems
      .filter((item) => item.vendor === vendor.name)
      .sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [vendor]);

  const vendorPricing = useMemo(() => {
    if (!vendor) return undefined;
    return pricingData.find((p) => p.vendor === vendor.name);
  }, [vendor]);

  const vendorCSAT = useMemo(() => {
    if (!vendor) return undefined;
    return csatData.find((c) => c.vendor === vendor.name);
  }, [vendor]);

  const vendorFunding = useMemo(() => {
    if (!vendor) return undefined;
    return fundingData.find((f) => f.vendor === vendor.name);
  }, [vendor]);

  const vendorEMEA = useMemo(() => {
    if (!vendor) return undefined;
    return emeaPresenceData.find((e) => e.vendor === vendor.name);
  }, [vendor]);

  const featureCompleteness = useMemo(() => {
    if (!vendor) return 0;
    const total = vendorFeatures.length;
    const completed = vendorFeatures.filter(
      (f) => f.vendors[vendor.name] === '\u2705'
    ).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [vendor, vendorFeatures]);

  const groupedFeatures = useMemo(() => {
    const groups: Record<string, Feature[]> = {};
    const categoryOrder = ['Core Voice', 'AI & NLU', 'Integration', 'Compliance', 'Analytics'];
    for (const cat of categoryOrder) {
      groups[cat] = vendorFeatures.filter((f) => f.category === cat);
    }
    return groups;
  }, [vendorFeatures]);

  const estimatedMonthlyCost = useMemo(() => {
    if (!vendorPricing) return 0;
    const model = vendorPricing.pricingModel.toLowerCase();
    if (model.includes('minute')) {
      return monthlyConversations * avgCallDuration * 0.08;
    } else if (model.includes('session') || model.includes('conversation')) {
      return monthlyConversations * 0.35;
    } else if (model.includes('agent') || model.includes('seat')) {
      return numAgents * 800 + monthlyConversations * 0.1;
    } else if (model.includes('interaction')) {
      return monthlyConversations * 0.25 + 2000;
    } else if (model.includes('character') || model.includes('api')) {
      return monthlyConversations * avgCallDuration * 500 * 0.00003;
    } else if (model.includes('credit') || model.includes('message')) {
      return monthlyConversations * 0.15;
    }
    return monthlyConversations * 0.2;
  }, [vendorPricing, monthlyConversations, avgCallDuration, numAgents]);

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 pt-20">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-slate-200">Vendor Not Found</h1>
          <p className="mb-6 text-slate-400">
            Could not find a vendor matching &quot;{vendorId}&quot;
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ────────────────────────── Tab: Features ──────────────────────────
  const renderFeatures = () => {
    const completenessColor =
      featureCompleteness > 75
        ? 'bg-emerald-500'
        : featureCompleteness > 50
          ? 'bg-amber-500'
          : 'bg-red-500';
    const completenessTextColor =
      featureCompleteness > 75
        ? 'text-emerald-400'
        : featureCompleteness > 50
          ? 'text-amber-400'
          : 'text-red-400';

    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Feature Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Category
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedFeatures).map(([category, feats]) => (
                <React.Fragment key={category}>
                  <tr className="border-t border-slate-600 bg-slate-700/50">
                    <td
                      colSpan={3}
                      className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400"
                    >
                      {category} ({feats.length})
                    </td>
                  </tr>
                  {feats.map((feat) => {
                    const status = feat.vendors[vendor.name] || '\u274C';
                    let statusColor = 'text-red-400';
                    if (status === '\u2705') statusColor = 'text-emerald-400';
                    else if (status === '\uD83D\uDD04') statusColor = 'text-amber-400';
                    return (
                      <tr
                        key={feat.name}
                        className="border-t border-slate-700/50 transition-colors hover:bg-slate-700/30"
                      >
                        <td className="px-6 py-3 text-sm text-slate-200">{feat.name}</td>
                        <td className="px-6 py-3 text-sm text-slate-400">{feat.category}</td>
                        <td className={`px-6 py-3 text-center text-lg ${statusColor}`}>
                          {status}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Feature Completeness Score */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200">Feature Completeness Score</h3>
            <span className={`text-2xl font-bold ${completenessTextColor}`}>
              {featureCompleteness}%
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${completenessColor}`}
              style={{ width: `${featureCompleteness}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {vendorFeatures.filter((f) => f.vendors[vendor.name] === '\u2705').length} of{' '}
            {vendorFeatures.length} features available
          </p>
        </div>
      </div>
    );
  };

  // ────────────────────────── Tab: Roadmap ──────────────────────────
  const renderRoadmap = () => {
    const statusBadge = (status: RoadmapItem['status']) => {
      const colors: Record<RoadmapItem['status'], string> = {
        Announced: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'In Beta': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        Rumored: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        GA: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      };
      return (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}
        >
          {status}
        </span>
      );
    };

    if (vendorRoadmap.length === 0) {
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <p className="text-lg text-slate-400">No roadmap items available for {vendor.name}.</p>
        </div>
      );
    }

    return (
      <div className="relative space-y-0 pl-8">
        {/* Vertical timeline line */}
        <div className="absolute left-3 top-2 h-[calc(100%-16px)] w-0.5 bg-slate-600" />

        {vendorRoadmap.map((item) => (
          <div key={item.id} className="relative pb-8">
            {/* Timeline dot */}
            <div
              className="absolute -left-5 top-2 h-4 w-4 rounded-full border-2 border-slate-500 bg-slate-800"
              style={{
                borderColor:
                  item.status === 'GA'
                    ? '#10B981'
                    : item.status === 'In Beta'
                      ? '#F59E0B'
                      : item.status === 'Announced'
                        ? '#3B82F6'
                        : '#64748B',
              }}
            />
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-colors hover:bg-slate-800/80">
              <div className="mb-2 flex items-center gap-3">
                <span className="rounded-md bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300">
                  {item.quarter}
                </span>
                {statusBadge(item.status)}
              </div>
              <h4 className="mb-1 text-base font-semibold text-slate-100">{item.item}</h4>
              <p className="text-sm leading-relaxed text-slate-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ────────────────────────── Tab: Pricing ──────────────────────────
  const renderPricing = () => {
    if (!vendorPricing) {
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <p className="text-lg text-slate-400">No pricing data available for {vendor.name}.</p>
        </div>
      );
    }

    const tiers: { key: 'entry' | 'mid' | 'enterprise'; data: PricingTier['entry'] }[] = [
      { key: 'entry', data: vendorPricing.entry },
      { key: 'mid', data: vendorPricing.mid },
      { key: 'enterprise', data: vendorPricing.enterprise },
    ];

    return (
      <div className="space-y-8">
        {/* Tier Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map(({ key, data }) => {
            const isEnterprise = key === 'enterprise';
            return (
              <div
                key={key}
                className={`relative rounded-xl border p-6 transition-colors ${
                  isEnterprise
                    ? 'border-cyan-500/50 bg-slate-800/80 shadow-lg shadow-cyan-500/5'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                {isEnterprise && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-0.5 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="mb-1 text-lg font-semibold text-slate-200">{data.name}</h3>
                <p className="mb-4 text-3xl font-bold text-slate-100">{data.price}</p>
                <ul className="space-y-2">
                  {data.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Pricing Model */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <span className="text-sm text-slate-400">Pricing Model: </span>
          <span className="font-medium text-slate-200">{vendorPricing.pricingModel}</span>
        </div>

        {/* TCO Calculator */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-6 text-lg font-semibold text-slate-200">TCO Calculator</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Monthly Conversations Slider */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Monthly Conversations:{' '}
                <span className="font-medium text-slate-200">
                  {monthlyConversations.toLocaleString()}
                </span>
              </label>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={monthlyConversations}
                onChange={(e) => setMonthlyConversations(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>1,000</span>
                <span>100,000</span>
              </div>
            </div>

            {/* Avg Call Duration Slider */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Avg Call Duration (min):{' '}
                <span className="font-medium text-slate-200">{avgCallDuration}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={avgCallDuration}
                onChange={(e) => setAvgCallDuration(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>1 min</span>
                <span>10 min</span>
              </div>
            </div>

            {/* Number of Agents Slider */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Number of Agents:{' '}
                <span className="font-medium text-slate-200">{numAgents}</span>
              </label>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={numAgents}
                onChange={(e) => setNumAgents(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>1</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="mt-8 rounded-lg border border-slate-600 bg-slate-900/50 p-6 text-center">
            <p className="mb-1 text-sm text-slate-400">Estimated Monthly Cost</p>
            <p className="text-4xl font-bold text-cyan-400">
              ${Math.round(estimatedMonthlyCost).toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Based on {monthlyConversations.toLocaleString()} conversations x {avgCallDuration} min
              avg x {numAgents} agents ({vendorPricing.pricingModel})
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ────────────────────────── Tab: CSAT & Performance ──────────────────────────
  const renderCSAT = () => {
    if (!vendorCSAT) {
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <p className="text-lg text-slate-400">No CSAT data available for {vendor.name}.</p>
        </div>
      );
    }

    const latencyColor =
      vendorCSAT.avgLatencyMs < 400
        ? 'text-emerald-400'
        : vendorCSAT.avgLatencyMs < 600
          ? 'text-amber-400'
          : 'text-red-400';

    // Half-donut pie data for containment rate
    const containmentPieData = [
      { name: 'Contained', value: vendorCSAT.containmentRate },
      { name: 'Not Contained', value: 100 - vendorCSAT.containmentRate },
    ];
    const containmentColors = ['#10B981', '#334155'];

    const renderStars = (rating: number) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.floor(rating);
        const partial = !filled && i - rating < 1 && i - rating > 0;
        stars.push(
          <span
            key={i}
            className={`text-lg ${filled ? 'text-amber-400' : partial ? 'text-amber-400/50' : 'text-slate-600'}`}
          >
            {'\u2605'}
          </span>
        );
      }
      return <div className="flex gap-0.5">{stars}</div>;
    };

    return (
      <div className="space-y-6">
        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* G2 Rating */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              G2 Rating
            </h4>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-slate-100">
                {vendorCSAT.g2Rating.toFixed(1)}
              </span>
              <span className="text-xl text-slate-400">/5</span>
            </div>
            <div className="mt-2">{renderStars(vendorCSAT.g2Rating)}</div>
            <p className="mt-2 text-sm text-slate-400">
              {vendorCSAT.g2Reviews.toLocaleString()} reviews
            </p>
          </div>

          {/* Capterra Rating */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              Capterra Rating
            </h4>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-slate-100">
                {vendorCSAT.capterraRating.toFixed(1)}
              </span>
              <span className="text-xl text-slate-400">/5</span>
            </div>
            <div className="mt-2">{renderStars(vendorCSAT.capterraRating)}</div>
            <p className="mt-2 text-sm text-slate-400">
              {vendorCSAT.capterraReviews.toLocaleString()} reviews
            </p>
          </div>

          {/* Containment Rate - Half Donut */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              Containment Rate
            </h4>
            {vendorCSAT.containmentRate > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={containmentPieData}
                      cx="50%"
                      cy="90%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      {containmentPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={containmentColors[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <span className="-mt-4 text-3xl font-bold text-emerald-400">
                  {vendorCSAT.containmentRate}%
                </span>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">N/A for this vendor</p>
            )}
          </div>

          {/* Avg Latency */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              Average Latency
            </h4>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${latencyColor}`}>
                {vendorCSAT.avgLatencyMs}
              </span>
              <span className="text-xl text-slate-400">ms</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {vendorCSAT.avgLatencyMs < 400
                ? 'Excellent response time'
                : vendorCSAT.avgLatencyMs < 600
                  ? 'Acceptable latency'
                  : 'High latency - may impact UX'}
            </p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* First Call Resolution */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium uppercase tracking-wider text-slate-400">
                First Call Resolution
              </h4>
              <span className="text-lg font-bold text-slate-200">
                {vendorCSAT.firstCallResolution > 0
                  ? `${vendorCSAT.firstCallResolution}%`
                  : 'N/A'}
              </span>
            </div>
            {vendorCSAT.firstCallResolution > 0 ? (
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${vendorCSAT.firstCallResolution}%` }}
                />
              </div>
            ) : (
              <div className="h-3 w-full rounded-full bg-slate-700" />
            )}
          </div>

          {/* CSAT Score */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium uppercase tracking-wider text-slate-400">
                CSAT Score
              </h4>
              <span className="text-lg font-bold text-slate-200">{vendorCSAT.csat}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${vendorCSAT.csat}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ────────────────────────── Tab: Funding ──────────────────────────
  const renderFunding = () => {
    if (!vendorFunding) {
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <p className="text-lg text-slate-400">No funding data available for {vendor.name}.</p>
        </div>
      );
    }

    const burnRiskColors: Record<string, string> = {
      Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      High: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
      <div className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Funding
            </p>
            <p className="text-2xl font-bold text-slate-100">{vendorFunding.totalFunding}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
              Valuation
            </p>
            <p className="text-2xl font-bold text-slate-100">{vendorFunding.valuation}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
              Burn Risk
            </p>
            <span
              className={`mt-1 inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${burnRiskColors[vendorFunding.burnRisk]}`}
            >
              {vendorFunding.burnRisk}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
              Employees
            </p>
            <p className="text-2xl font-bold text-slate-100">{vendorFunding.employees}</p>
          </div>
        </div>

        {/* Public/Private Badge */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${
              vendorFunding.publicPrivate === 'Public'
                ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                : 'border-slate-500/30 bg-slate-500/20 text-slate-400'
            }`}
          >
            {vendorFunding.publicPrivate}
          </span>
          <span className="text-sm text-slate-400">Founded {vendorFunding.founded}</span>
        </div>

        {/* Funding Timeline */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-6 text-lg font-semibold text-slate-200">Funding Timeline</h3>
          <div className="relative space-y-0 pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-2 h-[calc(100%-16px)] w-0.5 bg-slate-600" />

            {vendorFunding.rounds.map((round: FundingRound, index: number) => (
              <div key={index} className="relative pb-6">
                {/* Dot */}
                <div className="absolute -left-5 top-3 h-3 w-3 rounded-full border-2 border-cyan-500 bg-slate-800" />
                <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 transition-colors hover:bg-slate-900/60">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-slate-300">{round.date}</span>
                    <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
                      {round.round}
                    </span>
                    <span className="text-lg font-bold text-slate-100">{round.amount}</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {round.investors.join(' \u2022 ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ────────────────────────── Tab: EMEA Presence ──────────────────────────
  const renderEMEA = () => {
    if (!vendorEMEA) {
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <p className="text-lg text-slate-400">No EMEA data available for {vendor.name}.</p>
        </div>
      );
    }

    const languageProgress = Math.min((vendorEMEA.languages / 70) * 100, 100);

    return (
      <div className="space-y-6">
        {/* SVG Map */}
        {vendorEMEA.offices.length > 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-200">Office Locations</h3>
            <div className="relative">
              <svg
                viewBox="0 0 600 400"
                className="w-full"
                style={{ maxHeight: '350px' }}
              >
                {/* Map background */}
                <rect x="0" y="0" width="600" height="400" rx="12" fill="#1e293b" />
                {/* Rough Europe outline shapes */}
                <path
                  d="M150,100 L180,80 L220,75 L260,70 L300,65 L340,60 L380,65 L420,80 L460,90 L480,100
                     L490,130 L485,160 L470,180 L450,200 L420,220 L380,240 L350,260 L320,270
                     L290,280 L260,275 L240,260 L230,240 L250,220 L240,200 L220,190 L200,200
                     L190,180 L180,160 L160,150 L150,130 Z"
                  fill="#334155"
                  stroke="#475569"
                  strokeWidth="1"
                  opacity="0.5"
                />
                {/* UK/Ireland */}
                <path
                  d="M175,120 L200,110 L220,120 L225,150 L220,175 L210,185 L200,180 L190,170 L185,150 L175,135 Z"
                  fill="#334155"
                  stroke="#475569"
                  strokeWidth="1"
                  opacity="0.5"
                />
                {/* Office dots */}
                {vendorEMEA.offices.map((office) => {
                  const coords = CITY_COORDS[office.city];
                  if (!coords) return null;
                  return (
                    <g key={office.city}>
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="8"
                        fill={vendor.color}
                        opacity="0.3"
                      />
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="4"
                        fill={vendor.color}
                        stroke="#0F172A"
                        strokeWidth="1"
                        onMouseEnter={() => setHoveredCity(office.city)}
                        onMouseLeave={() => setHoveredCity(null)}
                        style={{ cursor: 'pointer' }}
                      />
                      {hoveredCity === office.city && (
                        <>
                          <rect
                            x={coords.x - 40}
                            y={coords.y - 28}
                            width={80}
                            height={20}
                            rx="4"
                            fill="#1e293b"
                            stroke="#475569"
                            strokeWidth="1"
                          />
                          <text
                            x={coords.x}
                            y={coords.y - 15}
                            textAnchor="middle"
                            fill="#e2e8f0"
                            fontSize="11"
                            fontWeight="500"
                          >
                            {office.city}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Office List */}
        {vendorEMEA.offices.length > 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-200">Offices</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vendorEMEA.offices.map((office) => (
                <div
                  key={`${office.city}-${office.type}`}
                  className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-200">
                      {COUNTRY_FLAGS[office.country] || ''} {office.city}
                    </p>
                    <p className="text-sm text-slate-400">{office.country}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      OFFICE_TYPE_COLORS[office.type] || OFFICE_TYPE_COLORS.Office
                    }`}
                  >
                    {office.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {vendorEMEA.offices.length === 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-slate-200">Offices</h3>
            <p className="text-sm text-slate-400">
              No dedicated EMEA offices. Operates remotely or from global HQ.
            </p>
          </div>
        )}

        {/* Reference Customers */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-200">Reference Customers</h3>
          <div className="flex flex-wrap gap-2">
            {vendorEMEA.referenceCustomers.map((customer) => (
              <span
                key={customer}
                className="rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-200"
              >
                {customer}
              </span>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-200">Partners</h3>
          <div className="flex flex-wrap gap-2">
            {vendorEMEA.partners.map((partner) => (
              <span
                key={partner}
                className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-400"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>

        {/* Data Residency */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-200">Data Residency</h3>
          <ul className="space-y-2">
            {vendorEMEA.dataResidency.map((location) => {
              // Try to extract a country hint for flag
              let flag = '\uD83C\uDDF3\uD83C\uDDF1'; // default globe
              if (location.toLowerCase().includes('frankfurt') || location.toLowerCase().includes('berlin') || location.toLowerCase().includes('dusseldorf')) {
                flag = '\uD83C\uDDE9\uD83C\uDDEA';
              } else if (location.toLowerCase().includes('dublin')) {
                flag = '\uD83C\uDDEE\uD83C\uDDEA';
              } else if (location.toLowerCase().includes('london')) {
                flag = '\uD83C\uDDEC\uD83C\uDDE7';
              } else if (location.toLowerCase().includes('amsterdam')) {
                flag = '\uD83C\uDDF3\uD83C\uDDF1';
              } else if (location.toLowerCase().includes('us') || location.toLowerCase().includes('virginia')) {
                flag = '\uD83C\uDDFA\uD83C\uDDF8';
              } else if (location.toLowerCase().includes('singapore')) {
                flag = '\uD83C\uDDF8\uD83C\uDDEC';
              } else if (location.toLowerCase().includes('eu')) {
                flag = '\uD83C\uDDEA\uD83C\uDDFA';
              }
              return (
                <li
                  key={location}
                  className="flex items-center gap-2 text-sm text-slate-300"
                >
                  <span className="text-base">{flag}</span>
                  {location}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Language Coverage */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200">Language Coverage</h3>
            <span className="text-lg font-bold text-slate-200">
              {vendorEMEA.languages} languages supported
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${languageProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Out of 70 major world languages</p>
        </div>
      </div>
    );
  };

  // ────────────────────────── Render Active Tab ──────────────────────────
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'features':
        return renderFeatures();
      case 'roadmap':
        return renderRoadmap();
      case 'pricing':
        return renderPricing();
      case 'csat':
        return renderCSAT();
      case 'funding':
        return renderFunding();
      case 'emea':
        return renderEMEA();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-20 p-6">
      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="mb-8">
          {/* Back link */}
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-6">
            {/* Vendor circle with initials */}
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: vendor.color }}
            >
              {getInitials(vendor.name)}
            </div>

            {/* Vendor info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-100">{vendor.name}</h1>
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-medium ${getTierBadgeClasses(vendor.tier)}`}
                >
                  {vendor.tier}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span>HQ: {vendor.hq}</span>
                <span>Founded: {vendor.founded}</span>
              </div>
            </div>

            {/* Score + Compare */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Overall Score
                </p>
                <ScoreBadge score={vendor.overallScore} size="lg" />
              </div>
              <AddToCompareButton vendorName={vendor.name} />
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="mb-6 flex flex-wrap gap-1">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Active Tab Content ── */}
        {renderActiveTab()}
      </div>
    </div>
  );
}
