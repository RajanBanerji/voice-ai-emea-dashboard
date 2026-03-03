import type {
  Feature,
  RoadmapItem,
  PricingTier,
  CSATData,
  FundingData,
  EMEAPresenceData,
} from '../types/vendorProfile';

// ─── Vendor name constants ──────────────────────────────────────────────────
const COGNIGY = 'Cognigy';
const POLYAI = 'PolyAI';
const SYNTHFLOW = 'Synthflow';
const PARLOA = 'Parloa';
const ELEVENLABS = 'ElevenLabs';
const NUANCE = 'Microsoft Nuance';
const SENDBIRD = 'Sendbird';

// ─── Features (25 rows) ────────────────────────────────────────────────────
export const features: Feature[] = [
  // ── Core Voice (8) ──
  {
    name: 'Inbound Voice',
    category: 'Core Voice',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\uD83D\uDD04',
    },
  },
  {
    name: 'Outbound Voice',
    category: 'Core Voice',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\uD83D\uDD04',
    },
  },
  {
    name: 'IVR Replacement',
    category: 'Core Voice',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\uD83D\uDD04',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u274C',
    },
  },
  {
    name: 'Voice Biometrics',
    category: 'Core Voice',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u274C',
      [SYNTHFLOW]: '\u274C',
      [PARLOA]: '\uD83D\uDD04',
      [ELEVENLABS]: '\u2705',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u274C',
    },
  },
  {
    name: 'Call Recording',
    category: 'Core Voice',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'Call Transfer',
    category: 'Core Voice',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\uD83D\uDD04',
    },
  },
  {
    name: 'Voicemail Detection',
    category: 'Core Voice',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u274C',
    },
  },
  {
    name: 'Barge-in Support',
    category: 'Core Voice',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\uD83D\uDD04',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u2705',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },

  // ── AI & NLU (6) ──
  {
    name: 'Custom LLM Integration',
    category: 'AI & NLU',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u2705',
      [NUANCE]: '\uD83D\uDD04',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'Intent Recognition',
    category: 'AI & NLU',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'Sentiment Analysis',
    category: 'AI & NLU',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\uD83D\uDD04',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'Multi-turn Conversations',
    category: 'AI & NLU',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\uD83D\uDD04',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'Entity Extraction',
    category: 'AI & NLU',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'Generative AI Responses',
    category: 'AI & NLU',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u2705',
      [NUANCE]: '\uD83D\uDD04',
      [SENDBIRD]: '\u2705',
    },
  },

  // ── Integration (5) ──
  {
    name: 'Genesys Integration',
    category: 'Integration',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u274C',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u274C',
    },
  },
  {
    name: 'Avaya Integration',
    category: 'Integration',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\uD83D\uDD04',
      [SYNTHFLOW]: '\u274C',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u274C',
    },
  },
  {
    name: 'NICE Integration',
    category: 'Integration',
    vendors: {
      [COGNIGY]: '\uD83D\uDD04',
      [POLYAI]: '\u274C',
      [SYNTHFLOW]: '\u274C',
      [PARLOA]: '\uD83D\uDD04',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u274C',
    },
  },
  {
    name: 'Salesforce Integration',
    category: 'Integration',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'WhatsApp Voice',
    category: 'Integration',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u274C',
      [SYNTHFLOW]: '\uD83D\uDD04',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u274C',
      [SENDBIRD]: '\uD83D\uDD04',
    },
  },

  // ── Compliance (3) ──
  {
    name: 'GDPR Compliant',
    category: 'Compliance',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\uD83D\uDD04',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\uD83D\uDD04',
    },
  },
  {
    name: 'SOC 2 Type II',
    category: 'Compliance',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u274C',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u2705',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'On-Premise Deployment',
    category: 'Compliance',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u274C',
      [SYNTHFLOW]: '\u274C',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u274C',
    },
  },

  // ── Analytics (3) ──
  {
    name: 'Real-time Dashboard',
    category: 'Analytics',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u2705',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'Conversation Analytics',
    category: 'Analytics',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\u2705',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\u2705',
    },
  },
  {
    name: 'Custom Reporting',
    category: 'Analytics',
    vendors: {
      [COGNIGY]: '\u2705',
      [POLYAI]: '\u2705',
      [SYNTHFLOW]: '\uD83D\uDD04',
      [PARLOA]: '\u2705',
      [ELEVENLABS]: '\u274C',
      [NUANCE]: '\u2705',
      [SENDBIRD]: '\uD83D\uDD04',
    },
  },
];

