// Shared-secret HMAC attestation for the anonymous subscription confirmation
// endpoint. The app is public with no login, so Origin/Referer headers alone
// are spoofable by non-browser clients. The browser-side forms sign each
// request with this key and sendSubscriptionConfirmation verifies the
// signature server-side (with a freshness window). The key ships in the public
// JS bundle by design — it is a caller attestation, not a vault secret; the
// server-side rate limits remain the hard anti-abuse cap.

export const FORM_SECRET = '9f3c61a7e245d80b4c7e1a9f6b2d48035ec17a2b9d6f1e48c05b3a7d92e41603';

const MAX_CLOCK_SKEW_MS = 10 * 60 * 1000;

// Identical normalization on both sides, so the signature always covers the
// exact values the server will act on.
export function normalizeSubscriptionFields(fields) {
  const kind = fields.kind === 'post_update' ? 'post_update' : 'newsletter';
  const email = String(fields.email || '').trim().toLowerCase().slice(0, 254);
  const postSlug = String(fields.post_slug || '');
  return { kind, email, postSlug };
}

async function hmacHex(message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(FORM_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Browser side: sign a subscription request; returns the full payload to send.
export async function signSubscriptionRequest(fields) {
  const { kind, email, postSlug } = normalizeSubscriptionFields(fields);
  const ts = Date.now();
  const sig = await hmacHex(`${kind}|${email}|${postSlug}|${ts}`);
  return { kind, email, post_slug: postSlug, ts, sig };
}

// Server side: verify the payload the function received.
export async function verifySubscriptionRequest(fields, ts, sig) {
  if (!Number.isInteger(ts) || Math.abs(Date.now() - ts) > MAX_CLOCK_SKEW_MS) return false;
  if (typeof sig !== 'string' || !/^[0-9a-f]{64}$/.test(sig)) return false;
  const { kind, email, postSlug } = normalizeSubscriptionFields(fields);
  const expected = await hmacHex(`${kind}|${email}|${postSlug}|${ts}`);
  let diff = 0;
  for (let i = 0; i < 64; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}