import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpItem {
  label: string;
  color?: string;
  description: string;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

const SECTIONS: HelpSection[] = [
  {
    title: 'Top Bar',
    items: [
      {
        label: '▶ Run Full Suite',
        color: 'bg-[#742DDD] text-white',
        description: 'Runs every endpoint across all categories sequentially. Skips destructive endpoints unless "Include destructive" is checked.',
      },
      {
        label: '📋 Export',
        color: 'bg-[#252145] text-gray-300',
        description: 'Downloads all test results as a JSON file for sharing or archiving.',
      },
      {
        label: '⚙️ Credentials',
        color: 'bg-[#252145] text-gray-300',
        description: 'Opens the credentials drawer to update your App ID or Master API Token.',
      },
      {
        label: '☀️ / 🌙',
        color: 'bg-[#252145] text-gray-300',
        description: 'Toggles between dark and light mode.',
      },
      {
        label: 'Ping (ms)',
        color: 'bg-green-900/40 text-green-400',
        description: 'Live latency from your browser to your Sendbird app. Green < 200ms, Yellow < 500ms, Red ≥ 500ms.',
      },
    ],
  },
  {
    title: 'Category Panel',
    items: [
      {
        label: '▶ Run All',
        color: 'bg-[#742DDD] text-white',
        description: 'Runs all endpoints in the selected category in sequence.',
      },
      {
        label: 'Clear',
        color: 'bg-[#2E2A52] text-gray-300',
        description: 'Removes all test results for the current category, resetting every card to Pending.',
      },
      {
        label: 'Include destructive',
        color: 'bg-[#0D0A1C] text-gray-300',
        description: 'Checkbox. When unchecked (default), DELETE and other irreversible endpoints are skipped during Run All and Run Full Suite. Check it only when you want to test those endpoints.',
      },
      {
        label: 'Pause',
        color: 'bg-yellow-600 text-white',
        description: 'Pauses a running batch test after the current endpoint finishes.',
      },
      {
        label: 'Resume',
        color: 'bg-green-600 text-white',
        description: 'Continues a paused batch test from where it left off.',
      },
      {
        label: 'Cancel',
        color: 'bg-red-600 text-white',
        description: 'Stops a running batch test immediately. Already-completed results are kept.',
      },
    ],
  },
  {
    title: 'Test Card — Actions',
    items: [
      {
        label: 'Run Test',
        color: 'bg-[#742DDD] text-white',
        description: 'Calls the endpoint once using the params and body you have filled in.',
      },
      {
        label: 'Resolve & Run',
        color: 'bg-amber-600 text-white',
        description: 'Appears when required path params (e.g. channel_url, user_id) are missing. Automatically fetches those values from Sendbird, fills them in, then runs the test.',
      },
      {
        label: 'Resolve Only',
        color: 'bg-[#252145] text-gray-300',
        description: 'Fetches and fills in the missing prerequisite values without running the test — useful when you want to review the values first.',
      },
      {
        label: 'Auto-Resolve & Run',
        color: 'bg-amber-500 text-white',
        description: 'One-click version inside the prerequisites panel: resolves all dependencies and immediately runs the test.',
      },
      {
        label: 'Reset Params',
        color: 'bg-[#252145] text-gray-300',
        description: 'Restores all parameter fields to their default values.',
      },
      {
        label: 'Reset (body)',
        color: 'bg-transparent text-gray-400',
        description: 'Restores the request body JSON to its default template.',
      },
      {
        label: 'Copy cURL',
        color: 'bg-[#252145] text-gray-300',
        description: 'Copies an equivalent curl command (with your API token and current params) to the clipboard.',
      },
    ],
  },
  {
    title: 'Test Card — Status Badges',
    items: [
      {
        label: 'Pending',
        color: 'bg-gray-600 text-white',
        description: 'The test has not been run yet.',
      },
      {
        label: 'Running',
        color: 'bg-[#742DDD] text-white animate-pulse',
        description: 'The API call is in progress.',
      },
      {
        label: 'Pass',
        color: 'bg-green-600 text-white',
        description: 'The endpoint returned a 2xx response — test succeeded.',
      },
      {
        label: 'Fail',
        color: 'bg-red-600 text-white',
        description: 'The endpoint returned a 4xx/5xx response or a network error occurred.',
      },
      {
        label: 'Skipped',
        color: 'bg-yellow-600 text-white',
        description: 'The test was skipped during a batch run because it is destructive and "Include destructive" was off.',
      },
    ],
  },
  {
    title: 'Parameter Badges',
    items: [
      {
        label: 'Path',
        color: 'bg-purple-900/50 text-purple-300 border border-purple-700',
        description: 'This parameter is embedded in the URL path (e.g. /v3/users/{user_id}). It must be filled before the request can be sent.',
      },
      {
        label: 'Required',
        color: 'bg-red-900/50 text-red-300 border border-red-700',
        description: 'This parameter is mandatory. Leaving it blank will cause the API call to fail.',
      },
      {
        label: 'Optional',
        color: 'bg-gray-800 text-gray-400 border border-gray-700',
        description: 'This parameter can be left empty. The API will use its default behaviour without it.',
      },
    ],
  },
];

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#16132D] border border-[#2E2A52] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2E2A52] sticky top-0 bg-[#16132D]">
          <h2 className="text-lg font-semibold text-white">Help — Button Reference</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sections */}
        <div className="px-6 py-5 space-y-8">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.items.map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span
                      className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${item.color ?? ''}`}
                    >
                      {item.label}
                    </span>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
