import type { PrerequisiteStep } from '../context/TestResultsContext';

export type ResolutionKind = 'static' | 'api' | 'chained';

interface StaticResolution {
  kind: 'static';
  label: string;
  description: string;
  defaultValue: string;
  options?: { value: string; label: string }[];
}

interface CreateFallback {
  method: string;
  path: string;
  body: Record<string, unknown>;
  extractPath: string;
  description: string;
}

interface ApiResolution {
  kind: 'api';
  label: string;
  description: string;
  apiPath: string;
  apiMethod: 'GET';
  apiParams?: Record<string, unknown>;
  extractPath: string;
  emptyMessage: string;
  createFallback?: CreateFallback;
}

interface ChainedResolution {
  kind: 'chained';
  label: string;
  description: string;
  dependsOn: string[];
  getApiConfig: (resolvedValues: Record<string, string>) => {
    apiPath: string;
    apiMethod: 'GET';
    apiParams?: Record<string, unknown>;
    extractPath: string;
    emptyMessage: string;
  };
  getCreateFallback?: (resolvedValues: Record<string, string>) => CreateFallback;
}

export type ParamResolution = StaticResolution | ApiResolution | ChainedResolution;
export type ResolutionFactory = (category: string) => ParamResolution;

export const DEPENDENCY_REGISTRY: Record<string, ResolutionFactory> = {
  user_id: () => {
    const userId = `auto_user_${Date.now()}`;
    return {
      kind: 'api' as const,
      label: 'Fetch a user ID',
      description: 'Calls GET /v3/users to retrieve an existing user.',
      apiPath: '/v3/users',
      apiMethod: 'GET' as const,
      apiParams: { limit: 1 },
      extractPath: 'users.0.user_id',
      emptyMessage: 'No users found. Creating a user...',
      createFallback: {
        method: 'POST',
        path: '/v3/users',
        body: { user_id: userId, nickname: 'Auto-created User', profile_url: '' },
        extractPath: 'user_id',
        description: 'Auto-creating a user via POST /v3/users',
      },
    };
  },

  channel_url: (category: string) => {
    if (category === 'Open Channels') {
      return {
        kind: 'api' as const,
        label: 'Fetch an open channel URL',
        description: 'Calls GET /v3/open_channels to retrieve a channel.',
        apiPath: '/v3/open_channels',
        apiMethod: 'GET' as const,
        apiParams: { limit: 1 },
        extractPath: 'channels.0.channel_url',
        emptyMessage: 'No open channels found. Creating one...',
        createFallback: {
          method: 'POST',
          path: '/v3/open_channels',
          body: { name: 'Auto-created Open Channel' },
          extractPath: 'channel_url',
          description: 'Auto-creating an open channel via POST /v3/open_channels',
        },
      };
    }
    return {
      kind: 'api' as const,
      label: 'Fetch a group channel URL',
      description: 'Calls GET /v3/group_channels to retrieve a channel.',
      apiPath: '/v3/group_channels',
      apiMethod: 'GET' as const,
      apiParams: { limit: 1 },
      extractPath: 'channels.0.channel_url',
      emptyMessage: 'No group channels found. Creating one...',
      createFallback: {
        method: 'POST',
        path: '/v3/group_channels',
        body: { name: 'Auto-created Group Channel', user_ids: ['test_api_user_1'] },
        extractPath: 'channel_url',
        description: 'Auto-creating a group channel via POST /v3/group_channels',
      },
    };
  },

  channel_type: (category: string) => ({
    kind: 'static',
    label: 'Channel type',
    description: 'Automatically determined from the endpoint category.',
    defaultValue: category === 'Open Channels' ? 'open_channels' : 'group_channels',
    options: [
      { value: 'open_channels', label: 'Open Channels' },
      { value: 'group_channels', label: 'Group Channels' },
    ],
  }),

  data_type: () => ({
    kind: 'static',
    label: 'Data type',
    description: 'Type of data to export. Defaults to "messages".',
    defaultValue: 'messages',
    options: [
      { value: 'messages', label: 'Messages' },
      { value: 'channels', label: 'Channels' },
      { value: 'users', label: 'Users' },
    ],
  }),

  bot_userid: () => {
    const botId = `auto_bot_${Date.now()}`;
    return {
      kind: 'api' as const,
      label: 'Fetch a bot user ID',
      description: 'Calls GET /v3/bots to retrieve an existing bot.',
      apiPath: '/v3/bots',
      apiMethod: 'GET' as const,
      extractPath: 'bots.0.bot.bot_userid',
      emptyMessage: 'No bots found. Creating one...',
      createFallback: {
        method: 'POST',
        path: '/v3/bots',
        body: {
          bot_userid: botId,
          bot_nickname: 'Auto-created Bot',
          bot_callback_url: 'https://example.com/bot-callback',
          is_privacy_mode: false,
        },
        extractPath: 'bot.bot_userid',
        description: 'Auto-creating a bot via POST /v3/bots',
      },
    };
  },

  message_id: () => ({
    kind: 'chained',
    label: 'Fetch a message ID',
    description: 'Requires channel_url first, then fetches messages from that channel.',
    dependsOn: ['channel_type', 'channel_url'],
    getApiConfig: (resolved: Record<string, string>) => {
      const channelType = resolved['channel_type'] || 'group_channels';
      const channelUrl = resolved['channel_url'];
      return {
        apiPath: `/v3/${channelType}/${channelUrl}/messages`,
        apiMethod: 'GET',
        apiParams: { message_ts: 0, prev_limit: 0, next_limit: 1 },
        extractPath: 'messages.0.message_id',
        emptyMessage: 'No messages found. Sending a message...',
      };
    },
    getCreateFallback: (resolved: Record<string, string>) => {
      const channelType = resolved['channel_type'] || 'group_channels';
      const channelUrl = resolved['channel_url'];
      return {
        method: 'POST',
        path: `/v3/${channelType}/${channelUrl}/messages`,
        body: { message_type: 'MESG', message: 'Auto-generated test message', user_id: resolved['user_id'] || 'test_api_user_1' },
        extractPath: 'message_id',
        description: `Auto-sending a message via POST /v3/${channelType}/${channelUrl}/messages`,
      };
    },
  }),

  request_id: () => ({
    kind: 'chained',
    label: 'Fetch an export request ID',
    description: 'Requires data_type first, then lists export requests.',
    dependsOn: ['data_type'],
    getApiConfig: (resolved: Record<string, string>) => {
      const dataType = resolved['data_type'] || 'messages';
      return {
        apiPath: `/v3/export/${dataType}`,
        apiMethod: 'GET',
        extractPath: 'exported_data.0.request_id',
        emptyMessage: 'No export requests found. Creating one...',
      };
    },
    getCreateFallback: (resolved: Record<string, string>) => {
      const dataType = resolved['data_type'] || 'messages';
      return {
        method: 'POST',
        path: `/v3/export/${dataType}`,
        body: { start_ts: 1700000000, end_ts: 1700086400 },
        extractPath: 'request_id',
        description: `Auto-creating an export request via POST /v3/export/${dataType}`,
      };
    },
  }),

  target_id: () => ({
    kind: 'api',
    label: 'Fetch a target user ID',
    description: 'Calls GET /v3/users to retrieve an existing user.',
    apiPath: '/v3/users',
    apiMethod: 'GET',
    apiParams: { limit: 1 },
    extractPath: 'users.0.user_id',
    emptyMessage: 'No users found. Create a user first.',
  }),

  banned_user_id: () => ({
    kind: 'api',
    label: 'Fetch a user ID (for unban)',
    description: 'Calls GET /v3/users to retrieve an existing user.',
    apiPath: '/v3/users',
    apiMethod: 'GET',
    apiParams: { limit: 1 },
    extractPath: 'users.0.user_id',
    emptyMessage: 'No users found. Create a user first.',
  }),

  muted_user_id: () => ({
    kind: 'api',
    label: 'Fetch a user ID (for unmute)',
    description: 'Calls GET /v3/users to retrieve an existing user.',
    apiPath: '/v3/users',
    apiMethod: 'GET',
    apiParams: { limit: 1 },
    extractPath: 'users.0.user_id',
    emptyMessage: 'No users found. Create a user first.',
  }),
};

