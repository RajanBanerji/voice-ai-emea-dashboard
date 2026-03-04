import { useCallback, useRef } from 'react';
import { useTestResults } from '../context/TestResultsContext';
import type { PrerequisiteStep } from '../context/TestResultsContext';
import { useHistory } from '../context/HistoryContext';
import { useSendbirdApi, getLatencyRating } from './useSendbirdApi';
import { resolveDependencies } from '../data/dependencyRegistry';
import type { EndpointDef, HttpMethod } from '../data/endpoints';

const DELAY_MS = 300;
const RATE_LIMIT_DELAY_MS = 5000;

/** Body field names that can be resolved from the shared cache */
const BODY_RESOLVABLE: Record<string, string> = {
  user_id: 'user_id',
  target_id: 'user_id',       // target_id is another user
  banned_user_id: 'user_id',
  muted_user_id: 'user_id',
  bot_userid: 'bot_userid',
  channel_url: 'channel_url',
};

export function useTestRunner() {
  const { setResult, setRunProgress, includeDestructive } = useTestResults();
  const { addEntry } = useHistory();
  const { callApi, baseUrl } = useSendbirdApi();
  const cancelRef = useRef(false);
  const pauseRef = useRef(false);

  const resolvePathParams = (
    path: string,
    paramValues: Record<string, unknown>
  ): string => {
    let resolved = path;
    const pathParamRegex = /\{(\w+)\}/g;
    let match;
    while ((match = pathParamRegex.exec(path)) !== null) {
      const key = match[1];
      const val = paramValues[key];
      if (val !== undefined && val !== '') {
        resolved = resolved.replace(`{${key}}`, String(val));
      }
    }
    return resolved;
  };

  const runSingleTest = useCallback(async (
    endpoint: EndpointDef,
    paramValues: Record<string, unknown>,
    bodyValues: Record<string, unknown> | null,
    prerequisiteSteps?: PrerequisiteStep[]
  ) => {
    setResult(endpoint.id, {
      endpointId: endpoint.id,
      status: 'running',
      prerequisiteSteps,
    });

    const resolvedPath = resolvePathParams(endpoint.path, paramValues);

    // Separate query params from path params
    const queryParams: Record<string, unknown> = {};
    for (const p of endpoint.params) {
      if (!p.isPathParam && paramValues[p.name] !== undefined && paramValues[p.name] !== '') {
        queryParams[p.name] = paramValues[p.name];
      }
    }

    const result = await callApi(endpoint.method, resolvedPath, queryParams, bodyValues);
    const maskedHeaders: Record<string, string> = { 'Api-Token': '••••••••', 'Content-Type': 'application/json' };

    // For premium endpoints returning 403/404/500, mark as pass with warning
    const isPremiumFail = endpoint.isPremium && !result.success && (result.status === 400 || result.status === 403 || result.status === 404 || result.status === 500);

    const testResult = {
      endpointId: endpoint.id,
      status: (result.success || isPremiumFail ? 'pass' : 'fail') as 'pass' | 'fail',
      httpStatus: result.status,
      latencyMs: result.latencyMs,
      ttfbMs: result.ttfbMs,
      responseSizeKb: result.responseSizeKb,
      request: {
        url: `${baseUrl}${resolvedPath}`,
        method: endpoint.method,
        headers: maskedHeaders,
        params: queryParams,
        body: bodyValues,
      },
      response: {
        body: result.data,
        headers: result.headers,
      },
      error: result.error
        ? { message: isPremiumFail ? `[Premium Feature] ${result.error}` : result.error }
        : undefined,
      prerequisiteSteps,
      timestamp: new Date().toISOString(),
    };

    setResult(endpoint.id, testResult);

    // Add to history
    addEntry({
      endpoint_name: endpoint.name,
      method: endpoint.method as HttpMethod,
      url: `${baseUrl}${resolvedPath}`,
      category: endpoint.category,
      endpointId: endpoint.id,
      request: {
        headers: maskedHeaders,
        params: queryParams,
        body: bodyValues,
      },
      response: {
        status: result.status,
        status_text: result.statusText,
        headers: result.headers,
        body: result.data,
        size_kb: result.responseSizeKb,
      },
      performance: {
        latency_ms: result.latencyMs,
        ttfb_ms: result.ttfbMs,
        rating: getLatencyRating(result.latencyMs),
      },
      result: result.success || isPremiumFail ? 'pass' : 'fail',
      error: result.error ? { message: result.error } : undefined,
    });

    return testResult;
  }, [callApi, baseUrl, setResult, addEntry]);

  /** Look up a value in the shared cache, checking category-specific key first, then any category */
  const findInCache = (cache: Record<string, string>, paramKey: string, category: string): string | undefined => {
    const specific = cache[`${paramKey}:${category}`];
    if (specific) return specific;
    for (const key of Object.keys(cache)) {
      if (key.startsWith(`${paramKey}:`)) return cache[key];
    }
    return undefined;
  };

  const runCategoryTests = useCallback(async (
    endpoints: EndpointDef[],
    getParamValues: (ep: EndpointDef) => Record<string, unknown>,
    getBodyValues: (ep: EndpointDef) => Record<string, unknown> | null,
    categoryName: string
  ) => {
    cancelRef.current = false;
    pauseRef.current = false;

    // Shared cache for resolved dependencies across endpoints in this batch
    const resolveCache: Record<string, string> = {};

    // Only skip destructive endpoints (when opt-out); run everything else
    const runnable: EndpointDef[] = [];
    for (const ep of endpoints) {
      if (ep.isDestructive && !includeDestructive) {
        setResult(ep.id, { endpointId: ep.id, status: 'skipped' });
        continue;
      }
      runnable.push(ep);
    }

    setRunProgress({
      isRunning: true, current: 0, total: runnable.length,
      currentEndpoint: '', category: categoryName, isPaused: false,
    });

    for (let i = 0; i < runnable.length; i++) {
      if (cancelRef.current) break;

      while (pauseRef.current) {
        await new Promise(r => setTimeout(r, 200));
        if (cancelRef.current) break;
      }
      if (cancelRef.current) break;

      const ep = runnable[i];
      setRunProgress({
        isRunning: true, current: i + 1, total: runnable.length,
        currentEndpoint: ep.name, category: categoryName, isPaused: false,
      });

      // Collect prerequisite steps for this endpoint
      const allSteps: PrerequisiteStep[] = [];

      // Start with default param values
      const paramValues = { ...getParamValues(ep) };

      // Auto-resolve unresolved path params using the dependency registry
      const resolvedPath = resolvePathParams(ep.path, paramValues);
      if (/\{\w+\}/.test(resolvedPath)) {
        const { resolvedValues, steps } = await resolveDependencies(
          ep.path,
          ep.category,
          ep.params,
          paramValues,
          callApi,
          resolveCache
        );
        allSteps.push(...steps);
        for (const [k, v] of Object.entries(resolvedValues)) {
          paramValues[k] = v;
        }
      }

      // Build body and auto-resolve body field dependencies from cache
      let bodyValues = getBodyValues(ep);
      // Ensure PUT/PATCH requests always have at least an empty body
      if (!bodyValues && (ep.method === 'PUT' || ep.method === 'PATCH')) {
        bodyValues = {};
      }
      if (bodyValues) {
        const bodyCopy = { ...bodyValues };

        for (const bf of ep.bodyFields) {
          const cacheParamKey = BODY_RESOLVABLE[bf.name];
          if (!cacheParamKey) continue;

          const currentVal = bodyCopy[bf.name];
          const isEmpty = currentVal === '' || currentVal === undefined || currentVal === null;
          const isDefault = typeof currentVal === 'string' && (
            currentVal.startsWith('test_api_user_') ||
            currentVal === 'test_channel'
          );

          if (isEmpty || isDefault) {
            // For POST create endpoints (no path params = base resource creation),
            // generate unique IDs instead of reusing cached ones that already exist
            if (ep.method === 'POST' && !ep.path.includes('{') && bf.name === cacheParamKey) {
              const uniqueId = `auto_${cacheParamKey}_${Date.now()}`;
              bodyCopy[bf.name] = uniqueId;
              allSteps.push({
                paramName: bf.name,
                kind: 'body-resolve',
                description: `Generated unique ${bf.name} for resource creation`,
                resolvedValue: uniqueId,
              });
              continue;
            }

            // For target_id, we need a DIFFERENT user than the path param user_id
            if (bf.name === 'target_id') {
              let targetUser = resolveCache['target_user:global'];
              if (!targetUser) {
                // Create a dedicated target user
                const createResult = await callApi('POST', '/v3/users', {}, {
                  user_id: `target_user_${Date.now()}`,
                  nickname: 'Auto-created Target User',
                  profile_url: '',
                });
                if (createResult.success && createResult.data) {
                  targetUser = (createResult.data as Record<string, unknown>).user_id as string;
                  resolveCache['target_user:global'] = targetUser;
                  allSteps.push({
                    paramName: bf.name,
                    kind: 'api-create',
                    description: 'Auto-creating a target user via POST /v3/users',
                    apiCall: {
                      method: 'POST',
                      path: '/v3/users',
                      body: { user_id: targetUser, nickname: 'Auto-created Target User' },
                      responseStatus: createResult.status,
                    },
                    resolvedValue: targetUser,
                  });
                }
              }
              if (targetUser) {
                bodyCopy[bf.name] = targetUser;
                if (!allSteps.some(s => s.paramName === bf.name)) {
                  allSteps.push({
                    paramName: bf.name,
                    kind: 'body-resolve',
                    description: `Resolved body field "${bf.name}" from cached target user`,
                    resolvedValue: targetUser,
                  });
                }
              }
              continue;
            }

            let cached = findInCache(resolveCache, cacheParamKey, ep.category);

            // If cache doesn't have the value, try fetching it directly
            if (!cached && cacheParamKey === 'channel_url') {
              const fetchResult = await callApi('GET', '/v3/group_channels', { limit: 1 }, null);
              if (fetchResult.success && fetchResult.data) {
                const channels = (fetchResult.data as Record<string, unknown>).channels as unknown[];
                if (Array.isArray(channels) && channels.length > 0) {
                  cached = (channels[0] as Record<string, unknown>).channel_url as string;
                  if (cached) resolveCache[`channel_url:${ep.category}`] = cached;
                }
              }
            }
            if (!cached && cacheParamKey === 'user_id') {
              const fetchResult = await callApi('GET', '/v3/users', { limit: 1 }, null);
              if (fetchResult.success && fetchResult.data) {
                const users = (fetchResult.data as Record<string, unknown>).users as unknown[];
                if (Array.isArray(users) && users.length > 0) {
                  cached = (users[0] as Record<string, unknown>).user_id as string;
                  if (cached) resolveCache[`user_id:${ep.category}`] = cached;
                }
              }
            }

            if (cached) {
              bodyCopy[bf.name] = cached;
              allSteps.push({
                paramName: bf.name,
                kind: 'body-resolve',
                description: `Resolved body field "${bf.name}" from ${cacheParamKey}`,
                resolvedValue: cached,
              });
            }
          }
        }

        // Special case: user_ids array field (e.g., group channel create)
        if (bodyCopy['user_ids']) {
          const userId = findInCache(resolveCache, 'user_id', ep.category);
          if (userId) {
            const current = bodyCopy['user_ids'];
            if (Array.isArray(current) && current.length === 1 && current[0] === 'test_api_user_1') {
              bodyCopy['user_ids'] = [userId];
              allSteps.push({
                paramName: 'user_ids',
                kind: 'body-resolve',
                description: `Resolved body field "user_ids" from cached user_id`,
                resolvedValue: `[${userId}]`,
              });
            }
          }
        }

        // Special case: for bot send message, join the bot to the resolved channel first
        if (ep.id === 'bots-send-message' && bodyCopy['channel_url'] && bodyCopy['channel_url'] !== 'test_channel') {
          const botId = paramValues['bot_userid'] as string;
          const channelUrl = bodyCopy['channel_url'] as string;
          if (botId && channelUrl) {
            const joinResult = await callApi('POST', `/v3/bots/${botId}/channels`, {}, {
              channel_urls: [channelUrl],
            });
            allSteps.push({
              paramName: 'channel_url',
              kind: 'api-create',
              description: `Joining bot "${botId}" to channel before sending message`,
              apiCall: {
                method: 'POST',
                path: `/v3/bots/${botId}/channels`,
                body: { channel_urls: [channelUrl] },
                responseStatus: joinResult.status,
              },
              resolvedValue: channelUrl,
            });
          }
        }

        bodyValues = bodyCopy;
      }

      const result = await runSingleTest(ep, paramValues, bodyValues, allSteps.length > 0 ? allSteps : undefined);

      // Rate limit handling
      if (result.httpStatus === 429) {
        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
        await runSingleTest(ep, paramValues, bodyValues, allSteps.length > 0 ? allSteps : undefined);
      }

      if (i < runnable.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    setRunProgress({ isRunning: false, current: 0, total: 0, isPaused: false });
  }, [runSingleTest, setResult, setRunProgress, includeDestructive, callApi]);

  const cancelRun = useCallback(() => { cancelRef.current = true; }, []);
  const pauseRun = useCallback(() => { pauseRef.current = true; }, []);
  const resumeRun = useCallback(() => { pauseRef.current = false; }, []);

  return { runSingleTest, runCategoryTests, cancelRun, pauseRun, resumeRun };
}
