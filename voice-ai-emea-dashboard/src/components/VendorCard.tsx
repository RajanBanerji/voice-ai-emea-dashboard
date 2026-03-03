import React from 'react';
import { Link } from 'react-router-dom';
import type { Vendor } from '../types/vendor';
import ScoreBadge from './ScoreBadge';
import AddToCompareButton from './AddToCompareButton';

interface VendorCardProps {
  vendor: Vendor;
  previousScore?: number;
}

const HQ_FLAGS: Record<string, string> = {
  Germany: '\u{1F1E9}\u{1F1EA}',
  UK: '\u{1F1EC}\u{1F1E7}',
  USA: '\u{1F1FA}\u{1F1F8}',
  'South Korea': '\u{1F1F0}\u{1F1F7}',
  Korea: '\u{1F1F0}\u{1F1F7}',
  France: '\u{1F1EB}\u{1F1F7}',
  Israel: '\u{1F1EE}\u{1F1F1}',
  Canada: '\u{1F1E8}\u{1F1E6}',
  Netherlands: '\u{1F1F3}\u{1F1F1}',
  Sweden: '\u{1F1F8}\u{1F1EA}',
  Ireland: '\u{1F1EE}\u{1F1EA}',
  Spain: '\u{1F1EA}\u{1F1F8}',
  Italy: '\u{1F1EE}\u{1F1F9}',
};

const TIER_COLORS: Record<string, string> = {
  Leader: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Challenger: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Niche: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Emerging: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const VendorCard: React.FC<VendorCardProps> = ({ vendor, previousScore }) => {
  const initials = vendor.name.substring(0, 2).toUpperCase();
  const flag = HQ_FLAGS[vendor.hq] || '\u{1F30D}';
  const tierClass = TIER_COLORS[vendor.tier] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  const vendorPath = `/vendor/${vendor.name.toLowerCase().replace(/\s+/g, '-')}`;

  const diff = previousScore !== undefined ? vendor.overallScore - previousScore : null;
  const hasDiff = diff !== null && Math.abs(diff) >= 0.01;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg hover:border-slate-500 transition cursor-pointer">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <Link to={vendorPath} className="shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: vendor.color }}
          >
            {initials}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={vendorPath} className="hover:text-cyan-400 transition">
              <h3 className="text-white font-semibold text-lg truncate">{vendor.name}</h3>
            </Link>
            <span className="text-base" title={vendor.hq}>{flag}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${tierClass}`}>
              {vendor.tier}
            </span>
            <AddToCompareButton vendorName={vendor.name} size="sm" />
          </div>
        </div>
      </div>

      {/* Score row */}
      <div className="flex items-center gap-3 mb-3">
        <ScoreBadge score={vendor.overallScore} size="lg" />
        {hasDiff && diff !== null && (
          <span
            className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
              diff > 0
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-slate-400 text-sm leading-relaxed">{vendor.one_line_summary}</p>
    </div>
  );
};

export default VendorCard;
