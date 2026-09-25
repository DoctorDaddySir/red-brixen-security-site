// Thin node:http adapter that bridges Node's request/response objects to the
// Web-standard handleRequest(req: Request): Response handler. Used by local
// development, integration tests, and any platform that runs a Node script.
import http from 'node:http';
import { handleRequest, defaultDeps } from './handler.js';

function toWebRequest(nodeReq, body) {
  const host = nodeReq.headers.host || 'localhost';
  const url = `http://${host}${nodeReq.url || '/'}`;
  const headers = { ...nodeReq.headers };
  delete headers.host;
  delete headers['content-length'];
  return new Request(url, {
    method: nodeReq.method,
    headers,
    body: body ? body : undefined,
  });
}

export function createServer(deps) {
  const options = deps || defaultDeps(process.env);
  return http.createServer(async (nodeReq, nodeRes) => {
    try {
      let body = '';
      nodeReq.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1_000_000) {
          nodeRes.statusCode = 413;
          nodeRes.end('Payload Too Large');
        }
      });
      nodeReq.on('end', async () => {
        const res = await handleRequest(
          toWebRequest(nodeReq, body || undefined),
          options,
        );
        nodeRes.statusCode = res.status;
        for (const [key, value] of res.headers.entries()) {
          nodeRes.setHeader(key, value);
        }
        const text = await res.text();
        nodeRes.setHeader('content-length', Buffer.byteLength(text));
        nodeRes.end(text);
      });
    } catch (error) {
      console.error('[contact] server error', error);
      if (!nodeRes.headersSent) nodeRes.statusCode = 500;
      nodeRes.end('Internal Server Error');
    }
  });
}

// When executed directly (node functions/contact.js), start a dev server.
import { fileURLToPath } from 'node:url';
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env.PORT) || 4000;
  createServer().listen(port, () =>
    console.log(`[contact] function listening on port ${port}`),
  );
}
