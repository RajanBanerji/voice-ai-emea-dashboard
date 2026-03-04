import React, { useState, useMemo } from 'react';
import type { EndpointDef, EndpointParam } from '../data/endpoints';
import type { TestResult, TestStatus } from '../context/TestResultsContext';
import JsonViewer from './JsonViewer';
import PrerequisitesPanel from './PrerequisitesPanel';
import PrerequisiteStepsPanel from './PrerequisiteStepsPanel';
import DocsInfoButton from './DocsInfoButton';
import { useSendbirdApi } from '../hooks/useSendbirdApi';
import { useDependencyResolver } from '../hooks/useDependencyResolver';

interface TestCardProps {
  endpoint: EndpointDef;
  result?: TestResult;
  onRun: (
    endpoint: EndpointDef,
    params: Record<string, unknown>,
    body: Record<string, unknown> | null
  ) => void;
  onCopyCurl: (
    endpoint: EndpointDef,
    params: Record<string, unknown>,
    body: Record<string, unknown> | null
  ) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#3B82F6',
  POST: '#22C55E',
  PUT: '#F59E0B',
  DELETE: '#EF4444',
  PATCH: '#A78BFA',
};

const STATUS_CONFIG: Record<
  TestStatus,
  { label: string; color: string; animate?: boolean }
> = {
  pending: { label: 'Pending', color: 'bg-gray-600' },
  running: { label: 'Running', color: 'bg-[#742DDD]', animate: true },
  pass: { label: 'Pass', color: 'bg-green-600' },
  fail: { label: 'Fail', color: 'bg-red-600' },
  skipped: { label: 'Skipped', color: 'bg-yellow-600' },
};

function buildInitialParams(params: EndpointParam[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const p of params) {
    result[p.name] = String(p.default ?? '');
  }
  return result;
}

function buildInitialBody(bodyFields: EndpointParam[]): string {
  if (!bodyFields || bodyFields.length === 0) return '';
  const obj: Record<string, unknown> = {};
  for (const f of bodyFields) {
    const val = f.default ?? '';
    if (f.type === 'array' && typeof val === 'string' && val !== '') {
      obj[f.name] = val.split(',').map(s => s.trim());
    } else {
      obj[f.name] = val;
    }
  }
  return JSON.stringify(obj, null, 2);
}

function getLatencyRating(ms: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (ms < 200)
    return { label: 'Fast', color: 'text-green-400', bgColor: 'bg-green-500' };
  if (ms < 500)
    return {
      label: 'Acceptable',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500',
    };
  if (ms < 1000)
    return {
      label: 'Slow',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500',
    };
  return {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
  };
}

function getStatusCodeColor(status: number): string {
  if (status >= 200 && status < 300) return 'bg-green-600';
  if (status >= 300 && status < 400) return 'bg-yellow-600';
  if (status >= 400 && status < 500) return 'bg-orange-600';
  return 'bg-red-600';
}

