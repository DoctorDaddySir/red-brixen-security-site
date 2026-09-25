// Pure, dependency-free input validation and normalization for the contact
// form. This module is imported by both the browser (UX validation) and the
// server-side handler (authoritative validation). The server is always the
// source of truth; the browser copy exists only to improve the experience.
import { FIELD_LIMITS, REASON_VALUES, ERROR_MESSAGES } from './constants.js';

// Conservative email pattern. It is intentionally not RFC-5322 exhaustive
// (that grammar is impractical and itself a source of bugs/injection). It
// accepts ordinary addresses and rejects obviously malformed input and
// control characters that could be used for header injection.
// Accepts ordinary addresses and requires a dotted domain with a 2+ char TLD.
// Rejects embedded whitespace/control chars (header-injection guard) and
// comments. Intentionally not RFC-5322 exhaustive.
const EMAIL_PATTERN =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

// Strip NUL bytes (a classic traversal/injection trick) before anything else.
function stripNul(value) {
  return value.replace(/\u0000/g, '');
}

// Single-line fields (name, reason): collapse every run of whitespace
// (including newlines and tabs) into a single space, then trim. This removes
// any embedded CRLF, so the value can never carry a header-injection payload.
export function normalizeSingleLine(value) {
  if (typeof value !== 'string') return '';
  return stripNul(value).replace(/\s+/g, ' ').trim();
}

// Multi-line fields (message): preserve newlines/tabs for readability but
// strip NUL and other C0 control characters except tab/newline/carriage-return.
export function normalizeMultiLine(value) {
  if (typeof value !== 'string') return '';
  return (
    stripNul(value)
      // Remove C0 controls except \t (0x09), \n (0x0a), \r (0x0d) and DEL (0x7f).
      .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
      .trim()
  );
}

// Email: remove all internal whitespace, strip NUL, lowercase, trim.
export function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return stripNul(value).replace(/\s+/g, '').toLowerCase().trim();
}

/**
 * Validate a raw contact submission.
 * @param {unknown} raw The submitted payload (object).
 * @returns {{ ok: boolean, spam: boolean, errors: Record<string, string[]>,
 *   normalized: Record<string, string> | null }}
 */
export function validateContact(raw) {
  const errors = {};
  const normalized = {};

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      spam: false,
      errors: { __form: [ERROR_MESSAGES.server] },
      normalized: null,
    };
  }

  // Honeypot first: a filled trap means the client is almost certainly a bot.
  // Respond generically and do not process the rest of the payload.
  if (normalizeSingleLine(raw.website).length > 0) {
    return {
      ok: false,
      spam: true,
      errors: { __form: [ERROR_MESSAGES.spam] },
      normalized: null,
    };
  }

  const name = normalizeSingleLine(raw.name);
  if (FIELD_LIMITS.name.required && !name) {
    errors.name = [ERROR_MESSAGES.required];
  } else if (name.length > FIELD_LIMITS.name.max) {
    errors.name = [ERROR_MESSAGES.length(FIELD_LIMITS.name.max)];
  }
  normalized.name = name;

  const email = normalizeEmail(raw.email);
  if (FIELD_LIMITS.email.required && !email) {
    errors.email = [ERROR_MESSAGES.required];
  } else if (email.length > FIELD_LIMITS.email.max) {
    errors.email = [ERROR_MESSAGES.length(FIELD_LIMITS.email.max)];
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = [ERROR_MESSAGES.email];
  }
  normalized.email = email;

  const reason = normalizeSingleLine(raw.reason);
  if (FIELD_LIMITS.reason.required && !reason) {
    errors.reason = [ERROR_MESSAGES.required];
  } else if (!REASON_VALUES.includes(reason)) {
    errors.reason = [ERROR_MESSAGES.reason];
  }
  normalized.reason = reason;

  const message = normalizeMultiLine(raw.message);
  if (FIELD_LIMITS.message.required && !message) {
    errors.message = [ERROR_MESSAGES.required];
  } else if (message.length > FIELD_LIMITS.message.max) {
    errors.message = [ERROR_MESSAGES.length(FIELD_LIMITS.message.max)];
  }
  normalized.message = message;

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    spam: false,
    errors,
    normalized: ok ? normalized : null,
  };
}
