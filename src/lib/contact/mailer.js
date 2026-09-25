// Email transport abstraction. The transport is isolated behind a tiny
// interface so the handler never knows (or cares) how mail is delivered,
// and credentials never appear in client-side code.
//
// Supported transports (selected via env, see .env.example):
//   - resend : POSTs to the Resend HTTP API using RESEND_API_KEY (default)
//   - stub   : records the message and resolves (local dev / tests only)
//
// The destination address lives only in server configuration, never in source.
const RESEND_ENDPOINT = 'https://api.resend.com/email';

export function createMailer(config = {}) {
  const { apiKey, from, to } = config;
  console.log('[contact] mailer config', { apiKey: Boolean(apiKey), from, to });

  function isReady() {
    return Boolean(apiKey && from && to);
  }

  // "stub" mode: used when no API key is configured so local dev and tests
  // work without credentials. It does NOT deliver mail; it just resolves.
  async function sendStub(message) {
    if (process?.env?.NODE_ENV !== 'test' && !apiKey) {
      // Intentionally silent; the deployer must set RESEND_API_KEY in prod.
      console.warn('[contact] mailer stub: no RESEND_API_KEY configured');
    }
    return { delivered: false, via: 'stub', message };
  }

  async function sendViaResend(message) {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });
    if (!res.ok) {
      const err = new Error(`Resend API error: ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return { delivered: true, via: 'resend' };
  }

  return {
    isReady,
    async send(message) {
      if (!isReady()) return sendStub(message);
      return sendViaResend(message);
    },
  };
}
