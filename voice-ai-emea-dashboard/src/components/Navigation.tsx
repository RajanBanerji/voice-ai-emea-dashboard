import React, { useState, useEffect } from 'react';

interface NavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
  lastUpdated: string | null;
  onRefresh: () => void;
  loading: boolean;
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview' },
  { key: 'deep-dive', label: 'Deep Dive' },
  { key: 'head-to-head', label: 'Head-to-Head' },
  { key: 'trends', label: 'Trends' },
  { key: 'gap-analysis', label: 'Gap Analysis' },
];

const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onNavigate,
  lastUpdated,
  onRefresh,
  loading,
}) => {
  const [clock, setClock] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur border-b border-slate-700 z-50 h-16 flex items-center px-4 md:px-6">
      {/* Left: App name + icon */}
      <div className="flex items-center gap-2 shrink-0 mr-6">
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        <span className="text-white font-bold text-lg hidden sm:inline">
          EMEA Voice AI Tracker
        </span>
      </div>

      {/* Center: Nav links */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1">
        {NAV_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activePage === key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right: Clock, last updated, refresh */}
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-slate-400 text-xs hidden lg:inline font-mono">{clock}</span>

        {lastUpdated && (
          <span className="text-slate-500 text-xs hidden md:inline">
            Updated: {lastUpdated}
          </span>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden sm:inline">Refresh Intelligence</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
