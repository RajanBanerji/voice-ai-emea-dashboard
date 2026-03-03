import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

const VENDOR_COLORS: Record<string, string> = {
  Cognigy: '#3B82F6',
  PolyAI: '#8B5CF6',
  Synthflow: '#10B981',
  Parloa: '#F59E0B',
  ElevenLabs: '#EC4899',
  'Microsoft Nuance': '#6366F1',
  Sendbird: '#EF4444',
};

export default function CompareTray() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 w-full z-50 bg-slate-800 border-t border-slate-600 animate-slide-up"
      style={{ height: 56 }}
    >
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left — label */}
        <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
          Compare ({compareList.length}/4)
        </span>

        {/* Middle — vendor chips */}
        <div className="flex items-center gap-2 flex-1 mx-4 overflow-x-auto">
          {compareList.map((vendor) => (
            <span
              key={vendor}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200 whitespace-nowrap"
            >
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: VENDOR_COLORS[vendor] ?? '#94A3B8' }}
              />
              {vendor}
              <button
                onClick={() => removeFromCompare(vendor)}
                className="ml-1 text-slate-400 hover:text-white transition-colors"
                aria-label={`Remove ${vendor} from compare`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            onClick={() => navigate('/compare')}
            disabled={compareList.length < 2}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors
              bg-cyan-600 text-white hover:bg-cyan-500
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-600"
          >
            Compare Now
          </button>
          <button
            onClick={clearCompare}
            className="px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Slide-up keyframes injected via inline style tag */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
