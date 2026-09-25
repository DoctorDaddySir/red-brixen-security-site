// Tests for the contact system. Uses Node's built-in test runner
// (node --test) so no extra dependencies are introduced.
//
// The handler is exercised directly through the Web Standard
// Request/Response API. This tests the security logic (validation, rate
// limiting, honeypot, reference ids, mail delivery, error handling) without
// binding a network port, so tests stay fast and sandbox-friendly.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContact,
  normalizeSingleLine,
  normalizeEmail,
  normalizeMultiLine,
} from '../src/lib/contact/validation.js';
import {
  generateReferenceId,
  formatDateSegment,
} from '../src/lib/contact/reference.js';
import { RateLimiter } from '../src/lib/contact/rate-limit.js';
import { buildMessage } from '../src/lib/contact/message.js';
import { handleRequest } from '../src/lib/contact/handler.js';

const FIXED_DATE = new Date('2026-09-25T12:00:00Z');

function jsonRequest(body, headers = {}) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function formRequest(body, headers = {}) {
  const params = new URLSearchParams(body).toString();
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    body: params,
  });
}

function fakeMailer({ deliver = true, error = null } = {}) {
  const sent = [];
  return {
    isReady: () => true,
    send(message) {
      sent.push(message);
      if (error) throw error;
      return Promise.resolve({ delivered: deliver });
    },
    sent,
  };
}

function makeDeps(overrides = {}) {
  const limiter =
    overrides.rateLimiter || new RateLimiter({ windowMs: 60_000, max: 100 });
  const mailer = overrides.mailer || fakeMailer();
  return {
    now: () => FIXED_DATE,
    clientIp: (req) =>
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1',
    rateLimiter: limiter,
    mailer,
  };
}

async function call(deps, body, headers) {
  const res = await handleRequest(jsonRequest(body, headers), deps);
  return { res, json: await res.clone().json() };
}

// ---- validation: unit tests ----

test('validation accepts a complete, well-formed submission', () => {
  const result = validateContact({
    name: 'Trent',
    email: 'trent@example.com',
    reason: 'job-opportunity',
    message: 'Hello there.',
  });
  assert.equal(result.ok, true);
  assert.equal(result.spam, false);
  assert.deepEqual(result.normalized, {
    name: 'Trent',
    email: 'trent@example.com',
    reason: 'job-opportunity',
    message: 'Hello there.',
  });
});

