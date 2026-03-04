import React, { useState, useEffect } from 'react';
import { useCredentials } from '../context/CredentialsContext';
import { useTestResults } from '../context/TestResultsContext';

interface TopBarProps {
  onOpenCredentials: () => void;
  onExportResults: () => void;
  onRunFullSuite: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenCredentials, onExportResults, onRunFullSuite }) => {
  const { credentials, maskedToken } = useCredentials();
  const { globalSummary, runProgress } = useTestResults();
  const [pingMs, setPingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!credentials.isConnected) return;
    const ping = async () => {
      const start = performance.now();
      try {
        await fetch(`${credentials.baseUrl}/v3/applications/info`, {
          method: 'GET',
          headers: { 'Api-Token': credentials.apiToken, 'Content-Type': 'application/json' },
        });
        setPingMs(Math.round(performance.now() - start));
      } catch {
        setPingMs(null);
      }
    };
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [credentials]);

  void maskedToken;

  return (
    <header className="h-14 bg-[#16132D] border-b border-[#2E2A52] flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#742DDD" />
            <path d="M8 12C8 9.79 9.79 8 12 8h8c2.21 0 4 1.79 4 4v5c0 2.21-1.79 4-4 4h-2l-4 3v-3h-2c-2.21 0-4-1.79-4-4v-5z" fill="white" />
            <circle cx="13" cy="14.5" r="1.2" fill="#742DDD" />
            <circle cx="16" cy="14.5" r="1.2" fill="#742DDD" />
            <circle cx="19" cy="14.5" r="1.2" fill="#742DDD" />
          </svg>
          <h1 className="text-base font-semibold text-white">Sendbird API Test Suite</h1>
        </div>
        {credentials.isConnected && (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-900/30 border border-green-700/40 text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Connected — {credentials.appId.slice(0, 12)}...
            </span>
            {pingMs !== null && (
              <span className={`text-xs px-2 py-0.5 rounded ${
                pingMs < 200 ? 'text-green-400 bg-green-900/20' :
                pingMs < 500 ? 'text-yellow-400 bg-yellow-900/20' :
                'text-red-400 bg-red-900/20'
              }`}>
                {pingMs}ms
              </span>
            )}
          </div>
        )}
      </div>

      {runProgress.isRunning && (
        <div className="flex items-center gap-3">
          <div className="w-48 h-2 bg-[#2E2A52] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#742DDD] rounded-full transition-all duration-300"
              style={{ width: `${(runProgress.current / runProgress.total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {runProgress.current} / {runProgress.total}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {credentials.isConnected && (
          <>
            {(globalSummary.passed > 0 || globalSummary.failed > 0) && (
              <div className="flex items-center gap-1.5 text-xs mr-2">
                <span className="text-green-400">✅ {globalSummary.passed}</span>
                <span className="text-red-400">❌ {globalSummary.failed}</span>
              </div>
            )}
            <button
              onClick={onRunFullSuite}
              disabled={runProgress.isRunning}
              className="px-3 py-1.5 bg-[#742DDD] hover:bg-[#6211C8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors"
            >
              ▶ Run Full Suite
            </button>
            <button
              onClick={onExportResults}
              className="px-3 py-1.5 bg-[#252145] hover:bg-[#332E5C] text-gray-300 text-xs font-medium rounded-md transition-colors"
            >
              📋 Export
            </button>
            <button
              onClick={onOpenCredentials}
              className="px-3 py-1.5 bg-[#252145] hover:bg-[#332E5C] text-gray-300 text-xs font-medium rounded-md transition-colors"
            >
              ⚙️ Credentials
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
