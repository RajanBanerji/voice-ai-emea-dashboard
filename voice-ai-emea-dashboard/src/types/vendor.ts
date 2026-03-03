export interface Compliance {
  gdpr: boolean;
  iso27001: boolean;
  soc2: boolean;
  hipaa: boolean;
  bsi_c5: boolean;
  on_prem: boolean;
}

export interface Vendor {
  name: string;
  hq: string;
  founded: number;
  tier: string;
  overallScore: number;
  emea_compliance: number;
  language_coverage: number;
  latency: number;
  voice_quality: number;
  ease_of_use: number;
  enterprise_fit: number;
  pricing_transparency: number;
  market_sentiment: number;
  color: string;
  one_line_summary: string;
  top_strength: string;
  top_weakness: string;
  compliance: Compliance;
}

export interface MarketGrowth {
  year: number;
  value: number;
}

export interface MarketShare {
  name: string;
  value: number;
}

export interface VerticalAdoption {
  vertical: string;
  Cognigy: number;
  PolyAI: number;
  Parloa: number;
  Synthflow: number;
  Sendbird: number;
  [key: string]: string | number;
}

export interface GapAction {
  id: number;
  priority: 'Critical' | 'High' | 'Medium';
  action: string;
  impact: number;
  status: 'pending' | 'in_progress' | 'done';
}

export type DimensionKey =
  | 'emea_compliance'
  | 'language_coverage'
  | 'latency'
  | 'voice_quality'
  | 'ease_of_use'
  | 'enterprise_fit'
  | 'pricing_transparency';

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  emea_compliance: 'EMEA Compliance',
  language_coverage: 'Language Coverage',
  latency: 'Latency',
  voice_quality: 'Voice Quality',
  ease_of_use: 'Ease of Use',
  enterprise_fit: 'Enterprise Fit',
  pricing_transparency: 'Pricing Transparency',
};

export const DIMENSIONS: DimensionKey[] = [
  'emea_compliance',
  'language_coverage',
  'latency',
  'voice_quality',
  'ease_of_use',
  'enterprise_fit',
  'pricing_transparency',
];
