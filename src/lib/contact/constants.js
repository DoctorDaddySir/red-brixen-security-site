// Contact form field definitions and limits.
// Shared verbatim by the client form (UX validation) and the server-side
// handler (authoritative validation) so the two can never drift apart.
// Values are deliberately conservative for a low-traffic portfolio form.

// Maximum character counts. Kept tight to bound log size, mail bodies, and
// to reject oversized/abusive payloads before they reach the mailbox.
export const FIELD_LIMITS = {
  name: { max: 80, required: true },
  // 254 is the RFC 5321 practical length limit for an email address.
  email: { max: 254, required: true },
  // Slug length; the dropdown options are short.
  reason: { max: 32, required: true },
  // Generous enough for a thoughtful message, small enough to stay readable.
  message: { max: 2000, required: true },
  // Hidden honeypot. A real visitor leaves it empty; a bot typically fills it.
  website: { required: false },
};

// Human-readable reason options rendered in the dropdown. The submitted
// value is the lowercased, hyphenated slug form of these strings.
export const REASON_OPTIONS = [
  'Job opportunity',
  'Security consulting',
  'Collaboration',
  'Speaking / teaching',
  'Other',
];

export const REASON_VALUES = REASON_OPTIONS.map((reason) =>
  reason.toLowerCase().replace(/\s+/g, '-'),
);

export const ERROR_MESSAGES = {
  required: 'This field is required.',
  email: 'Please enter a valid email address.',
  length: (max) => `Must be ${max} characters or fewer.`,
  reason: 'Please select a valid reason for contact.',
  server:
    'Something went wrong. Your message was not sent. Please try again later.',
  rateLimit: 'Too many requests. Please wait a moment and try again.',
  method: 'Method not allowed.',
  mediaType: 'Unsupported content type.',
  spam: 'Submission rejected.',
};

// In-memory rate-limit policy for the server-side handler.
export const RATE_LIMIT = {
  windowMs: 60_000,
  max: 5,
};

export const REFERENCE_PREFIX = 'RBS';

// Public Railway endpoint. PUBLIC_CONTACT_ENDPOINT overrides this at build time.
// GitHub Pages serves only static files and cannot handle contact submissions.
export const DEFAULT_ENDPOINT = 'https://api.redbrixen.com/contact';
