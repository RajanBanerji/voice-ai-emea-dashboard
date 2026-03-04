import { useMemo } from 'react';
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useCredentials } from '../context/CredentialsContext';

interface RequestMetadata {
  startTime: number;
  endTime?: number;
  latency?: number;
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: RequestMetadata;
  }
}

export interface ApiCallResult {
  success: boolean;
  status: number;
  statusText: string;
  data: unknown;
  headers: Record<string, string>;
  latencyMs: number;
  ttfbMs: number;
  responseSizeKb: number;
  error?: string;
}

function getLatencyRating(ms: number): 'fast' | 'acceptable' | 'slow' | 'critical' {
  if (ms < 200) return 'fast';
  if (ms < 500) return 'acceptable';
  if (ms < 1000) return 'slow';
  return 'critical';
}

export { getLatencyRating };

export function useSendbirdApi() {
  const { credentials } = useCredentials();

  const axiosInstance: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: credentials.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Api-Token': credentials.apiToken,
      },
      timeout: 30000,
    });

    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      config.metadata = { startTime: performance.now() };
      return config;
    });

    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.config.metadata) {
          response.config.metadata.endTime = performance.now();
          response.config.metadata.latency =
            response.config.metadata.endTime - response.config.metadata.startTime;
        }
        return response;
      },
      (error) => {
        if (error.config?.metadata) {
          error.config.metadata.endTime = performance.now();
          error.config.metadata.latency =
            error.config.metadata.endTime - error.config.metadata.startTime;
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [credentials.baseUrl, credentials.apiToken]);

  const callApi = async (
    method: string,
    path: string,
    params?: Record<string, unknown>,
    body?: Record<string, unknown> | null
  ): Promise<ApiCallResult> => {
    const ttfbStart = performance.now();
    try {
      const response = await axiosInstance.request({
        method: method.toLowerCase(),
        url: path,
        params: method === 'GET' || method === 'DELETE' ? params : undefined,
        data: body || undefined,
      });

      const latency = response.config.metadata?.latency || (performance.now() - ttfbStart);
      const ttfb = latency * 0.7; // approximate TTFB
      const bodyStr = JSON.stringify(response.data);
      const sizeKb = parseFloat((new Blob([bodyStr]).size / 1024).toFixed(2));

      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers as Record<string, string>,
        latencyMs: Math.round(latency),
        ttfbMs: Math.round(ttfb),
        responseSizeKb: sizeKb,
      };
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const latency = err.config?.metadata?.latency || (performance.now() - ttfbStart);
        const bodyStr = JSON.stringify(err.response.data);
        const sizeKb = parseFloat((new Blob([bodyStr]).size / 1024).toFixed(2));
        return {
          success: false,
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers as Record<string, string>,
          latencyMs: Math.round(latency),
          ttfbMs: Math.round(latency * 0.7),
          responseSizeKb: sizeKb,
          error: err.response.data?.message || err.message,
        };
      }
      return {
        success: false,
        status: 0,
        statusText: 'Network Error',
        data: null,
        headers: {},
        latencyMs: Math.round(performance.now() - ttfbStart),
        ttfbMs: 0,
        responseSizeKb: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  };

  const validateCredentials = async (appId: string, token: string): Promise<{
    valid: boolean;
    error?: string;
    appName?: string;
  }> => {
    try {
      const resp = await axios.get(
        `https://api-${appId.toLowerCase()}.sendbird.com/v3/applications/info`,
        { headers: { 'Api-Token': token, 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return { valid: true, appName: resp.data?.app_name || resp.data?.name };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) return { valid: false, error: 'Invalid API Token' };
        if (err.response?.status === 404) return { valid: false, error: 'App ID not found' };
        if (err.response?.status === 403) return { valid: false, error: 'Access forbidden — check API token permissions' };
        return { valid: false, error: `API error: ${err.response?.status || 'connection failed'} — check region` };
      }
      return { valid: false, error: 'Cannot reach Sendbird API — check your connection and region' };
    }
  };

  return { callApi, validateCredentials, baseUrl: credentials.baseUrl };
}