// ─── Roadmap Items (35 items) ───────────────────────────────────────────────
export const roadmapItems: RoadmapItem[] = [
  // ── Sendbird (6) ──
  {
    id: 1,
    vendor: SENDBIRD,
    item: 'EU Data Residency (Frankfurt)',
    quarter: 'Q3 2026',
    status: 'Announced',
    description:
      'Dedicated EU data hosting in Frankfurt AWS region to meet GDPR and data sovereignty requirements for European enterprise customers.',
  },
  {
    id: 2,
    vendor: SENDBIRD,
    item: 'WhatsApp Audio Support',
    quarter: 'Q2 2026',
    status: 'In Beta',
    description:
      'Native WhatsApp voice message handling integrated into Sendbird AI chatbot flows, enabling seamless omnichannel voice experiences.',
  },
  {
    id: 3,
    vendor: SENDBIRD,
    item: 'ISO 27001 Certification',
    quarter: 'Q4 2026',
    status: 'Announced',
    description:
      'Pursuing ISO 27001 certification to strengthen security posture and satisfy enterprise procurement requirements across EMEA.',
  },
  {
    id: 4,
    vendor: SENDBIRD,
    item: 'Genesys Cloud Integration',
    quarter: 'Q1 2027',
    status: 'Rumored',
    description:
      'Potential integration with Genesys Cloud CX platform to enable Sendbird voice AI within existing contact center infrastructure.',
  },
  {
    id: 5,
    vendor: SENDBIRD,
    item: 'Arabic & Turkish Language Pack',
    quarter: 'Q3 2026',
    status: 'Announced',
    description:
      'Expanding language support with dedicated Arabic and Turkish voice models for Middle East and Turkey market penetration.',
  },
  {
    id: 6,
    vendor: SENDBIRD,
    item: 'BSI C5 Certification',
    quarter: 'Q1 2027',
    status: 'Rumored',
    description:
      'German BSI Cloud Computing Compliance Criteria Catalogue certification being explored for German public sector requirements.',
  },

  // ── Cognigy (5) ──
  {
    id: 7,
    vendor: COGNIGY,
    item: 'Agentic AI Orchestration',
    quarter: 'Q2 2026',
    status: 'In Beta',
    description:
      'Multi-agent orchestration framework enabling autonomous AI agents to collaborate on complex customer service workflows.',
  },
  {
    id: 8,
    vendor: COGNIGY,
    item: 'Native Voice Gateway v3',
    quarter: 'Q3 2026',
    status: 'Announced',
    description:
      'Next-generation voice gateway with sub-300ms latency, improved DTMF handling, and enhanced SIP trunk compatibility.',
  },
  {
    id: 9,
    vendor: COGNIGY,
    item: 'NICE CXone Integration',
    quarter: 'Q2 2026',
    status: 'In Beta',
    description:
      'Certified integration with NICE CXone platform for seamless agent handoff and workforce management synchronization.',
  },
  {
    id: 10,
    vendor: COGNIGY,
    item: 'Real-time Agent Copilot',
    quarter: 'Q4 2026',
    status: 'Announced',
    description:
      'AI-powered agent assist providing real-time suggestions, knowledge retrieval, and next-best-action guidance during live calls.',
  },
  {
    id: 11,
    vendor: COGNIGY,
    item: 'Healthcare Compliance Module',
    quarter: 'Q1 2027',
    status: 'Rumored',
    description:
      'HIPAA and EHDS-compliant module designed for healthcare voice automation in European health systems.',
  },

  // ── PolyAI (4) ──
  {
    id: 12,
    vendor: POLYAI,
    item: 'Voice Analytics Dashboard v2',
    quarter: 'Q2 2026',
    status: 'Announced',
    description:
      'Enhanced analytics with conversation intelligence, topic clustering, and automated QA scoring for voice interactions.',
  },
  {
    id: 13,
    vendor: POLYAI,
    item: 'Multi-language Voice Cloning',
    quarter: 'Q3 2026',
    status: 'In Beta',
    description:
      'Cross-lingual voice cloning allowing a single brand voice to speak naturally across 20+ European languages.',
  },
  {
    id: 14,
    vendor: POLYAI,
    item: 'Avaya Cloud Integration',
    quarter: 'Q4 2026',
    status: 'In Beta',
    description:
      'Certified connector for Avaya Experience Platform enabling PolyAI voice assistants within Avaya contact centers.',
  },
  {
    id: 15,
    vendor: POLYAI,
    item: 'Banking Compliance Pack',
    quarter: 'Q3 2026',
    status: 'Announced',
    description:
      'Pre-built compliance workflows for PSD2 Strong Customer Authentication and FCA regulatory voice requirements.',
  },

  // ── Synthflow (4) ──
  {
    id: 16,
    vendor: SYNTHFLOW,
    item: 'Enterprise Self-Service Portal',
    quarter: 'Q2 2026',
    status: 'In Beta',
    description:
      'No-code enterprise portal for managing voice AI agents at scale with role-based access control and team collaboration.',
  },
  {
    id: 17,
    vendor: SYNTHFLOW,
    item: 'SOC 2 Type II Certification',
    quarter: 'Q4 2026',
    status: 'Announced',
    description:
      'Pursuing SOC 2 Type II audit to unlock enterprise procurement pipelines requiring certified security controls.',
  },
  {
    id: 18,
    vendor: SYNTHFLOW,
    item: 'Genesys Cloud Connector',
    quarter: 'Q3 2026',
    status: 'Rumored',
    description:
      'Potential marketplace listing on Genesys AppFoundry to expand reach into enterprise contact center buyers.',
  },
  {
    id: 19,
    vendor: SYNTHFLOW,
    item: 'Advanced Sentiment Engine',
    quarter: 'Q2 2026',
    status: 'In Beta',
    description:
      'Real-time emotion and sentiment detection during voice calls to enable dynamic conversation flow adjustments.',
  },

  // ── Parloa (5) ──
  {
    id: 20,
    vendor: PARLOA,
    item: 'Microsoft Teams Voice Integration',
    quarter: 'Q2 2026',
    status: 'Announced',
    description:
      'Native Microsoft Teams integration for internal employee-facing voice AI assistants and IT helpdesk automation.',
  },
  {
    id: 21,
    vendor: PARLOA,
    item: 'Generative IVR Builder',
    quarter: 'Q3 2026',
    status: 'In Beta',
    description:
      'LLM-powered IVR flow builder that generates conversation trees from plain-language business requirement descriptions.',
  },
  {
    id: 22,
    vendor: PARLOA,
    item: 'UK Data Center Launch',
    quarter: 'Q4 2026',
    status: 'Announced',
    description:
      'Dedicated UK data hosting to address post-Brexit data adequacy requirements for UK financial services customers.',
  },
  {
    id: 23,
    vendor: PARLOA,
    item: 'Outbound Campaign Manager',
    quarter: 'Q2 2026',
    status: 'GA',
    description:
      'Intelligent outbound calling campaigns with lead scoring, optimal timing, and regulatory compliance for EMEA markets.',
  },
  {
    id: 24,
    vendor: PARLOA,
    item: 'Contact Center AI Insights',
    quarter: 'Q1 2027',
    status: 'Rumored',
    description:
      'Predictive analytics module forecasting call volumes, staffing needs, and customer churn from voice interaction patterns.',
  },

  // ── ElevenLabs (5) ──
  {
    id: 25,
    vendor: ELEVENLABS,
    item: 'Conversational AI Platform',
    quarter: 'Q2 2026',
    status: 'GA',
    description:
      'Full conversational AI platform moving beyond TTS to include dialogue management, memory, and tool calling.',
  },
  {
    id: 26,
    vendor: ELEVENLABS,
    item: 'EU Hosting Option',
    quarter: 'Q3 2026',
    status: 'Announced',
    description:
      'European-hosted inference endpoints for voice synthesis to meet data residency requirements for EMEA enterprise clients.',
  },
  {
    id: 27,
    vendor: ELEVENLABS,
    item: 'Telephony Gateway',
    quarter: 'Q4 2026',
    status: 'In Beta',
    description:
      'SIP trunk and PSTN connectivity layer enabling ElevenLabs voices in traditional telephony infrastructure.',
  },
  {
    id: 28,
    vendor: ELEVENLABS,
    item: 'Enterprise Admin Console',
    quarter: 'Q3 2026',
    status: 'Announced',
    description:
      'Centralized administration dashboard with SSO, audit logs, and usage governance for enterprise voice AI deployments.',
  },
  {
    id: 29,
    vendor: ELEVENLABS,
    item: 'Real-time Voice Translation',
    quarter: 'Q1 2027',
    status: 'Rumored',
    description:
      'Live voice-to-voice translation preserving speaker identity and emotion across languages during phone calls.',
  },

  // ── Microsoft Nuance (5) ──
  {
    id: 30,
    vendor: NUANCE,
    item: 'Azure OpenAI Integration',
    quarter: 'Q2 2026',
    status: 'GA',
    description:
      'Deep integration with Azure OpenAI Service for generative AI responses within Nuance Mix dialog flows.',
  },
  {
    id: 31,
    vendor: NUANCE,
    item: 'Copilot for Contact Centers',
    quarter: 'Q3 2026',
    status: 'In Beta',
    description:
      'Microsoft Copilot-powered agent assist bringing GPT-4 capabilities to Nuance contact center solutions.',
  },
  {
    id: 32,
    vendor: NUANCE,
    item: 'Cloud Migration Accelerator',
    quarter: 'Q2 2026',
    status: 'Announced',
    description:
      'Automated tooling to migrate on-premise Nuance deployments to Azure cloud with minimal service disruption.',
  },
  {
    id: 33,
    vendor: NUANCE,
    item: 'Sovereign Cloud Deployment',
    quarter: 'Q4 2026',
    status: 'Announced',
    description:
      'Nuance solutions on Microsoft Cloud for Sovereignty for EU government and regulated industry voice applications.',
  },
  {
    id: 34,
    vendor: NUANCE,
    item: 'Unified Biometrics Platform',
    quarter: 'Q1 2027',
    status: 'In Beta',
    description:
      'Combined voice, behavioral, and conversational biometrics in a single authentication and fraud prevention platform.',
  },
];

