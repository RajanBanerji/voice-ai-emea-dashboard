import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCredentials } from '../context/CredentialsContext';
import { useSendbirdApi } from '../hooks/useSendbirdApi';

function getCachedCredentials(): { appId: string; apiToken: string } {
  try {
    const raw = localStorage.getItem('sb_credentials');
    if (!raw) return { appId: '', apiToken: '' };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      appId: typeof parsed.appId === 'string' ? parsed.appId : '',
      apiToken: typeof parsed.apiToken === 'string' ? parsed.apiToken : '',
    };
  } catch {
    return { appId: '', apiToken: '' };
  }
}

export default function CredentialGate() {
  const cached = getCachedCredentials();
  const [appId, setAppId] = useState(cached.appId);
  const [apiToken, setApiToken] = useState(cached.apiToken);
  const hasCachedValues = cached.appId !== '' || cached.apiToken !== '';
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
      setError(err instanceof Error ? err.message : 'Failed to validate credentials');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0A1C] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-5">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="#742DDD" />
              <path d="M16 24C16 19.58 19.58 16 24 16h16c4.42 0 8 3.58 8 8v10c0 4.42-3.58 8-8 8h-4l-8 6v-6h-4c-4.42 0-8-3.58-8-8v-10z" fill="white" />
              <circle cx="26" cy="29" r="2.4" fill="#742DDD" />
              <circle cx="32" cy="29" r="2.4" fill="#742DDD" />
              <circle cx="38" cy="29" r="2.4" fill="#742DDD" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Sendbird API Test Suite</h1>
            <p className="text-sm text-gray-400 mt-1">Test and validate your Sendbird integration in minutes</p>
          </div>
        </div>

        {/* What you can do */}
        <div className="bg-[#16132D] border border-[#2E2A52] rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '⚡', title: 'Test APIs', desc: 'Run all Sendbird endpoints with one click' },
            { icon: '🔗', title: 'Webhooks', desc: 'Inspect event payloads for your handler' },
            { icon: '📊', title: 'Performance', desc: 'Track latency and API response times' },
          ].map(item => (
            <div key={item.title} className="space-y-1">
              <div className="text-2xl">{item.icon}</div>
              <p className="text-xs font-semibold text-white">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Setup steps */}
        <div className="bg-[#16132D] border border-[#2E2A52] rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-white">How to get your credentials</p>
          <ol className="space-y-2">
            {[
              { step: '1', text: 'Log in to your Sendbird Dashboard at dashboard.sendbird.com' },
              { step: '2', text: 'Select your application (or create one if you don\'t have one yet)' },
              { step: '3', text: 'Go to Settings → General → find your App ID and Master API Token' },
              { step: '4', text: 'Paste both below and click Connect — your credentials are saved locally only' },
            ].map(item => (
              <li key={item.step} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#742DDD]/20 border border-[#742DDD]/40 text-[#742DDD] text-xs font-bold flex items-center justify-center mt-0.5">
                  {item.step}
                </span>
                <span className="text-sm text-gray-400">{item.text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Credential form */}
        <div className="bg-[#16132D] border border-[#2E2A52] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Connect your Sendbird app</h2>
          {hasCachedValues && (
            <div className="flex items-center gap-2 bg-purple-900/20 border border-purple-700/30 rounded-lg px-3 py-2 mb-4">
              <span className="text-[#742DDD] text-sm">↩</span>
              <p className="text-xs text-purple-300">
                Your previously used credentials have been pre-filled. Just click <span className="font-semibold text-white">Validate & Connect</span> to reconnect.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="appId" className="block text-sm font-medium text-gray-300">
                  App ID
                </label>
                {cached.appId && (
                  <span className="text-[10px] text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded border border-purple-700/30">
                    from cache
                  </span>
                )}
              </div>
              <input
                id="appId"
                type="text"
                value={appId}
                onChange={e => setAppId(e.target.value)}
                placeholder="e.g. 2B525FD3-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-600"
              />
              <p className="text-xs text-gray-600 mt-1">Dashboard → Settings → General → Application ID</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="apiToken" className="block text-sm font-medium text-gray-300">
                  Master API Token
                </label>
                {cached.apiToken && (
                  <span className="text-[10px] text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded border border-purple-700/30">
                    from cache
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="apiToken"
                  type={showToken ? 'text' : 'password'}
                  value={apiToken}
                  onChange={e => setApiToken(e.target.value)}
                  placeholder="Your Master API Token"
                  className="w-full bg-[#0D0A1C] border border-[#2E2A52] rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-600 pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">Dashboard → Settings → General → Master API Token</p>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid || isValidating}
              className="w-full bg-[#742DDD] hover:bg-[#6211C8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isValidating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Validating...
                </>
              ) : (
                'Validate & Connect'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600">
          🔒 Credentials are stored only in your browser's local storage and never sent anywhere else.
        </p>
      </div>
    </div>
  );
}
