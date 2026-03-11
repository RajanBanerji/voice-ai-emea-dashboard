import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { tunnel as cloudflaredTunnel } from 'cloudflared';

const app = express();
const PORT = 3001;
const MAX_EVENTS = 100;

let apiToken = '';
let tunnelUrl = '';
const events = [];
const clients = new Set();

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) client.write(msg);
}

app.use(cors({ origin: '*' }));

// Configure API token for signature verification
app.post('/api/webhook/configure', express.json(), (req, res) => {
  apiToken = req.body?.apiToken || '';
  console.log(`API token ${apiToken ? 'set' : 'cleared'}`);
  res.json({ ok: true });
});

// Expose current tunnel URL to frontend on demand
app.get('/api/webhook/tunnel-url', (req, res) => {
  res.json({ url: tunnelUrl });
});

// SSE stream — browser connects here to receive live events + tunnel URL
app.get('/api/webhook/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.add(res);
  // Send buffered events + current tunnel URL immediately on connect
  res.write(`data: ${JSON.stringify({ type: 'init', events, tunnelUrl })}\n\n`);

  req.on('close', () => clients.delete(res));
});

// Clear event history
app.delete('/api/webhook/history', express.json(), (req, res) => {
  events.length = 0;
  broadcast({ type: 'clear' });
  res.json({ ok: true });
});

// Receive webhook POST from Sendbird via the public tunnel
app.post('/api/webhook', express.raw({ type: '*/*' }), (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';

  // Dump all incoming headers for debugging
  console.log('[headers]', JSON.stringify(req.headers));

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const incomingSignature = req.headers['x-sendbird-signature'];
  let verified = false;
  if (apiToken && incomingSignature) {
    const expected = crypto.createHmac('sha256', apiToken).update(rawBody).digest('hex');
    verified = expected === incomingSignature;
    if (!verified) {
      console.log(`[sig-debug] incoming: ${incomingSignature}`);
      console.log(`[sig-debug] expected: ${expected}`);
      console.log(`[sig-debug] body-len: ${rawBody.length}, body-start: ${rawBody.slice(0, 80)}`);
    }
  }

  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    category: payload.category || 'unknown',
    verified,
    signaturePresent: !!incomingSignature,
    headers: req.headers,
    payload,
  };

  events.unshift(event);
  if (events.length > MAX_EVENTS) events.pop();

  broadcast({ type: 'event', event });
  console.log(`[webhook] ${event.category} — verified: ${verified}`);
  res.status(200).json({ ok: true });
});

// ── Start server then open Cloudflare Quick Tunnel ─────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Webhook receiver listening on http://localhost:${PORT}/api/webhook`);
  console.log(`🌐  Opening Cloudflare Quick Tunnel…`);

  try {
    // Pass args as array: "tunnel --url" creates a Quick Tunnel (no account needed)
    const cfTunnel = cloudflaredTunnel(['tunnel', '--url', `http://localhost:${PORT}`]);

    cfTunnel.on('url', url => {
      tunnelUrl = url;
      console.log(`🚀  Public webhook URL: ${tunnelUrl}/api/webhook`);
      console.log(`📋  Register this in Sendbird Dashboard → Settings → Webhooks`);
      broadcast({ type: 'tunnel', url: tunnelUrl });
    });

    cfTunnel.on('error', err => {
      console.error('Tunnel error:', err.message);
    });

    cfTunnel.once('close', () => {
      console.log('⚠️  Tunnel closed');
      tunnelUrl = '';
      broadcast({ type: 'tunnel', url: '' });
    });

    process.on('SIGINT', () => { cfTunnel.stop(); process.exit(0); });
    process.on('SIGTERM', () => { cfTunnel.stop(); process.exit(0); });

  } catch (err) {
    console.error('⚠️  Could not open tunnel:', err.message);
    console.log('💡  Start one manually: cloudflared tunnel --url http://localhost:3001');
  }
});
