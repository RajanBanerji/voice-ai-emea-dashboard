import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Vendor, GapAction, DimensionKey } from '../types/vendor';
import { DIMENSIONS, DIMENSION_LABELS } from '../types/vendor';
import ActionItem from '../components/ActionItem';
import ScoreBadge from '../components/ScoreBadge';
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

interface SendbirdGapAnalysisProps {
  vendors: Vendor[];
  gapActions: GapAction[];
  onToggleAction: (id: number) => void;
}

const PROJECTED_SCORES: Record<DimensionKey, number> = {
  emea_compliance: 8,
  language_coverage: 8,
  latency: 9,
  voice_quality: 9,
  ease_of_use: 9,
  enterprise_fit: 7,
  pricing_transparency: 7,
};

const PRIORITY_ORDER: GapAction['priority'][] = ['Critical', 'High', 'Medium'];

const PRIORITY_HEADER_STYLES: Record<GapAction['priority'], string> = {
  Critical: 'text-red-400 border-red-500/30',
  High: 'text-amber-400 border-amber-500/30',
  Medium: 'text-blue-400 border-blue-500/30',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const DarkTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-slate-200 font-medium text-sm mb-2">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value.toFixed(1)}</span>
        </p>
      ))}
    </div>
  );
};

const SendbirdGapAnalysis: React.FC<SendbirdGapAnalysisProps> = ({
  vendors,
  gapActions,
  onToggleAction,
}) => {
  const sendbird = useMemo(
    () => vendors.find((v) => v.name === 'Sendbird') ?? null,
    [vendors]
  );

  const leader = useMemo(
    () =>
      vendors.reduce<Vendor | null>(
        (best, v) => (!best || v.overallScore > best.overallScore ? v : best),
        null
      ),
    [vendors]
  );

  const emeaAverages = useMemo(() => {
    const avgs: Record<DimensionKey, number> = {} as Record<DimensionKey, number>;
    DIMENSIONS.forEach((dim) => {
      const sum = vendors.reduce((acc, v) => acc + v[dim], 0);
      avgs[dim] = vendors.length > 0 ? sum / vendors.length : 0;
    });
    return avgs;
  }, [vendors]);

  const gapChartData = useMemo(() => {
    if (!sendbird || !leader) return [];
    return DIMENSIONS.map((dim) => ({
      dimension: DIMENSION_LABELS[dim],
      Sendbird: sendbird[dim],
      'EMEA Average': parseFloat(emeaAverages[dim].toFixed(1)),
      [`Market Leader (${leader.name})`]: leader[dim],
    }));
  }, [sendbird, leader, emeaAverages]);

  const leaderName = leader?.name ?? 'Leader';
  const leaderVendorId = leaderName.toLowerCase().replace(/\s+/g, '-');

  const projectionChartData = useMemo(() => {
    if (!sendbird) return [];
    return DIMENSIONS.map((dim) => ({
      dimension: DIMENSION_LABELS[dim],
      Current: sendbird[dim],
      Projected: PROJECTED_SCORES[dim],
    }));
  }, [sendbird]);

  const currentOverall = sendbird?.overallScore ?? 0;
  const projectedOverall = useMemo(() => {
    const vals = Object.values(PROJECTED_SCORES);
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
  }, []);

  const completedActions = gapActions.filter((a) => a.status === 'done').length;
  const totalActions = gapActions.length;

  const groupedActions = useMemo(() => {
    const groups: Record<GapAction['priority'], GapAction[]> = {
      Critical: [],
      High: [],
      Medium: [],
    };
    gapActions.forEach((a) => {
      groups[a.priority].push(a);
    });
    return groups;
  }, [gapActions]);

  if (!sendbird) {
    return (
      <div className="pt-20 p-6 max-w-7xl mx-auto">
        <p className="text-slate-400 text-center">Sendbird vendor data not found.</p>
      </div>
    );
  }

  return (
    <div className="pt-20 p-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-white mb-2">
        <Link to="/vendor/sendbird" className="hover:text-blue-400 transition-colors">Sendbird</Link>
        {' '}EMEA Gap Analysis
      </h1>
      <p className="text-slate-400 mb-8">
        Competitive position analysis and action plan for the EMEA Voice AI market
      </p>

      {/* Section 1: Sendbird Position Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            <ScoreBadge score={sendbird.overallScore} size="lg" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-1">
              Current EMEA Position: {sendbird.overallScore.toFixed(1)}/10
            </h2>
            <p className="text-slate-400 mb-4">{sendbird.one_line_summary}</p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                {sendbird.tier}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-600/50 text-slate-300 border border-slate-500/30">
                HQ: {sendbird.hq}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Sentiment: {sendbird.market_sentiment.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Gap Chart - Grouped Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-1">
          Sendbird vs EMEA Average vs Market Leader
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Dimension-by-dimension comparison across the EMEA competitive landscape
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={gapChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="dimension"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickCount={6}
            />
            <Tooltip content={<DarkTooltip />} />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: 16 }}
              iconType="rect"
              content={({ payload }) => (
                <div className="flex justify-center gap-6 pb-4">
                  {payload?.map((entry, idx) => {
                    const name = entry.value ?? '';
                    const isLeader = name.includes(leaderName) && leader;
                    const isSendbird = name === 'Sendbird';
                    return (
                      <span key={idx} className="flex items-center gap-2 text-sm">
                        <span
                          className="inline-block w-3 h-3 rounded-sm"
                          style={{ backgroundColor: entry.color }}
                        />
                        {isSendbird ? (
                          <Link to="/vendor/sendbird" className="text-slate-200 hover:text-blue-400 transition-colors">
                            {name}
                          </Link>
                        ) : isLeader ? (
                          <Link to={`/vendor/${leaderVendorId}`} className="text-slate-200 hover:text-blue-400 transition-colors">
                            {name}
                          </Link>
                        ) : (
                          <span className="text-slate-200">{name}</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            />
            <Bar
              dataKey="Sendbird"
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            />
            <Bar
              dataKey="EMEA Average"
              fill="#94A3B8"
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            />
            <Bar
              dataKey={`Market Leader (${leaderName})`}
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Section 3: Priority Action Items */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold text-white">EMEA Priority Action Plan</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          {completedActions}/{totalActions} actions completed
        </p>
        <div className="space-y-6">
          {PRIORITY_ORDER.map((priority) => {
            const actions = groupedActions[priority];
            if (actions.length === 0) return null;
            return (
              <div key={priority}>
                <h3
                  className={`text-sm font-semibold uppercase tracking-wider mb-3 pb-2 border-b ${PRIORITY_HEADER_STYLES[priority]}`}
                >
                  {priority} Priority ({actions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {actions.map((action) => (
                    <ActionItem
                      key={action.id}
                      action={action}
                      onToggle={onToggleAction}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Gap Closure Projection Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-1">
          Projected Impact of Gap Closure
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Estimated scores after completing the EMEA priority action plan
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={projectionChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="dimension"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickCount={6}
            />
            <Tooltip content={<DarkTooltip />} />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: 16 }}
              iconType="rect"
            />
            <Bar
              dataKey="Current"
              fill="rgba(239, 68, 68, 0.6)"
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            />
            <Bar
              dataKey="Projected"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Section 5: Projected Score Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          Projected Overall Score Impact
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          {/* Current Score */}
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">
              Current Overall
            </p>
            <div className="text-5xl font-bold text-red-400">{currentOverall.toFixed(1)}</div>
            <p className="text-xs text-slate-500 mt-1">/10</p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span className="text-sm font-semibold text-emerald-400 mt-1">
              +{(projectedOverall - currentOverall).toFixed(1)}
            </span>
          </div>

          {/* Projected Score */}
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">
              Projected Overall
            </p>
            <div className="text-5xl font-bold text-emerald-400">
              {projectedOverall.toFixed(1)}
            </div>
            <p className="text-xs text-slate-500 mt-1">/10</p>
          </div>
        </div>

        <p className="text-center text-slate-300 mt-8 max-w-xl mx-auto text-sm leading-relaxed">
          Closing identified gaps would move Sendbird from{' '}
          <span className="text-red-400 font-semibold">&lsquo;lagging&rsquo;</span> to{' '}
          <span className="text-emerald-400 font-semibold">&lsquo;competitive&rsquo;</span> in
          EMEA
        </p>
      </div>
    </div>
  );
};

export default SendbirdGapAnalysis;
