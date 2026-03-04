import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  endpoint_name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  category: string;
  endpointId: string;
  request: {
    headers: Record<string, string>;
    params: Record<string, unknown>;
    body: Record<string, unknown> | null;
  };
  response: {
    status: number;
    status_text: string;
    headers: Record<string, string>;
    body: unknown;
    size_kb: number;
  };
  performance: {
    latency_ms: number;
    ttfb_ms: number;
    rating: 'fast' | 'acceptable' | 'slow' | 'critical';
  };
  result: 'pass' | 'fail' | 'skipped';
  error?: {
    message: string;
    code?: string;
    debug_analysis?: unknown;
  };
}

interface HistoryContextType {
  history: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  getEntriesForEndpoint: (endpointId: string) => HistoryEntry[];
  getLatencies: (endpointId: string) => number[];
  allLatencies: () => Map<string, number[]>;
}

const STORAGE_KEY = 'sendbird_api_history';
const MAX_ENTRIES = 1000;

const HistoryContext = createContext<HistoryContextType | null>(null);

function loadHistory(): HistoryEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch { /* storage full, ignore */ }
}

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  useEffect(() => { saveHistory(history); }, [history]);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const full: HistoryEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [full, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getEntriesForEndpoint = useCallback((endpointId: string) => {
    return history.filter(e => e.endpointId === endpointId);
  }, [history]);

  const getLatencies = useCallback((endpointId: string) => {
    return history.filter(e => e.endpointId === endpointId).map(e => e.performance.latency_ms);
  }, [history]);

  const allLatencies = useCallback(() => {
    const map = new Map<string, number[]>();
    for (const e of history) {
      if (!map.has(e.endpointId)) map.set(e.endpointId, []);
      map.get(e.endpointId)!.push(e.performance.latency_ms);
    }
    return map;
  }, [history]);

  return (
    <HistoryContext.Provider value={{
      history, addEntry, removeEntry, clearHistory,
      getEntriesForEndpoint, getLatencies, allLatencies,
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

export function useHistory(): HistoryContextType {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
