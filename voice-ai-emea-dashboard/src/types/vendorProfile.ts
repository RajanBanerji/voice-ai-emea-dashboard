export interface Feature {
  name: string;
  category: 'Core Voice' | 'AI & NLU' | 'Integration' | 'Compliance' | 'Analytics';
  vendors: Record<string, '\u2705' | '\u274C' | '\uD83D\uDD04'>; // vendor name -> status
}

export interface RoadmapItem {
  id: number;
  vendor: string;
  item: string;
  quarter: string; // e.g. "Q2 2026"
  status: 'Announced' | 'In Beta' | 'Rumored' | 'GA';
  description: string;
}

export interface PricingTier {
  vendor: string;
  entry: { name: string; price: string; features: string[] };
  mid: { name: string; price: string; features: string[] };
  enterprise: { name: string; price: string; features: string[] };
  pricingModel: string; // e.g. "Per conversation minute", "Per agent seat"
}

export interface CSATData {
  vendor: string;
  g2Rating: number; // out of 5
  g2Reviews: number;
  capterraRating: number;
  capterraReviews: number;
  containmentRate: number; // percentage
  avgLatencyMs: number;
  firstCallResolution: number; // percentage
  csat: number; // percentage
}

export interface FundingRound {
  date: string;
  round: string;
  amount: string;
  investors: string[];
}

export interface FundingData {
  vendor: string;
  totalFunding: string;
  valuation: string;
  burnRisk: 'Low' | 'Medium' | 'High';
  publicPrivate: 'Public' | 'Private';
  founded: number;
  employees: string;
  rounds: FundingRound[];
}

export interface EMEAOffice {
  city: string;
  country: string;
  type: 'HQ' | 'Regional HQ' | 'Office' | 'Data Center';
}

export interface EMEAPresenceData {
  vendor: string;
  offices: EMEAOffice[];
  referenceCustomers: string[];
  partners: string[];
  dataResidency: string[];
  languages: number;
}
