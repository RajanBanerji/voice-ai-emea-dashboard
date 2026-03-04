import { useState, useMemo, useCallback } from 'react';
import { DEPENDENCY_REGISTRY, extractValueByPath } from '../data/dependencyRegistry';
import type { ParamResolution } from '../data/dependencyRegistry';
import type { EndpointDef } from '../data/endpoints';
import type { ApiCallResult } from './useSendbirdApi';

export type ResolveStepStatus = 'pending' | 'resolving' | 'resolved' | 'error';

export interface ResolveStep {
  paramName: string;
  label: string;
  description: string;
  status: ResolveStepStatus;
  resolvedValue?: string;
  error?: string;
  apiPath?: string;
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

function buildSteps(
  unresolvedParams: string[],
  category: string
): ResolveStep[] {
  const sorted = topologicalSort(unresolvedParams, category);
  return sorted.map(paramName => {
    const factory = DEPENDENCY_REGISTRY[paramName];
    if (!factory) {
      return {
        paramName,
        label: paramName,
        description: 'No resolver available for this parameter.',
        status: 'error' as const,
        error: 'Unknown parameter — fill in manually.',
      };
    }
    const resolution = factory(category);
    return {
      paramName,
      label: resolution.label,
      description: resolution.description,
      status: 'pending' as const,
      apiPath: resolution.kind === 'api' ? resolution.apiPath : undefined,
    };
  });
}

export function useDependencyResolver(
  endpoint: EndpointDef,
  paramValues: Record<string, string>,
  callApi: (method: string, path: string, params?: Record<string, unknown>, body?: Record<string, unknown> | null) => Promise<ApiCallResult>
) {
  const [steps, setSteps] = useState<ResolveStep[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  const unresolvedParams = useMemo(() => {
    return endpoint.params
      .filter(p => p.isPathParam && (!paramValues[p.name] || paramValues[p.name] === ''))
      .map(p => p.name)
      .filter(name => DEPENDENCY_REGISTRY[name] != null);
  }, [endpoint.params, paramValues]);

  const hasUnresolved = unresolvedParams.length > 0;

  const currentSteps = useMemo(() => {
    if (!hasUnresolved) return [];
    return buildSteps(unresolvedParams, endpoint.category);
  }, [unresolvedParams, endpoint.category, hasUnresolved]);

  const resolveAll = useCallback(async (): Promise<Record<string, string>> => {
    const resolvedValues: Record<string, string> = {};
    const freshSteps = buildSteps(unresolvedParams, endpoint.category);
    setSteps(freshSteps);
    setIsResolving(true);

    for (let i = 0; i < freshSteps.length; i++) {
      const step = freshSteps[i];
      const factory = DEPENDENCY_REGISTRY[step.paramName];
      if (!factory) continue;

      // Mark resolving
      setSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: 'resolving' as const } : s
      ));

      const resolution: ParamResolution = factory(endpoint.category);

      if (resolution.kind === 'static') {
        resolvedValues[step.paramName] = resolution.defaultValue;
        setSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: 'resolved' as const, resolvedValue: resolution.defaultValue } : s
        ));
        continue;
      }

      if (resolution.kind === 'api') {
        const result = await callApi('GET', resolution.apiPath, resolution.apiParams ?? {}, null);
        if (result.success) {
          const value = extractValueByPath(result.data, resolution.extractPath);
          if (value) {
            resolvedValues[step.paramName] = value;
            setSteps(prev => prev.map((s, idx) =>
              idx === i ? { ...s, status: 'resolved' as const, resolvedValue: value } : s
            ));
          } else {
            setSteps(prev => prev.map((s, idx) =>
              idx === i ? { ...s, status: 'error' as const, error: resolution.emptyMessage } : s
            ));
            setIsResolving(false);
            return resolvedValues;
          }
        } else {
          setSteps(prev => prev.map((s, idx) =>
            idx === i ? { ...s, status: 'error' as const, error: result.error || 'API call failed' } : s
          ));
          setIsResolving(false);
          return resolvedValues;
        }
        continue;
      }

      if (resolution.kind === 'chained') {
        // Merge already-resolved values with current param values
        const merged = { ...paramValues, ...resolvedValues };
        const config = resolution.getApiConfig(merged);
        const result = await callApi('GET', config.apiPath, config.apiParams ?? {}, null);
        if (result.success) {
          const value = extractValueByPath(result.data, config.extractPath);
          if (value) {
            resolvedValues[step.paramName] = value;
            setSteps(prev => prev.map((s, idx) =>
              idx === i ? { ...s, status: 'resolved' as const, resolvedValue: value } : s
            ));
          } else {
            setSteps(prev => prev.map((s, idx) =>
              idx === i ? { ...s, status: 'error' as const, error: config.emptyMessage } : s
            ));
            setIsResolving(false);
            return resolvedValues;
          }
        } else {
          setSteps(prev => prev.map((s, idx) =>
            idx === i ? { ...s, status: 'error' as const, error: result.error || 'API call failed' } : s
          ));
          setIsResolving(false);
          return resolvedValues;
        }
      }
    }

    setIsResolving(false);
    return resolvedValues;
  }, [unresolvedParams, endpoint.category, paramValues, callApi]);

  // Use live steps during resolution, otherwise use computed steps
  const displaySteps = isResolving || steps.length > 0 ? steps : currentSteps;

  return { steps: displaySteps, isResolving, hasUnresolved, resolveAll };
}
