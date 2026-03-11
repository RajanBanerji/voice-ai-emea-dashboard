import React, { useState } from 'react';

const STORAGE_KEY = 'sb_onboarding_dismissed';

const STEPS = [
  {
    number: '1',
    category: 'Applications',
    icon: '⚙️',
    title: 'Verify your connection',
    detail: 'Confirm your App ID and API token are working. If this fails, everything else will too.',
  },
  {
    number: '2',
    category: 'Users',
    icon: '👥',
    title: 'Check your user list',
    detail: 'See if existing users are reachable and that new users can be created.',
  },
  {
    number: '3',
    category: 'Group Channels',
    icon: '💬',
    title: 'Test messaging',
    detail: 'Create a channel, send a message, and verify your core chat flow is working end-to-end.',
  },
  {
    number: '4',
    category: null,
    icon: '🚀',
    title: 'Run the full suite',
    detail: 'Use "Run Full Suite" in the top bar to health-check every API at once and get a summary.',
  },
];

const OnboardingBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="bg-[#16132D] border border-[#742DDD]/40 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 bg-[#742DDD]/10 border-b border-[#742DDD]/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none mt-0.5">👋</span>
          <div>
            <h3 className="text-base font-semibold text-white">You're connected — here's where to start</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Follow these four steps to verify your Sendbird app is healthy.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-600 hover:text-gray-400 text-lg leading-none shrink-0 ml-4 mt-0.5"
          title="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 divide-x divide-[#2E2A52]">
        {STEPS.map((step, i) => (
          <div key={i} className="px-4 py-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#742DDD]/30 border border-[#742DDD]/50 text-[#742DDD] text-[10px] font-bold flex items-center justify-center shrink-0">
                {step.number}
              </span>
              <span className="text-sm">{step.icon}</span>
              <span className="text-sm font-medium text-white truncate">{step.title}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{step.detail}</p>
            {step.category && (
              <p className="text-[10px] text-[#742DDD] font-medium">
                → {step.category} in the sidebar
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-[#2E2A52]/60 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          Click any category in the left sidebar to expand it and run individual tests.
        </p>
        <button
          onClick={handleDismiss}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Got it, don't show again
        </button>
      </div>
    </div>
  );
};

export default OnboardingBanner;