// ---------------------------------------------------------------------------
// Standalone resolution for batch runner (no React hooks)
// ---------------------------------------------------------------------------

interface ApiCaller {
  (method: string, path: string, params?: Record<string, unknown>, body?: Record<string, unknown> | null): Promise<{
    success: boolean;
    status: number;
    data: unknown;
    error?: string;
  }>;
}

function topologicalSort(
  unresolvedParams: string[],
  category: string
): string[] {
  const result: string[] = [];
  const remaining = new Set(unresolvedParams);
  const resolved = new Set<string>();

  let changed = true;
  while (changed && remaining.size > 0) {
    changed = false;
    for (const param of remaining) {
      const factory = DEPENDENCY_REGISTRY[param];
      if (!factory) {
        remaining.delete(param);
        changed = true;
        continue;
      }
      const resolution = factory(category);
      if (resolution.kind !== 'chained') {
        result.push(param);
        resolved.add(param);
        remaining.delete(param);
        changed = true;
      } else {
        const allDepsMet = resolution.dependsOn.every(
          dep => resolved.has(dep) || !remaining.has(dep)
        );
        if (allDepsMet) {
          result.push(param);
          resolved.add(param);
          remaining.delete(param);
          changed = true;
        }
      }
    }
  }

  for (const param of remaining) result.push(param);
  return result;
}

