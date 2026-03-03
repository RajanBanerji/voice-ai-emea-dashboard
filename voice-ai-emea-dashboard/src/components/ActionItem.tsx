import React from 'react';
import type { GapAction } from '../types/vendor';

interface ActionItemProps {
  action: GapAction;
  onToggle: (id: number) => void;
}

const PRIORITY_STYLES: Record<GapAction['priority'], string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const STATUS_LABELS: Record<GapAction['status'], string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
};

const STATUS_STYLES: Record<GapAction['status'], string> = {
  pending: 'bg-slate-600 hover:bg-slate-500 text-slate-300',
  in_progress: 'bg-amber-600 hover:bg-amber-500 text-white',
  done: 'bg-emerald-600 hover:bg-emerald-500 text-white',
};

const ActionItem: React.FC<ActionItemProps> = ({ action, onToggle }) => {
  const impactPercent = (action.impact / 10) * 100;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      {/* Top row: priority badge + status toggle */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PRIORITY_STYLES[action.priority]}`}
        >
          {action.priority}
        </span>
        <button
          onClick={() => onToggle(action.id)}
          className={`text-xs font-medium px-3 py-1 rounded-full transition ${STATUS_STYLES[action.status]}`}
        >
          {STATUS_LABELS[action.status]}
        </button>
      </div>

      {/* Action text */}
      <p
        className={`text-sm mb-3 ${
          action.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'
        }`}
      >
        {action.action}
      </p>

      {/* Impact bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 shrink-0">Impact</span>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${impactPercent}%`,
              backgroundColor:
                action.impact >= 8 ? '#10B981' : action.impact >= 5 ? '#F59E0B' : '#3B82F6',
            }}
          />
        </div>
        <span className="text-xs text-slate-400 shrink-0">{action.impact}/10</span>
      </div>
    </div>
  );
};

export default ActionItem;
