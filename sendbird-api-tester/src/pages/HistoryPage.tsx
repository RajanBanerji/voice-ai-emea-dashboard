import React, { useState, useMemo } from 'react';
import { useHistory } from '../context/HistoryContext';
import { exportHistory } from '../utils/exportResults';
import JsonViewer from '../components/JsonViewer';
import toast from 'react-hot-toast';
import { useMode } from '../context/ModeContext';

const METHOD_COLORS: Record<string, string> = {
  GET: '#3B82F6',
  POST: '#22C55E',
  PUT: '#F59E0B',
  DELETE: '#EF4444',
  PATCH: '#A78BFA',
};

const HistoryPage: React.FC = () => {
  const { history, clearHistory, removeEntry } = useHistory();
  const { isDevMode } = useMode();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('');
  const [filterResult, setFilterResult] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    return history.filter(entry => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !entry.endpoint_name.toLowerCase().includes(q) &&
          !entry.url.toLowerCase().includes(q) &&
          !entry.category.toLowerCase().includes(q)
        ) return false;
      }
      if (filterMethod && entry.method !== filterMethod) return false;
      if (filterResult && entry.result !== filterResult) return false;
      return true;
    });
  }, [history, search, filterMethod, filterResult]);

  const handleExport = () => {
    exportHistory(filtered);
    toast.success(`Exported ${filtered.length} history entries`);
  };

  const handleClear = () => {
    clearHistory();
    setConfirmClear(false);
    toast.success('History cleared');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">API Call History</h2>
          <p className="text-sm text-gray-400 mt-1">{history.length} total entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="px-3 py-1.5 bg-[#2E2A52] hover:bg-[#332E5C] text-gray-300 text-xs font-medium rounded-md transition-colors">
            Export
          </button>
          {confirmClear ? (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-1.5">
              <span className="text-xs text-red-300">Delete all {history.length} entries?</span>
              <button onClick={handleClear} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors">
                Yes, clear all
              </button>
              <button onClick={() => setConfirmClear(false)} className="px-2.5 py-1 bg-[#2E2A52] hover:bg-[#332E5C] text-gray-300 text-xs font-medium rounded transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900/70 text-red-300 text-xs font-medium rounded-md transition-colors border border-red-800/40"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-[#16132D] border border-[#2E2A52] rounded-lg p-3">
        <input
          type="text"
          placeholder="Search endpoints, URLs, categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#0D0A1C] border border-[#2E2A52] rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#742DDD]"
        />
        <select
          value={filterMethod}
          onChange={e => setFilterMethod(e.target.value)}
          className="bg-[#0D0A1C] border border-[#2E2A52] rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none"
        >
          <option value="">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        <select
          value={filterResult}
          onChange={e => setFilterResult(e.target.value)}
          className="bg-[#0D0A1C] border border-[#2E2A52] rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none"
        >
          <option value="">All Results</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="skipped">Skipped</option>
        </select>
      </div>

      {/* Results Count */}
      {search || filterMethod || filterResult ? (
        <p className="text-xs text-gray-500">Showing {filtered.length} of {history.length} entries</p>
      ) : null}

      {/* History Entries */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No history entries</p>
          <p className="text-sm">{history.length > 0 ? 'Try adjusting your filters' : 'Run some API tests to see history here'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="bg-[#16132D] border border-[#2E2A52] rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1E1A3A] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>

                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white uppercase flex-shrink-0"
                    data-method={entry.method}
                    style={{ backgroundColor: METHOD_COLORS[entry.method] || '#6B7280' }}
                  >
                    {entry.method}
                  </span>

                  <span className="text-white font-medium truncate flex-1">{entry.endpoint_name}</span>

                  <span className="text-xs text-gray-500 flex-shrink-0">{entry.performance.latency_ms}ms</span>

                  <span className={`px-2 py-0.5 rounded text-xs font-medium text-white flex-shrink-0 ${
                    entry.result === 'pass' ? 'bg-green-600' :
                    entry.result === 'fail' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {entry.response.status}
                  </span>

                  <span className="text-xs text-gray-600 flex-shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>

                  <button
                    onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                    className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Remove"
                  >
                    &times;
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#2E2A52] px-4 py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">URL</p>
                        <p className="text-gray-300 font-mono text-xs break-all">{entry.url}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Category</p>
                        <p className="text-gray-300">{entry.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Latency</p>
                        <p className="text-gray-300">{entry.performance.latency_ms}ms ({entry.performance.rating})</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Response Size</p>
                        <p className="text-gray-300">{entry.response.size_kb.toFixed(2)} KB</p>
                      </div>
                    </div>

                    {entry.request.body && (
                      <div>
                        <p className="text-gray-500 text-xs mb-2">{isDevMode ? 'Request Body' : 'Data Sent'}</p>
                        <JsonViewer data={entry.request.body} maxHeight="200px" />
                      </div>
                    )}

                    <div>
                      <p className="text-gray-500 text-xs mb-2">Response Body</p>
                      <JsonViewer data={entry.response.body} maxHeight="300px" />
                    </div>

                    {entry.error && (
                      <div className="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                        <p className="text-sm text-red-400">{entry.error.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