export interface ResolutionResult {
  resolvedValues: Record<string, string>;
  steps: PrerequisiteStep[];
}

/**
 * Resolve unresolved path params for an endpoint using the dependency registry.
 * Uses a shared cache to avoid redundant API calls across endpoints in a batch run.
 * Includes create-fallback: if a fetch returns empty, automatically creates the resource.
 * Returns both resolved values and detailed steps for display in the UI.
 */
export async function resolveDependencies(
  endpointPath: string,
  endpointCategory: string,
  pathParams: { name: string; isPathParam?: boolean }[],
  paramValues: Record<string, unknown>,
  callApi: ApiCaller,
  cache: Record<string, string>
): Promise<ResolutionResult> {
  const unresolvedParams = pathParams
    .filter(p => p.isPathParam && (!paramValues[p.name] || paramValues[p.name] === ''))
    .map(p => p.name)
    .filter(name => DEPENDENCY_REGISTRY[name] != null);

  if (unresolvedParams.length === 0) return { resolvedValues: {}, steps: [] };

  const sorted = topologicalSort(unresolvedParams, endpointCategory);
  const resolvedValues: Record<string, string> = {};
  const steps: PrerequisiteStep[] = [];

  for (const paramName of sorted) {
    // Check cache first (keyed by param + category)
    const cacheKey = `${paramName}:${endpointCategory}`;
    if (cache[cacheKey]) {
      resolvedValues[paramName] = cache[cacheKey];
      steps.push({
        paramName,
        kind: 'api-fetch',
        description: `Used cached value for ${paramName}`,
        resolvedValue: cache[cacheKey],
      });
      continue;
    }

    const factory = DEPENDENCY_REGISTRY[paramName];
    if (!factory) continue;

    const resolution = factory(endpointCategory);

    if (resolution.kind === 'static') {
      resolvedValues[paramName] = resolution.defaultValue;
      cache[cacheKey] = resolution.defaultValue;
      steps.push({
        paramName,
        kind: 'static',
        description: resolution.description,
        resolvedValue: resolution.defaultValue,
      });
      continue;
    }

    if (resolution.kind === 'api') {
      const start = performance.now();
      const result = await callApi('GET', resolution.apiPath, resolution.apiParams ?? {}, null);
      const duration = Math.round(performance.now() - start);

      if (result.success) {
        const value = extractValueByPath(result.data, resolution.extractPath);
        if (value) {
          resolvedValues[paramName] = value;
          cache[cacheKey] = value;
          steps.push({
            paramName,
            kind: 'api-fetch',
            description: resolution.description,
            apiCall: {
              method: 'GET',
              path: resolution.apiPath,
              params: resolution.apiParams,
              responseStatus: result.status,
              responseBody: result.data,
            },
            resolvedValue: value,
            durationMs: duration,
          });
          continue;
        }
      }

      // Fetch returned empty or failed — try create fallback
      if (resolution.createFallback) {
        const fb = resolution.createFallback;
        const createStart = performance.now();
        const createResult = await callApi(fb.method, fb.path, {}, fb.body);
        const createDuration = Math.round(performance.now() - createStart);

        if (createResult.success) {
          const value = extractValueByPath(createResult.data, fb.extractPath);
          if (value) {
            resolvedValues[paramName] = value;
            cache[cacheKey] = value;
            steps.push({
              paramName,
              kind: 'api-create',
              description: fb.description,
              apiCall: {
                method: fb.method,
                path: fb.path,
                body: fb.body,
                responseStatus: createResult.status,
                responseBody: createResult.data,
              },
              resolvedValue: value,
              durationMs: createDuration,
            });
            continue;
          }
        }
        steps.push({
          paramName,
          kind: 'api-create',
          description: fb.description,
          apiCall: {
            method: fb.method,
            path: fb.path,
            body: fb.body,
            responseStatus: createResult.status,
            responseBody: createResult.data,
          },
          error: createResult.error || 'Create fallback failed',
          durationMs: createDuration,
        });
      } else {
        steps.push({
          paramName,
          kind: 'api-fetch',
          description: resolution.description,
          apiCall: {
            method: 'GET',
            path: resolution.apiPath,
            params: resolution.apiParams,
            responseStatus: result.status,
            responseBody: result.data,
          },
          error: resolution.emptyMessage,
          durationMs: duration,
        });
      }
      continue;
    }

    if (resolution.kind === 'chained') {
      // Merge existing params + already-resolved values + cache
      const merged: Record<string, string> = {};
      for (const [k, v] of Object.entries(paramValues)) {
        if (v != null && v !== '') merged[k] = String(v);
      }
      Object.assign(merged, resolvedValues);
      for (const dep of resolution.dependsOn) {
        const depCacheKey = `${dep}:${endpointCategory}`;
        if (cache[depCacheKey] && !merged[dep]) {
          merged[dep] = cache[depCacheKey];
        }
      }

      const config = resolution.getApiConfig(merged);
      const start = performance.now();
      const result = await callApi('GET', config.apiPath, config.apiParams ?? {}, null);
      const duration = Math.round(performance.now() - start);

      if (result.success) {
        const value = extractValueByPath(result.data, config.extractPath);
        if (value) {
          resolvedValues[paramName] = value;
          cache[cacheKey] = value;
          steps.push({
            paramName,
            kind: 'chained-fetch',
            description: resolution.description,
            apiCall: {
              method: 'GET',
              path: config.apiPath,
              params: config.apiParams,
              responseStatus: result.status,
              responseBody: result.data,
            },
            resolvedValue: value,
            durationMs: duration,
          });
          continue;
        }
      }

      // Chained fetch returned empty — try create fallback
      if (resolution.getCreateFallback) {
        // Ensure user_id is available in merged for message creation
        if (!merged['user_id'] && cache[`user_id:${endpointCategory}`]) {
          merged['user_id'] = cache[`user_id:${endpointCategory}`];
        }
        // Also check other category caches for user_id
        if (!merged['user_id']) {
          for (const key of Object.keys(cache)) {
            if (key.startsWith('user_id:')) {
              merged['user_id'] = cache[key];
              break;
            }
          }
        }

        const fb = resolution.getCreateFallback(merged);
        const createStart = performance.now();
        const createResult = await callApi(fb.method, fb.path, {}, fb.body);
        const createDuration = Math.round(performance.now() - createStart);

        if (createResult.success) {
          const value = extractValueByPath(createResult.data, fb.extractPath);
          if (value) {
            resolvedValues[paramName] = String(value);
            cache[cacheKey] = String(value);
            steps.push({
              paramName,
              kind: 'chained-create',
              description: fb.description,
              apiCall: {
                method: fb.method,
                path: fb.path,
                body: fb.body,
                responseStatus: createResult.status,
                responseBody: createResult.data,
              },
              resolvedValue: String(value),
              durationMs: createDuration,
            });
            continue;
          }
        }
        steps.push({
          paramName,
          kind: 'chained-create',
          description: fb.description,
          apiCall: {
            method: fb.method,
            path: fb.path,
            body: fb.body,
            responseStatus: createResult.status,
            responseBody: createResult.data,
          },
          error: createResult.error || 'Create fallback failed',
          durationMs: createDuration,
        });
      } else {
        steps.push({
          paramName,
          kind: 'chained-fetch',
          description: resolution.description,
          apiCall: {
            method: 'GET',
            path: config.apiPath,
            params: config.apiParams,
            responseStatus: result.status,
            responseBody: result.data,
          },
          error: config.emptyMessage,
          durationMs: duration,
        });
      }
    }
  }

  return { resolvedValues, steps };
}

/** Extract a value from nested data using dot-notation path (e.g., 'users.0.user_id') */
export function extractValueByPath(data: unknown, path: string): string | undefined {
  const segments = path.split('.');
  let current: unknown = data;
  for (const seg of segments) {
    if (current == null) return undefined;
    const index = Number(seg);
    if (!isNaN(index) && Array.isArray(current)) {
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  return current != null ? String(current) : undefined;
}
