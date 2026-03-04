import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCredentials } from '../context/CredentialsContext';
import { useSendbirdApi } from '../hooks/useSendbirdApi';

export default function CredentialGate() {
  const [appId, setAppId] = useState('');
  const [apiToken, setApiToken] = useState('');

  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const { setCredentials } = useCredentials();
  const { validateCredentials } = useSendbirdApi();

  const isFormValid = appId.trim() !== '' && apiToken.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const result = await validateCredentials(appId.trim(), apiToken.trim());
      if (result.valid) {
        setCredentials(appId.trim(), apiToken.trim(), 'US', result.appName ?? '');
        toast.success('Connected to Sendbird successfully!');
      } else {
        setError(result.error || 'Validation failed');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to validate credentials';
      setError(message);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0A1C] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#16132D] border border-[#2E2A52] rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="#742DDD" />
              <path d="M16 24C16 19.58 19.58 16 24 16h16c4.42 0 8 3.58 8 8v10c0 4.42-3.58 8-8 8h-4l-8 6v-6h-4c-4.42 0-8-3.58-8-8v-10z" fill="white" />
              <circle cx="26" cy="29" r="2.4" fill="#742DDD" />
              <circle cx="32" cy="29" r="2.4" fill="#742DDD" />
              <circle cx="38" cy="29" r="2.4" fill="#742DDD" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Sendbird API Test Suite
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* App ID */}
          <div>
            <label
              htmlFor="appId"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              App ID
            </label>
            <input
              id="appId"
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="Enter your Sendbird App ID"
              className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* API Token */}
          <div>
            <label
              htmlFor="apiToken"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              API Token
            </label>
            <div className="relative">
              <input
                id="apiToken"
                type={showToken ? 'text' : 'password'}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your API Token"
                className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-sm"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isFormValid || isValidating}
            className="w-full bg-[#742DDD] hover:bg-[#6211C8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Validating...
              </>
            ) : (
              'Validate & Connect'
            )}
          </button>
        </form>

        {/* Info note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Find these in Sendbird Dashboard &rarr; Settings &rarr; General &rarr;
          API
        </p>
      </div>
    </div>
  );
}
