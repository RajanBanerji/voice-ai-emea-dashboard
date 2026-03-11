import React, { useState, useEffect } from 'react';
import { useCredentials } from '../context/CredentialsContext';
import { useTestResults } from '../context/TestResultsContext';
import { useTheme } from '../context/ThemeContext';
import { useMode } from '../context/ModeContext';

interface TopBarProps {
  onOpenCredentials: () => void;
  onExportResults: () => void;
  onRunFullSuite: () => void;
  onOpenHelp: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenCredentials, onExportResults, onRunFullSuite, onOpenHelp }) => {
  const { credentials, maskedToken, clearCredentials } = useCredentials();
  const { globalSummary, runProgress } = useTestResults();
  const { theme, toggleTheme } = useTheme();
  const { isDevMode, toggleMode } = useMode();
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  // Use primitive values as dependencies to avoid re-running on every object reference change
  const { isConnected, baseUrl, apiToken } = credentials;

  useEffect(() => {
    if (!isConnected) return;
    const ping = async () => {
      const start = performance.now();
      try {
        await fetch(`${baseUrl}/v3/applications/info`, {
          method: 'GET',
          headers: { 'Api-Token': apiToken, 'Content-Type': 'application/json' },
        });
        setPingMs(Math.round(performance.now() - start));
      } catch {
        setPingMs(null);
      }
    };
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [isConnected, baseUrl, apiToken]);

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
          <div className="flex items-center gap-2">
            {/* App identity block */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-green-900/15 border border-green-700/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-white max-w-[160px] truncate" title={credentials.appName || credentials.appId}>
                  {credentials.appName || credentials.appId}
                </span>
                <span className="text-[10px] text-gray-500 max-w-[160px] truncate" title={credentials.appId}>
                  {credentials.appName ? `${credentials.appId} · ` : ''}{credentials.region}
                </span>
              </div>
              {pingMs !== null && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ml-1 ${
                  pingMs < 200 ? 'text-green-400 bg-green-900/30' :
                  pingMs < 500 ? 'text-yellow-400 bg-yellow-900/30' :
                  'text-red-400 bg-red-900/30'
                }`}>
                  {pingMs}ms
                </span>
              )}
            </div>

            {/* Switch App — with inline confirmation */}
            {confirmDisconnect ? (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-2.5 py-1">
                <span className="text-[11px] text-red-300">Disconnect?</span>
                <button
                  onClick={() => { clearCredentials(); setConfirmDisconnect(false); }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium rounded transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDisconnect(false)}
                  className="px-2 py-0.5 bg-[#2E2A52] hover:bg-[#332E5C] text-gray-300 text-[11px] font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDisconnect(true)}
                title="Disconnect and switch to a different app"
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] text-gray-500 hover:text-red-400 hover:bg-red-900/15 border border-transparent hover:border-red-700/30 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Switch App
              </button>
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
        {/* Help */}
        <button
          onClick={onOpenHelp}
          title="Help — button reference"
          className="px-2.5 py-1.5 bg-[#252145] hover:bg-[#332E5C] text-gray-300 text-sm font-semibold rounded-md transition-colors"
        >
          ?
        </button>
        {/* Mode toggle */}
        <button
          onClick={toggleMode}
          title={isDevMode ? 'Switch to Easy Mode — plain English labels' : 'Switch to Dev Mode — show technical terms'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            isDevMode
              ? 'bg-[#252145] hover:bg-[#332E5C] text-purple-300 border-purple-700/40'
              : 'bg-green-900/20 hover:bg-green-900/30 text-green-300 border-green-700/30'
          }`}
        >
          {isDevMode ? (
            <><span>{'</>'}</span><span>Dev</span></>
          ) : (
            <><span>🧑‍💼</span><span>Easy</span></>
          )}
        </button>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="px-2.5 py-1.5 bg-[#252145] hover:bg-[#332E5C] text-gray-300 text-sm rounded-md transition-colors"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

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
              ▶ Run All APIs
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
