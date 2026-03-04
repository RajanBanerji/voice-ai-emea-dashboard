import React from 'react';
import { useTestResults } from '../context/TestResultsContext';
import { CATEGORIES } from '../data/endpoints';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onSelectCategory, onNavigate, currentPage }) => {
  const { getCategorySummary } = useTestResults();

  const getStatusColor = (endpointIds: string[]) => {
    const s = getCategorySummary(endpointIds);
    if (s.passed === 0 && s.failed === 0) return 'bg-gray-600';
    if (s.failed > 0 && s.passed === 0) return 'bg-red-500';
    if (s.failed > 0) return 'bg-yellow-500';
    if (s.passed > 0 && s.failed === 0) return 'bg-green-500';
    return 'bg-gray-600';
  };

  return (
    <aside className="w-60 bg-[#16132D] border-r border-[#2E2A52] fixed left-0 top-14 bottom-0 overflow-y-auto z-30">
      <div className="p-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          API Categories
        </h2>
        <nav className="space-y-0.5">
          {CATEGORIES.map(cat => {
            const epIds = cat.endpoints.map(e => e.id);
            const summary = getCategorySummary(epIds);
            const isActive = currentPage === 'dashboard' && selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => { onNavigate('dashboard'); onSelectCategory(cat.name); }}
                className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-[#742DDD]/20 text-white border border-[#742DDD]/30'
                    : 'text-gray-400 hover:bg-[#1E1A3A] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(epIds)}`} />
                  <span className="truncate">{cat.icon} {cat.name}</span>
                </div>
                <span className="text-xs text-gray-600 shrink-0 ml-1">
                  {summary.passed + summary.failed > 0 && (
                    <span className={summary.failed > 0 ? 'text-red-400' : 'text-green-400'}>
                      {summary.passed}/{epIds.length}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-[#2E2A52]">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Tools
          </h2>
          <nav className="space-y-0.5">
            <button
              onClick={() => onNavigate('performance')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                currentPage === 'performance'
                  ? 'bg-[#742DDD]/20 text-white border border-[#742DDD]/30'
                  : 'text-gray-400 hover:bg-[#1E1A3A] hover:text-gray-200'
              }`}
            >
              📈 Performance
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                currentPage === 'history'
                  ? 'bg-[#742DDD]/20 text-white border border-[#742DDD]/30'
                  : 'text-gray-400 hover:bg-[#1E1A3A] hover:text-gray-200'
              }`}
            >
              🕘 History
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
