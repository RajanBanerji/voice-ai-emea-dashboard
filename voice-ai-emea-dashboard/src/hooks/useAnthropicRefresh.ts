import { useState } from 'react';
import type { Vendor } from '../types/vendor';

interface UseAnthropicRefreshReturn {
  refreshData: () => Promise<Vendor[] | undefined>;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function useAnthropicRefresh(_vendors: Vendor[]): UseAnthropicRefreshReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refreshData = async (): Promise<Vendor[] | undefined> => {
    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      setError('Missing VITE_ANTHROPIC_API_KEY environment variable');
      setLoading(false);
      return undefined;
    }

    const prompt = `You are a competitive intelligence analyst for voice AI platforms in the EMEA market as of ${new Date().toDateString()}.
Return a JSON object with updated competitive scores for these 7 platforms: Cognigy, Parloa, PolyAI, Synthflow, ElevenLabs, Microsoft Nuance, Sendbird.
For each vendor return scores out of 10 for: overallScore, emea_compliance, language_coverage, latency, voice_quality, ease_of_use, enterprise_fit, pricing_transparency, market_sentiment.
Also return: one_line_summary (max 15 words), top_strength (max 20 words), top_weakness (max 20 words).
Base scores on publicly known analyst reports (Gartner, Forrester), user reviews (G2, Capterra), and market presence in EMEA.
Sendbird voice AI launched August 2025 and has limited EMEA presence. Cognigy is Gartner Magic Quadrant Leader 2025.
Return ONLY a valid JSON array named "vendors". No markdown, no explanation.`;

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
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text: string = data.content[0].text;
      const parsed = JSON.parse(text);
      const vendorData: Vendor[] = parsed.vendors;

      setLastUpdated(new Date().toISOString());
      setLoading(false);
      return vendorData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setLoading(false);
      return undefined;
    }
  };

  return { refreshData, loading, error, lastUpdated };
}