test('validation rejects missing required fields', () => {
  const result = validateContact({
    name: '',
    email: '',
    reason: '',
    message: '',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.reason);
  assert.ok(result.errors.message);
  assert.equal(result.normalized, null);
});

test('validation rejects a malformed email', () => {
  const result = validateContact({
    name: 'A',
    email: 'not-an-email',
    reason: 'other',
    message: 'hi',
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors.email[0], 'Please enter a valid email address.');
});

test('validation rejects oversized input (name, message)', () => {
  const result = validateContact({
    name: 'x'.repeat(81),
    email: 'a@b.com',
    reason: 'other',
    message: 'y'.repeat(2001),
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.message);
});

test('validation rejects an unknown reason value', () => {
  const result = validateContact({
    name: 'A',
    email: 'a@b.com',
    reason: 'spam',
    message: 'hi',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.reason);
});

test('validation flags the honeypot field as spam without revealing which field is the trap', () => {
  const result = validateContact({
    name: 'A',
    email: 'a@b.com',
    reason: 'other',
    message: 'hi',
    website: 'bot-filled',
  });
  assert.equal(result.ok, false);
  assert.equal(result.spam, true);
  assert.deepEqual(Object.keys(result.errors), ['__form']);
});

test('normalization strips NUL bytes and whitespace, lowercases email', () => {
  assert.equal(normalizeSingleLine('  Trent\x00  Bricks  '), 'Trent Bricks');
  assert.equal(normalizeEmail(' Trent@Example.COM '), 'trent@example.com');
  assert.equal(normalizeMultiLine('line1\r\nline2\x00'), 'line1\r\nline2');
});

test('normalization prevents CRLF injection in fields', () => {
  const result = validateContact({
    name: 'X\r\nBcc: evil',
    email: 'a@b.com',
    reason: 'other',
    message: 'hi',
  });
  assert.equal(result.ok, true);
  assert.equal(result.normalized.name, 'X Bcc: evil');
  assert.equal(result.normalized.name.includes('\n'), false);
});

test('rejects a non-object payload', () => {
  const result = validateContact('not an object');
  assert.equal(result.ok, false);
  assert.equal(result.normalized, null);
});

// ---- reference ids ----

test('reference id matches the opaque RBS-YYMMDD-HEX format', () => {
  const id = generateReferenceId(FIXED_DATE);
  assert.match(id, /^RBS-260925-[0-9A-F]{4}$/);
  assert.equal(formatDateSegment(FIXED_DATE), '260925');
});

test('reference ids are unique', () => {
  const ids = new Set();
  for (let i = 0; i < 300; i++) ids.add(generateReferenceId());
  assert.equal(ids.size, 300);
});

// ---- rate limiter ----

test('rate limiter blocks after the configured maximum within the window', () => {
  const limiter = new RateLimiter({ windowMs: 60_000, max: 3 });
  assert.equal(limiter.consume('1.2.3.4'), true);
  assert.equal(limiter.consume('1.2.3.4'), true);
  assert.equal(limiter.consume('1.2.3.4'), true);
  assert.equal(limiter.consume('1.2.3.4'), false);
});

test('rate limiter tracks clients independently', () => {
  const limiter = new RateLimiter({ windowMs: 60_000, max: 1 });
  assert.equal(limiter.consume('1.1.1.1'), true);
  assert.equal(limiter.consume('1.1.1.1'), false);
  assert.equal(limiter.consume('2.2.2.2'), true);
});

// ---- message building / output encoding ----

test('mail body escapes user input to prevent stored XSS', () => {
  const { text, html } = buildMessage({
    name: 'Alice',
    email: 'a@b.com',
    reason: 'other',
    referenceId: 'RBS-260925-A7F2',
    message: '<script>alert(1)</script>',
  });
  assert.equal(text.includes('<script>alert(1)</script>'), true); // plain text is not HTML
  assert.equal(html.includes('<script>alert(1)</script>'), false); // escaped
  assert.equal(html.includes('&lt;script&gt;'), true);
});

test('mail subject cannot carry CRLF injection', () => {
  const { subject } = buildMessage({
    name: 'A\r\nB',
    email: 'a@b.com',
    reason: 'other',
    referenceId: 'RBS-260925-A7F2',
    message: 'm',
  });
  assert.equal(subject.includes('\n'), false);
  assert.equal(subject.includes('\r'), false);
});

// ---- handler: integration via Web Request/Response ----

test('handler: valid submission returns 200 and a reference id', async () => {
  const deps = makeDeps();
  const { res, json } = await call(deps, {
    name: 'Trent',
    email: 'trent@example.com',
    reason: 'job-opportunity',
    message: 'Hello',
  });
  assert.equal(res.status, 200);
  assert.equal(json.ok, true);
  assert.match(json.referenceId, /^RBS-260925-[0-9A-F]{4}$/);
  assert.equal(
    json.message,
    'Your message has been sent. I will reply within a few business days.',
  );
  assert.equal(deps.mailer.sent.length, 1);
});

test('handler: destination email is never returned to the client', async () => {
  const deps = makeDeps();
  const { res } = await call(deps, {
    name: 'Trent',
    email: 'trent@example.com',
    reason: 'job-opportunity',
    message: 'Hello',
  });
  const text = await res.clone().text();
  assert.equal(text.includes('trent.shelton.primary@gmail.com'), false);
  assert.equal(text.includes('CONTACT_EMAIL'), false);
  assert.equal(text.includes('RBS-260925'), true); // opaque reference only
});

test('handler: missing required fields returns 400 with field errors', async () => {
  const deps = makeDeps();
  const { res, json } = await call(deps, {
    name: '',
    email: 'bad',
    reason: '',
    message: '',
  });
  assert.equal(res.status, 400);
  assert.equal(json.ok, false);
  assert.ok(json.errors.name);
  assert.ok(json.errors.email);
  assert.ok(json.errors.reason);
  assert.ok(json.errors.message);
});

test('handler: malformed email returns 400', async () => {
  const deps = makeDeps();
  const { res, json } = await call(deps, {
    name: 'A',
    email: 'nope',
    reason: 'other',
    message: 'hi',
  });
  assert.equal(res.status, 400);
  assert.ok(json.errors.email);
});

test('handler: oversized input returns 400', async () => {
  const deps = makeDeps();
  const { res, json } = await call(deps, {
    name: 'x'.repeat(200),
    email: 'a@b.com',
    reason: 'other',
    message: 'y'.repeat(5000),
  });
  assert.equal(res.status, 400);
  assert.ok(json.errors.name || json.errors.message);
});

test('handler: honeypot activation returns 400 without revealing the trap', async () => {
  const deps = makeDeps();
  const { res, json } = await call(deps, {
    name: 'A',
    email: 'a@b.com',
    reason: 'other',
    message: 'hi',
    website: 'bot',
  });
  assert.equal(res.status, 400);
  assert.equal(json.ok, false);
  assert.equal(json.errors, undefined); // no field errors leaked
});

test('handler: rate limiting returns 429', async () => {
  const limiter = new RateLimiter({ windowMs: 60_000, max: 2 });
  const deps = makeDeps({ rateLimiter: limiter });
  await call(
    deps,
    { name: 'A', email: 'a@b.com', reason: 'other', message: '1' },
    { 'x-forwarded-for': '9.9.9.9' },
  );
  await call(
    deps,
    { name: 'A', email: 'a@b.com', reason: 'other', message: '2' },
    { 'x-forwarded-for': '9.9.9.9' },
  );
  const { res, json } = await call(
    deps,
    { name: 'A', email: 'a@b.com', reason: 'other', message: '3' },
    { 'x-forwarded-for': '9.9.9.9' },
  );
  assert.equal(res.status, 429);
  assert.equal(
    json.message,
    'Too many requests. Please wait a moment and try again.',
  );
});

test('handler: rate limit is per-client IP', async () => {
  const limiter = new RateLimiter({ windowMs: 60_000, max: 1 });
  const deps = makeDeps({ rateLimiter: limiter });
  const first = await call(
    deps,
    { name: 'A', email: 'a@b.com', reason: 'other', message: '1' },
    { 'x-forwarded-for': '1.1.1.1' },
  );
  const second = await call(
    deps,
    { name: 'A', email: 'a@b.com', reason: 'other', message: '2' },
    { 'x-forwarded-for': '1.1.1.1' },
  );
  const other = await call(
    deps,
    { name: 'A', email: 'a@b.com', reason: 'other', message: '3' },
    { 'x-forwarded-for': '2.2.2.2' },
  );
  assert.equal(first.res.status, 200);
  assert.equal(second.res.status, 429);
  assert.equal(other.res.status, 200);
});

test('handler: backend mail failure returns 502 with no internal details', async () => {
  const mailer = fakeMailer({
    error: new Error('Resend down: secret-stack-trace'),
  });
  const deps = makeDeps({ mailer });
  const { res, json } = await call(deps, {
    name: 'A',
    email: 'a@b.com',
    reason: 'other',
    message: 'hi',
  });
  assert.equal(res.status, 502);
  assert.equal(json.ok, false);
  assert.equal(
    json.message,
    'Something went wrong. Your message was not sent. Please try again later.',
  );
  assert.equal(json.message.includes('Resend down'), false);
  assert.equal(json.message.includes('secret-stack-trace'), false);
});

test('handler: GET is not allowed', async () => {
  const deps = makeDeps();
  const req = new Request('http://localhost/api/contact', { method: 'GET' });
  const res = await handleRequest(req, deps);
  assert.equal(res.status, 405);
});

test('handler: form-encoded submissions are accepted', async () => {
  const deps = makeDeps();
  const req = formRequest({
    name: 'Tamsin',
    email: 't@e.com',
    reason: 'collaboration',
    message: 'hi',
  });
  const res = await handleRequest(req, deps);
  const json = await res.json();
  assert.equal(res.status, 200);
  assert.equal(json.ok, true);
  assert.match(json.referenceId, /^RBS-/);
});

test('handler: errors never produce a location/redirect that drops form content', async () => {
  const deps = makeDeps();
  const { res } = await call(deps, {
    name: '',
    email: 'bad',
    reason: '',
    message: '',
  });
  assert.equal(res.status, 400);
  assert.equal(res.headers.get('location'), null);
});
