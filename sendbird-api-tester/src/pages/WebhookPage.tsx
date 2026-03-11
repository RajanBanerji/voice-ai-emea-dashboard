import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useCredentials } from '../context/CredentialsContext';
import JsonViewer from '../components/JsonViewer';

// ─── Static reference data ────────────────────────────────────────────────────

interface WebhookEvent {
  id: string;
  name: string;
  description: string;
  trigger: string;
  payload: Record<string, unknown>;
}

interface WebhookCategory {
  name: string;
  icon: string;
  events: WebhookEvent[];
}

const WEBHOOK_CATEGORIES: WebhookCategory[] = [
  {
    name: 'Messages',
    icon: '💬',
    events: [
      {
        id: 'message_send',
        name: 'message:send',
        description: 'Fires when a user sends a message in any channel.',
        trigger: 'A user calls the Send Message API or sends via SDK',
        payload: {
          category: 'message:send',
          sender: { user_id: 'user_001', nickname: 'Alice', profile_url: '' },
          silent: false,
          sender_ip_addr: '192.168.1.1',
          custom_type: '',
          mention_type: 'users',
          mentioned_users: [],
          type: 'MESG',
          payload: {
            message_id: 1234567,
            type: 'MESG',
            message: 'Hello, world!',
            custom_type: '',
            data: '',
            translations: {},
            mention_type: 'users',
            mentioned_users: [],
            created_at: 1700000000000,
            updated_at: 0,
          },
          channel: {
            channel_url: 'sendbird_group_channel_xxxx',
            name: 'My Channel',
            custom_type: '',
            is_distinct: false,
            is_public: false,
            is_super: false,
          },
          sdk: 'JavaScript',
          app_id: '2B525FD3-XXXX',
        },
      },
      {
        id: 'message_delete',
        name: 'message:delete',
        description: 'Fires when a message is deleted.',
        trigger: 'A user or admin calls the Delete Message API',
        payload: {
          category: 'message:delete',
          channel: { channel_url: 'sendbird_group_channel_xxxx', channel_type: 'group' },
          msg_id: 1234567,
          message_type: 'MESG',
          app_id: '2B525FD3-XXXX',
        },
      },
    ],
  },
  {
    name: 'Users',
    icon: '👥',
    events: [
      {
        id: 'user_block',
        name: 'user:block',
        description: 'Fires when a user blocks another user.',
        trigger: 'A user calls the Block User API',
        payload: {
          category: 'user:block',
          blocker: { user_id: 'user_001', nickname: 'Alice' },
          blockee: { user_id: 'user_002', nickname: 'Bob' },
          app_id: '2B525FD3-XXXX',
        },
      },
      {
        id: 'user_unblock',
        name: 'user:unblock',
        description: 'Fires when a user unblocks another user.',
        trigger: 'A user calls the Unblock User API',
        payload: {
          category: 'user:unblock',
          blocker: { user_id: 'user_001', nickname: 'Alice' },
          blockee: { user_id: 'user_002', nickname: 'Bob' },
          app_id: '2B525FD3-XXXX',
        },
      },
    ],
  },
  {
    name: 'Group Channels',
    icon: '🏠',
    events: [
      {
        id: 'group_channel_create',
        name: 'group_channel:create',
        description: 'Fires when a new group channel is created.',
        trigger: 'Any user or admin creates a group channel',
        payload: {
          category: 'group_channel:create',
          channel: {
            channel_url: 'sendbird_group_channel_xxxx',
            name: 'New Channel',
            custom_type: '',
            is_distinct: false,
            is_public: false,
            is_super: false,
            created_at: 1700000000000,
            member_count: 2,
          },
          inviter: { user_id: 'user_001', nickname: 'Alice' },
          invitees: [{ user_id: 'user_002', nickname: 'Bob' }],
          app_id: '2B525FD3-XXXX',
        },
      },
      {
        id: 'group_channel_invite',
        name: 'group_channel:invite',
        description: 'Fires when users are invited to a group channel.',
        trigger: 'A member invites new users to an existing channel',
        payload: {
          category: 'group_channel:invite',
          channel: { channel_url: 'sendbird_group_channel_xxxx', name: 'My Channel' },
          inviter: { user_id: 'user_001', nickname: 'Alice' },
          invitees: [{ user_id: 'user_003', nickname: 'Carol' }],
          app_id: '2B525FD3-XXXX',
        },
      },
      {
        id: 'group_channel_leave',
        name: 'group_channel:leave',
        description: 'Fires when a member leaves a group channel.',
        trigger: 'A user calls the Leave Channel API or is removed by an operator',
        payload: {
          category: 'group_channel:leave',
          channel: { channel_url: 'sendbird_group_channel_xxxx', name: 'My Channel' },
          leavers: [{ user_id: 'user_002', nickname: 'Bob' }],
          app_id: '2B525FD3-XXXX',
        },
      },
    ],
  },
  {
    name: 'Open Channels',
    icon: '#️⃣',
    events: [
      {
        id: 'open_channel_enter',
        name: 'open_channel:enter',
        description: 'Fires when a user enters an open channel.',
        trigger: 'A user connects to and enters an open channel via SDK',
        payload: {
          category: 'open_channel:enter',
          channel: { channel_url: 'sendbird_open_channel_xxxx', name: 'Public Chat', custom_type: '' },
          user: { user_id: 'user_001', nickname: 'Alice' },
          app_id: '2B525FD3-XXXX',
        },
      },
      {
        id: 'open_channel_exit',
        name: 'open_channel:exit',
        description: 'Fires when a user exits an open channel.',
        trigger: 'A user disconnects or exits an open channel',
        payload: {
          category: 'open_channel:exit',
          channel: { channel_url: 'sendbird_open_channel_xxxx', name: 'Public Chat' },
          user: { user_id: 'user_001', nickname: 'Alice' },
          app_id: '2B525FD3-XXXX',
        },
      },
    ],
  },
  {
    name: 'Moderation',
    icon: '🛡️',
    events: [
      {
        id: 'user_mute',
        name: 'group_channel:mute_user / open_channel:mute_user',
        description: 'Fires when a user is muted in a channel.',
        trigger: 'An operator calls the Mute User API',
        payload: {
          category: 'group_channel:mute_user',
          channel: { channel_url: 'sendbird_group_channel_xxxx', name: 'My Channel' },
          muted_user: { user_id: 'user_002', nickname: 'Bob' },
          muted_by: { user_id: 'user_001', nickname: 'Alice' },
          duration: 60,
          app_id: '2B525FD3-XXXX',
        },
      },
      {
        id: 'user_ban',
        name: 'group_channel:ban_user / open_channel:ban_user',
        description: 'Fires when a user is banned from a channel.',
        trigger: 'An operator calls the Ban User API',
        payload: {
          category: 'group_channel:ban_user',
          channel: { channel_url: 'sendbird_group_channel_xxxx', name: 'My Channel' },
          banned_user: { user_id: 'user_002', nickname: 'Bob' },
          banned_by: { user_id: 'user_001', nickname: 'Alice' },
          duration: -1,
          reason: 'Spam',
          app_id: '2B525FD3-XXXX',
        },
      },
    ],
  },
];

