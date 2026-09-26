import http from 'node:http';

import {
  handleRequest,
  defaultDeps,
} from '../lib/contact/handler.js';

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_ORIGIN =
  process.env.CONTACT_ALLOWED_ORIGIN || 'https://redbrixen.com';

const deps = defaultDeps(process.env);

/**
 * Apply CORS headers to responses returned by the existing contact handler.
 */
function withCors(response) {
  const headers = new Headers(response.headers);

  headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  headers.set('Vary', 'Origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Convert a Node IncomingMessage into a Web Standard Request.
 */
async function toWebRequest(req) {
  const host = req.headers.host || `localhost:${PORT}`;
  const protocol =
    req.headers['x-forwarded-proto'] || 'http';

  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  const options = {
    method: req.method,
    headers,
  };

  // GET/HEAD requests cannot have a body.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    options.body = req;
    options.duplex = 'half';
  }

  return new Request(url, options);
}

/**
 * Send a Web Standard Response through Node's ServerResponse.
 */
async function sendWebResponse(response, res) {
  res.statusCode = response.status;

  for (const [name, value] of response.headers) {
    res.setHeader(name, value);
  }

  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    /*
     * Railway health/root endpoint.
     */
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
      });

      res.end(
        JSON.stringify({
          ok: true,
          service: 'red-brixen-contact-api',
        }),
      );

      return;
    }

    /*
     * Only expose the contact endpoint.
     */
    if (req.url !== '/contact' && req.url !== '/contact/') {
      res.writeHead(404, {
        'Content-Type': 'application/json; charset=utf-8',
      });

      res.end(
        JSON.stringify({
          ok: false,
          message: 'Not found',
        }),
      );

      return;
    }

    /*
     * CORS preflight.
     */
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;

      if (origin && origin !== ALLOWED_ORIGIN) {
        res.writeHead(403, {
          'Content-Type': 'application/json; charset=utf-8',
        });

        res.end(
          JSON.stringify({
            ok: false,
            message: 'Origin not allowed',
          }),
        );

        return;
      }

      res.writeHead(204, {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      });

      res.end();
      return;
    }

    /*
     * Reject browser requests from unexpected origins.
     */
    const origin = req.headers.origin;

    if (origin && origin !== ALLOWED_ORIGIN) {
      res.writeHead(403, {
        'Content-Type': 'application/json; charset=utf-8',
      });

      res.end(
        JSON.stringify({
          ok: false,
          message: 'Origin not allowed',
        }),
      );

      return;
    }

    /*
     * Pass the request into the contact handler you already built.
     */
    const request = await toWebRequest(req);
    const response = await handleRequest(request, deps);

    await sendWebResponse(withCors(response), res);
  } catch (error) {
    console.error('[contact-api] unexpected error', error);

    res.writeHead(500, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      Vary: 'Origin',
    });

    res.end(
      JSON.stringify({
        ok: false,
        message: 'Internal server error',
      }),
    );
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[contact-api] listening on port ${PORT}`);
});