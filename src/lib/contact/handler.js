// Server-side contact handler. Composes validation, rate limiting, reference
// id generation, and the mail transport behind a single Web-standard
// request handler: handleRequest(req: Request): Promise<Response>.
//
// Security controls implemented here (the server is the source of truth):
//   - method + content-type enforcement
//   - IP-based rate limiting (sliding window)
//   - honeypot field (bot mitigation)
//   - server-side validation + strict length limits + email validation
//   - input normalization (NUL/CRLF stripping, lowercasing, trimming)
//   - output encoding for the mail body (see message.js)
//   - opaque, non-sensitive reference id
//   - safe error handling: internal errors are logged, never echoed to clients
//   - no secrets in responses; credentials come only from server env
import { validateContact } from './validation.js';
import { generateReferenceId } from './reference.js';
import { RateLimiter } from './rate-limit.js';
import { buildMessage } from './message.js';
import { createMailer } from './mailer.js';
import { RATE_LIMIT, ERROR_MESSAGES } from './constants.js';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Never cache form results; they are per-submission and may be errors.
      'cache-control': 'no-store',
    },
  });
}

// Resolve the originating client IP for rate limiting. Trust X-Forwarded-For
// only as far as the edge; here we take the first entry and cap its length.
function clientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first.slice(0, 64);
  }
  const cloudflare = req.headers.get('cf-connecting-ip');
  if (cloudflare) return cloudflare.slice(0, 64);
  return 'unknown';
}

export function defaultDeps(env = {}) {
  const rateLimiter = new RateLimiter({
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || RATE_LIMIT.windowMs,
    max: Number(env.RATE_LIMIT_MAX) || RATE_LIMIT.max,
  });
  return {
    rateLimiter,
    mailer: createMailer({
      apiKey: env.RESEND_API_KEY,
      from: env.CONTACT_FROM,
      to: env.CONTACT_EMAIL,
    }),
    now: () => new Date(),
    clientIp: (req) => clientIp(req),
  };
}

/**
 * Handle a contact form submission.
 * @param {Request} req A Web Standard Request.
 * @param {object} [deps] Injected dependencies (for testing / deployment).
 * @returns {Promise<Response>} A JSON Web Standard Response.
 */
export async function handleRequest(req, deps) {
  const use = deps || defaultDeps(process.env);
  try {
    if (req.method !== 'POST') {
      return json(405, { ok: false, message: ERROR_MESSAGES.method });
    }

    const contentType = req.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      return json(415, { ok: false, message: ERROR_MESSAGES.mediaType });
    }

    const ip = use.clientIp(req);
    if (!use.rateLimiter.consume(ip)) {
      return json(429, { ok: false, message: ERROR_MESSAGES.rateLimit });
    }

    const result = validateContact(body);

    if (result.spam) {
      // Do not reveal the honeypot mechanism. Respond as a generic reject.
      return json(400, { ok: false, message: ERROR_MESSAGES.spam });
    }

    if (!result.ok) {
      return json(400, { ok: false, errors: result.errors });
    }

    const referenceId = generateReferenceId(use.now());
    const message = buildMessage({ ...result.normalized, referenceId });

    try {
      await use.mailer.send(message);
    } catch (error) {
      // Log the real cause server-side; return a generic message to the client.
      console.error('[contact] mail delivery failed', error);
      return json(502, { ok: false, message: ERROR_MESSAGES.server });
    }

    return json(200, {
      ok: true,
      referenceId,
      message:
        'Your message has been sent. I will reply within a few business days.',
    });
  } catch (error) {
    console.error('[contact] unexpected handler error', error);
    return json(500, { ok: false, message: ERROR_MESSAGES.server });
  }
}
