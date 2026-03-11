import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Credentials {
  appId: string;
  apiToken: string;
  region: string;
  baseUrl: string;
  isConnected: boolean;
  appName?: string;
}

interface CredentialsContextType {
  credentials: Credentials;
  setCredentials: (appId: string, apiToken: string, region: string, appName?: string) => void;
  clearCredentials: () => void;
  maskedToken: string;
}

const CredentialsContext = createContext<CredentialsContextType | null>(null);

function buildBaseUrl(appId: string): string {
  return `https://api-${appId.toLowerCase()}.sendbird.com`;
}

function maskToken(token: string): string {
  if (token.length <= 4) return '••••';
  return '••••••••' + token.slice(-4);
}

export const CredentialsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credentials, setCredentialsState] = useState<Credentials>(() => {
    const saved = localStorage.getItem('sb_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, baseUrl: buildBaseUrl(parsed.appId) };
      } catch { /* ignore */ }
    }
    return { appId: '', apiToken: '', region: 'US', baseUrl: '', isConnected: false };
  });

  useEffect(() => {
    if (credentials.isConnected) {
      localStorage.setItem('sb_credentials', JSON.stringify({
        appId: credentials.appId,
        apiToken: credentials.apiToken,
        region: credentials.region,
        appName: credentials.appName,
        isConnected: true,
      }));
    }
  }, [credentials]);

  const setCredentials = useCallback((appId: string, apiToken: string, region: string, appName?: string) => {
    setCredentialsState({
      appId,
      apiToken,
      region,
      baseUrl: buildBaseUrl(appId),
      isConnected: true,
      appName,
    });
  }, []);

  const clearCredentials = useCallback(() => {
    // Preserve appId/apiToken in cache so CredentialGate can pre-fill them on re-entry
    try {
      const raw = localStorage.getItem('sb_credentials');
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        localStorage.setItem('sb_credentials', JSON.stringify({ ...parsed, isConnected: false }));
      }
    } catch { /* ignore */ }
    setCredentialsState({ appId: '', apiToken: '', region: 'US', baseUrl: '', isConnected: false });
  }, []);

  const maskedToken = maskToken(credentials.apiToken);

  return (
    <CredentialsContext.Provider value={{ credentials, setCredentials, clearCredentials, maskedToken }}>
      {children}
    </CredentialsContext.Provider>
  );
};

export function useCredentials(): CredentialsContextType {
  const ctx = useContext(CredentialsContext);
  if (!ctx) throw new Error('useCredentials must be used within CredentialsProvider');
  return ctx;
}
