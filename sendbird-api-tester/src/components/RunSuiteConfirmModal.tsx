import React from 'react';

interface RunSuiteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  includeDestructive: boolean;
}

const RunSuiteConfirmModal: React.FC<RunSuiteConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  includeDestructive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#16132D] border border-[#2E2A52] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-4">
          <div className="w-10 h-10 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">This will make real changes to your app</h2>
            <p className="text-sm text-gray-400 mt-1">
              Running the full suite sends live API calls to your Sendbird application — not a sandbox.
            </p>
          </div>
        </div>

        {/* What will happen */}
        <div className="px-6 pb-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What this will do</p>
          <ul className="space-y-2">
            {[
              { icon: '👤', text: 'Create test users in your user list' },
              { icon: '💬', text: 'Create test channels with messages' },
              { icon: '📢', text: 'Send messages in those channels' },
              { icon: '🔔', text: 'Modify push notification settings' },
              ...(includeDestructive
                ? [{ icon: '🗑️', text: 'Delete some of the created test data (destructive mode is on)' }]
                : [{ icon: '⚠️', text: 'Test data (users, channels) will remain in your app afterward' }]
              ),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="shrink-0 text-base leading-5">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <div className="bg-amber-900/15 border border-amber-700/30 rounded-lg px-3 py-2.5 text-xs text-amber-300">
            <strong>Tip:</strong> To clean up afterward, visit your Sendbird Dashboard → Users and filter by the <code className="bg-black/20 px-1 rounded">test_</code> prefix.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-[#252145] hover:bg-[#2E2A52] border border-[#2E2A52] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#742DDD] hover:bg-[#6211C8] transition-colors"
          >
            Run Full Suite
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunSuiteConfirmModal;
