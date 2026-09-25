// Opaque, non-sensitive submission reference ids (e.g. RBS-260925-A7F2).
// Deliberately encodes nothing sensitive: no database ids, no precise
// timestamps, no internal identifiers, no infrastructure details. Only a
// coarse day (for human reference) and a short random segment.
import { REFERENCE_PREFIX } from './constants.js';

const HEX_ALPHABET = '0123456789ABCDEF';

export function formatDateSegment(date) {
  const d =
    date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = String(d.getUTCFullYear()).slice(-2);
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// 2 random bytes -> 4 uppercase hex chars (65536 possibilities per day).
function randomSegment() {
  const bytes = new Uint8Array(2);
  globalThis.crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += HEX_ALPHABET[bytes[i] >> 4];
    out += HEX_ALPHABET[bytes[i] & 0x0f];
  }
  return out;
}

export function generateReferenceId(date) {
  return `${REFERENCE_PREFIX}-${formatDateSegment(date)}-${randomSegment()}`;
}