// ─── Pricing Data ───────────────────────────────────────────────────────────
export const pricingData: PricingTier[] = [
  {
    vendor: COGNIGY,
    entry: {
      name: 'Business',
      price: '$5,000/mo',
      features: [
        'Up to 10,000 conversations/mo',
        '5 voice agents',
        'Standard NLU',
        'Email support',
        'Pre-built templates',
      ],
    },
    mid: {
      name: 'Professional',
      price: '$15,000/mo',
      features: [
        'Up to 50,000 conversations/mo',
        '25 voice agents',
        'Advanced NLU + LLM',
        'Priority support',
        'Genesys integration',
        'Custom analytics',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: '$50,000+/mo',
      features: [
        'Unlimited conversations',
        'Unlimited agents',
        'On-premise option',
        'Dedicated CSM',
        'All integrations',
        'SLA guarantees',
        'Custom voice models',
      ],
    },
    pricingModel: 'Per conversation session',
  },
  {
    vendor: POLYAI,
    entry: {
      name: 'Growth',
      price: '$10,000/mo',
      features: [
        'Up to 5,000 calls/mo',
        'Single use case',
        'Standard voice',
        'Basic analytics',
        'Onboarding support',
      ],
    },
    mid: {
      name: 'Scale',
      price: '$25,000/mo',
      features: [
        'Up to 25,000 calls/mo',
        'Multi-use case',
        'Custom voice persona',
        'Advanced analytics',
        'Dedicated success team',
        'Genesys integration',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Unlimited calls',
        'All use cases',
        'Bespoke voice design',
        'Full API access',
        'SLA with penalties',
        'On-site implementation',
        'Multi-language support',
      ],
    },
    pricingModel: 'Per resolved conversation',
  },
  {
    vendor: SYNTHFLOW,
    entry: {
      name: 'Starter',
      price: '$500/mo',
      features: [
        '2,000 minutes/mo',
        '3 voice agents',
        'Pre-built templates',
        'Community support',
        'Standard voices',
      ],
    },
    mid: {
      name: 'Pro',
      price: '$2,000/mo',
      features: [
        '10,000 minutes/mo',
        '15 voice agents',
        'Custom LLM integration',
        'Priority support',
        'CRM integrations',
        'A/B testing',
      ],
    },
    enterprise: {
      name: 'Business',
      price: '$5,000/mo',
      features: [
        '50,000 minutes/mo',
        'Unlimited agents',
        'White-label option',
        'API access',
        'Dedicated support',
        'Custom analytics',
        'Salesforce integration',
      ],
    },
    pricingModel: 'Per conversation minute',
  },
  {
    vendor: PARLOA,
    entry: {
      name: 'Professional',
      price: '$8,000/mo',
      features: [
        'Up to 10,000 conversations/mo',
        '10 voice agents',
        'Standard NLU',
        'Basic integrations',
        'Onboarding included',
      ],
    },
    mid: {
      name: 'Business',
      price: '$25,000/mo',
      features: [
        'Up to 50,000 conversations/mo',
        '50 voice agents',
        'Advanced AI features',
        'Contact center integrations',
        'Dedicated CSM',
        'Custom reporting',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Unlimited conversations',
        'Unlimited agents',
        'On-premise available',
        'SLA guarantees',
        'All integrations',
        'Custom voice models',
        'Regulatory compliance pack',
      ],
    },
    pricingModel: 'Per agent seat + usage',
  },
  {
    vendor: ELEVENLABS,
    entry: {
      name: 'Starter',
      price: '$5/mo',
      features: [
        '30,000 characters/mo',
        '10 custom voices',
        'API access',
        'Commercial license',
        'Community support',
      ],
    },
    mid: {
      name: 'Scale',
      price: '$99/mo',
      features: [
        '2,000,000 characters/mo',
        '100 custom voices',
        'Professional voice cloning',
        'Priority support',
        'Higher rate limits',
        'Usage analytics',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: '$330+/mo',
      features: [
        '11,000,000+ characters/mo',
        'Unlimited voices',
        'Dedicated infrastructure',
        'SSO & admin console',
        'SLA guarantees',
        'Priority queue',
        'PVC access',
      ],
    },
    pricingModel: 'Per character / API call',
  },
  {
    vendor: NUANCE,
    entry: {
      name: 'Standard',
      price: '$10,000/mo',
      features: [
        'Up to 10,000 interactions/mo',
        'Nuance Mix essentials',
        'Standard IVR',
        'Basic biometrics',
        'Cloud-hosted',
      ],
    },
    mid: {
      name: 'Professional',
      price: '$30,000/mo',
      features: [
        'Up to 100,000 interactions/mo',
        'Full Nuance Mix',
        'Advanced biometrics',
        'Omnichannel support',
        'Azure integration',
        'Premium support',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Unlimited interactions',
        'On-premise or sovereign cloud',
        'Full biometric suite',
        'All integrations',
        'Dedicated team',
        'Custom SLA',
        'Copilot features',
      ],
    },
    pricingModel: 'Per interaction + platform fee',
  },
  {
    vendor: SENDBIRD,
    entry: {
      name: 'Starter',
      price: '$500/mo',
      features: [
        '1,000 AI message credits/mo',
        'Basic voice AI',
        'Pre-built UI components',
        'Community support',
        'Standard AI models',
      ],
    },
    mid: {
      name: 'Pro',
      price: '$2,000/mo',
      features: [
        '10,000 AI message credits/mo',
        'Advanced voice AI',
        'Custom AI workflows',
        'Priority support',
        'Salesforce integration',
        'Analytics dashboard',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: '$5,000+/mo',
      features: [
        'Unlimited AI credits',
        'Full voice AI suite',
        'Custom LLM integration',
        'Dedicated CSM',
        'SOC 2 compliance',
        'SLA guarantees',
        'Multi-region hosting',
      ],
    },
    pricingModel: 'Per AI message credit',
  },
];

// ─── CSAT / Performance Data ────────────────────────────────────────────────
export const csatData: CSATData[] = [
  {
    vendor: COGNIGY,
    g2Rating: 4.6,
    g2Reviews: 180,
    capterraRating: 4.5,
    capterraReviews: 95,
    containmentRate: 72,
    avgLatencyMs: 450,
    firstCallResolution: 68,
    csat: 84,
  },
  {
    vendor: POLYAI,
    g2Rating: 4.7,
    g2Reviews: 45,
    capterraRating: 4.6,
    capterraReviews: 28,
    containmentRate: 82,
    avgLatencyMs: 380,
    firstCallResolution: 75,
    csat: 88,
  },
  {
    vendor: SYNTHFLOW,
    g2Rating: 4.5,
    g2Reviews: 120,
    capterraRating: 4.4,
    capterraReviews: 75,
    containmentRate: 68,
    avgLatencyMs: 350,
    firstCallResolution: 62,
    csat: 80,
  },
  {
    vendor: PARLOA,
    g2Rating: 4.3,
    g2Reviews: 60,
    capterraRating: 4.2,
    capterraReviews: 35,
    containmentRate: 65,
    avgLatencyMs: 780,
    firstCallResolution: 60,
    csat: 78,
  },
  {
    vendor: ELEVENLABS,
    g2Rating: 4.8,
    g2Reviews: 250,
    capterraRating: 4.7,
    capterraReviews: 180,
    containmentRate: 0, // N/A — not a contact center platform
    avgLatencyMs: 200,
    firstCallResolution: 0, // N/A
    csat: 91,
  },
  {
    vendor: NUANCE,
    g2Rating: 4.1,
    g2Reviews: 310,
    capterraRating: 4.0,
    capterraReviews: 220,
    containmentRate: 70,
    avgLatencyMs: 550,
    firstCallResolution: 66,
    csat: 76,
  },
  {
    vendor: SENDBIRD,
    g2Rating: 4.4,
    g2Reviews: 90,
    capterraRating: 4.3,
    capterraReviews: 55,
    containmentRate: 60,
    avgLatencyMs: 320,
    firstCallResolution: 58,
    csat: 79,
  },
];

// ─── Funding Data ───────────────────────────────────────────────────────────
export const fundingData: FundingData[] = [
  {
    vendor: COGNIGY,
    totalFunding: '$175M',
    valuation: '$1B',
    burnRisk: 'Low',
    publicPrivate: 'Private',
    founded: 2016,
    employees: '400-500',
    rounds: [
      {
        date: '2018-06',
        round: 'Seed',
        amount: '$2.5M',
        investors: ['DN Capital', 'Nordic Makers'],
      },
      {
        date: '2020-03',
        round: 'Series A',
        amount: '$11M',
        investors: ['Insight Partners', 'DN Capital'],
      },
      {
        date: '2021-09',
        round: 'Series B',
        amount: '$44M',
        investors: ['Insight Partners', 'DTCP', 'DN Capital'],
      },
      {
        date: '2023-12',
        round: 'Series C',
        amount: '$100M',
        investors: ['Eurazeo', 'Insight Partners', 'DTCP'],
      },
    ],
  },
  {
    vendor: POLYAI,
    totalFunding: '$70M',
    valuation: '$500M',
    burnRisk: 'Medium',
    publicPrivate: 'Private',
    founded: 2017,
    employees: '200-300',
    rounds: [
      {
        date: '2019-07',
        round: 'Seed',
        amount: '$4M',
        investors: ['Point72 Ventures', 'Sands Capital'],
      },
      {
        date: '2021-10',
        round: 'Series B',
        amount: '$14M',
        investors: ['Khosla Ventures', 'Point72 Ventures'],
      },
      {
        date: '2023-09',
        round: 'Series C',
        amount: '$50M',
        investors: ['NVP', 'Khosla Ventures', 'Point72 Ventures'],
      },
    ],
  },
  {
    vendor: SYNTHFLOW,
    totalFunding: '$10M',
    valuation: '$100M',
    burnRisk: 'Medium',
    publicPrivate: 'Private',
    founded: 2023,
    employees: '30-50',
    rounds: [
      {
        date: '2023-08',
        round: 'Pre-Seed',
        amount: '$1.5M',
        investors: ['Y Combinator', 'Angel investors'],
      },
      {
        date: '2024-06',
        round: 'Seed',
        amount: '$8.5M',
        investors: ['a16z', 'Y Combinator', 'Craft Ventures'],
      },
    ],
  },
  {
    vendor: PARLOA,
    totalFunding: '$92M',
    valuation: '$500M',
    burnRisk: 'Medium',
    publicPrivate: 'Private',
    founded: 2018,
    employees: '250-350',
    rounds: [
      {
        date: '2021-04',
        round: 'Series A',
        amount: '$20M',
        investors: ['EQT Ventures', 'Newion'],
      },
      {
        date: '2023-06',
        round: 'Series B',
        amount: '$66M',
        investors: ['Altimeter Capital', 'EQT Ventures', 'Newion'],
      },
    ],
  },
  {
    vendor: ELEVENLABS,
    totalFunding: '$180M',
    valuation: '$3.3B',
    burnRisk: 'Low',
    publicPrivate: 'Private',
    founded: 2022,
    employees: '150-200',
    rounds: [
      {
        date: '2023-01',
        round: 'Seed',
        amount: '$2M',
        investors: ['Credo Ventures', 'Concept Ventures'],
      },
      {
        date: '2023-06',
        round: 'Series A',
        amount: '$19M',
        investors: ['Nat Friedman', 'Daniel Gross', 'a16z'],
      },
      {
        date: '2024-01',
        round: 'Series B',
        amount: '$80M',
        investors: [
          'a16z',
          'Nat Friedman',
          'Daniel Gross',
          'Sequoia Capital',
        ],
      },
      {
        date: '2024-12',
        round: 'Series C',
        amount: '$80M',
        investors: ['ICONIQ Growth', 'a16z', 'Sequoia Capital'],
      },
    ],
  },
  {
    vendor: NUANCE,
    totalFunding: '$19.7B (Microsoft acquisition)',
    valuation: '$19.7B',
    burnRisk: 'Low',
    publicPrivate: 'Public',
    founded: 1992,
    employees: '6,000-7,000',
    rounds: [
      {
        date: '2000-04',
        round: 'IPO',
        amount: '$150M',
        investors: ['Public markets'],
      },
      {
        date: '2021-04',
        round: 'Acquisition',
        amount: '$19.7B',
        investors: ['Microsoft'],
      },
    ],
  },
  {
    vendor: SENDBIRD,
    totalFunding: '$221M',
    valuation: '$1B+',
    burnRisk: 'Low',
    publicPrivate: 'Private',
    founded: 2013,
    employees: '300-400',
    rounds: [
      {
        date: '2019-05',
        round: 'Series B',
        amount: '$52M',
        investors: ['ICONIQ Growth', 'Tiger Global', 'Shasta Ventures'],
      },
      {
        date: '2021-04',
        round: 'Series C',
        amount: '$100M',
        investors: ['Steadfast Capital', 'Tiger Global', 'ICONIQ Growth'],
      },
      {
        date: '2022-04',
        round: 'Series C Extension',
        amount: '$69M',
        investors: ['Softbank Vision Fund 2', 'ICONIQ Growth'],
      },
    ],
  },
];

// ─── EMEA Presence Data ─────────────────────────────────────────────────────
export const emeaPresenceData: EMEAPresenceData[] = [
  {
    vendor: COGNIGY,
    offices: [
      { city: 'Dusseldorf', country: 'Germany', type: 'HQ' },
      { city: 'Berlin', country: 'Germany', type: 'Office' },
      { city: 'London', country: 'UK', type: 'Office' },
    ],
    referenceCustomers: [
      'Lufthansa',
      'Bosch',
      'Henkel',
      'Toyota Financial Services',
      'E.ON',
    ],
    partners: [
      'Genesys',
      'Avaya',
      'Deloitte Digital',
      'Accenture',
    ],
    dataResidency: ['Frankfurt (AWS)', 'Dublin (Azure)', 'Dusseldorf (on-prem)'],
    languages: 50,
  },
  {
    vendor: POLYAI,
    offices: [
      { city: 'London', country: 'UK', type: 'HQ' },
    ],
    referenceCustomers: [
      'Caesars Entertainment',
      'Whitbread (Premier Inn)',
      'Greene King',
      'Carnival UK',
    ],
    partners: ['Genesys', 'Five9', 'Talkdesk'],
    dataResidency: ['London (AWS)', 'Dublin (AWS)'],
    languages: 12,
  },
  {
    vendor: SYNTHFLOW,
    offices: [
      { city: 'Berlin', country: 'Germany', type: 'HQ' },
    ],
    referenceCustomers: [
      'Dental clinics (DACH)',
      'SME insurance brokers',
      'PropTech startups',
    ],
    partners: ['Make (Integromat)', 'Zapier', 'HubSpot'],
    dataResidency: ['Frankfurt (AWS)', 'US East (AWS)'],
    languages: 20,
  },
  {
    vendor: PARLOA,
    offices: [
      { city: 'Berlin', country: 'Germany', type: 'HQ' },
      { city: 'Munich', country: 'Germany', type: 'Office' },
    ],
    referenceCustomers: [
      'German Red Cross',
      'Swiss Life',
      'Decathlon Germany',
      'HSE',
      'Consolidated Bathrooms',
    ],
    partners: ['Genesys', 'Microsoft', 'Salesforce', 'SAP'],
    dataResidency: ['Frankfurt (Azure)', 'Berlin (on-prem)'],
    languages: 25,
  },
  {
    vendor: ELEVENLABS,
    offices: [],
    referenceCustomers: [
      'Storytel',
      'The Washington Post',
      'Paradox Interactive',
      'Duolingo',
    ],
    partners: ['HubSpot', 'Zapier', 'Twilio'],
    dataResidency: ['US (GCP)', 'EU endpoint planned'],
    languages: 70,
  },
  {
    vendor: NUANCE,
    offices: [
      { city: 'London', country: 'UK', type: 'Regional HQ' },
      { city: 'Dublin', country: 'Ireland', type: 'Office' },
      { city: 'Aachen', country: 'Germany', type: 'Office' },
      { city: 'Amsterdam', country: 'Netherlands', type: 'Data Center' },
      { city: 'Paris', country: 'France', type: 'Office' },
    ],
    referenceCustomers: [
      'HSBC',
      'Telefonica',
      'Vodafone',
      'ING Bank',
      'NHS 111',
    ],
    partners: ['Microsoft', 'Genesys', 'Avaya', 'NICE'],
    dataResidency: [
      'Amsterdam (Azure)',
      'Dublin (Azure)',
      'London (Azure)',
      'Frankfurt (Azure)',
    ],
    languages: 40,
  },
  {
    vendor: SENDBIRD,
    offices: [],
    referenceCustomers: [
      'Virgin Mobile UAE',
      'Careem',
      'Delivery Hero',
    ],
    partners: ['Salesforce', 'HubSpot', 'Zendesk'],
    dataResidency: ['US (AWS)', 'Singapore (AWS)', 'Frankfurt planned'],
    languages: 29,
  },
];
