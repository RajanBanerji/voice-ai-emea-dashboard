import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTestResults } from '../context/TestResultsContext';
import { CATEGORIES } from '../data/endpoints';
import type { EndpointDef } from '../data/endpoints';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  onSelectEndpoint: (category: string, endpointId: string) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-blue-400 bg-blue-900/30',
  POST: 'text-green-400 bg-green-900/30',
  PUT: 'text-yellow-400 bg-yellow-900/30',
  DELETE: 'text-red-400 bg-red-900/30',
  PATCH: 'text-orange-400 bg-orange-900/30',
};

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onSelectCategory, onNavigate, currentPage, onSelectEndpoint }) => {
  const { getCategorySummary } = useTestResults();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: Array<{ endpoint: EndpointDef; categoryName: string; categoryIcon: string }> = [];
    for (const cat of CATEGORIES) {
      for (const ep of cat.endpoints) {
        if (
          ep.name.toLowerCase().includes(q) ||
          ep.path.toLowerCase().includes(q) ||
          ep.method.toLowerCase().includes(q) ||
          ep.description.toLowerCase().includes(q)
        ) {
          results.push({ endpoint: ep, categoryName: cat.name, categoryIcon: cat.icon });
        }
      }
    }
    return results.slice(0, 15);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (categoryName: string, endpointId: string) => {
    setQuery('');
    setDropdownOpen(false);
    onSelectEndpoint(categoryName, endpointId);
  };

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
        {/* Search Bar */}
        <div ref={searchRef} className="relative mb-4">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search APIs..."
              value={query}
              onChange={e => { setQuery(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              className="w-full pl-7 pr-7 py-1.5 bg-[#0D0A1C] border border-[#2E2A52] rounded-md text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#742DDD] transition-colors"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setDropdownOpen(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {dropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E1A3A] border border-[#2E2A52] rounded-md shadow-xl z-50 max-h-72 overflow-y-auto">
              {searchResults.map(({ endpoint, categoryName, categoryIcon }) => (
                <button
                  key={endpoint.id}
                  onClick={() => handleSelectResult(categoryName, endpoint.id)}
                  className="w-full text-left px-3 py-2 hover:bg-[#2E2A52] transition-colors border-b border-[#2E2A52]/50 last:border-0"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${METHOD_COLORS[endpoint.method] ?? 'text-gray-400'}`}>
                      {endpoint.method}
                    </span>
                    <span className="text-xs text-gray-200 truncate font-medium">{endpoint.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate pl-0.5">
                    {categoryIcon} {categoryName} · {endpoint.path}
                  </div>
                </button>
              ))}
            </div>
          )}
          {dropdownOpen && query.trim() && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E1A3A] border border-[#2E2A52] rounded-md shadow-xl z-50 px-3 py-4 text-center text-xs text-gray-500">
              No APIs match "{query}"
            </div>
          )}
        </div>

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
            <button
              onClick={() => onNavigate('webhooks')}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                currentPage === 'webhooks'
                  ? 'bg-[#742DDD]/20 text-white border border-[#742DDD]/30'
                  : 'text-gray-400 hover:bg-[#1E1A3A] hover:text-gray-200'
              }`}
            >
              🔗 Webhook Inspector
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
