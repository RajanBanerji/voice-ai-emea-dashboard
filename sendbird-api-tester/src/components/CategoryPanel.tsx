import React, { useState, useCallback } from 'react';
import { useTestResults } from '../context/TestResultsContext';
import { useTestRunner } from '../hooks/useTestRunner';
import { useCredentials } from '../context/CredentialsContext';
import { generateCurl } from '../utils/curlGenerator';
import TestCard from './TestCard';
import toast from 'react-hot-toast';
import type { CategoryDef, EndpointDef } from '../data/endpoints';

interface CategoryPanelProps {
  category: CategoryDef;
}

const CategoryPanel: React.FC<CategoryPanelProps> = ({ category }) => {
  const { results, getCategorySummary, clearCategoryResults, includeDestructive, setIncludeDestructive, runProgress } = useTestResults();
  const { runSingleTest, runCategoryTests, cancelRun, pauseRun, resumeRun } = useTestRunner();
  const { credentials } = useCredentials();
  const [paramOverrides] = useState<Record<string, Record<string, unknown>>>({});

  const epIds = category.endpoints.map(e => e.id);
  const summary = getCategorySummary(epIds);

  const getDefaultParams = useCallback((ep: EndpointDef): Record<string, unknown> => {
    if (paramOverrides[ep.id]) return paramOverrides[ep.id];
    const defaults: Record<string, unknown> = {};
    for (const p of ep.params) {
      defaults[p.name] = p.default ?? '';
    }
    return defaults;
  }, [paramOverrides]);

  const getDefaultBody = useCallback((ep: EndpointDef): Record<string, unknown> | null => {
    if (ep.bodyFields.length === 0) return null;
    const body: Record<string, unknown> = {};
    const suffix = `_${Date.now()}`;
    for (const f of ep.bodyFields) {
      const val = f.default ?? '';
      if (f.type === 'array' && typeof val === 'string' && val !== '') {
        body[f.name] = val.split(',').map(s => s.trim());
      } else if (ep.method === 'POST' && typeof val === 'string' && val !== '' && (f.name === 'user_id' || f.name === 'bot_userid')) {
        body[f.name] = val + suffix;
      } else {
        body[f.name] = val;
      }
    }
    return body;
  }, []);

  const handleRunAll = () => {
    runCategoryTests(category.endpoints, getDefaultParams, getDefaultBody, category.name);
  };

  const handleClearResults = () => {
    clearCategoryResults(category.name, epIds);
    toast.success(`Cleared results for ${category.name}`);
  };

  const handleRunSingle = useCallback(async (
    endpoint: EndpointDef,
    params: Record<string, unknown>,
    body: Record<string, unknown> | null
  ) => {
    await runSingleTest(endpoint, params, body);
  }, [runSingleTest]);

  const handleCopyCurl = useCallback((
    endpoint: EndpointDef,
    params: Record<string, unknown>,
    body: Record<string, unknown> | null
  ) => {
    const resolvedPath = endpoint.path.replace(/\{(\w+)\}/g, (_, key) => {
      return String(params[key] || `{${key}}`);
    });
    const url = `${credentials.baseUrl}${resolvedPath}`;
    const curl = generateCurl(endpoint.method, url, credentials.apiToken, params, body);
    navigator.clipboard.writeText(curl);
    toast.success('cURL copied to clipboard');
  }, [credentials]);

  const isRunningThis = runProgress.isRunning && runProgress.category === category.name;

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {category.icon} {category.name}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {category.endpoints.length} endpoints
            {summary.passed > 0 && <span className="text-green-400 ml-2">  {summary.passed} passed</span>}
            {summary.failed > 0 && <span className="text-red-400 ml-2">  {summary.failed} failed</span>}
            {summary.skipped > 0 && <span className="text-yellow-400 ml-2">  {summary.skipped} skipped</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDestructive}
              onChange={e => setIncludeDestructive(e.target.checked)}
              className="rounded border-gray-600 bg-[#0D0A1C] text-purple-500 focus:ring-purple-500"
            />
            Include destructive
          </label>
          {isRunningThis ? (
            <div className="flex items-center gap-1">
              {runProgress.isPaused ? (
                <button onClick={resumeRun} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors">
                  Resume
                </button>
              ) : (
                <button onClick={pauseRun} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-md transition-colors">
                  Pause
                </button>
              )}
              <button onClick={cancelRun} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleRunAll}
                disabled={runProgress.isRunning}
                className="px-3 py-1.5 bg-[#742DDD] hover:bg-[#6211C8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors"
              >
                ▶ Run All
              </button>
              <button
                onClick={handleClearResults}
                className="px-3 py-1.5 bg-[#2E2A52] hover:bg-[#332E5C] text-gray-300 text-xs font-medium rounded-md transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar for category run */}
      {isRunningThis && (
        <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">
              Testing: {runProgress.currentEndpoint}
            </span>
            <span className="text-xs text-gray-500">
              {runProgress.current} / {runProgress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-[#0D0A1C] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#742DDD] rounded-full transition-all duration-300"
              style={{ width: `${(runProgress.current / runProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Endpoint Cards */}
      <div className="space-y-2">
        {category.endpoints.map(ep => (
          <TestCard
            key={ep.id}
            endpoint={ep}
            result={results[ep.id]}
            onRun={handleRunSingle}
            onCopyCurl={handleCopyCurl}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryPanel;
