import React, { useState } from 'react';
import { useCredentials } from '../context/CredentialsContext';
import { useSendbirdApi } from '../hooks/useSendbirdApi';
import { useTestResults } from '../context/TestResultsContext';
import toast from 'react-hot-toast';

interface CredentialDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CredentialDrawer: React.FC<CredentialDrawerProps> = ({ isOpen, onClose }) => {
  const { credentials, setCredentials, maskedToken } = useCredentials();
  const { validateCredentials } = useSendbirdApi();
  const { clearResults } = useTestResults();

  const [appId, setAppId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [region, setRegion] = useState('US');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!appId.trim() || !apiToken.trim()) return;
    setError('');
    setIsValidating(true);
    const result = await validateCredentials(appId.trim(), apiToken.trim());
    setIsValidating(false);
    if (result.valid) {
      setCredentials(appId.trim(), apiToken.trim(), region, result.appName);
      clearResults();
      toast.success('Credentials updated successfully');
      setAppId('');
      setApiToken('');
      onClose();
    } else {
      setError(result.error || 'Validation failed');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#16132D] border-l border-[#2E2A52] z-50 overflow-y-auto shadow-2xl animate-slide-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">⚙️ API Credentials</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
          </div>

          <div className="mb-6 p-3 bg-[#0D0A1C] rounded-lg border border-[#2E2A52]">
            <p className="text-xs text-gray-500 mb-1">Current App ID</p>
            <p className="text-sm text-gray-300 font-mono">
              {credentials.appId ? credentials.appId.slice(0, 12) + '...' : 'None'}
            </p>
            <p className="text-xs text-gray-500 mt-2 mb-1">Current Token</p>
            <p className="text-sm text-gray-300 font-mono">{maskedToken || 'None'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">New App ID</label>
              <input
                type="text"
                value={appId}
                onChange={e => setAppId(e.target.value)}
                className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter new App ID"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New API Token</label>
              <input
                type="password"
                value={apiToken}
                onChange={e => setApiToken(e.target.value)}
                className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter new API Token"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Region</label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none"
              >
                <option value="US">US</option>
                <option value="EU">EU</option>
                <option value="AP1">AP1</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleValidate}
                disabled={!appId.trim() || !apiToken.trim() || isValidating}
                className="flex-1 py-2.5 bg-[#742DDD] hover:bg-[#6211C8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isValidating ? '🔍 Validating...' : '🔍 Validate New Credentials'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-[#2E2A52] hover:bg-[#332E5C] text-gray-300 text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-yellow-500/80 mt-2">
              ⚠️ Changing credentials will clear all current test results
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CredentialDrawer;