// ─── Live event type ──────────────────────────────────────────────────────────

interface LiveEvent {
  id: string;
  timestamp: string;
  category: string;
  verified: boolean;
  signaturePresent: boolean;
  payload: Record<string, unknown>;
}

// ─── JsonBlock (for reference tab) ───────────────────────────────────────────

function JsonBlock({ data }: { data: unknown }) {
  const str = JSON.stringify(data, null, 2);
  const lines = str.split('\n');

  const colorize = (line: string): React.ReactNode => {
    const keyMatch = line.match(/^(\s*)("[\w_]+")(\s*:\s*)(.*)/);
    if (keyMatch) {
      const [, indent, key, colon, value] = keyMatch;
      let valueNode: React.ReactNode = value;
      if (value.startsWith('"')) valueNode = <span className="json-string">{value}</span>;
      else if (value === 'true' || value === 'false') valueNode = <span className="json-boolean">{value}</span>;
      else if (value === 'null') valueNode = <span className="json-null">{value}</span>;
      else if (!isNaN(Number(value.replace(',', '')))) valueNode = <span className="json-number">{value}</span>;
      return <>{indent}<span className="json-key">{key}</span>{colon}{valueNode}</>;
    }
    return line;
  };

  return (
    <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
      {lines.map((line, i) => (
        <div key={i}>{colorize(line)}</div>
      ))}
    </pre>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const WebhookPage: React.FC = () => {
  const { credentials } = useCredentials();
  const [activeTab, setActiveTab] = useState<'live' | 'reference'>('live');

  // Reference tab state
  const [selectedCategory, setSelectedCategory] = useState(WEBHOOK_CATEGORIES[0].name);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Live receiver state
  const [connected, setConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [expandedLiveId, setExpandedLiveId] = useState<string | null>(null);

  // Auto tunnel state (provided by the backend via SSE)
  const [autoTunnelUrl, setAutoTunnelUrl] = useState('');
  const [tunnelStarting, setTunnelStarting] = useState(false);

  // Sendbird webhook config state
  const [currentWebhookUrl, setCurrentWebhookUrl] = useState<string | null>(null);
  const [enabledEvents, setEnabledEvents] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Auto-configure backend with API token when credentials change
  useEffect(() => {
    if (credentials.isConnected && credentials.apiToken) {
      fetch('/api/webhook/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: credentials.apiToken }),
      }).catch(() => {/* backend may not be running yet */});
    }
  }, [credentials.isConnected, credentials.apiToken]);

  // Fetch current Sendbird webhook URL on connect
  useEffect(() => {
    if (!credentials.isConnected || !credentials.apiToken || !credentials.appId) return;
    fetch(`${credentials.baseUrl}/v3/applications/settings/webhook`, {
      headers: { 'Api-Token': credentials.apiToken },
    })
      .then(r => r.json())
      .then(data => {
        if (data.webhook) {
          setCurrentWebhookUrl(data.webhook.url || '');
          setEnabledEvents(data.webhook.enabled_events || []);
        }
      })
      .catch(() => {});
  }, [credentials.isConnected, credentials.apiToken, credentials.appId, credentials.baseUrl]);

  // SSE connection — receives live webhook events AND tunnel URL from the backend
  useEffect(() => {
    const es = new EventSource('/api/webhook/events');

    es.onopen = () => {
      setConnected(true);
      setTunnelStarting(true); // tunnel may still be starting
    };
    es.onerror = () => {
      setConnected(false);
      setTunnelStarting(false);
    };

    es.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data as string);
        if (data.type === 'init') {
          setLiveEvents(data.events as LiveEvent[]);
          setConnected(true);
          if (data.tunnelUrl) {
            setAutoTunnelUrl(data.tunnelUrl as string);
            setTunnelStarting(false);
          }
        } else if (data.type === 'tunnel') {
          setAutoTunnelUrl((data.url as string) || '');
          setTunnelStarting(false);
        } else if (data.type === 'event') {
          setLiveEvents(prev => [data.event as LiveEvent, ...prev].slice(0, 100));
        } else if (data.type === 'clear') {
          setLiveEvents([]);
        }
      } catch {/* ignore parse errors */}
    };

    return () => es.close();
  }, []);

  const handleClearLive = useCallback(async () => {
    await fetch('/api/webhook/history', { method: 'DELETE' });
    toast.success('Events cleared');
  }, []);

  const handleRegisterInSendbird = useCallback(async () => {
    if (!autoTunnelUrl || !credentials.apiToken || !credentials.baseUrl) return;
    const publicUrl = `${autoTunnelUrl.replace(/\/$/, '')}/api/webhook`;
    setRegistering(true);
    try {
      const resp = await fetch(`${credentials.baseUrl}/v3/applications/settings/webhook`, {
        method: 'PUT',
        headers: { 'Api-Token': credentials.apiToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: publicUrl, enabled_events: enabledEvents, enabled: true }),
      });
      const data = await resp.json();
      if (data.webhook) {
        setCurrentWebhookUrl(data.webhook.url);
        toast.success('Webhook URL registered in Sendbird ✓');
      } else {
        toast.error(data.message || 'Failed to register webhook URL');
      }
    } catch {
      toast.error('Error registering webhook URL');
    } finally {
      setRegistering(false);
    }
  }, [autoTunnelUrl, credentials.apiToken, credentials.baseUrl, enabledEvents]);

  const handleClearWebhook = useCallback(async () => {
    if (!credentials.apiToken || !credentials.baseUrl) return;
    setClearing(true);
    try {
      const resp = await fetch(`${credentials.baseUrl}/v3/applications/settings/webhook`, {
        method: 'PUT',
        headers: { 'Api-Token': credentials.apiToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '', enabled: false }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setCurrentWebhookUrl('');
        toast.success('Webhook cleared — manager can now register a new URL in Sendbird Dashboard');
      } else {
        toast.error(data.message || `Failed to clear webhook (${resp.status})`);
      }
    } catch {
      toast.error('Error clearing webhook');
    } finally {
      setClearing(false);
    }
  }, [credentials.apiToken, credentials.baseUrl]);

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success('URL copied'))
      .catch(() => toast.error('Failed to copy'));
  }, []);

  const handleCopyPayload = useCallback((payload: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      .then(() => toast.success('Payload copied'))
      .catch(() => toast.error('Failed to copy'));
  }, []);

  const activeCat = WEBHOOK_CATEGORIES.find(c => c.name === selectedCategory) || WEBHOOK_CATEGORIES[0];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header + tab switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Webhook Inspector</h2>
          <p className="text-sm text-gray-400 mt-0.5">Receive and inspect live Sendbird webhook events</p>
        </div>
        <div className="flex bg-[#16132D] border border-[#2E2A52] rounded-lg p-1 gap-1">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-[#742DDD] text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            📡 Live Receiver
          </button>
          <button
            onClick={() => setActiveTab('reference')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'reference'
                ? 'bg-[#742DDD] text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            📚 Event Reference
          </button>
        </div>
      </div>

      {/* ── Live Receiver tab ─────────────────────────────────────────────── */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {/* Connection status + URL panel */}
          <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-4 space-y-4">

            {/* Status row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-white">
                  {connected ? 'Receiver connected' : 'Receiver offline — run npm run dev'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{liveEvents.length} events</span>
                {liveEvents.length > 0 && (
                  <button
                    onClick={handleClearLive}
                    className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 rounded transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Tunnel status */}
            {connected && (
              <div className={`rounded-lg px-3 py-2.5 text-xs border ${
                autoTunnelUrl
                  ? 'bg-[#0D1A0D] border-green-800/40'
                  : 'bg-[#16132D] border-[#2E2A52]'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${autoTunnelUrl ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                  <span className={`font-semibold ${autoTunnelUrl ? 'text-green-400' : 'text-yellow-400'}`}>
                    {autoTunnelUrl ? 'Public tunnel active' : tunnelStarting ? 'Starting public tunnel…' : 'Tunnel unavailable'}
                  </span>
                </div>

                {autoTunnelUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-[#0A150A] border border-green-900/40 rounded px-2.5 py-1.5">
                      <code className="flex-1 text-xs font-mono text-green-300 truncate">
                        {autoTunnelUrl}/api/webhook
                      </code>
                      <button
                        onClick={() => handleCopyUrl(`${autoTunnelUrl}/api/webhook`)}
                        className="shrink-0 px-2 py-0.5 text-xs bg-[#1A2E1A] hover:bg-[#243824] text-green-400 border border-green-900/40 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>

                    {/* Register / Restore button — shown when Sendbird URL doesn't match the tunnel */}
                    {currentWebhookUrl !== `${autoTunnelUrl}/api/webhook` && (
                      <button
                        onClick={handleRegisterInSendbird}
                        disabled={registering || !credentials.isConnected}
                        className="w-full py-2 text-sm font-medium bg-[#742DDD] hover:bg-[#6211C8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        {registering
                          ? (currentWebhookUrl ? 'Restoring…' : 'Registering…')
                          : currentWebhookUrl
                            ? '↩ Restore Tunnel URL'
                            : '⚡ Register in Sendbird'}
                      </button>
                    )}

                    {/* Confirmation when already registered */}
                    {currentWebhookUrl === `${autoTunnelUrl}/api/webhook` && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-green-400">
                          <span>✓</span>
                          <span>Registered in Sendbird — ready to receive webhooks</span>
                        </div>
                        <button
                          onClick={handleClearWebhook}
                          disabled={clearing || !credentials.isConnected}
                          className="shrink-0 px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 border border-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          {clearing ? 'Clearing…' : '🗑 Clear Webhook'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {tunnelStarting
                      ? 'The public tunnel is being established. This takes a few seconds…'
                      : 'Could not open a tunnel. Check the server terminal for details.'}
                  </p>
                )}
              </div>
            )}

            {/* Current Sendbird webhook URL status */}
            {currentWebhookUrl !== null && currentWebhookUrl !== `${autoTunnelUrl}/api/webhook` && (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                !currentWebhookUrl || currentWebhookUrl.includes('localhost') || currentWebhookUrl.includes('127.0.0.1')
                  ? 'bg-yellow-900/10 border border-yellow-800/20'
                  : 'bg-[#0D0A1C] border border-[#2E2A52]'
              }`}>
                <span className="shrink-0 text-base leading-none">
                  {!currentWebhookUrl || currentWebhookUrl.includes('localhost') || currentWebhookUrl.includes('127.0.0.1') ? '⚠️' : 'ℹ️'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`font-medium ${
                    !currentWebhookUrl || currentWebhookUrl.includes('localhost') || currentWebhookUrl.includes('127.0.0.1')
                      ? 'text-yellow-500' : 'text-gray-400'
                  }`}>
                    {!currentWebhookUrl
                      ? 'No webhook URL configured in Sendbird'
                      : currentWebhookUrl.includes('localhost') || currentWebhookUrl.includes('127.0.0.1')
                        ? 'Sendbird is pointing at localhost (not reachable)'
                        : 'Currently registered URL'}
                  </span>
                  {currentWebhookUrl && (
                    <code className="block text-gray-500 font-mono mt-0.5 truncate">{currentWebhookUrl}</code>
                  )}
                </div>
                {currentWebhookUrl && (
                  <button
                    onClick={handleClearWebhook}
                    disabled={clearing || !credentials.isConnected}
                    className="shrink-0 px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 border border-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    {clearing ? 'Clearing…' : '🗑 Clear'}
                  </button>
                )}
              </div>
            )}

            {credentials.isConnected && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Signature verification active — using connected API token
              </div>
            )}
          </div>

          {/* Live event stream */}
          {!connected ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-gray-400 font-medium">Backend not running</p>
              <p className="text-sm text-gray-600">Start both servers with:</p>
              <code className="inline-block bg-[#0D0A1C] border border-[#2E2A52] text-purple-300 px-4 py-2 rounded-lg text-sm">
                npm run dev
              </code>
              <p className="text-xs text-gray-600">This starts the Vite frontend and the webhook receiver together.</p>
            </div>
          ) : liveEvents.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400 font-medium">Waiting for webhooks…</p>
              <p className="text-sm text-gray-600">
                Register the URL above in Sendbird Dashboard, then trigger an event in your app.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {liveEvents.map(evt => {
                const isOpen = expandedLiveId === evt.id;
                return (
                  <div key={evt.id} className="bg-[#16132D] border border-[#2E2A52] rounded-lg overflow-hidden">
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1E1A3A] transition-colors"
                      onClick={() => setExpandedLiveId(isOpen ? null : evt.id)}
                    >
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>

                      <code className="text-xs font-mono text-purple-300 bg-[#2E2A52] px-2 py-0.5 rounded shrink-0">
                        {evt.category}
                      </code>

                      <span className="flex-1 text-xs text-gray-500 truncate">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>

                      {evt.signaturePresent && (
                        evt.verified ? (
                          <span className="text-xs px-2 py-0.5 rounded shrink-0 bg-green-900/30 text-green-400">
                            ✓ verified
                          </span>
                        ) : (
                          <span className="relative group/sigbadge shrink-0">
                            <span className="text-xs px-2 py-0.5 rounded bg-red-900/30 text-red-400 cursor-help flex items-center gap-1">
                              ✗ sig mismatch
                              <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                              </svg>
                            </span>
                            <div className="absolute right-0 top-full mt-1.5 z-50 hidden group-hover/sigbadge:block w-72 p-3 rounded-lg bg-[#1A1535] border border-red-800/50 shadow-xl text-left">
                              <p className="text-xs font-semibold text-red-400 mb-1">Why does this happen?</p>
                              <p className="text-xs text-gray-300 leading-relaxed mb-2">
                                The token used to configure the webhook server doesn't match the token Sendbird used to sign this request.
                              </p>
                              <p className="text-xs font-semibold text-amber-400 mb-1">Fix: Use your Master API Token</p>
                              <p className="text-xs text-gray-300 leading-relaxed">
                                Go to <span className="text-purple-300 font-medium">Sendbird Dashboard → Settings → General → Master API Token</span> and paste that token into <span className="text-purple-300 font-medium">Credentials</span> above.
                              </p>
                              <p className="text-xs text-gray-500 mt-2">Secondary or restricted tokens won't match.</p>
                            </div>
                          </span>
                        )
                      )}

                      <button
                        onClick={e => { e.stopPropagation(); handleCopyPayload(evt.payload); }}
                        className="shrink-0 px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-[#252145] hover:bg-[#2E2A52] rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-[#2E2A52] px-4 py-3">
                        <JsonViewer data={evt.payload} maxHeight="400px" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Event Reference tab ───────────────────────────────────────────── */}
      {activeTab === 'reference' && (
        <div className="space-y-4">
          {/* How webhooks work banner */}
          <div className="bg-[#1E1A3A] border border-[#742DDD]/30 rounded-lg p-4 flex gap-3">
            <span className="text-2xl shrink-0">💡</span>
            <div className="space-y-1 text-sm">
              <p className="text-white font-medium">How Sendbird webhooks work</p>
              <p className="text-gray-400">
                Sendbird sends an HTTP POST request to your server URL whenever an event occurs.
                Your server must respond with <code className="text-purple-300 bg-[#2E2A52] px-1 rounded">HTTP 200</code> within 10 seconds.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Dashboard → Settings → Webhooks → Add URL
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Category tabs */}
            <div className="w-48 shrink-0 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Event Categories</p>
              {WEBHOOK_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => { setSelectedCategory(cat.name); setExpandedEvent(null); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-[#742DDD]/20 text-white border border-[#742DDD]/30'
                      : 'text-gray-400 hover:bg-[#1E1A3A] hover:text-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="ml-auto text-xs text-gray-600">{cat.events.length}</span>
                </button>
              ))}
            </div>

            {/* Events list */}
            <div className="flex-1 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                {activeCat.icon} {activeCat.name} Events ({activeCat.events.length})
              </p>
              {activeCat.events.map(event => {
                const isExpanded = expandedEvent === event.id;
                return (
                  <div key={event.id} className="bg-[#16132D] border border-[#2E2A52] rounded-lg overflow-hidden">
                    <div
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[#1E1A3A] transition-colors"
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    >
                      <svg
                        className={`w-4 h-4 text-gray-500 mt-0.5 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-purple-300 bg-[#2E2A52] px-2 py-0.5 rounded">
                          {event.name}
                        </code>
                        <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                      </div>
                      <button
                        className="shrink-0 px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-[#252145] hover:bg-[#2E2A52] rounded transition-colors"
                        onClick={e => { e.stopPropagation(); handleCopyPayload(event.payload); }}
                      >
                        Copy
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#2E2A52] px-4 py-4 space-y-4">
                        <div className="flex items-start gap-2 bg-green-900/10 border border-green-800/30 rounded-md px-3 py-2">
                          <span className="text-green-400 text-sm shrink-0">⚡</span>
                          <div>
                            <p className="text-xs font-medium text-green-300">What triggers this</p>
                            <p className="text-xs text-gray-400 mt-0.5">{event.trigger}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sample Payload</p>
                            <button
                              className="px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-[#252145] hover:bg-[#2E2A52] rounded transition-colors"
                              onClick={() => handleCopyPayload(event.payload)}
                            >
                              Copy JSON
                            </button>
                          </div>
                          <div className="bg-[#0D0A1C] border border-[#2E2A52] rounded-lg p-4 max-h-80 overflow-y-auto">
                            <JsonBlock data={event.payload} />
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span>📖</span>
                          Your server will receive a POST request with this exact structure at your webhook URL.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Setup checklist */}
          <div className="bg-[#16132D] border border-[#2E2A52] rounded-lg p-5 space-y-3">
            <p className="text-sm font-medium text-white">Webhook Setup Checklist</p>
            <div className="grid gap-2 text-sm">
              {[
                'Your server is publicly accessible via HTTPS',
                'Your endpoint returns HTTP 200 within 10 seconds',
                'You\'ve registered your URL in Sendbird Dashboard → Settings → Webhooks',
                'You\'ve enabled the specific event categories you need',
                'You validate the webhook signature using your Sendbird API token (optional but recommended)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-gray-400">
                  <span className="text-[#742DDD] mt-0.5 shrink-0">☐</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookPage;