const TestCard: React.FC<TestCardProps> = ({
  endpoint,
  result,
  onRun,
  onCopyCurl,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() =>
    buildInitialParams(endpoint.params)
  );
  const [bodyJson, setBodyJson] = useState<string>(() =>
    buildInitialBody(endpoint.bodyFields)
  );
  const [activeTab, setActiveTab] = useState<'response' | 'performance'>(
    'response'
  );

  const { callApi } = useSendbirdApi();
  const { steps, isResolving, hasUnresolved, resolveAll } = useDependencyResolver(
    endpoint, paramValues, callApi
  );

  const status: TestStatus = result?.status ?? 'pending';
  const statusCfg = STATUS_CONFIG[status];
  const methodColor = METHOD_COLORS[endpoint.method] ?? '#6B7280';
  const hasBody =
    endpoint.method === 'POST' ||
    endpoint.method === 'PUT' ||
    endpoint.method === 'PATCH';

  const allParams = useMemo(() => endpoint.params, [endpoint.params]);

  const handleParamChange = (name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetParams = () => {
    setParamValues(buildInitialParams(endpoint.params));
  };

  const handleResetBody = () => {
    setBodyJson(buildInitialBody(endpoint.bodyFields));
  };

  const handleRun = () => {
    let body: Record<string, unknown> | null = null;
    if (hasBody && bodyJson.trim()) {
      try {
        body = JSON.parse(bodyJson);
      } catch {
        body = null;
      }
    }
    onRun(endpoint, paramValues, body);
  };

  const handleCopyCurl = () => {
    let body: Record<string, unknown> | null = null;
    if (hasBody && bodyJson.trim()) {
      try {
        body = JSON.parse(bodyJson);
      } catch {
        body = null;
      }
    }
    onCopyCurl(endpoint, paramValues, body);
  };

  const handleResolveAndRun = async () => {
    const resolvedValues = await resolveAll();
    const merged = { ...paramValues, ...resolvedValues };
    setParamValues(merged);

    // Check if all path params are now filled
    const stillUnresolved = endpoint.params.some(
      p => p.isPathParam && (!merged[p.name] || merged[p.name] === '')
    );
    if (!stillUnresolved) {
      let body: Record<string, unknown> | null = null;
      if (hasBody && bodyJson.trim()) {
        try { body = JSON.parse(bodyJson); } catch { body = null; }
      }
      onRun(endpoint, merged, body);
    }
  };

  const handleResolveOnly = async () => {
    const resolvedValues = await resolveAll();
    setParamValues(prev => ({ ...prev, ...resolvedValues }));
  };

  const hasResults = result && (result.status === 'pass' || result.status === 'fail');

  return (
    <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg">
      {/* Header Row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1E1A3A] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Expand/collapse chevron */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
            isExpanded ? 'rotate-90' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>

        {/* Method badge */}
        <span
          className="px-2 py-0.5 rounded text-xs font-bold text-white uppercase flex-shrink-0"
          style={{ backgroundColor: methodColor }}
        >
          {endpoint.method}
        </span>

        {/* Endpoint name */}
        <span className="text-white font-medium truncate flex-1">
          {endpoint.name}
        </span>

        {/* Docs info button */}
        <DocsInfoButton endpoint={endpoint} />

        {/* Latency */}
        {result?.latencyMs != null && (
          <span className="text-xs text-gray-500 flex-shrink-0">
            {result.latencyMs}ms
          </span>
        )}

        {/* Status badge */}
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium text-white flex-shrink-0 ${
            statusCfg.color
          } ${statusCfg.animate ? 'animate-pulse' : ''}`}
        >
          {statusCfg.label}
        </span>

        {/* Run Test button */}
        <button
          className={`px-3 py-1 rounded text-xs font-medium text-white transition-colors flex-shrink-0 ${
            hasUnresolved
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-[#742DDD] hover:bg-[#6211C8]'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasUnresolved) {
              setIsExpanded(true);
              handleResolveAndRun();
            } else {
              handleRun();
            }
          }}
          disabled={status === 'running' || isResolving}
        >
          {isResolving ? 'Resolving...' : hasUnresolved ? 'Resolve & Run' : 'Run Test'}
        </button>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="border-t border-[#2E2A52] px-4 py-4 space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-400">{endpoint.description}</p>

          {/* Path */}
          <div className="font-mono text-xs text-gray-500 bg-[#0D0A1C] rounded px-3 py-2 border border-[#2E2A52]">
            {endpoint.method} {endpoint.path}
          </div>

          {/* Parameters Section */}
          {allParams.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Parameters</h4>
              <div className="grid gap-3">
                {allParams.map((param) => (
                  <div key={param.name} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-300 font-mono">
                        {param.name}
                      </label>
                      {param.isPathParam && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
                          Path
                        </span>
                      )}
                      {param.required ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-900/50 text-red-300 border border-red-700">
                          Required
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-400 border border-gray-700">
                          Optional
                        </span>
                      )}
                    </div>
                    {param.description && (
                      <p className="text-xs text-gray-500">
                        {param.description}
                      </p>
                    )}
                    {param.enum && param.enum.length > 0 ? (
                      <select
                        className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-[#742DDD] transition-colors"
                        value={paramValues[param.name] ?? ''}
                        onChange={(e) =>
                          handleParamChange(param.name, e.target.value)
                        }
                      >
                        <option value="">Select...</option>
                        {param.enum.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#742DDD] transition-colors"
                        placeholder={`Enter ${param.name}...`}
                        value={paramValues[param.name] ?? ''}
                        onChange={(e) =>
                          handleParamChange(param.name, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites Panel */}
          {hasUnresolved && (
            <PrerequisitesPanel
              steps={steps}
              isResolving={isResolving}
              onResolveAndRun={handleResolveAndRun}
              onResolveOnly={handleResolveOnly}
            />
          )}

          {/* Body Section */}
          {hasBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">
                  Request Body
                </h4>
                <button
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  onClick={handleResetBody}
                >
                  Reset
                </button>
              </div>
              <textarea
                className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded px-3 py-2 text-sm text-gray-200 font-mono placeholder-gray-600 focus:outline-none focus:border-[#742DDD] transition-colors resize-y"
                rows={Math.max(
                  4,
                  Math.min(15, bodyJson.split('\n').length + 1)
                )}
                value={bodyJson}
                onChange={(e) => setBodyJson(e.target.value)}
                placeholder='{ "key": "value" }'
                spellCheck={false}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              className={`px-4 py-1.5 rounded text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                hasUnresolved
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#742DDD] hover:bg-[#6211C8]'
              }`}
              onClick={hasUnresolved ? handleResolveAndRun : handleRun}
              disabled={status === 'running' || isResolving}
            >
              {status === 'running' ? 'Running...' : isResolving ? 'Resolving...' : hasUnresolved ? 'Resolve & Run' : 'Run'}
            </button>
            <button
              className="px-4 py-1.5 rounded text-sm font-medium text-gray-300 bg-[#252145] hover:bg-[#2E2A52] border border-[#2E2A52] transition-colors"
              onClick={handleResetParams}
            >
              Reset Params
            </button>
            <button
              className="px-4 py-1.5 rounded text-sm font-medium text-gray-300 bg-[#252145] hover:bg-[#2E2A52] border border-[#2E2A52] transition-colors"
              onClick={handleCopyCurl}
            >
              Copy cURL
            </button>
          </div>

          {/* Prerequisite Steps from batch run */}
          {result?.prerequisiteSteps && result.prerequisiteSteps.length > 0 && (
            <PrerequisiteStepsPanel steps={result.prerequisiteSteps} />
          )}

          {/* Error Section */}
          {result?.status === 'fail' && result.error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-300">
                    Error
                  </p>
                  <p className="text-sm text-red-400">
                    {result.error.message}
                  </p>
                  {result.error.code && (
                    <p className="text-xs text-red-500 font-mono">
                      Code: {result.error.code}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Response Section */}
          {hasResults && (
            <div className="space-y-3">
              {/* Tabs */}
              <div className="flex border-b border-[#2E2A52]">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'response'
                      ? 'text-[#8B5CF6] border-[#8B5CF6]'
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('response')}
                >
                  Response
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'performance'
                      ? 'text-[#8B5CF6] border-[#8B5CF6]'
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('performance')}
                >
                  Performance
                </button>
              </div>

              {/* Response Tab */}
              {activeTab === 'response' && (
                <div className="space-y-3">
                  {/* HTTP Status */}
                  {result?.httpStatus != null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        HTTP Status:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold text-white ${getStatusCodeColor(
                          result.httpStatus
                        )}`}
                      >
                        {result.httpStatus}
                      </span>
                    </div>
                  )}
                  {/* Response Body */}
                  <JsonViewer
                    data={result?.response?.body}
                    maxHeight="400px"
                  />
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-4">
                  {/* Latency Bar */}
                  {result?.latencyMs != null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Latency</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-200">
                            {result.latencyMs}ms
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              getLatencyRating(result.latencyMs).color
                            }`}
                          >
                            {getLatencyRating(result.latencyMs).label}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#0D0A1C] rounded-full h-2 border border-[#2E2A52]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            getLatencyRating(result.latencyMs).bgColor
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (result.latencyMs / 2000) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-600">
                        <span>0ms</span>
                        <span>200ms</span>
                        <span>500ms</span>
                        <span>1000ms</span>
                        <span>2000ms</span>
                      </div>
                    </div>
                  )}

                  {/* TTFB */}
                  {result?.ttfbMs != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Time to First Byte (TTFB)
                      </span>
                      <span className="text-sm font-mono text-gray-200">
                        {result.ttfbMs}ms
                      </span>
                    </div>
                  )}

                  {/* Response Size */}
                  {result?.responseSizeKb != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Response Size
                      </span>
                      <span className="text-sm font-mono text-gray-200">
                        {result.responseSizeKb.toFixed(2)} KB
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCard;
