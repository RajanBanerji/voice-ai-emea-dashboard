import { useState, useCallback } from 'react';
import type { DebugAnalysis } from '../context/TestResultsContext';

export function useDebugAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeFailure = useCallback(async (
    endpoint: string,
    method: string,
    requestPayload: unknown,
    responseStatus: number,
    responseBody: unknown,
    errorMessage: string
  ): Promise<DebugAnalysis | null> => {
    setIsAnalyzing(true);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
    if (!apiKey) {
      setIsAnalyzing(false);
      return generateFallbackAnalysis(responseStatus, errorMessage);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a Sendbird Platform API debugging expert with deep knowledge of the Sendbird API docs at docs.sendbird.com.

A developer got an API failure. Analyze it and provide structured debugging guidance.

Endpoint: ${method} ${endpoint}
HTTP Status: ${responseStatus}
Request Payload: ${JSON.stringify(requestPayload, null, 2)}
Error Response: ${JSON.stringify(responseBody, null, 2)}
Error Message: ${errorMessage}

Respond ONLY with a JSON object (no markdown) with these fields:
{
  "root_cause": "One sentence explaining the exact root cause",
  "explanation": "2-3 sentences explaining what went wrong technically",
  "fix_steps": ["step 1", "step 2", "step 3"],
  "correct_payload_example": { ...corrected payload JSON if applicable... },
  "sendbird_doc_reference": "Relevant docs.sendbird.com section name",
  "common_mistakes": ["mistake 1", "mistake 2"],
  "is_auth_issue": boolean,
  "is_payload_issue": boolean,
  "is_rate_limit": boolean,
  "is_permission_issue": boolean,
  "severity": "low|medium|high|critical"
}`,
          }],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const parsed = JSON.parse(text) as DebugAnalysis;
      return parsed;
    } catch {
      return generateFallbackAnalysis(responseStatus, errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { analyzeFailure, isAnalyzing };
}

function generateFallbackAnalysis(status: number, errorMessage: string): DebugAnalysis {
  const isAuth = status === 401 || status === 403;
  const isRateLimit = status === 429;
  const isPayload = status === 400;

  let rootCause = 'The API returned an error response.';
  let explanation = `HTTP ${status} was returned. ${errorMessage}`;
  const fixSteps: string[] = [];

  if (isAuth) {
    rootCause = 'Authentication failed — the API token may be invalid or expired.';
    explanation = 'The server rejected the provided API token. This typically means the token is wrong, expired, or lacks necessary permissions.';
    fixSteps.push('Verify your API token in Sendbird Dashboard → Settings → General');
    fixSteps.push('Ensure the token has the necessary permissions for this endpoint');
    fixSteps.push('Generate a new token if the current one has expired');
  } else if (isRateLimit) {
    rootCause = 'Rate limit exceeded — too many requests sent in a short period.';
    explanation = 'Sendbird enforces rate limits (~30 requests/second). The test suite sent too many requests too quickly.';
    fixSteps.push('Wait a few seconds before retrying');
    fixSteps.push('Reduce the frequency of API calls');
    fixSteps.push('The test suite will auto-retry after 5 seconds');
  } else if (isPayload) {
    rootCause = 'Bad request — the request payload is malformed or missing required fields.';
    explanation = `The server could not process the request. Error: ${errorMessage}`;
    fixSteps.push('Check that all required fields are included in the request body');
    fixSteps.push('Verify field values match the expected types (string, number, etc.)');
    fixSteps.push('Review the Sendbird API docs for this endpoint');
  } else {
    fixSteps.push('Check the Sendbird API documentation for this endpoint');
    fixSteps.push('Verify the request parameters and body are correct');
    fixSteps.push('Try the request with minimal parameters first');
  }

  return {
    root_cause: rootCause,
    explanation,
    fix_steps: fixSteps,
    sendbird_doc_reference: 'Platform API Documentation',
    common_mistakes: ['Invalid or expired API token', 'Missing required fields', 'Incorrect field types'],
    is_auth_issue: isAuth,
    is_payload_issue: isPayload,
    is_rate_limit: isRateLimit,
    is_permission_issue: status === 403,
    severity: isAuth || isRateLimit ? 'high' : isPayload ? 'medium' : 'low',
  };
}
