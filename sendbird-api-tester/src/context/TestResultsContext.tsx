import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type TestStatus = 'pending' | 'running' | 'pass' | 'fail' | 'skipped';

export interface PrerequisiteStep {
  paramName: string;
  kind: 'static' | 'api-fetch' | 'api-create' | 'chained-fetch' | 'chained-create' | 'body-resolve';
  description: string;
  apiCall?: {
    method: string;
    path: string;
    params?: Record<string, unknown>;
    body?: Record<string, unknown> | null;
    responseStatus?: number;
    responseBody?: unknown;
  };
  resolvedValue?: string;
  error?: string;
  durationMs?: number;
}

export interface TestResult {
  endpointId: string;
  status: TestStatus;
  httpStatus?: number;
  latencyMs?: number;
  ttfbMs?: number;
  responseSizeKb?: number;
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    params: Record<string, unknown>;
    body: Record<string, unknown> | null;
  };
  response?: {
    body: unknown;
    headers?: Record<string, string>;
  };
  error?: {
    message: string;
    code?: string;
    debugAnalysis?: DebugAnalysis;
  };
  prerequisiteSteps?: PrerequisiteStep[];
  timestamp?: string;
}

export interface DebugAnalysis {
  root_cause: string;
  explanation: string;
  fix_steps: string[];
  correct_payload_example?: Record<string, unknown>;
  sendbird_doc_reference: string;
  common_mistakes: string[];
  is_auth_issue: boolean;
  is_payload_issue: boolean;
  is_rate_limit: boolean;
  is_permission_issue: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RunProgress {
  isRunning: boolean;
  current: number;
  total: number;
  currentEndpoint?: string;
  category?: string;
  isPaused: boolean;
}

interface TestResultsContextType {
  results: Record<string, TestResult>;
  setResult: (endpointId: string, result: TestResult) => void;
  clearResults: () => void;
  clearCategoryResults: (category: string, endpointIds: string[]) => void;
  getResult: (endpointId: string) => TestResult | undefined;
  getCategorySummary: (endpointIds: string[]) => { passed: number; failed: number; pending: number; skipped: number };
  globalSummary: { passed: number; failed: number; pending: number; skipped: number; totalTime: number };
  runProgress: RunProgress;
  setRunProgress: (progress: RunProgress) => void;
  includeDestructive: boolean;
  setIncludeDestructive: (v: boolean) => void;
}

const TestResultsContext = createContext<TestResultsContextType | null>(null);

const RESULTS_STORAGE_KEY = 'sendbird_test_results';

function loadResults(): Record<string, TestResult> {
  try {
    const data = localStorage.getItem(RESULTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveResults(results: Record<string, TestResult>) {
  try {
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
  } catch { /* storage full */ }
}

export const TestResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<Record<string, TestResult>>(loadResults);
  const [runProgress, setRunProgress] = useState<RunProgress>({
    isRunning: false, current: 0, total: 0, isPaused: false,
  });
  const [includeDestructive, setIncludeDestructive] = useState(false);

  useEffect(() => { saveResults(results); }, [results]);

  const setResult = useCallback((endpointId: string, result: TestResult) => {
    setResults(prev => ({ ...prev, [endpointId]: result }));
  }, []);

  const clearResults = useCallback(() => {
    setResults({});
    localStorage.removeItem(RESULTS_STORAGE_KEY);
  }, []);

  const clearCategoryResults = useCallback((category: string, endpointIds: string[]) => {
    void category;
    setResults(prev => {
      const next = { ...prev };
      for (const id of endpointIds) delete next[id];
      return next;
    });
  }, []);

  const getResult = useCallback((endpointId: string) => results[endpointId], [results]);

  const getCategorySummary = useCallback((endpointIds: string[]) => {
    let passed = 0, failed = 0, pending = 0, skipped = 0;
    for (const id of endpointIds) {
      const r = results[id];
      if (!r || r.status === 'pending') pending++;
      else if (r.status === 'pass') passed++;
      else if (r.status === 'fail') failed++;
      else if (r.status === 'skipped') skipped++;
    }
    return { passed, failed, pending, skipped };
  }, [results]);

  const globalSummary = React.useMemo(() => {
    let passed = 0, failed = 0, pending = 0, skipped = 0, totalTime = 0;
    for (const r of Object.values(results)) {
      if (r.status === 'pass') { passed++; totalTime += r.latencyMs || 0; }
      else if (r.status === 'fail') { failed++; totalTime += r.latencyMs || 0; }
      else if (r.status === 'skipped') skipped++;
      else pending++;
    }
    return { passed, failed, pending, skipped, totalTime };
  }, [results]);

  return (
    <TestResultsContext.Provider value={{
      results, setResult, clearResults, clearCategoryResults,
      getResult, getCategorySummary, globalSummary,
      runProgress, setRunProgress, includeDestructive, setIncludeDestructive,
    }}>
      {children}
    </TestResultsContext.Provider>
  );
};

export function useTestResults(): TestResultsContextType {
  const ctx = useContext(TestResultsContext);
  if (!ctx) throw new Error('useTestResults must be used within TestResultsProvider');
  return ctx;
}
