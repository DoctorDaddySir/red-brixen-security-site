// Production/local entry point for the contact function.
// Deploy this to any Node-compatible runtime (Render, Fly.io, a small VPS,
// etc.) and set the documented environment variables. The static site then
// posts to PUBLIC_CONTACT_ENDPOINT (set to this function's URL at build).
import { createServer, defaultDeps } from '../src/lib/contact/server.js';

createServer(defaultDeps(process.env)).listen(
  Number(process.env.PORT) || 4000,
  () => console.log('[contact] listening on port 4000'),
);
