import { handleRequest, defaultDeps } from '../../lib/contact/handler.js';

export const prerender = false;

const deps = defaultDeps(process.env);

export const GET = ({ request }) => handleRequest(request, deps);

export const POST = ({ request }) => handleRequest(request, deps);
